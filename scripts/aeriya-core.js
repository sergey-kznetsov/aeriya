const MODULE_ID = "aeriya";

const AERIYA_FLAGS = Object.freeze({
  reaction: {
    available: "reaction.available",
    lastRoll: "reaction.lastRoll",
    usedThisRound: "reaction.usedThisRound",
    lastUseType: "reaction.lastUseType"
  },
  targeting: {
    knownWeakSpots: "targeting.knownWeakSpots",
    lastTargetedZone: "targeting.lastTargetedZone",
    lastTargetingResult: "targeting.lastTargetingResult"
  },
  weakSpots: "weakSpots",
  rituals: {
    knownRituals: "rituals.knownRituals",
    activeBacklash: "rituals.activeBacklash",
    lastRitualId: "rituals.lastRitualId",
    lastOutcome: "rituals.lastOutcome"
  },
  necromancy: {
    patron: "necromancy.patron",
    soulDebt: "necromancy.soulDebt",
    boundSouls: "necromancy.boundSouls",
    funeralViolation: "necromancy.funeralViolation"
  },
  spirits: {
    oaths: "spirits.oaths",
    favor: "spirits.favor",
    debt: "spirits.debt",
    lastSign: "spirits.lastSign"
  },
  factions: {
    reputation: "factions.reputation",
    debts: "factions.debts",
    access: "factions.access"
  },
  epicActions: {
    history: "epicActions.history",
    lastCost: "epicActions.lastCost",
    lastOutcome: "epicActions.lastOutcome"
  },
  region: {
    currentRegion: "region.currentRegion",
    threatClock: "region.threatClock",
    activeHazards: "region.activeHazards"
  }
});

class AeriyaLogger {
  static info(...args) {
    console.info("Aeria Core |", ...args);
  }

  static warn(...args) {
    console.warn("Aeria Core |", ...args);
  }
}

class AeriyaFlags {
  static async set(document, key, value) {
    if (!document) return null;
    return document.setFlag(MODULE_ID, key, value);
  }

  static get(document, key, fallback = null) {
    if (!document) return fallback;
    const value = document.getFlag(MODULE_ID, key);
    return value ?? fallback;
  }

  static async unset(document, key) {
    if (!document) return null;
    return document.unsetFlag(MODULE_ID, key);
  }
}

class AeriyaReactionManager {
  static get recoveryThreshold() {
    return game.settings.get(MODULE_ID, "reactionRecoveryThreshold") ?? 4;
  }

  static isAvailable(actor) {
    return Boolean(AeriyaFlags.get(actor, AERIYA_FLAGS.reaction.available, false));
  }

  static async rollRecovery(actor) {
    if (!actor) {
      ui.notifications?.warn(game.i18n.localize("AEЯIA.Notifications.SelectActor"));
      return null;
    }

    const roll = await new Roll("1d10").evaluate();
    const threshold = Number(this.recoveryThreshold);
    const recovered = roll.total <= threshold;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: recovered
        ? game.i18n.format("AEЯIA.Reaction.Recovered", { actor: actor.name, threshold })
        : game.i18n.format("AEЯIA.Reaction.NotRecovered", { actor: actor.name, threshold })
    });

    await AeriyaFlags.set(actor, AERIYA_FLAGS.reaction.available, recovered);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.reaction.lastRoll, roll.total);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.reaction.usedThisRound, false);

    return { actor, roll, recovered };
  }

  static async spend(actor, mode = "reaction") {
    if (!actor) return false;

    const available = this.isAvailable(actor);
    if (!available) {
      ui.notifications?.warn(game.i18n.format("AEЯIA.Notifications.NoReaction", { actor: actor.name }));
      return false;
    }

    await AeriyaFlags.set(actor, AERIYA_FLAGS.reaction.available, false);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.reaction.usedThisRound, true);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.reaction.lastUseType, mode);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: game.i18n.format("AEЯIA.Reaction.Spent", {
        actor: actor.name,
        mode: game.i18n.localize(`AEЯIA.Reaction.Mode.${mode}`) || mode
      })
    });

    return true;
  }

  static async reset(actor) {
    if (!actor) return false;

    await AeriyaFlags.set(actor, AERIYA_FLAGS.reaction.available, false);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.reaction.usedThisRound, false);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.reaction.lastUseType, null);

    return true;
  }
}

class AeriyaTargetedAttacks {
  static weakPointExamples = {
    humanoid: ["глаза", "горло", "кисть", "локоть", "колено", "сухожилия", "открытый участок брони"],
    beast: ["глаза", "лапа", "сухожилия", "брюхо", "пасть", "крыло"],
    undead: ["череп", "позвоночник", "ритуальная метка", "узел удержания", "место старой раны"],
    construct: ["шарнир", "сердечник", "пластина корпуса", "рунический шов", "источник питания"],
    spirit: ["якорь проявления", "обетная метка", "граница формы", "эхо имени"]
  };

  static getWeakPointExamples(type = "humanoid") {
    return this.weakPointExamples[type] ?? this.weakPointExamples.humanoid;
  }

  static getWeakSpots(actor) {
    return AeriyaFlags.get(actor, AERIYA_FLAGS.weakSpots, []);
  }

  static async setWeakSpots(actor, weakSpots = []) {
    return AeriyaFlags.set(actor, AERIYA_FLAGS.weakSpots, weakSpots);
  }

