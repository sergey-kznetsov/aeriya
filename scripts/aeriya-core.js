const MODULE_ID = "aeriya";

class AeriyaLogger {
  static info(...args) {
    console.info("Aeria Core |", ...args);
  }

  static warn(...args) {
    console.warn("Aeria Core |", ...args);
  }
}

class AeriyaReactionManager {
  static get recoveryThreshold() {
    return game.settings.get(MODULE_ID, "reactionRecoveryThreshold") ?? 4;
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

    await actor.setFlag(MODULE_ID, "reaction.available", recovered);
    await actor.setFlag(MODULE_ID, "reaction.lastRecoveryRoll", roll.total);

    return { actor, roll, recovered };
  }

  static async spend(actor, mode = "reaction") {
    if (!actor) return false;

    const available = actor.getFlag(MODULE_ID, "reaction.available");
    if (!available) {
      ui.notifications?.warn(game.i18n.format("AEЯIA.Notifications.NoReaction", { actor: actor.name }));
      return false;
    }

    await actor.setFlag(MODULE_ID, "reaction.available", false);
    await actor.setFlag(MODULE_ID, "reaction.lastSpentMode", mode);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: game.i18n.format("AEЯIA.Reaction.Spent", {
        actor: actor.name,
        mode: game.i18n.localize(`AEЯIA.Reaction.Mode.${mode}`) || mode
      })
    });

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

  static getWeakPoints(type = "humanoid") {
    return this.weakPointExamples[type] ?? this.weakPointExamples.humanoid;
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

  game.aeriya = {
    reactions: AeriyaReactionManager,
    targetedAttacks: AeriyaTargetedAttacks,
    rituals: AeriyaRitualManager,
    epicActions: AeriyaEpicActions
  };

  AeriyaLogger.info("module initialized");
});

Hooks.once("ready", () => {
  AeriyaLogger.info("module ready", game.modules.get(MODULE_ID)?.version ?? "unknown version");
});
