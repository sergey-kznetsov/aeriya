/**
 * Aeria Core — Content Importer v0.3.2
 *
 * Imports Journals, Actors (NPCs + Bestiary with embedded Items), and Scenes.
 * This importer is intentionally world-level: it creates working materials directly
 * in the active Foundry world and is safe to run repeatedly via module update.
 */

const MODULE_ID = "aeriya";
const IMPORT_SCHEMA_VERSION = "world-import-v4";
const DEFAULT_ACTOR_IMAGE = "icons/svg/mystery-man.svg";

const _folderCache = new Map();

async function getOrCreateFolder(documentType, folderPath) {
  const key = `${documentType}::${folderPath}`;
  if (_folderCache.has(key)) return _folderCache.get(key);

  const parts = String(folderPath || "Aeria Core")
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  let parent = null;
  for (const part of parts) {
    const existing = game.folders.find(
      (folder) => folder.type === documentType && folder.name === part && (folder.folder?.id ?? null) === (parent?.id ?? null)
    );
    parent = existing ?? await Folder.create({ name: part, type: documentType, folder: parent?.id ?? null, sorting: "a" });
  }

  _folderCache.set(key, parent);
  return parent;
}

function parseCR(raw) {
  if (raw === null || raw === undefined) return 0;
  const s = String(raw).trim().split(/[\s(]/)[0];
  if (s === "1/2") return 0.5;
  if (s === "1/4") return 0.25;
  if (s === "1/8") return 0.125;
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseFirstNumber(value, fallback = 0) {
  const match = String(value ?? "").match(/-?\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : fallback;
}

function parseMovement(speedText) {
  const movement = { walk: 30, swim: 0, fly: 0, climb: 0, burrow: 0, units: "ft" };
  if (!speedText) return movement;

  const walk = speedText.match(/^(\d+)\s*фт/i);
  const fly = speedText.match(/полёт[^\d]*(\d+)/i);
  const swim = speedText.match(/плав[^\d]*(\d+)/i);
  const climb = speedText.match(/лаз[^\d]*(\d+)/i);
  const burrow = speedText.match(/копан|рыть|нор[^\d]*(\d+)/i);

  if (walk) movement.walk = parseInt(walk[1], 10);
  if (fly) movement.fly = parseInt(fly[1], 10);
  if (swim) movement.swim = parseInt(swim[1], 10);
  if (climb) movement.climb = parseInt(climb[1], 10);
  if (burrow) movement.burrow = parseInt(burrow[1], 10);
  return movement;
}

function parseAbilityTable(markdown) {
  const match = markdown.match(/\|\s*СИЛ\s*\|\s*ЛОВ\s*\|\s*ТЕЛ\s*\|\s*ИНТ\s*\|\s*М[ДУ]Р\s*\|\s*ХАР\s*\|[\s\S]*?\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)/i);
  if (!match) return { str:{value:10}, dex:{value:10}, con:{value:10}, int:{value:10}, wis:{value:10}, cha:{value:10} };
  return {
    str: { value: parseInt(match[1], 10) || 10 },
    dex: { value: parseInt(match[2], 10) || 10 },
    con: { value: parseInt(match[3], 10) || 10 },
    int: { value: parseInt(match[4], 10) || 10 },
    wis: { value: parseInt(match[5], 10) || 10 },
    cha: { value: parseInt(match[6], 10) || 10 }
  };
}

function inferSize(text) {
  const value = String(text || "").toLowerCase();
  if (value.includes("крохотн")) return "tiny";
  if (value.includes("маленьк")) return "sm";
  if (value.includes("огромн")) return "huge";
  if (value.includes("громадн")) return "grg";
  if (value.includes("большой") || value.includes("большая") || value.includes("большое")) return "lg";
  return "med";
}

function inferType(text) {
  const map = {
    аберрация: "aberration", зверь: "beast", небожитель: "celestial", конструкт: "construct",
    дракон: "dragon", элементаль: "elemental", фея: "fey", исчадие: "fiend", великан: "giant",
    гуманоид: "humanoid", слизь: "ooze", монструозность: "monstrosity", нежить: "undead", растение: "plant"
  };
  const value = String(text || "").toLowerCase();
  for (const [ru, en] of Object.entries(map)) {
    if (value.includes(ru)) return en;
  }
  return "humanoid";
}

function renderInline(markdown) {
  return escapeHtml(markdown)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function stripDuplicateH1(markdown, title = "") {
  if (!title) return markdown;
  const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return markdown.replace(new RegExp(`^#\\s+${safeTitle}\\s*\\n+`, "m"), "").trim();
}

function mdToHtml(markdown, title = "") {
  if (!markdown) return "<p></p>";
  const text = stripDuplicateH1(markdown, title);
  const blocks = text.trim().split(/\n{2,}/);
  const html = ['<div class="aeriya-content">'];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (/^\|.+\|/.test(trimmed) && trimmed.includes("\n") && /\|\s*-+/.test(trimmed)) {
      const rows = trimmed
        .split("\n")
        .map((row) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
        .filter((row) => row.some(Boolean));
      const header = rows[0] ?? [];
      const body = rows.slice(2);
      html.push(`<table class="aeriya-table"><thead><tr>${header.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 6);
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items = trimmed.split("\n").map((line) => line.replace(/^[-*]\s+/, "").trim()).filter(Boolean);
      html.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    html.push(`<p>${renderInline(trimmed.split("\n").map((line) => line.trim()).filter(Boolean).join(" "))}</p>`);
  }

  html.push("</div>");
  return html.join("\n");
}

async function fetchText(path) {
  const response = await fetch(`modules/${MODULE_ID}/${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
  return response.text();
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  const fm = {};
  let body = markdown;

  if (match) {
    body = markdown.slice(match[0].length).trim();
    for (const line of match[1].split("\n")) {
      const separator = line.indexOf(":");
      if (separator === -1) continue;
      fm[line.slice(0, separator).trim()] = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    }
  }

  const h1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return { fm, body, name: fm.name || h1 || "Aeria" };
}

function extractH1Blocks(body, batchTitle) {
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

function parseMetric(markdown, ...labels) {
  for (const label of labels) {
    const match = markdown.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\n]+)`, "i"));
    if (match) return match[1].trim();
  }
  return "";
}

function buildEmbeddedItems(markdown) {
  const items = [];

  function parseBoldFeats(sectionText, activationType) {
    const matches = [...sectionText.matchAll(/\*\*([^*]+?)\.\*\*\s+([^\n]+(?:\n(?!\*\*)[^\n]+)*)/g)];
    for (const [, rawName, rawDesc] of matches) {
      const name = rawName.trim();
      const desc = rawDesc.trim();
      const isAttack = /атака оружием|к попаданию/i.test(desc);
      const damageMatch = desc.match(/(\d+к\d+(?:\s*[+\-]\s*\d+)?)\s*(рубящ|колющ|дробящ|огнен|кислот|некрот|психич|молние|ядовит|холодн|силов|излучен)/i);
      const hitMatch = desc.match(/[+](\d+)\s*к попаданию/i);
      const reachMatch = desc.match(/(\d+)\s*фт/);
      const damageTypeMap = {
        рубящ: "slashing", колющ: "piercing", дробящ: "bludgeoning", огнен: "fire", кислот: "acid",
        некрот: "necrotic", психич: "psychic", молние: "lightning", ядовит: "poison", холодн: "cold",
        силов: "force", излучен: "radiant"
      };
      const damageKey = damageMatch ? Object.keys(damageTypeMap).find((key) => damageMatch[2].toLowerCase().startsWith(key)) : null;
      const damageType = damageKey ? damageTypeMap[damageKey] : "bludgeoning";

      if (isAttack && activationType === "action") {
        items.push({
          name,
          type: "weapon",
          system: {
            description: { value: `<p>${escapeHtml(desc)}</p>` },
            activation: { type: "action", cost: 1 },
            target: { type: "creature", count: 1 },
            range: { value: reachMatch ? parseInt(reachMatch[1], 10) : 5, units: "ft" },
            actionType: "mwak",
            attackBonus: hitMatch ? parseInt(hitMatch[1], 10) : 0,
            damage: { parts: damageMatch ? [[damageMatch[1].replace(/\s/g, "").replace(/к/gi, "d"), damageType]] : [["1d4", "bludgeoning"]] },
            equipped: true,
            proficient: true,
            source: { custom: "Aeria Core" }
          }
        });
      } else {
        items.push({
          name,
          type: "feat",
          system: {
            description: { value: `<p>${escapeHtml(desc)}</p>` },
            activation: { type: activationType, cost: activationType === "passive" ? null : 1 },
            source: { custom: "Aeria Core" }
          }
        });
      }
    }
  }

  const sections = {
    "## Особенности": "passive",
    "## Действия": "action",
    "## Бонусное действие": "bonus",
    "## Бонусные действия": "bonus",
    "## Реакция": "reaction",
    "## Реакции": "reaction",
    "## Легендарные действия": "legendary"
  };

  for (const [header, activation] of Object.entries(sections)) {
    const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sectionMatch = markdown.match(new RegExp(`${escaped}\n([\s\S]*?)(?=\n## |\n---\n|\n# |$)`));
    if (sectionMatch) parseBoldFeats(sectionMatch[1], activation);
  }

  const dobychaMatch = markdown.match(/\*\*Добыча Ловчих:\*\*\s*([^\n]+)/i);
  if (dobychaMatch) {
    items.push({
      name: "Добыча Ловчих",
      type: "feat",
      system: {
        description: { value: `<p><strong>Добыча Ловчих:</strong> ${escapeHtml(dobychaMatch[1].trim())}</p>` },
        activation: { type: "passive", cost: null },
        source: { custom: "Aeria Core" }
      }
    });
  }

  return items;
}

function buildActorData(block, sourcePath, fm, folderId, tokenMap, kind) {
  const markdown = block.markdown;
  const cr = parseCR(parseMetric(markdown, "CR", "КО", "КД опасности"));
  const acRaw = parseMetric(markdown, "КД");
  const hpRaw = parseMetric(markdown, "ХП");
  const speedRaw = parseMetric(markdown, "Скорость");
  const languageText = parseMetric(markdown, "Языки");
  const sensesText = parseMetric(markdown, "Чувства");
  const darkvisionMatch = sensesText.match(/тёмное зрение\s+(\d+)/i);
  const firstLine = markdown.split("\n").slice(1).find((line) => line.trim()) ?? "";
  const tokenImg = tokenMap?.get(block.name.toLowerCase()) ?? DEFAULT_ACTOR_IMAGE;

  return {
    name: block.name,
    type: "npc",
    img: tokenImg,
    folder: folderId,
    system: {
      details: {
        biography: { value: mdToHtml(markdown, block.name), public: "" },
        type: { value: inferType(firstLine), custom: "" },
        cr,
        source: { custom: fm.source || "Aeria Core" }
      },
      attributes: {
        ac: { flat: parseFirstNumber(acRaw, 10), calc: "flat" },
        hp: {
          value: parseFirstNumber(hpRaw, 1),
          max: parseFirstNumber(hpRaw, 1),
          temp: 0,
          tempmax: 0,
          formula: (hpRaw.match(/\((.+?)\)/)?.[1] ?? "").replace(/к/gi, "d")
        },
        movement: parseMovement(speedRaw),
        senses: { darkvision: darkvisionMatch ? parseInt(darkvisionMatch[1], 10) : 0, special: sensesText, units: "ft", perception: 0 }
      },
      abilities: parseAbilityTable(markdown),
      skills: {},
      traits: {
        size: inferSize(firstLine),
        languages: { value: [], custom: languageText || "" },
        di: { value: [], custom: "" }, dr: { value: [], custom: "" }, dv: { value: [], custom: "" }, ci: { value: [], custom: "" }
      }
    },
    prototypeToken: {
      name: block.name,
      actorLink: false,
      disposition: kind === "npc" ? 0 : -1,
      displayName: 20,
      displayBars: 20,
      bar1: { attribute: "attributes.hp" },
      texture: { src: tokenImg, scaleX: 1, scaleY: 1 },
      sight: { enabled: false }
    },
    flags: {
      [MODULE_ID]: {
        sourcePath,
        sourceBlock: block.name,
        documentKind: kind,
        shard: fm.shard || (sourcePath.includes("shadow") ? "shadow-shard" : sourcePath.includes("scorching") ? "scorching-shard" : "middle-lands"),
        region: fm.region || "",
        importSchema: IMPORT_SCHEMA_VERSION
      }
    }
  };
}

function actorFolderPath(sourcePath, fm, kind) {
  const prefix = kind === "npc" ? "Aeria Core / НИПы" : "Aeria Core / Бестиарий";
  const shard = fm.shard || (sourcePath.includes("shadow") ? "shadow-shard" : sourcePath.includes("scorching") ? "scorching-shard" : "middle-lands");
  const region = fm.region || "";
  const shardMap = { "middle-lands": "Срединные Земли", "shadow-shard": "Теневой Осколок", "scorching-shard": "Палящий Осколок" };
  const regionMap = {
    "ash-steppe": "Пепельная Степь",
    "black-whisper-forest": "Лес Чёрного Шёпота",
    "icy-limit": "Ледяной Предел",
    "burning-wastes": "Выжженные Пустоши",
    "burned-wasteland": "Выжженные Пустоши",
    "salt-deserts": "Соляные Пустыни",
    all: "Общие"
  };
  const shardName = shardMap[shard] ?? "Общие";
  const regionName = regionMap[region];
  return regionName ? `${prefix} / ${shardName} / ${regionName}` : `${prefix} / ${shardName}`;
}

async function loadTokenMap() {
  try {
    const manifest = JSON.parse(await fetchText("assets/manifests/old-world-assets.json"));
    const map = new Map();
    for (const token of manifest.tokens ?? []) {
      if (token.status === "imported") map.set(token.name.toLowerCase(), token.path);
    }
    return map;
  } catch {
    return new Map();
  }
}

async function replaceActorItems(actor, items) {
  const itemIds = actor.items?.map((item) => item.id) ?? [];
  if (itemIds.length > 0) await actor.deleteEmbeddedDocuments("Item", itemIds);
  if (items.length > 0) await actor.createEmbeddedDocuments("Item", items);
}

function preserveExistingActorImages(existing, data) {
  if (!existing) return data;
  const currentImg = existing.img;
  const currentTokenImg = existing.prototypeToken?.texture?.src;

  if (currentImg && currentImg !== DEFAULT_ACTOR_IMAGE && data.img === DEFAULT_ACTOR_IMAGE) {
    data.img = currentImg;
  }
  if (currentTokenImg && currentTokenImg !== DEFAULT_ACTOR_IMAGE && data.prototypeToken?.texture?.src === DEFAULT_ACTOR_IMAGE) {
    data.prototypeToken.texture.src = currentTokenImg;
  }
  return data;
}

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
  "content/actor-statblocks/bestiary/source-import-batch-01.md",
  "content/actor-statblocks/bestiary/module-scorching-creatures-batch-02.md",
  "content/actor-statblocks/bestiary/module-shadow-creatures-batch-02.md"
];

async function importH1Actors(paths, kind, tokenMap, { overwrite = false } = {}) {
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  for (const sourcePath of paths) {
    try {
      const markdown = await fetchText(sourcePath);
      const { fm, body, name: batchName } = parseFrontmatter(markdown);
      const blocks = extractH1Blocks(body, batchName);
      if (!blocks.length) continue;
      const folder = await getOrCreateFolder("Actor", actorFolderPath(sourcePath, fm, kind));

      for (const block of blocks) {
        if (!block.name) continue;
        const existing = game.actors.find((actor) => actor.getFlag(MODULE_ID, "sourcePath") === sourcePath && actor.getFlag(MODULE_ID, "sourceBlock") === block.name);
        if (existing && !overwrite) { result.skipped += 1; continue; }

        const items = buildEmbeddedItems(block.markdown);
        let data = buildActorData(block, sourcePath, fm, folder.id, tokenMap, kind);
        if (!Number.isFinite(data.system.details.cr)) data.system.details.cr = 0;
        data = preserveExistingActorImages(existing, data);

        try {
          if (existing && overwrite) {
            await existing.update(data);
            await replaceActorItems(existing, items);
            result.updated += 1;
          } else {
            await Actor.create({ ...data, items });
            result.created += 1;
          }
        } catch (innerError) {
          try {
            if (existing && overwrite) {
              await existing.update(data);
              await replaceActorItems(existing, []);
              result.updated += 1;
            } else {
              await Actor.create(data);
              result.created += 1;
            }
          } catch (fallbackError) {
            result.failed.push({ sourcePath, block: block.name, error: fallbackError.message || innerError.message });
          }
        }
      }
    } catch (error) {
      result.failed.push({ sourcePath, error: error.message });
    }
  }
  return result;
}

const TABLE_STATBLOCK_PATHS = [
  { path: "content/actor-statblocks/middle-lands/npc-statblocks.md", kind: "npc" },
  { path: "content/actor-statblocks/middle-lands/monster-statblocks.md", kind: "bestiary" },
  { path: "content/actor-statblocks/shadow-shard/ash-steppe-npc-statblocks.md", kind: "npc" },
  { path: "content/actor-statblocks/shadow-shard/forest-npc-statblocks.md", kind: "npc" },
  { path: "content/actor-statblocks/shadow-shard/monster-statblocks.md", kind: "bestiary" },
  { path: "content/actor-statblocks/scorching-shard/monster-statblocks.md", kind: "bestiary" }
];

function parseTableActors(markdown) {
  const results = [];
  const tablePattern = /\|[^\n]+\|\n\|[-: |]+\|\n((?:\|[^\n]+\|\n?)+)/g;
  let tableMatch;
  while ((tableMatch = tablePattern.exec(markdown)) !== null) {
    const allRows = tableMatch[0].trim().split("\n");
    const header = allRows[0].split("|").map((cell) => cell.trim()).filter(Boolean);
    const dataRows = allRows.slice(2);

    for (const row of dataRows) {
      const cells = row.split("|").map((cell) => cell.trim()).filter(Boolean);
      if (cells.length < 3) continue;
      const data = {};
      header.forEach((heading, index) => { data[heading] = cells[index] ?? ""; });
      const name = data["НИП / роль"] || data["НИП"] || data["Существо"] || cells[0];
      if (!name || name.startsWith("---") || name.startsWith("|")) continue;

      const actionsText = data["Действия и особенности"] || data["Действия"] || "";
      const items = [];
      if (actionsText) {
        const actionParts = actionsText.split(/;\s*(?=[А-ЯA-Z])/);
        for (const part of actionParts) {
          const itemName = part.match(/^([^:+]+?)(?:\s*\+\d+,|\s*:)/)?.[1]?.trim() || "Действие";
          if (itemName.length < 2 || itemName.length > 60) continue;
          const isAttack = /к попаданию|удар|атака|\+\d+,\s*\d+к/i.test(part);
          const damageMatch = part.match(/(\d+к\d+(?:\s*[+\-]\s*\d+)?)\s*(рубящ|колющ|дробящ|огнен|некрот|психич)/i);
          const hitMatch = part.match(/[+](\d+),/);
          if (isAttack && damageMatch) {
            items.push({
              name: itemName,
              type: "weapon",
              system: {
                description: { value: `<p>${escapeHtml(part.trim())}</p>` },
                activation: { type: "action", cost: 1 },
                actionType: "mwak",
                attackBonus: hitMatch ? parseInt(hitMatch[1], 10) : 0,
                damage: { parts: [[damageMatch[1].replace(/\s/g, "").replace(/к/gi, "d"), "bludgeoning"]] },
                equipped: true,
                proficient: true,
                source: { custom: "Aeria Core" }
              }
            });
          } else {
            items.push({ name: itemName, type: "feat", system: { description: { value: `<p>${escapeHtml(part.trim())}</p>` }, activation: { type: "action", cost: 1 }, source: { custom: "Aeria Core" } } });
          }
        }
      }

      const stats = (data["Характеристики"] || "10/10/10/10/10/10").split("/").map((value) => parseInt(value.trim(), 10) || 10);
      const sizeTypeText = data["Размер / тип"] || "";
      const skillsText = data["Навыки / чувства"] || data["Навыки"] || "";
      const biographyHtml = `<div class="aeriya-content"><h3>${escapeHtml(name)}</h3>${[
        data["Класс / архетип"] && `<p><strong>Класс:</strong> ${escapeHtml(data["Класс / архетип"])}</p>`,
        data["Ур."] && `<p><strong>Уровень:</strong> ${escapeHtml(data["Ур."])}</p>`,
        sizeTypeText && `<p><strong>Тип:</strong> ${escapeHtml(sizeTypeText)}</p>`,
        skillsText && `<p><strong>Навыки/чувства:</strong> ${escapeHtml(skillsText)}</p>`,
        actionsText && `<h4>Действия</h4><p>${escapeHtml(actionsText)}</p>`
      ].filter(Boolean).join("\n")}</div>`;

      results.push({
        name,
        cr: parseCR(data["CR"] || data["КО"] || "0"),
        acNum: parseFirstNumber(data["КД"] || "10", 10),
        hpNum: parseFirstNumber(data["Хиты"] || "1", 1),
        movement: parseMovement(data["Скорость"] || ""),
        abilities: { str:{value:stats[0]}, dex:{value:stats[1]}, con:{value:stats[2]}, int:{value:stats[3]}, wis:{value:stats[4]}, cha:{value:stats[5]} },
        size: inferSize(sizeTypeText),
        creatureType: inferType(sizeTypeText),
        biographyHtml,
        skillsText,
        items
      });
    }
  }
  return results;
}

async function importTableActors(tokenMap, { overwrite = false } = {}) {
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  for (const { path: sourcePath, kind } of TABLE_STATBLOCK_PATHS) {
    try {
      const markdown = await fetchText(sourcePath);
      const { fm } = parseFrontmatter(markdown);
      const rows = parseTableActors(markdown);
      if (!rows.length) continue;
      const folder = await getOrCreateFolder("Actor", actorFolderPath(sourcePath, fm, kind));

      for (const row of rows) {
        const existing = game.actors.find((actor) => actor.getFlag(MODULE_ID, "sourcePath") === sourcePath && actor.getFlag(MODULE_ID, "sourceBlock") === row.name);
        if (existing && !overwrite) { result.skipped += 1; continue; }
        const tokenImg = tokenMap?.get(row.name.toLowerCase()) ?? DEFAULT_ACTOR_IMAGE;
        let actorData = {
          name: row.name,
          type: "npc",
          img: tokenImg,
          folder: folder.id,
          system: {
            details: { biography: { value: row.biographyHtml, public: "" }, type: { value: row.creatureType, custom: "" }, cr: row.cr, source: { custom: fm.source || "Aeria Core" } },
            attributes: { ac: { flat: row.acNum, calc: "flat" }, hp: { value: row.hpNum, max: row.hpNum, temp: 0, tempmax: 0, formula: "" }, movement: row.movement, senses: { darkvision: 0, special: row.skillsText || "", units: "ft", perception: 0 } },
            abilities: row.abilities,
            skills: {},
            traits: { size: row.size, languages: { value: [], custom: "общий" }, di:{value:[],custom:""}, dr:{value:[],custom:""}, dv:{value:[],custom:""}, ci:{value:[],custom:""} }
          },
          prototypeToken: { name: row.name, actorLink: false, disposition: kind === "npc" ? 0 : -1, displayName: 20, displayBars: 20, bar1: { attribute: "attributes.hp" }, texture: { src: tokenImg, scaleX: 1, scaleY: 1 }, sight: { enabled: false } },
          flags: { [MODULE_ID]: { sourcePath, sourceBlock: row.name, documentKind: kind, shard: fm.shard || "middle-lands", region: fm.region || "", importSchema: IMPORT_SCHEMA_VERSION } }
        };
        actorData = preserveExistingActorImages(existing, actorData);

        try {
          if (existing && overwrite) {
            await existing.update(actorData);
            await replaceActorItems(existing, row.items);
            result.updated += 1;
          } else {
            await Actor.create({ ...actorData, items: row.items });
            result.created += 1;
          }
        } catch (error) {
          try {
            if (existing && overwrite) {
              await existing.update(actorData);
              await replaceActorItems(existing, []);
              result.updated += 1;
            } else {
              await Actor.create(actorData);
              result.created += 1;
            }
          } catch (fallbackError) {
            result.failed.push({ sourcePath, block: row.name, error: fallbackError.message || error.message });
          }
        }
      }
    } catch (error) {
      result.failed.push({ sourcePath, error: error.message });
    }
  }
  return result;
}

async function importActors({ overwrite = false } = {}) {
  const tokenMap = await loadTokenMap();
  return mergeResults(
    await importH1Actors(NPC_BATCH_PATHS, "npc", tokenMap, { overwrite }),
    await importH1Actors(BESTIARY_BATCH_PATHS, "bestiary", tokenMap, { overwrite }),
    await importTableActors(tokenMap, { overwrite })
  );
}

const LEGACY_HANDOUT_PATHS = [
  { sp: "content/handouts/middle-lands/common/quest-rynkovaya-zapis.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/common/quest-nochnoy-kolokol.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/common/adventure-dolg-na-rynke.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/common/adventure-kolokol-i-most.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/city-quests/quest-archive-and-empty-name.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/city-quests/quest-cargo-without-owner.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/city-quests/quest-water-and-wooden-paths.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/city-quests/quest-bell-and-house-debt.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/city-quests/quest-beast-roads-and-signs.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/city-quests/quest-lower-gears-and-black-smoke.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/middle-lands/common/player-city-customs-handout.md", folder: "Aeria Core / Раздаточные материалы" },
  { sp: "content/handouts/middle-lands/common/gm-city-scene-checklist.md", folder: "Aeria Core / Раздаточные материалы" },
  { sp: "content/handouts/shadow-shard/ash-steppe/city-quests/quest-okram-zakrytyy-uzel.md", folder: "Aeria Core / Квесты и приключения / Теневой Осколок / Пепельная Степь" },
  { sp: "content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-koren-i-dom-mha.md", folder: "Aeria Core / Квесты и приключения / Теневой Осколок / Лес Чёрного Шёпота" },
  { sp: "content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-seryy-priyut-i-staraya-zastava.md", folder: "Aeria Core / Квесты и приключения / Теневой Осколок / Лес Чёрного Шёпота" },
  { sp: "content/handouts/shadow-shard/icy-limit/city-quests/quest-ogon-i-ledyanoy-klyk.md", folder: "Aeria Core / Квесты и приключения / Теневой Осколок / Ледяной Предел" },
  { sp: "content/handouts/shadow-shard/icy-limit/city-quests/quest-pereval-i-belye-kamni.md", folder: "Aeria Core / Квесты и приключения / Теневой Осколок / Ледяной Предел" },
  { sp: "content/handouts/scorching-shard/city-quests/quest-tri-teni-i-posledniy-vzdoh.md", folder: "Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp: "content/handouts/scorching-shard/city-quests/quest-klinok-i-steklyannyy-gorodok.md", folder: "Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp: "content/handouts/scorching-shard/city-quests/quest-rodnik-i-belyy-kolodets.md", folder: "Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp: "content/handouts/scorching-shard/city-quests/quest-fort-dvorets-i-krasnaya-sol.md", folder: "Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp: "content/handouts/scorching-shard/city-quests/quest-melnitsa-porog-i-tihaya-korka.md", folder: "Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp: "content/handouts/shadow-shard/ash-steppe/encounters/encounter-tea-house-dispute.md", folder: "Aeria Core / Квесты и приключения / Теневой Осколок / Пепельная Степь" },
  { sp: "content/handouts/shadow-shard/black-whisper-forest/encounters/encounter-moss-path.md", folder: "Aeria Core / Квесты и приключения / Теневой Осколок / Лес Чёрного Шёпота" },
  { sp: "content/handouts/shadow-shard/icy-limit/encounters/encounter-last-fire.md", folder: "Aeria Core / Квесты и приключения / Теневой Осколок / Ледяной Предел" },
  { sp: "content/handouts/scorching-shard/encounters/encounter-dry-road.md", folder: "Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp: "content/handouts/middle-lands/encounters/encounter-market-debt.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/shadow-shard/ash-steppe/books/zapis-o-pyati-chashah.md", folder: "Aeria Core / Книги внутри мира / Предания" },
  { sp: "content/handouts/shadow-shard/black-whisper-forest/books/shest-pravil-mha.md", folder: "Aeria Core / Книги внутри мира / Предания" },
  { sp: "content/handouts/shadow-shard/icy-limit/books/zapis-ob-obschem-ogne.md", folder: "Aeria Core / Книги внутри мира / Предания" },
  { sp: "content/handouts/scorching-shard/books/spisok-suhoy-dorogi.md", folder: "Aeria Core / Книги внутри мира / Предания" },
  { sp: "content/handouts/middle-lands/books/kniga-dorozhnyh-zametok.md", folder: "Aeria Core / Книги внутри мира / Дорожные байки" },
  { sp: "content/handouts/middle-lands/books/pismo-bez-dveri.md", folder: "Aeria Core / Книги внутри мира / Дорожные байки" },
  { sp: "content/handouts/middle-lands/boards/city-board-middle-lands.md", folder: "Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp: "content/handouts/shadow-shard/boards/city-board-shadow-shard.md", folder: "Aeria Core / Квесты и приключения / Теневой Осколок" },
  { sp: "content/handouts/scorching-shard/boards/city-board-scorching-shard.md", folder: "Aeria Core / Квесты и приключения / Палящий Осколок" }
];

const SPIRIT_PATHS = [
  "content/spirits/all-shards/common/niks.md",
  "content/spirits/all-shards/common/omulu.md",
  "content/spirits/all-shards/common/vechnyy-zmey.md",
  "content/spirits/middle-lands/common/duh-perekrestka.md",
  "content/spirits/middle-lands/common/poslednyaya-torgovka.md",
  "content/spirits/shadow-shard/ash-steppe/runay-stepnoy.md",
  "content/spirits/shadow-shard/ash-steppe/salbar.md",
  "content/spirits/shadow-shard/black-whisper-forest/mat-mha.md",
  "content/spirits/shadow-shard/black-whisper-forest/sam-les.md",
  "content/spirits/shadow-shard/black-whisper-forest/shepotnik.md",
  "content/spirits/shadow-shard/icy-limit/ayrun-severnyy.md",
  "content/spirits/shadow-shard/icy-limit/belyy-ugolek.md",
  "content/spirits/shadow-shard/icy-limit/iskra-predkov.md",
  "content/spirits/scorching-shard/common/glas-suhoy-dorogi.md",
  "content/spirits/scorching-shard/common/ignis-peschanyy-zmey.md",
  "content/spirits/scorching-shard/common/mat-soli.md",
  "content/spirits/scorching-shard/common/peschanaya-mat.md",
  "content/spirits/scorching-shard/common/runay-palyaschiy.md",
  "content/spirits/scorching-shard/common/shamas-solntselikiy.md"
];

async function deleteExtraJournalPages(entry, keepCount) {
  const extraPageIds = entry.pages.contents.slice(keepCount).map((page) => page.id);
  if (extraPageIds.length > 0) await entry.deleteEmbeddedDocuments("JournalEntryPage", extraPageIds);
}

async function importJournals({ overwrite = false } = {}) {
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  let journalData = [];

  try {
    journalData = JSON.parse(await fetchText("content/generated/journal-content.json"));
  } catch (error) {
    result.failed.push({ sourcePath: "content/generated/journal-content.json", error: error.message });
  }

  for (const { sp, folder } of LEGACY_HANDOUT_PATHS) {
    try {
      const markdown = await fetchText(sp);
      const { body, name } = parseFrontmatter(markdown);
      journalData.push({ folder, sourcePath: sp, shard: "all", name, pages: [{ name, content: mdToHtml(body, name) }] });
    } catch {
      // Optional legacy material can be absent during early module assembly.
    }
  }

  for (const sp of SPIRIT_PATHS) {
    try {
      const markdown = await fetchText(sp);
      const { fm, body, name } = parseFrontmatter(markdown);
      const shard = fm.shard || (sp.includes("shadow") ? "shadow-shard" : sp.includes("scorching") ? "scorching-shard" : "all");
      const shardFolderName = { "shadow-shard": "Теневой Осколок", "scorching-shard": "Палящий Осколок" }[shard] || "Все Осколки";
      journalData.push({ folder: `Aeria Core / Духи / ${shardFolderName}`, sourcePath: sp, shard, name, pages: [{ name, content: mdToHtml(body, name) }] });
    } catch {
      // Optional spirit material can be absent during early module assembly.
    }
  }

  for (const entry of journalData) {
    try {
      const sourcePath = entry.sourcePath;
      const existing = game.journal.find((journal) => journal.getFlag(MODULE_ID, "sourcePath") === sourcePath);
      if (existing && !overwrite) { result.skipped += 1; continue; }

      const folder = await getOrCreateFolder("JournalEntry", entry.folder || "Aeria Core / Справочник");
      const pages = (entry.pages || []).map((page, index) => ({
        name: page.name || `Страница ${index + 1}`,
        type: "text",
        sort: (index + 1) * 100000,
        text: { format: 1, content: page.content || "<p></p>" }
      }));
      const flags = { [MODULE_ID]: { sourcePath, documentKind: "journal", shard: entry.shard || "all", region: entry.region || "", importSchema: IMPORT_SCHEMA_VERSION } };

      if (existing && overwrite) {
        await existing.update({ name: entry.name, folder: folder.id, flags });
        for (let index = 0; index < pages.length; index += 1) {
          const existingPage = existing.pages.contents[index];
          if (existingPage) await existingPage.update(pages[index]);
          else await JournalEntryPage.create(pages[index], { parent: existing });
        }
        await deleteExtraJournalPages(existing, pages.length);
        result.updated += 1;
      } else {
        await JournalEntry.create({ name: entry.name, folder: folder.id, flags, pages });
        result.created += 1;
      }
    } catch (error) {
      result.failed.push({ sourcePath: entry.sourcePath || entry.name, error: error.message });
    }
  }

  return result;
}

async function importScenes({ overwrite = false } = {}) {
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  let scenesData = [];
  try {
    scenesData = JSON.parse(await fetchText("content/generated/scenes-data.json"));
  } catch (error) {
    result.failed.push({ sourcePath: "content/generated/scenes-data.json", error: error.message });
    return result;
  }

  if (overwrite) {
    const manifestPaths = new Set(scenesData.map((scene) => scene.sourcePath));
    const obsolete = game.scenes.filter((scene) => {
      const sourcePath = scene.getFlag(MODULE_ID, "sourcePath");
      return sourcePath && !manifestPaths.has(sourcePath) && scene.getFlag(MODULE_ID, "documentKind") === "scene";
    });
    if (obsolete.length > 0) await Scene.deleteDocuments(obsolete.map((scene) => scene.id));
  }

  for (const spec of scenesData) {
    try {
      const existing = game.scenes.find((scene) => scene.getFlag(MODULE_ID, "sourcePath") === spec.sourcePath);
      if (existing && !overwrite) { result.skipped += 1; continue; }
      const folder = await getOrCreateFolder("Scene", spec.folder || "Aeria Core / Сцены");
      const sceneData = {
        name: spec.name,
        folder: folder.id,
        width: existing?.width || 1600,
        height: existing?.height || 900,
        padding: 0,
        background: { src: "" },
        grid: { type: 0, size: 100, distance: 5, units: "ft" },
        tokenVision: false,
        fogExploration: false,
        navigation: false,
        darkness: 0,
        notes: [], tokens: [], tiles: [], walls: [], lights: [], sounds: [], drawings: [],
        flags: { [MODULE_ID]: { sourcePath: spec.sourcePath, documentKind: "scene", shard: spec.shard || "", region: spec.region || "", locationType: spec.type || "", description: spec.description || "", displayMode: "show-only-city-image", tacticalMap: false, playerMovement: false, importSchema: IMPORT_SCHEMA_VERSION } }
      };

      if (existing && overwrite) {
        const update = { ...sceneData };
        const existingBackground = existing.background?.src;
        if (existingBackground) delete update.background;
        await existing.update(update);
        result.updated += 1;
      } else {
        await Scene.create(sceneData);
        result.created += 1;
      }
    } catch (error) {
      result.failed.push({ sourcePath: spec.sourcePath, error: error.message });
    }
  }

  return result;
}

function mergeResults(...results) {
  const merged = { created: 0, updated: 0, skipped: 0, failed: [] };
  for (const result of results) {
    if (!result) continue;
    merged.created += result.created ?? 0;
    merged.updated += result.updated ?? 0;
    merged.skipped += result.skipped ?? 0;
    merged.failed.push(...(result.failed ?? []));
  }
  return merged;
}

async function importAll({ overwrite = false } = {}) {
  if (!game.user?.isGM) {
    ui.notifications?.warn("Aeria Core: импорт доступен только мастеру.");
    return { created: 0, updated: 0, skipped: 0, failed: [] };
  }

  ui.notifications?.info("Aeria Core: импортирую контент мира Аэрии...");
  _folderCache.clear();
  const journals = await importJournals({ overwrite });
  const actors = await importActors({ overwrite });
  const scenes = await importScenes({ overwrite });
  const result = mergeResults(journals, actors, scenes);
  const message = `Aeria Core: импорт завершён. Создано: ${result.created}, обновлено: ${result.updated}, пропущено: ${result.skipped}, ошибок: ${result.failed.length}.`;

  if (result.failed.length > 0) {
    console.error("Aeria Core | import failures", result.failed);
    ui.notifications?.error(`${message} Подробности записаны в консоль Foundry.`);
  } else {
    ui.notifications?.info(message);
  }

  return result;
}

class AeriyaContentBootstrap {
  static async registerSettings() {
    game.settings.register(MODULE_ID, "autoImportReleaseContent", {
      name: "Aeria Core: автоимпорт материалов",
      hint: "Автоматически импортировать материалы мира Аэрии при включении модуля у мастера.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
    game.settings.register(MODULE_ID, "releaseContentImportedVersion", {
      name: "Aeria Core: версия импортированных материалов",
      hint: "Служебная настройка.",
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
    game.aeriya.importAll = (options = {}) => importAll(options);
    game.aeriya.importJournals = (options = {}) => importJournals(options);
    game.aeriya.importActors = (options = {}) => importActors(options);
    game.aeriya.importScenes = (options = {}) => importScenes(options);
    game.aeriya.parseCR = parseCR;
  }

  static async runAutoImport() {
    if (!game.user?.isGM) return;
    if (!game.settings.get(MODULE_ID, "autoImportReleaseContent")) return;
    const currentKey = this.importVersionKey;
    const importedKey = game.settings.get(MODULE_ID, "releaseContentImportedVersion");
    if (importedKey === currentKey) {
      console.log(`Aeria Core | Already imported ${currentKey}`);
      return;
    }
    console.log(`Aeria Core | Auto-import ${currentKey}`);
    const result = await importAll({ overwrite: true });
    if (result && result.failed.length === 0) await game.settings.set(MODULE_ID, "releaseContentImportedVersion", currentKey);
  }
}

Hooks.once("init", () => { AeriyaContentBootstrap.registerSettings(); });
Hooks.once("ready", () => { AeriyaContentBootstrap.exposeApi(); AeriyaContentBootstrap.runAutoImport(); });