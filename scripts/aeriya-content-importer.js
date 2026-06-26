/**
 * Aeria Core — Content Importer v0.3.1
 *
 * Imports Journals, Actors (NPCs + Bestiary with embedded Items), and Scenes.
 *
 * Fixes vs v0.2.x:
 *  - CR always finite number (1/2→0.5, "3 (700 опыта)"→3, null→0)
 *  - Embedded Items (feats, weapons, reactions, legendary) parsed from statblocks
 *  - Table-format statblock files (old format) also imported
 *  - 56 scenes across all Shards/regions/types, nested folder hierarchy
 *  - 19 journal books from docx (250+ pages), no duplicate H1
 *  - Journals: markdown tables as <table>, lists as <ul>
 *  - Idempotent (finds by flags.aeriya.sourcePath + sourceBlock)
 *  - No overwrite of user-set scene backgrounds
 *  - Nested Actor folders: Shard → Region
 *  - Nested Scene folders: Shard → Region → Type
 *  - Nested Journal folders
 */

const MODULE_ID = "aeriya";
const IMPORT_SCHEMA_VERSION = "world-import-v3";
const DEFAULT_ACTOR_IMAGE = "icons/svg/mystery-man.svg";

// ── Folder cache ─────────────────────────────────────────────
const _folderCache = new Map();

async function getOrCreateFolder(documentType, folderPath) {
  const key = `${documentType}::${folderPath}`;
  if (_folderCache.has(key)) return _folderCache.get(key);
  const parts = folderPath.split(" / ").filter(Boolean);
  let parent = null;
  for (const part of parts) {
    const existing = game.folders.find(
      (f) => f.type === documentType && f.name === part && (f.folder?.id ?? null) === (parent?.id ?? null)
    );
    parent = existing ?? await Folder.create({ name: part, type: documentType, folder: parent?.id ?? null, sorting: "a" });
  }
  _folderCache.set(key, parent);
  return parent;
}

