const MODULE_ID = "aeriya";
const IMPORT_SCHEMA_VERSION = "world-import-v2";
const DEFAULT_ACTOR_IMAGE = "icons/svg/mystery-man.svg";

const JOURNAL_PATHS = [
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

const NPC_BATCH_PATHS = [
  "content/actor-statblocks/npcs/middle-lands-city-npcs-batch-01.md",
  "content/actor-statblocks/npcs/middle-lands-city-npcs-batch-02.md",
  "content/actor-statblocks/npcs/middle-lands-common-npcs-batch-03.md",
  "content/actor-statblocks/npcs/shadow-shard-npcs-batch-01.md",
  "content/actor-statblocks/npcs/scorching-shard-npcs-batch-01.md"
];

const BESTIARY_BATCH_PATHS = [
  "content/actor-statblocks/bestiary/new-middle-creatures-batch-01.md",
  "content/actor-statblocks/bestiary/source-middle-creatures-batch-02.md",
  "content/actor-statblocks/bestiary/source-middle-creatures-batch-03.md",
  "content/actor-statblocks/bestiary/source-middle-creatures-batch-04.md",
  "content/actor-statblocks/bestiary/source-middle-creatures-batch-05.md",
  "content/actor-statblocks/bestiary/source-shadow-creatures-batch-06.md",
  "content/actor-statblocks/bestiary/source-scorching-creatures-batch-07.md",
  "content/actor-statblocks/bestiary/source-middle-expanded-creatures-batch-08.md",
  "content/actor-statblocks/bestiary/source-import-batch-01.md"
];

class AeriyaReleaseImporter {
  static async fetchText(path) {
    const response = await fetch(`modules/${MODULE_ID}/${path}`);
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.text();
  }

  static parseFrontmatter(markdown) {
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
    const frontmatter = {};
    let body = markdown;

    if (frontmatterMatch) {
      body = markdown.slice(frontmatterMatch[0].length).trim();
      for (const line of frontmatterMatch[1].split("\n")) {
        const separator = line.indexOf(":");
        if (separator === -1) continue;
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
        frontmatter[key] = value;
      }
    }

    const firstHeading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
    const name = frontmatter.name || firstHeading || "Aeria Core Material";
    return { frontmatter, body, name };
  }

  static stripFirstMatchingHeading(markdown, title) {
    const lines = markdown.split("\n");
    const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);
    if (firstContentIndex === -1) return markdown;
    const firstLine = lines[firstContentIndex].trim();
    const heading = firstLine.match(/^#\s+(.+)$/)?.[1]?.trim();
    if (!heading) return markdown;
    if (heading === title || heading.toLowerCase() === title.toLowerCase()) {
      lines.splice(firstContentIndex, 1);
      return lines.join("\n").trim();
    }
    return markdown;
  }

  static escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  static renderInline(markdown) {
    return this.escapeHtml(markdown)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  static isTableBlock(block) {
    const lines = block.trim().split("\n").map((line) => line.trim());
    return lines.length >= 2 && lines.every((line) => line.startsWith("|") && line.endsWith("|")) && /^\|?\s*:?-{3,}:?/.test(lines[1]);
  }

  static renderTable(block) {
    const rows = block.trim().split("\n").map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
    const header = rows[0] ?? [];
    const bodyRows = rows.slice(2);
    const thead = `<thead><tr>${header.map((cell) => `<th>${this.renderInline(cell)}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${this.renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<table class="aeriya-table">${thead}${tbody}</table>`;
  }

  static markdownToHtml(markdown, title = "") {
    const prepared = this.stripFirstMatchingHeading(markdown, title);
    const blocks = prepared.split(/\n{2,}/);

    return `<div class="aeriya-imported-content">${blocks.map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (this.isTableBlock(trimmed)) return this.renderTable(trimmed);

      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = Math.min(heading[1].length + 1, 6);
        return `<h${level}>${this.renderInline(heading[2])}</h${level}>`;
      }

      if (trimmed.startsWith("- ")) {
        const items = trimmed.split("\n").map((line) => line.replace(/^-\s+/, "").trim()).filter(Boolean);
        return `<ul>${items.map((item) => `<li>${this.renderInline(item)}</li>`).join("")}</ul>`;
      }

      return `<p>${this.renderInline(trimmed).replace(/\n/g, "<br>")}</p>`;
    }).join("\n")}</div>`;
  }

  static folderNameForJournal(data) {
    if (data.shard === "middle-lands") return "Aeria Core — Срединные Земли";
    if (data.shard === "shadow-shard") return "Aeria Core — Теневой Осколок";
    if (data.shard === "scorching-shard") return "Aeria Core — Палящий Осколок";
    return "Aeria Core — Индексы и справки";
  }

  static actorFolderNameFor(path, data, kind) {
    const prefix = kind === "npc" ? "Aeria Core — НИПы" : "Aeria Core — Бестиарий";
    if (data.shard === "middle-lands" || path.includes("middle")) return `${prefix}: Срединные Земли`;
    if (data.shard === "shadow-shard" || path.includes("shadow")) return `${prefix}: Теневой Осколок`;
    if (data.shard === "scorching-shard" || path.includes("scorching")) return `${prefix}: Палящий Осколок`;
    return `${prefix}: Общие / импорт`;
  }

  static sceneFolderNameFor(shard) {
    if (shard === "middle-lands") return "Aeria Core — Сцены: Срединные Земли";
    if (shard === "shadow-shard") return "Aeria Core — Сцены: Теневой Осколок";
    if (shard === "scorching-shard") return "Aeria Core — Сцены: Палящий Осколок";
    return "Aeria Core — Сцены: Общие";
  }

  static async getOrCreateFolder(type, name) {
    const existing = game.folders.find((folder) => folder.type === type && folder.name === name);
    if (existing) return existing;
    return Folder.create({ name, type, sorting: "a" });
  }

  static async importJournals({ overwrite = false } = {}) {
    const result = { created: 0, updated: 0, skipped: 0, failed: [] };

    for (const sourcePath of JOURNAL_PATHS) {
      try {
        const markdown = await this.fetchText(sourcePath);
        const parsed = this.parseFrontmatter(markdown);
        const folder = await this.getOrCreateFolder("JournalEntry", this.folderNameForJournal(parsed.frontmatter));
        const existing = game.journal.find((entry) => entry.getFlag(MODULE_ID, "sourcePath") === sourcePath);
        const content = this.markdownToHtml(parsed.body, parsed.name);
        const pageData = {
          name: parsed.name,
          type: "text",
          text: { format: 1, content }
        };

        const flags = {
          [MODULE_ID]: {
            sourcePath,
            documentKind: "journal",
            shard: parsed.frontmatter.shard || "",
            region: parsed.frontmatter.region || "",
            source: parsed.frontmatter.source || "",
            status: parsed.frontmatter.status || "",
            importSchema: IMPORT_SCHEMA_VERSION
          }
        };

        if (existing && !overwrite) {
          result.skipped += 1;
          continue;
        }

        if (existing && overwrite) {
          await existing.update({ name: parsed.name, folder: folder.id, flags });
          const page = existing.pages.contents[0];
          if (page) await page.update(pageData);
          else await JournalEntryPage.create(pageData, { parent: existing });
          result.updated += 1;
          continue;
        }

        await JournalEntry.create({ name: parsed.name, folder: folder.id, flags, pages: [pageData] });
        result.created += 1;
      } catch (error) {
        result.failed.push({ sourcePath, error: error.message });
      }
    }

    return result;
  }

  static extractH1Blocks(body, batchTitle) {
    const matches = [...body.matchAll(/^#\s+(.+)$/gm)];
    const blocks = [];
    for (let index = 0; index < matches.length; index += 1) {
      const name = matches[index][1].trim();
      if (name === batchTitle) continue;
      const start = matches[index].index;
      const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
      const markdown = body.slice(start, end).trim();
      if (markdown) blocks.push({ name, markdown });
    }
    return blocks;
  }

  static parseMetric(markdown, label) {
    const match = markdown.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i"));
    return match?.[1]?.trim() ?? "";
  }

  static parseFirstNumber(value) {
    const match = String(value ?? "").match(/-?\d+/);
    return match ? Number(match[0]) : null;
  }

  static async loadImportedTokenMap() {
    try {
      const manifest = JSON.parse(await this.fetchText("assets/manifests/old-world-assets.json"));
      const map = new Map();
      for (const token of manifest.tokens ?? []) {
        if (token.status !== "imported") continue;
        map.set(this.normalizeName(token.name), token.path);
      }
      return map;
    } catch {
      return new Map();
    }
  }

  static normalizeName(name) {
    return String(name ?? "").toLowerCase().replace(/ё/g, "е").replace(/[^a-z0-9а-я -]+/giu, "").replace(/\s+/g, " ").trim();
  }

  static buildActorData(block, sourcePath, batchData, kind, folder, tokenMap) {
    const acText = this.parseMetric(block.markdown, "КД");
    const hpText = this.parseMetric(block.markdown, "ХП");
    const crText = this.parseMetric(block.markdown, "CR") || this.parseMetric(block.markdown, "КО");
    const speedText = this.parseMetric(block.markdown, "Скорость");
    const img = tokenMap.get(this.normalizeName(block.name)) || DEFAULT_ACTOR_IMAGE;
    const html = this.markdownToHtml(block.markdown, block.name);
    const hp = this.parseFirstNumber(hpText) ?? 1;

    return {
      name: block.name,
      type: "npc",
      folder: folder.id,
      img,
      system: {
        details: {
          biography: { value: html, public: "" },
          type: { value: kind === "npc" ? "humanoid" : "custom" },
          cr: crText
        },
        attributes: {
          ac: { flat: this.parseFirstNumber(acText) ?? 10 },
          hp: { value: hp, max: hp },
          movement: { special: speedText }
        }
      },
      prototypeToken: {
        name: block.name,
        actorLink: false,
        disposition: kind === "npc" ? 0 : -1,
        texture: { src: img }
      },
      flags: {
        [MODULE_ID]: {
          sourcePath,
          sourceBlock: block.name,
          documentKind: kind,
          shard: batchData.shard || "",
          region: batchData.region || "",
          source: batchData.source || "",
          status: batchData.status || "",
          importSchema: IMPORT_SCHEMA_VERSION
        }
      }
    };
  }

  static async importActorBatchPaths(paths, kind, { overwrite = false } = {}) {
    const result = { created: 0, updated: 0, skipped: 0, failed: [] };
    const tokenMap = await this.loadImportedTokenMap();

    for (const sourcePath of paths) {
      try {
        const markdown = await this.fetchText(sourcePath);
        const parsed = this.parseFrontmatter(markdown);
        const blocks = this.extractH1Blocks(parsed.body, parsed.name);
        const folder = await this.getOrCreateFolder("Actor", this.actorFolderNameFor(sourcePath, parsed.frontmatter, kind));

        for (const block of blocks) {
          const existing = game.actors.find((actor) => actor.getFlag(MODULE_ID, "sourcePath") === sourcePath && actor.getFlag(MODULE_ID, "sourceBlock") === block.name);
          if (existing && !overwrite) {
            result.skipped += 1;
            continue;
          }

          const actorData = this.buildActorData(block, sourcePath, parsed.frontmatter, kind, folder, tokenMap);
          if (existing && overwrite) {
            await existing.update(actorData);
            result.updated += 1;
          } else {
            await Actor.create(actorData);
            result.created += 1;
          }
        }
      } catch (error) {
        result.failed.push({ sourcePath, error: error.message });
      }
    }

    return result;
  }

  static async importActors({ overwrite = false } = {}) {
    const npcs = await this.importActorBatchPaths(NPC_BATCH_PATHS, "npc", { overwrite });
    const bestiary = await this.importActorBatchPaths(BESTIARY_BATCH_PATHS, "bestiary", { overwrite });
    return this.mergeResults(npcs, bestiary, { npcs, bestiary });
  }

  static async importScenes({ overwrite = false } = {}) {
    const result = { created: 0, updated: 0, skipped: 0, failed: [], importedAssets: 0 };

    try {
      const manifest = JSON.parse(await this.fetchText("assets/manifests/old-world-assets.json"));
      const shards = new Set(["middle-lands", "shadow-shard", "scorching-shard"]);
      for (const shard of shards) await this.getOrCreateFolder("Scene", this.sceneFolderNameFor(shard));

      for (const record of manifest.cityScenes ?? []) {
        if (record.status !== "imported") continue;
        result.importedAssets += 1;
        const folder = await this.getOrCreateFolder("Scene", this.sceneFolderNameFor(record.shard));
        const existing = game.scenes.find((scene) => scene.getFlag(MODULE_ID, "assetId") === record.id);

        if (existing && !overwrite) {
          result.skipped += 1;
          continue;
        }

        const sceneData = {
          name: record.name,
          folder: folder.id,
          img: record.path,
          background: { src: record.path, offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1, rotation: 0, tint: "#ffffff" },
          width: 1600,
          height: 900,
          padding: 0,
          grid: { type: 0, size: 100, distance: 5, units: "ft" },
          tokenVision: false,
          fogExploration: false,
          navigation: false,
          notes: [],
          tokens: [],
          tiles: [],
          walls: [],
          lights: [],
          sounds: [],
          drawings: [],
          flags: {
            [MODULE_ID]: {
              assetId: record.id,
              documentKind: "scene",
              sourcePath: record.path,
              shard: record.shard || "",
              kind: record.kind || "city-scene",
              displayMode: "show-only-city-image",
              tacticalMap: false,
              playerMovement: false,
              importSchema: IMPORT_SCHEMA_VERSION
            }
          }
        };

        if (existing && overwrite) {
          await existing.update(sceneData);
          result.updated += 1;
        } else {
          await Scene.create(sceneData);
          result.created += 1;
        }
      }
    } catch (error) {
      result.failed.push({ sourcePath: "assets/manifests/old-world-assets.json", error: error.message });
    }

    return result;
  }

  static mergeResults(...results) {
    const merged = { created: 0, updated: 0, skipped: 0, failed: [] };
    for (const result of results) {
      if (!result || typeof result !== "object") continue;
      merged.created += result.created ?? 0;
      merged.updated += result.updated ?? 0;
      merged.skipped += result.skipped ?? 0;
      merged.failed.push(...(result.failed ?? []));
      for (const [key, value] of Object.entries(result)) {
        if (!["created", "updated", "skipped", "failed"].includes(key)) merged[key] = value;
      }
    }
    return merged;
  }

  static async importAll({ overwrite = false } = {}) {
    if (!game.user?.isGM) {
      ui.notifications?.warn("Aeria Core: импорт доступен только мастеру.");
      return { created: 0, updated: 0, skipped: 0, failed: [] };
    }

    ui.notifications?.info("Aeria Core: импортирую Journal, НИПов, бестиарий и сцены.");
    const journals = await this.importJournals({ overwrite });
    const actors = await this.importActors({ overwrite });
    const scenes = await this.importScenes({ overwrite });
    const result = this.mergeResults(journals, actors, scenes, { journals, actors, scenes });

    const text = `Aeria Core: импорт завершён. Создано: ${result.created}, обновлено: ${result.updated}, пропущено: ${result.skipped}, ошибок: ${result.failed.length}.`;
    if (result.failed.length > 0) {
      console.error("Aeria Core | import failures", result.failed);
      ui.notifications?.error(`${text} Подробности в консоли F12.`);
    } else {
      ui.notifications?.info(text);
    }

    return result;
  }
}

class AeriyaReleaseContentBootstrap {
  static async registerSettings() {
    game.settings.register(MODULE_ID, "autoImportReleaseContent", {
      name: "Aeria Core: автоимпорт материалов",
      hint: "Автоматически импортировать Journal, НИПов, бестиарий и show-only сцены Аэрии в мир при включении модуля у мастера.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(MODULE_ID, "releaseContentImportedVersion", {
      name: "Aeria Core: версия импортированных материалов",
      hint: "Служебная настройка. Хранит версию схемы импорта материалов в этом мире.",
      scope: "world",
      config: false,
      type: String,
      default: ""
    });
  }

  static get importVersionKey() {
    return `${game.modules.get(MODULE_ID)?.version ?? "unknown"}:${IMPORT_SCHEMA_VERSION}`;
  }

  static exposeApi() {
    game.aeriya = game.aeriya ?? {};
    game.aeriya.importReleaseContent = (options = {}) => AeriyaReleaseImporter.importAll(options);
    game.aeriya.importReleaseJournals = (options = {}) => AeriyaReleaseImporter.importJournals(options);
    game.aeriya.importReleaseActors = (options = {}) => AeriyaReleaseImporter.importActors(options);
    game.aeriya.importReleaseScenes = (options = {}) => AeriyaReleaseImporter.importScenes(options);
    game.aeriya.releaseImporter = AeriyaReleaseImporter;
  }

  static async runAutoImport() {
    if (!game.user?.isGM) return;
    const autoImport = game.settings.get(MODULE_ID, "autoImportReleaseContent");
    if (!autoImport) return;

    const currentVersion = this.importVersionKey;
    const importedVersion = game.settings.get(MODULE_ID, "releaseContentImportedVersion");
    if (importedVersion === currentVersion) return;

    const result = await AeriyaReleaseImporter.importAll({ overwrite: true });
    if (result.failed.length > 0) return;
    await game.settings.set(MODULE_ID, "releaseContentImportedVersion", currentVersion);
  }
}

Hooks.once("init", () => {
  AeriyaReleaseContentBootstrap.registerSettings();
});

Hooks.once("ready", () => {
  AeriyaReleaseContentBootstrap.exposeApi();
  AeriyaReleaseContentBootstrap.runAutoImport();
});
