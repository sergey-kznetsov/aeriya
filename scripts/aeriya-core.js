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

const AERIYA_RELEASE_HANDOUT_PATHS = [
  "content/handouts/middle-lands/common/player-city-customs-handout.md",
  "content/handouts/middle-lands/common/gm-city-scene-checklist.md",
  "content/handouts/middle-lands/common/quest-rynkovaya-zapis.md",
  "content/handouts/middle-lands/common/quest-nochnoy-kolokol.md",
  "content/handouts/middle-lands/common/adventure-dolg-na-rynke.md",
  "content/handouts/middle-lands/common/adventure-kolokol-i-most.md",
  "content/handouts/middle-lands/encounters/encounter-market-debt.md",
  "content/handouts/middle-lands/boards/city-board-middle-lands.md",
  "content/handouts/middle-lands/city-quests/quest-archive-and-empty-name.md",
  "content/handouts/middle-lands/city-quests/quest-cargo-without-owner.md",
  "content/handouts/middle-lands/city-quests/quest-water-and-wooden-paths.md",
  "content/handouts/middle-lands/city-quests/quest-bell-and-house-debt.md",
  "content/handouts/middle-lands/city-quests/quest-beast-roads-and-signs.md",
  "content/handouts/middle-lands/city-quests/quest-lower-gears-and-black-smoke.md",
  "content/handouts/middle-lands/books/kniga-dorozhnyh-zametok.md",
  "content/handouts/middle-lands/books/pismo-bez-dveri.md",
  "content/handouts/shadow-shard/boards/city-board-shadow-shard.md",
  "content/handouts/shadow-shard/ash-steppe/city-quests/quest-okram-zakrytyy-uzel.md",
  "content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-koren-i-dom-mha.md",
  "content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-seryy-priyut-i-staraya-zastava.md",
  "content/handouts/shadow-shard/icy-limit/city-quests/quest-ogon-i-ledyanoy-klyk.md",
  "content/handouts/shadow-shard/icy-limit/city-quests/quest-pereval-i-belye-kamni.md",
  "content/handouts/shadow-shard/ash-steppe/encounters/encounter-tea-house-dispute.md",
  "content/handouts/shadow-shard/black-whisper-forest/encounters/encounter-moss-path.md",
  "content/handouts/shadow-shard/icy-limit/encounters/encounter-last-fire.md",
  "content/handouts/shadow-shard/ash-steppe/books/zapis-o-pyati-chashah.md",
  "content/handouts/shadow-shard/black-whisper-forest/books/shest-pravil-mha.md",
  "content/handouts/shadow-shard/icy-limit/books/zapis-ob-obschem-ogne.md",
  "content/handouts/scorching-shard/boards/city-board-scorching-shard.md",
  "content/handouts/scorching-shard/city-quests/quest-tri-teni-i-posledniy-vzdoh.md",
  "content/handouts/scorching-shard/city-quests/quest-klinok-i-steklyannyy-gorodok.md",
  "content/handouts/scorching-shard/city-quests/quest-rodnik-i-belyy-kolodets.md",
  "content/handouts/scorching-shard/city-quests/quest-fort-dvorets-i-krasnaya-sol.md",
  "content/handouts/scorching-shard/city-quests/quest-melnitsa-porog-i-tihaya-korka.md",
  "content/handouts/scorching-shard/encounters/encounter-dry-road.md",
  "content/handouts/scorching-shard/books/spisok-suhoy-dorogi.md",
  "content/_indexes/shadow-shard-play-index.md",
  "content/_indexes/scorching-shard-index.md",
  "content/_indexes/handouts-index.md"
];

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

class AeriyaContentImporter {
  static get releasePaths() {
    return AERIYA_RELEASE_HANDOUT_PATHS;
  }

  static parseMarkdownDocument(markdown, sourcePath) {
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
    const frontmatter = {};
    let body = markdown;

    if (frontmatterMatch) {
      body = markdown.slice(frontmatterMatch[0].length).trim();
      for (const line of frontmatterMatch[1].split("\n")) {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) continue;
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
        frontmatter[key] = value;
      }
    }