  static async recordTargeting(actor, zone, result = "manual") {
    if (!actor) return false;

    await AeriyaFlags.set(actor, AERIYA_FLAGS.targeting.lastTargetedZone, zone);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.targeting.lastTargetingResult, result);

    return true;
  }

  static buildEffectDescription(targetPart) {
    const effects = {
      "сухожилия": "цель теряет скорость или временно не может нормально передвигаться",
      "колено": "цель рискует упасть, потерять скорость или получить помеху на перемещение",
      "рука": "цель может выронить предмет или получить помеху на следующую атаку",
      "кисть": "цель может потерять хват, фокусировку или точность",
      "глаза": "цель может временно ослепнуть или получить штраф к атакам",
      "крыло": "летающая цель теряет устойчивость, высоту или падает",
      "броня": "защита цели повреждается или открывается слабое место",
      "магический узел": "нарушается заклинание, ритуал или особая способность"
    };

    return effects[targetPart] ?? "мастер определяет эффект по анатомии цели, оружию и обстоятельствам сцены";
  }
}

class AeriyaRitualManager {
  static requirements = [
    "инструкция",
    "нужные слова",
    "компоненты",
    "время",
    "подходящее место",
    "понимание риска"
  ];

  static backlashExamples = [
    "дух требует плату",
    "ритуал привлекает нежелательное внимание",
    "слова услышал не тот, к кому обращались",
    "место меняется",
    "компонент уничтожается",
    "персонаж получает метку",
    "у партии появляется долг",
    "мёртвый отвечает чужим голосом",
    "открывается след для сущностей Извне",
    "ритуал срабатывает, но создаёт новую проблему"
  ];

  static randomBacklash() {
    return this.backlashExamples[Math.floor(Math.random() * this.backlashExamples.length)];
  }

  static describeRequirements() {
    return this.requirements.join(", ");
  }

  static async recordOutcome(actor, ritualId, outcome) {
    if (!actor) return false;

    await AeriyaFlags.set(actor, AERIYA_FLAGS.rituals.lastRitualId, ritualId);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.rituals.lastOutcome, outcome);

    return true;
  }

  static async addBacklash(actor, backlash) {
    if (!actor) return false;

    const current = AeriyaFlags.get(actor, AERIYA_FLAGS.rituals.activeBacklash, []);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.rituals.activeBacklash, [...current, backlash]);

    return true;
  }
}

class AeriyaEpicActions {
  static costs = [
    "рана",
    "потеря предмета",
    "уровень усталости",
    "долг духу",
    "ухудшение отношения фракции",
    "магический откат",
    "появление нового врага",
    "усиление угрозы",
    "изменение локации",
    "потеря времени",
    "жертва ресурса",
    "долгосрочная метка"
  ];

  static randomCost() {
    return this.costs[Math.floor(Math.random() * this.costs.length)];
  }

  static async record(actor, action) {
    if (!actor) return false;

    const history = AeriyaFlags.get(actor, AERIYA_FLAGS.epicActions.history, []);
    const nextHistory = [...history, action];

    await AeriyaFlags.set(actor, AERIYA_FLAGS.epicActions.history, nextHistory);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.epicActions.lastCost, action?.cost ?? null);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.epicActions.lastOutcome, action?.outcome ?? null);

    return true;
  }
}

class AeriyaFactions {
  static getReputation(actor) {
    return AeriyaFlags.get(actor, AERIYA_FLAGS.factions.reputation, {});
  }

  static async setReputation(actor, factionId, value) {
    if (!actor || !factionId) return false;

    const reputation = this.getReputation(actor);
    await AeriyaFlags.set(actor, AERIYA_FLAGS.factions.reputation, {
      ...reputation,
      [factionId]: Number(value)
    });

    return true;
  }
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "reactionRecoveryThreshold", {
    name: "AEЯIA.Settings.ReactionRecoveryThreshold.Name",
    hint: "AEЯIA.Settings.ReactionRecoveryThreshold.Hint",
    scope: "world",
    config: true,
    type: Number,
    default: 4,
    range: {
      min: 1,
      max: 10,
      step: 1
    }
  });

  game.settings.register(MODULE_ID, "enableAeriaReactions", {
    name: "AEЯIA.Settings.EnableAeriaReactions.Name",
    hint: "AEЯIA.Settings.EnableAeriaReactions.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "enableTargetedAttacks", {
    name: "AEЯIA.Settings.EnableTargetedAttacks.Name",
    hint: "AEЯIA.Settings.EnableTargetedAttacks.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "enableRitualTools", {
    name: "AEЯIA.Settings.EnableRitualTools.Name",
    hint: "AEЯIA.Settings.EnableRitualTools.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.aeriya = {
    MODULE_ID,
    flags: AERIYA_FLAGS,
    flagApi: AeriyaFlags,
    reactions: AeriyaReactionManager,
    targetedAttacks: AeriyaTargetedAttacks,
    rituals: AeriyaRitualManager,
    epicActions: AeriyaEpicActions,
    factions: AeriyaFactions
  };

  AeriyaLogger.info("module initialized");
});

Hooks.once("ready", () => {
  AeriyaLogger.info("module ready", game.modules.get(MODULE_ID)?.version ?? "unknown version");
});