// ── Utilities ────────────────────────────────────────────────
function parseCR(raw) {
  if (raw === null || raw === undefined) return 0;
  const s = String(raw).trim().split(/[\s(]/)[0];
  if (s === "1/2") return 0.5;
  if (s === "1/4") return 0.25;
  if (s === "1/8") return 0.125;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function escapeHtml(text) {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseFirstNumber(value, fallback = 0) {
  const m = String(value ?? "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : fallback;
}

function parseMovement(speedText) {
  const m = { walk: 30, swim: 0, fly: 0, climb: 0, burrow: 0, units: "ft" };
  if (!speedText) return m;
  const w = speedText.match(/^(\d+)\s*фт/i); if (w) m.walk = parseInt(w[1]);
  const f = speedText.match(/полёт[^\d]*(\d+)/i); if (f) m.fly = parseInt(f[1]);
  const s = speedText.match(/плав[^\d]*(\d+)/i); if (s) m.swim = parseInt(s[1]);
  const c = speedText.match(/лаз[^\d]*(\d+)/i); if (c) m.climb = parseInt(c[1]);
  return m;
}

function parseAbilityTable(md) {
  const m = md.match(/\|\s*СИЛ\s*\|\s*ЛОВ\s*\|\s*ТЕЛ\s*\|\s*ИНТ\s*\|\s*М[ДУ]Р\s*\|\s*ХАР\s*\|[\s\S]*?\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)/i);
  if (m) return {
    str: { value: parseInt(m[1]) || 10 }, dex: { value: parseInt(m[2]) || 10 },
    con: { value: parseInt(m[3]) || 10 }, int: { value: parseInt(m[4]) || 10 },
    wis: { value: parseInt(m[5]) || 10 }, cha: { value: parseInt(m[6]) || 10 },
  };
  return { str:{value:10}, dex:{value:10}, con:{value:10}, int:{value:10}, wis:{value:10}, cha:{value:10} };
}

function inferSize(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("крохотн")) return "tiny";
  if (t.includes("маленьк")) return "sm";
  if (t.includes("огромн")) return "huge";
  if (t.includes("громадн")) return "grg";
  if (t.includes("большой") || t.includes("большая") || t.includes("большое")) return "lg";
  return "med";
}

function inferType(text) {
  const map = { аберрация:"aberration", зверь:"beast", небожитель:"celestial", конструкт:"construct",
    дракон:"dragon", элементаль:"elemental", фея:"fey", исчадие:"fiend", великан:"giant",
    гуманоид:"humanoid", слизь:"ooze", монструозность:"monstrosity", нежить:"undead", растение:"plant" };
  const t = (text || "").toLowerCase();
  for (const [ru, en] of Object.entries(map)) { if (t.includes(ru)) return en; }
  return "humanoid";
}

// ── Markdown → HTML ──────────────────────────────────────────
function mdToHtml(md, title = "") {
  if (!md) return "<p></p>";
  let text = md;
  if (title) text = text.replace(new RegExp(`^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s*\\n`,"m"), "");
  const blocks = text.trim().split(/\n{2,}/);
  const html = ['<div class="aeriya-content">'];
  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;
    // Table
    if (/^\|.+\|/.test(b) && b.includes("\n") && /\|-+/.test(b)) {
      const rows = b.split("\n").map(r => r.trim().replace(/^\||\|$/g,"").split("|").map(c=>c.trim()));
      const hdr = rows[0]; const body = rows.slice(2).filter(r=>r.some(c=>c));
      html.push(`<table class="aeriya-table"><thead><tr>${hdr.map(h=>`<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${body.map(r=>`<tr>${r.map(c=>`<td>${escapeHtml(c).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    // Heading
    const hm = b.match(/^(#{1,6})\s+(.+)$/);
    if (hm) { html.push(`<h${Math.min(hm[1].length+1,6)}>${escapeHtml(hm[2])}</h${Math.min(hm[1].length+1,6)}>`); continue; }
    // List
    if (b.startsWith("- ") || b.startsWith("* ")) {
      const items = b.split("\n").map(l=>l.replace(/^[-*]\s+/,"").trim()).filter(Boolean);
      html.push(`<ul>${items.map(i=>`<li>${escapeHtml(i).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")}</li>`).join("")}</ul>`);
      continue;
    }
    // Para
    const content = b.split("\n").map(l=>l.trim()).filter(Boolean).join(" ");
    html.push(`<p>${escapeHtml(content).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>")}</p>`);
  }
  html.push("</div>");
  return html.join("\n");
}

// ── Fetch helper ─────────────────────────────────────────────
async function fetchText(path) {
  const r = await fetch(`modules/${MODULE_ID}/${path}`);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
  return r.text();
}

// ── Frontmatter parser ───────────────────────────────────────
function parseFrontmatter(markdown) {
  const m = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  const fm = {};
  let body = markdown;
  if (m) {
    body = markdown.slice(m[0].length).trim();
    for (const line of m[1].split("\n")) {
      const sep = line.indexOf(":");
      if (sep === -1) continue;
      fm[line.slice(0,sep).trim()] = line.slice(sep+1).trim().replace(/^["']|["']$/g,"");
    }
  }
  const h1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return { fm, body, name: fm.name || h1 || "Aeria" };
}

// ── Extract H1 blocks ────────────────────────────────────────
function extractH1Blocks(body, batchTitle) {
  const matches = [...body.matchAll(/^#\s+(.+)$/gm)];
  const blocks = [];
  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1].trim();
    if (name === batchTitle) continue;
    const start = matches[i].index;
    const end = i+1 < matches.length ? matches[i+1].index : body.length;
    const mkd = body.slice(start, end).trim();
    if (mkd) blocks.push({ name, markdown: mkd });
  }
  return blocks;
}

// ── Parse single metric ──────────────────────────────────────
function parseMetric(md, ...labels) {
  for (const label of labels) {
    const m = md.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\n]+)`,"i"));
    if (m) return m[1].trim();
  }
  return "";
}

// ── Embedded Items builder ───────────────────────────────────
function buildEmbeddedItems(md) {
  const items = [];

  function parseBoldFeats(sectionText, activationType) {
    const matches = [...sectionText.matchAll(/\*\*([^*]+?)\.\*\*\s+([^\n]+(?:\n(?!\*\*)[^\n]+)*)/g)];
    for (const [, rawName, rawDesc] of matches) {
      const name = rawName.trim();
      const desc = rawDesc.trim();
      const isAttack = /атака оружием|к попаданию/i.test(desc);
      const dmgM = desc.match(/(\d+к\d+(?:\s*[+\-]\s*\d+)?)\s*(рубящ|колющ|дробящ|огнен|кислот|некрот|психич|молние|ядовит|холодн|силов|излучен)/i);
      const hitM = desc.match(/[+](\d+)\s*к попаданию/i);
      const reachM = desc.match(/(\d+)\s*фт/);

      const dmgTypeMap = { рубящ:"slashing", колющ:"piercing", дробящ:"bludgeoning",
        огнен:"fire", кислот:"acid", некрот:"necrotic", психич:"psychic",
        молние:"lightning", ядовит:"poison", холодн:"cold", силов:"force", излучен:"radiant" };
      const dmgType = dmgM ? (dmgTypeMap[Object.keys(dmgTypeMap).find(k=>dmgM[2].toLowerCase().startsWith(k))] ?? "bludgeoning") : "bludgeoning";

      if (isAttack && activationType === "action") {
        items.push({
          name,
          type: "weapon",
          system: {
            description: { value: `<p>${escapeHtml(desc)}</p>` },
            activation: { type: "action", cost: 1 },
            target: { type: "creature", count: 1 },
            range: { value: reachM ? parseInt(reachM[1]) : 5, units: "ft" },
            actionType: "mwak",
            attackBonus: hitM ? parseInt(hitM[1]) : 0,
            damage: { parts: dmgM ? [[dmgM[1].replace(/\s/g,"").replace(/к/gi,"d"), dmgType]] : [["1d4","bludgeoning"]] },
            equipped: true, proficient: true,
            source: { custom: "Aeria Core" },
          },
        });
      } else {
        items.push({
          name,
          type: "feat",
          system: {
            description: { value: `<p>${escapeHtml(desc)}</p>` },
            activation: { type: activationType, cost: activationType === "passive" ? null : 1 },
            source: { custom: "Aeria Core" },
          },
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
    "## Легендарные действия": "legendary",
  };

  for (const [header, activation] of Object.entries(sections)) {
    const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sectionMatch = md.match(new RegExp(`${escaped}\\n([\\s\\S]*?)(?=\\n## |\\n---\\n|\\n# |$)`));
    if (sectionMatch) parseBoldFeats(sectionMatch[1], activation);
  }

  // Добыча Ловчих как feat
  const dobychaM = md.match(/\*\*Добыча Ловчих:\*\*\s*([^\n]+)/i);
  if (dobychaM) {
    items.push({
      name: "Добыча Ловчих",
      type: "feat",
      system: {
        description: { value: `<p><strong>Добыча Ловчих:</strong> ${escapeHtml(dobychaM[1].trim())}</p>` },
        activation: { type: "passive", cost: null },
        source: { custom: "Aeria Core" },
      },
    });
  }

  return items;
}

// ── Build Actor data ─────────────────────────────────────────
function buildActorData(block, sourcePath, fm, folderID, tokenMap, kind) {
  const md = block.markdown;
  const cr = parseCR(parseMetric(md, "CR", "КО", "КД опасности"));
  const acRaw = parseMetric(md, "КД");
  const acNum = parseFirstNumber(acRaw, 10);
  const hpRaw = parseMetric(md, "ХП");
  const hpNum = parseFirstNumber(hpRaw, 1);
  const hpDice = (hpRaw.match(/\((.+?)\)/)?.[1] ?? "").replace(/к/gi, "d");
  const speedRaw = parseMetric(md, "Скорость");
  const movement = parseMovement(speedRaw);
  const abilities = parseAbilityTable(md);
  const langText = parseMetric(md, "Языки");
  const sensesText = parseMetric(md, "Чувства");
  const dvMatch = sensesText.match(/тёмное зрение\s+(\d+)/i);
  const senses = { darkvision: dvMatch ? parseInt(dvMatch[1]) : 0, special: sensesText, units: "ft", perception: 0 };
  const firstLine = md.split("\n").slice(1).find(l => l.trim()) ?? "";
  const size = inferSize(firstLine);
  const creatureType = inferType(firstLine);
  const tokenImg = tokenMap?.get(block.name.toLowerCase()) ?? DEFAULT_ACTOR_IMAGE;
  const biographyHtml = mdToHtml(md, block.name);

  return {
    name: block.name,
    type: "npc",
    img: tokenImg,
    folder: folderID,
    system: {
      details: {
        biography: { value: biographyHtml, public: "" },
        type: { value: creatureType, custom: "" },
        cr,
        source: { custom: fm.source || "Aeria Core" },
      },
      attributes: {
        ac: { flat: acNum, calc: "flat" },
        hp: { value: hpNum, max: hpNum, temp: 0, tempmax: 0, formula: hpDice },
        movement,
        senses,
      },
      abilities,
      skills: {},
      traits: {
        size,
        languages: { value: [], custom: langText || "" },
        di: { value: [], custom: "" }, dr: { value: [], custom: "" },
        dv: { value: [], custom: "" }, ci: { value: [], custom: "" },
      },
    },
    prototypeToken: {
      name: block.name,
      actorLink: false,
      disposition: kind === "npc" ? 0 : -1,
      displayName: 20,
      displayBars: 20,
      bar1: { attribute: "attributes.hp" },
      texture: { src: tokenImg, scaleX: 1, scaleY: 1 },
      sight: { enabled: false },
    },
    flags: {
      [MODULE_ID]: {
        sourcePath,
        sourceBlock: block.name,
        documentKind: kind,
        shard: fm.shard || (sourcePath.includes("shadow") ? "shadow-shard" : sourcePath.includes("scorching") ? "scorching-shard" : "middle-lands"),
        region: fm.region || "",
        importSchema: IMPORT_SCHEMA_VERSION,
      },
    },
  };
}

// ── Actor folder path ────────────────────────────────────────
function actorFolderPath(sourcePath, fm, kind) {
  const prefix = kind === "npc" ? "Aeria Core / НИПы" : "Aeria Core / Бестиарий";
  const shard = fm.shard || (sourcePath.includes("shadow") ? "shadow-shard" : sourcePath.includes("scorching") ? "scorching-shard" : "middle-lands");
  const region = fm.region || "";
  const shardMap = { "middle-lands":"Срединные Земли", "shadow-shard":"Теневой Осколок", "scorching-shard":"Палящий Осколок" };
  const regionMap = { "ash-steppe":"Пепельная Степь", "black-whisper-forest":"Лес Чёрного Шёпота", "icy-limit":"Ледяной Предел", "burned-wasteland":"Выжженные Пустоши", "salt-deserts":"Соляные Пустыни", "all":"Общие / импорт" };
  const sN = shardMap[shard] ?? "Общие";
  const rN = regionMap[region];
  return rN ? `${prefix} / ${sN} / ${rN}` : `${prefix} / ${sN}`;
}

// ── Token map ────────────────────────────────────────────────
async function loadTokenMap() {
  try {
    const manifest = JSON.parse(await fetchText("assets/manifests/old-world-assets.json"));
    const map = new Map();
    for (const t of manifest.tokens ?? []) {
      if (t.status === "imported") map.set(t.name.toLowerCase(), t.path);
    }
    return map;
  } catch { return new Map(); }
}

// ── H1-block actor import ────────────────────────────────────
const NPC_BATCH_PATHS = [
  "content/actor-statblocks/npcs/middle-lands-city-npcs-batch-01.md",
  "content/actor-statblocks/npcs/middle-lands-city-npcs-batch-02.md",
  "content/actor-statblocks/npcs/middle-lands-common-npcs-batch-03.md",
  "content/actor-statblocks/npcs/shadow-shard-npcs-batch-01.md",
  "content/actor-statblocks/npcs/scorching-shard-npcs-batch-01.md",
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
  "content/actor-statblocks/bestiary/module-shadow-creatures-batch-02.md",
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
        const existing = game.actors.find(a =>
          a.getFlag(MODULE_ID, "sourcePath") === sourcePath &&
          a.getFlag(MODULE_ID, "sourceBlock") === block.name
        );
        if (existing && !overwrite) { result.skipped++; continue; }
        const data = buildActorData(block, sourcePath, fm, folder.id, tokenMap, kind);
        const items = buildEmbeddedItems(block.markdown);
        if (!Number.isFinite(data.system.details.cr)) data.system.details.cr = 0;
        try {
          if (existing && overwrite) {
            await existing.update(data);
            // Update items if any
            if (items.length) {
              await existing.deleteEmbeddedDocuments("Item", existing.items.map(i => i.id));
              await existing.createEmbeddedDocuments("Item", items);
            }
            result.updated++;
          } else {
            await Actor.create({ ...data, items });
            result.created++;
          }
        } catch (innerErr) {
          // Retry without items if creation fails
          try {
            if (!existing) await Actor.create(data);
            else await existing.update(data);
            existing && overwrite ? result.updated++ : result.created++;
          } catch (e2) {
            result.failed.push({ sourcePath, block: block.name, error: e2.message });
          }
        }
      }
    } catch (err) {
      result.failed.push({ sourcePath, error: err.message });
    }
  }
  return result;
}

// ── Table-format actor import ─────────────────────────────────
const TABLE_STATBLOCK_PATHS = [
  { path: "content/actor-statblocks/middle-lands/npc-statblocks.md", kind: "npc" },
  { path: "content/actor-statblocks/middle-lands/monster-statblocks.md", kind: "bestiary" },
  { path: "content/actor-statblocks/shadow-shard/ash-steppe-npc-statblocks.md", kind: "npc" },
  { path: "content/actor-statblocks/shadow-shard/forest-npc-statblocks.md", kind: "npc" },
  { path: "content/actor-statblocks/shadow-shard/monster-statblocks.md", kind: "bestiary" },
  { path: "content/actor-statblocks/scorching-shard/monster-statblocks.md", kind: "bestiary" },
];

function parseTableActors(markdown, fm) {
  const results = [];
  const tablePattern = /\|[^\n]+\|\n\|[-: |]+\|\n((?:\|[^\n]+\|\n?)+)/g;
  let tableMatch;
  while ((tableMatch = tablePattern.exec(markdown)) !== null) {
    const allRows = tableMatch[0].trim().split("\n");
    const header = allRows[0].split("|").map(h => h.trim()).filter(Boolean);
    const dataRows = allRows.slice(2);
    for (const row of dataRows) {
      const cells = row.split("|").map(c => c.trim()).filter(Boolean);
      if (cells.length < 3) continue;
      const data = {};
      header.forEach((h, i) => { data[h] = cells[i] ?? ""; });
      const name = data["НИП / роль"] || data["НИП"] || data["Существо"] || cells[0];
      if (!name || name.startsWith("---") || name.startsWith("|")) continue;
      const crRaw = data["CR"] || data["КО"] || "0";
      const cr = parseCR(crRaw);
      const acNum = parseFirstNumber(data["КД"] || "10", 10);
      const hpNum = parseFirstNumber(data["Хиты"] || "1", 1);
      const movement = parseMovement(data["Скорость"] || "");
      const statsRaw = data["Характеристики"] || "10/10/10/10/10/10";
      const s = statsRaw.split("/").map(v => parseInt(v.trim()) || 10);
      const abilities = { str:{value:s[0]||10}, dex:{value:s[1]||10}, con:{value:s[2]||10}, int:{value:s[3]||10}, wis:{value:s[4]||10}, cha:{value:s[5]||10} };
      const sizeTypeText = data["Размер / тип"] || "";
      const size = inferSize(sizeTypeText);
      const creatureType = inferType(sizeTypeText);
      const actionsText = data["Действия и особенности"] || data["Действия"] || "";
      const skillsText = data["Навыки / чувства"] || data["Навыки"] || "";
      const classText = data["Класс / архетип"] || "";
      const levelText = data["Ур."] || data["Уровень"] || "";

      // Build items from actions text (each ; separated action)
      const items = [];
      if (actionsText) {
        const actionParts = actionsText.split(/;\s*(?=[А-ЯA-Z])/);
        for (const part of actionParts) {
          const nameMatch = part.match(/^([^:+]+?)(?:\s*\+\d+,|\s*:)/);
          const itemName = nameMatch?.[1]?.trim() || "Действие";
          if (itemName.length < 2 || itemName.length > 60) continue;
          const isAttack = /к попаданию|удар|атака|\+\d+,\s*\d+к/i.test(part);
          const dmgM = part.match(/(\d+к\d+(?:\s*[+\-]\s*\d+)?)\s*(рубящ|колющ|дробящ|огнен|некрот|психич)/i);
          const hitM = part.match(/[+](\d+),/);
          if (isAttack && dmgM) {
            items.push({
              name: itemName,
              type: "weapon",
              system: {
                description: { value: `<p>${escapeHtml(part.trim())}</p>` },
                activation: { type: "action", cost: 1 },
                actionType: "mwak",
                attackBonus: hitM ? parseInt(hitM[1]) : 0,
                damage: { parts: [[dmgM[1].replace(/\s/g,"").replace(/к/gi,"d"), "bludgeoning"]] },
                equipped: true, proficient: true,
                source: { custom: "Aeria Core" },
              },
            });
          } else {
            items.push({
              name: itemName,
              type: "feat",
              system: {
                description: { value: `<p>${escapeHtml(part.trim())}</p>` },
                activation: { type: "action", cost: 1 },
                source: { custom: "Aeria Core" },
              },
            });
          }
        }
      }

      const biographyHtml = `<div class="aeriya-content"><h3>${escapeHtml(name)}</h3>${[
        classText && `<p><strong>Класс:</strong> ${escapeHtml(classText)}</p>`,
        levelText && `<p><strong>Уровень:</strong> ${escapeHtml(levelText)}</p>`,
        sizeTypeText && `<p><strong>Тип:</strong> ${escapeHtml(sizeTypeText)}</p>`,
        skillsText && `<p><strong>Навыки/чувства:</strong> ${escapeHtml(skillsText)}</p>`,
        actionsText && `<h4>Действия</h4><p>${escapeHtml(actionsText)}</p>`,
      ].filter(Boolean).join("\n")}</div>`;

      results.push({ name, cr, acNum, hpNum, movement, abilities, size, creatureType, biographyHtml, skillsText, items });
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
      const rows = parseTableActors(markdown, fm);
      if (!rows.length) continue;
      const folder = await getOrCreateFolder("Actor", actorFolderPath(sourcePath, fm, kind));
      for (const row of rows) {
        const existing = game.actors.find(a =>
          a.getFlag(MODULE_ID, "sourcePath") === sourcePath &&
          a.getFlag(MODULE_ID, "sourceBlock") === row.name
        );
        if (existing && !overwrite) { result.skipped++; continue; }
        const tokenImg = tokenMap?.get(row.name.toLowerCase()) ?? DEFAULT_ACTOR_IMAGE;
        const actorData = {
          name: row.name, type: "npc", img: tokenImg, folder: folder.id,
          system: {
            details: { biography: { value: row.biographyHtml, public: "" }, type: { value: row.creatureType, custom: "" }, cr: row.cr, source: { custom: fm.source || "Aeria Core" } },
            attributes: {
              ac: { flat: row.acNum, calc: "flat" },
              hp: { value: row.hpNum, max: row.hpNum, temp: 0, tempmax: 0, formula: "" },
              movement: row.movement,
              senses: { darkvision: 0, special: row.skillsText || "", units: "ft", perception: 0 },
            },
            abilities: row.abilities, skills: {},
            traits: { size: row.size, languages: { value: [], custom: "общий" }, di:{value:[],custom:""}, dr:{value:[],custom:""}, dv:{value:[],custom:""}, ci:{value:[],custom:""} },
          },
          prototypeToken: { name: row.name, actorLink: false, disposition: kind === "npc" ? 0 : -1, displayName: 20, displayBars: 20, bar1: { attribute: "attributes.hp" }, texture: { src: tokenImg, scaleX: 1, scaleY: 1 }, sight: { enabled: false } },
          flags: { [MODULE_ID]: { sourcePath, sourceBlock: row.name, documentKind: kind, shard: fm.shard || "middle-lands", region: fm.region || "", importSchema: IMPORT_SCHEMA_VERSION } },
        };
        try {
          if (existing && overwrite) {
            await existing.update(actorData);
            if (row.items.length) {
              await existing.deleteEmbeddedDocuments("Item", existing.items.map(i => i.id));
              await existing.createEmbeddedDocuments("Item", row.items);
            }
            result.updated++;
          } else {
            await Actor.create({ ...actorData, items: row.items });
            result.created++;
          }
        } catch (e) {
          try { existing ? await existing.update(actorData) : await Actor.create(actorData); existing ? result.updated++ : result.created++; } catch (e2) { result.failed.push({ sourcePath, block: row.name, error: e2.message }); }
        }
      }
    } catch (err) {
      result.failed.push({ sourcePath, error: err.message });
    }
  }
  return result;
}

// ── Import all actors ─────────────────────────────────────────
async function importActors({ overwrite = false } = {}) {
  const tokenMap = await loadTokenMap();
  const npcs = await importH1Actors(NPC_BATCH_PATHS, "npc", tokenMap, { overwrite });
  const bestiary = await importH1Actors(BESTIARY_BATCH_PATHS, "bestiary", tokenMap, { overwrite });
  const tableActors = await importTableActors(tokenMap, { overwrite });
  return mergeResults(npcs, bestiary, tableActors);
}

// ── Import Journals ──────────────────────────────────────────
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
  { sp: "content/handouts/scorching-shard/boards/city-board-scorching-shard.md", folder: "Aeria Core / Квесты и приключения / Палящий Осколок" },
];

async function importJournals({ overwrite = false } = {}) {
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };

  // Load generated journal content
  let journalData = [];
  try {
    journalData = JSON.parse(await fetchText("content/generated/journal-content.json"));
  } catch (err) {
    console.error("Aeria Core | journal-content.json missing", err);
  }

  // Add legacy handout files
  for (const { sp, folder } of LEGACY_HANDOUT_PATHS) {
    try {
      const md = await fetchText(sp);
      const { body, name } = parseFrontmatter(md);
      journalData.push({ folder, sourcePath: sp, shard: "all", name, pages: [{ name, content: mdToHtml(body, name) }] });
    } catch { /* file may not exist */ }
  }

  // Add spirits content files
  const spiritsFiles = [
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
    "content/spirits/scorching-shard/common/shamas-solntselikiy.md",
  ];

  for (const sp of spiritsFiles) {
    try {
      const md = await fetchText(sp);
      const { fm, body, name } = parseFrontmatter(md);
      const shard = fm.shard || (sp.includes("shadow") ? "shadow-shard" : sp.includes("scorching") ? "scorching-shard" : "all");
      const shardFolderName = { "shadow-shard":"Теневой Осколок", "scorching-shard":"Палящий Осколок" }[shard] || "Все Осколки";
      journalData.push({ folder: `Aeria Core / Духи / ${shardFolderName}`, sourcePath: sp, shard, name, pages: [{ name, content: mdToHtml(body, name) }] });
    } catch { /* skip */ }
  }

  // Import all
  for (const entry of journalData) {
    try {
      const existing = game.journal.find(j => j.getFlag(MODULE_ID, "sourcePath") === entry.sourcePath);
      if (existing && !overwrite) { result.skipped++; continue; }
      const folder = await getOrCreateFolder("JournalEntry", entry.folder);
      const pages = (entry.pages || []).map((p, i) => ({
        name: p.name || `Страница ${i+1}`,
        type: "text",
        sort: (i+1)*100000,
        text: { format: 1, content: p.content || "<p></p>" },
      }));
      const flags = { [MODULE_ID]: { sourcePath: entry.sourcePath, documentKind: "journal", shard: entry.shard || "all", region: entry.region || "", importSchema: IMPORT_SCHEMA_VERSION } };
      if (existing && overwrite) {
        await existing.update({ name: entry.name, folder: folder.id, flags });
        const ep = existing.pages.contents;
        for (let i = 0; i < pages.length; i++) {
          if (ep[i]) await ep[i].update(pages[i]);
          else await JournalEntryPage.create(pages[i], { parent: existing });
        }
        result.updated++;
      } else {
        await JournalEntry.create({ name: entry.name, folder: folder.id, flags, pages });
        result.created++;
      }
    } catch (err) {
      result.failed.push({ sourcePath: entry.sourcePath || entry.name, error: err.message });
    }
  }
  return result;
}

// ── Import Scenes ─────────────────────────────────────────────
async function importScenes({ overwrite = false } = {}) {
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  let scenesData;
  try {
    scenesData = JSON.parse(await fetchText("content/generated/scenes-data.json"));
  } catch (err) {
    result.failed.push({ sourcePath: "content/generated/scenes-data.json", error: err.message });
    return result;
  }
  for (const spec of scenesData) {
    try {
      const existing = game.scenes.find(s => s.getFlag(MODULE_ID, "sourcePath") === spec.sourcePath);
      if (existing && !overwrite) { result.skipped++; continue; }
      const folder = await getOrCreateFolder("Scene", spec.folder);
      const sceneData = {
        name: spec.name, folder: folder.id,
        width: 1600, height: 900, padding: 0,
        background: { src: "" },
        grid: { type: 0, size: 100, distance: 5, units: "ft" },
        tokenVision: false, fogExploration: false, navigation: false, darkness: 0,
        notes: [], tokens: [], tiles: [], walls: [], lights: [], sounds: [], drawings: [],
        flags: { [MODULE_ID]: { sourcePath: spec.sourcePath, documentKind: "scene", shard: spec.shard, region: spec.region, locationType: spec.type, description: spec.description, displayMode: "show-only-city-image", tacticalMap: false, playerMovement: false, importSchema: IMPORT_SCHEMA_VERSION } },
      };
      if (existing && overwrite) {
        const update = { ...sceneData };
        const existingBg = existing.background?.src;
        if (existingBg && existingBg !== "") delete update.background; // preserve user-set bg
        await existing.update(update);
        result.updated++;
      } else {
        await Scene.create(sceneData);
        result.created++;
      }
    } catch (err) {
      result.failed.push({ sourcePath: spec.sourcePath, error: err.message });
    }
  }
  return result;
}

// ── Merge ─────────────────────────────────────────────────────
function mergeResults(...results) {
  const m = { created: 0, updated: 0, skipped: 0, failed: [] };
  for (const r of results) { if (!r) continue; m.created += r.created??0; m.updated += r.updated??0; m.skipped += r.skipped??0; m.failed.push(...(r.failed??[])); }
  return m;
}

// ── Master import ─────────────────────────────────────────────
async function importAll({ overwrite = false } = {}) {
  if (!game.user?.isGM) { ui.notifications?.warn("Aeria Core: импорт доступен только мастеру."); return; }
  ui.notifications?.info("Aeria Core: импортирую контент мира Аэрии...");
  _folderCache.clear();
  const journals = await importJournals({ overwrite });
  const actors = await importActors({ overwrite });
  const scenes = await importScenes({ overwrite });
  const r = mergeResults(journals, actors, scenes);
  const msg = `Aeria Core: импорт завершён. Создано: ${r.created}, обновлено: ${r.updated}, пропущено: ${r.skipped}, ошибок: ${r.failed.length}.`;
  r.failed.length > 0 ? (console.error("Aeria Core | failures", r.failed), ui.notifications?.error(`${msg} F12.`)) : ui.notifications?.info(msg);
  return r;
}

// ── Bootstrap ─────────────────────────────────────────────────
class AeriyaContentBootstrap {
  static async registerSettings() {
    game.settings.register(MODULE_ID, "autoImportReleaseContent", {
      name: "Aeria Core: автоимпорт материалов",
      hint: "Автоматически импортировать материалы мира Аэрии при включении модуля у мастера.",
      scope: "world", config: true, type: Boolean, default: true,
    });
    game.settings.register(MODULE_ID, "releaseContentImportedVersion", {
      name: "Aeria Core: версия импортированных материалов",
      hint: "Служебная настройка.",
      scope: "world", config: false, type: String, default: "",
    });
  }

  static get importVersionKey() {
    return `${game.modules.get(MODULE_ID)?.version ?? "unknown"}:${IMPORT_SCHEMA_VERSION}`;
  }

  static exposeApi() {
    game.aeriya = game.aeriya ?? {};
    game.aeriya.importAll = o => importAll(o);
    game.aeriya.importJournals = o => importJournals(o);
    game.aeriya.importActors = o => importActors(o);
    game.aeriya.importScenes = o => importScenes(o);
    game.aeriya.parseCR = parseCR;
  }

  static async runAutoImport() {
    if (!game.user?.isGM) return;
    if (!game.settings.get(MODULE_ID, "autoImportReleaseContent")) return;
    const currentKey = this.importVersionKey;
    const importedKey = game.settings.get(MODULE_ID, "releaseContentImportedVersion");
    if (importedKey === currentKey) { console.log(`Aeria Core | Already at ${currentKey}`); return; }
    console.log(`Aeria Core | Auto-import (schema: ${IMPORT_SCHEMA_VERSION})`);
    const r = await importAll({ overwrite: true });
    if (r && r.failed.length === 0) await game.settings.set(MODULE_ID, "releaseContentImportedVersion", currentKey);
  }
}

Hooks.once("init", () => { AeriyaContentBootstrap.registerSettings(); });
Hooks.once("ready", () => { AeriyaContentBootstrap.exposeApi(); AeriyaContentBootstrap.runAutoImport(); });