    const title = frontmatter.name || body.match(/^#\s+(.+)$/m)?.[1]?.trim() || sourcePath.split("/").pop()?.replace(/\.md$/, "") || sourcePath;
    return { frontmatter, body, title };
  }

  static escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  static renderInline(markdown) {
    return this.escapeHtml(markdown)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  static markdownToHtml(markdown) {
    return markdown
      .split(/\n{2,}/)
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";

        const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
          const level = Math.min(heading[1].length, 6);
          return `<h${level}>${this.renderInline(heading[2])}</h${level}>`;
        }

        if (trimmed.startsWith("|")) {
          return `<pre>${this.escapeHtml(trimmed)}</pre>`;
        }

        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((line) => line.replace(/^-\s+/, "").trim()).filter(Boolean);
          return `<ul>${items.map((item) => `<li>${this.renderInline(item)}</li>`).join("")}</ul>`;
        }

        return `<p>${this.renderInline(trimmed).replace(/\n/g, "<br>")}</p>`;
      })
      .join("\n");
  }

  static folderNameFor(path, data) {
    const shard = data.shard || "common";
    if (shard === "middle-lands") return "Aeria Core — Срединные Земли";
    if (shard === "shadow-shard") return "Aeria Core — Теневой Осколок";
    if (shard === "scorching-shard") return "Aeria Core — Палящий Осколок";
    return "Aeria Core — Индексы и справки";
  }

  static async getOrCreateFolder(name) {
    const existing = game.folders.find((folder) => folder.type === "JournalEntry" && folder.name === name);
    if (existing) return existing;
    return Folder.create({ name, type: "JournalEntry", sorting: "a" });
  }

  static async importReleaseContent({ overwrite = false } = {}) {
    if (!game.user?.isGM) {
      ui.notifications?.warn("Aeria Core: импорт материалов доступен только мастеру.");
      return { created: 0, updated: 0, skipped: 0, failed: [] };
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const failed = [];

    for (const sourcePath of this.releasePaths) {
      try {
        const response = await fetch(`modules/${MODULE_ID}/${sourcePath}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const markdown = await response.text();
        const { frontmatter, body, title } = this.parseMarkdownDocument(markdown, sourcePath);
        const folder = await this.getOrCreateFolder(this.folderNameFor(sourcePath, frontmatter));
        const existing = game.journal.find((entry) => entry.getFlag(MODULE_ID, "sourcePath") === sourcePath);
        const content = this.markdownToHtml(body);

        if (existing && !overwrite) {
          skipped += 1;
          continue;
        }

        const payload = {
          name: title,
          folder: folder.id,
          flags: {
            [MODULE_ID]: {
              sourcePath,
              shard: frontmatter.shard || "",
              region: frontmatter.region || "",
              source: frontmatter.source || "",
              status: frontmatter.status || "",
              importedBy: "AeriyaContentImporter"
            }
          },
          pages: [
            {
              name: title,
              type: "text",
              text: {
                format: 1,
                content
              }
            }
          ]
        };

        if (existing && overwrite) {
          await existing.update({ name: title, folder: folder.id, flags: payload.flags });
          const page = existing.pages.contents[0];
          if (page) await page.update(payload.pages[0]);
          else await JournalEntryPage.create(payload.pages[0], { parent: existing });
          updated += 1;
          continue;
        }

        await JournalEntry.create(payload);
        created += 1;
      } catch (error) {
        failed.push({ sourcePath, error: error.message });
        AeriyaLogger.warn("content import failed", sourcePath, error);
      }
    }

    const message = `Aeria Core: импорт материалов завершён. Создано: ${created}, обновлено: ${updated}, пропущено: ${skipped}, ошибок: ${failed.length}.`;
    if (failed.length > 0) ui.notifications?.warn(message);
    else ui.notifications?.info(message);

    return { created, updated, skipped, failed };
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
    factions: AeriyaFactions,
    contentImporter: AeriyaContentImporter,
    importReleaseContent: (options = {}) => AeriyaContentImporter.importReleaseContent(options)
  };

  AeriyaLogger.info("module initialized");
});

Hooks.once("ready", () => {
  AeriyaLogger.info("module ready", game.modules.get(MODULE_ID)?.version ?? "unknown version");
});
