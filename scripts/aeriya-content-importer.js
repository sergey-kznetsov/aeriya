/**
 * Aeria Core — Content Importer v0.3.3
 * World-level importer for Journals, Actors and show-only Scenes.
 */

const MODULE_ID = "aeriya";
const IMPORT_SCHEMA_VERSION = "world-import-v4";
const DEFAULT_ACTOR_IMAGE = "icons/svg/mystery-man.svg";
const _folderCache = new Map();

async function getOrCreateFolder(documentType, folderPath) {
  const key = `${documentType}::${folderPath}`;
  if (_folderCache.has(key)) return _folderCache.get(key);
  const parts = String(folderPath || "Aeria Core").split(/\s*\/\s*/).map(p => p.trim()).filter(Boolean);
  let parent = null;
  for (const part of parts) {
    const existing = game.folders.find(f => f.type === documentType && f.name === part && (f.folder?.id ?? null) === (parent?.id ?? null));
    parent = existing ?? await Folder.create({ name: part, type: documentType, folder: parent?.id ?? null, sorting: "a" });
  }
  _folderCache.set(key, parent);
  return parent;
}

function escapeHtml(text) {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

function parseFirstNumber(value, fallback = 0) {
  const m = String(value ?? "").match(/-?\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace(",", ".")) : fallback;
}

function parseMovement(speedText) {
  const m = { walk: 30, swim: 0, fly: 0, climb: 0, burrow: 0, units: "ft" };
  if (!speedText) return m;
  const walk = speedText.match(/^(\d+)\s*фт/i);
  const fly = speedText.match(/полёт[^\d]*(\d+)/i);
  const swim = speedText.match(/плав[^\d]*(\d+)/i);
  const climb = speedText.match(/лаз[^\d]*(\d+)/i);
  const burrow = speedText.match(/(?:копан|рыть|нор)[^\d]*(\d+)/i);
  if (walk) m.walk = parseInt(walk[1], 10);
  if (fly) m.fly = parseInt(fly[1], 10);
  if (swim) m.swim = parseInt(swim[1], 10);
  if (climb) m.climb = parseInt(climb[1], 10);
  if (burrow) m.burrow = parseInt(burrow[1], 10);
  return m;
}

function parseAbilityTable(markdown) {
  const m = markdown.match(/\|\s*СИЛ\s*\|\s*ЛОВ\s*\|\s*ТЕЛ\s*\|\s*ИНТ\s*\|\s*М[ДУ]Р\s*\|\s*ХАР\s*\|[\s\S]*?\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)[^|]*\|\s*([-\d]+)/i);
  if (!m) return { str:{value:10}, dex:{value:10}, con:{value:10}, int:{value:10}, wis:{value:10}, cha:{value:10} };
  return { str:{value:parseInt(m[1],10)||10}, dex:{value:parseInt(m[2],10)||10}, con:{value:parseInt(m[3],10)||10}, int:{value:parseInt(m[4],10)||10}, wis:{value:parseInt(m[5],10)||10}, cha:{value:parseInt(m[6],10)||10} };
}

function inferSize(text) {
  const t = String(text || "").toLowerCase();
  if (t.includes("крохотн")) return "tiny";
  if (t.includes("маленьк")) return "sm";
  if (t.includes("огромн")) return "huge";
  if (t.includes("громадн")) return "grg";
  if (t.includes("большой") || t.includes("большая") || t.includes("большое")) return "lg";
  return "med";
}

function inferType(text) {
  const map = { аберрация:"aberration", зверь:"beast", небожитель:"celestial", конструкт:"construct", дракон:"dragon", элементаль:"elemental", фея:"fey", исчадие:"fiend", великан:"giant", гуманоид:"humanoid", слизь:"ooze", монструозность:"monstrosity", нежить:"undead", растение:"plant" };
  const t = String(text || "").toLowerCase();
  for (const [ru, en] of Object.entries(map)) if (t.includes(ru)) return en;
  return "humanoid";
}

function renderInline(markdown) {
  return escapeHtml(markdown).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
}

function stripDuplicateH1(markdown, title = "") {
  if (!title) return markdown;
  const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return markdown.replace(new RegExp(`^#\\s+${safeTitle}\\s*\\n+`, "m"), "").trim();
}

function mdToHtml(markdown, title = "") {
  if (!markdown) return "<p></p>";
  const text = stripDuplicateH1(markdown, title);
  const html = ['<div class="aeriya-content">'];
  for (const block of text.trim().split(/\n{2,}/)) {
    const b = block.trim();
    if (!b) continue;
    if (/^\|.+\|/.test(b) && b.includes("\n") && /\|\s*-+/.test(b)) {
      const rows = b.split("\n").map(r => r.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim())).filter(r => r.some(Boolean));
      const header = rows[0] ?? [];
      const body = rows.slice(2);
      html.push(`<table class="aeriya-table"><thead><tr>${header.map(c => `<th>${renderInline(c)}</th>`).join("")}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${renderInline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    const h = b.match(/^(#{1,6})\s+(.+)$/);
    if (h) { const level = Math.min(h[1].length + 1, 6); html.push(`<h${level}>${renderInline(h[2])}</h${level}>`); continue; }
    if (b.startsWith("- ") || b.startsWith("* ")) {
      const items = b.split("\n").map(line => line.replace(/^[-*]\s+/, "").trim()).filter(Boolean);
      html.push(`<ul>${items.map(item => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }
    html.push(`<p>${renderInline(b.split("\n").map(line => line.trim()).filter(Boolean).join(" "))}</p>`);
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
      const sep = line.indexOf(":");
      if (sep === -1) continue;
      fm[line.slice(0, sep).trim()] = line.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  const h1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return { fm, body, name: fm.name || h1 || "Aeria" };
}

function extractH1Blocks(body, batchTitle) {
  const matches = [...body.matchAll(/^#\s+(.+)$/gm)];
  const blocks = [];
  for (let i = 0; i < matches.length; i += 1) {
    const name = matches[i][1].trim();
    if (name === batchTitle) continue;
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : body.length;
    const markdown = body.slice(start, end).trim();
    if (markdown) blocks.push({ name, markdown });
  }
  return blocks;
}

function parseMetric(markdown, ...labels) {
  for (const label of labels) {
    const m = markdown.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\n]+)`, "i"));
    if (m) return m[1].trim();
  }
  return "";
}

function markdownSection(markdown, header) {
  const marker = `${header}\n`;
  const start = markdown.indexOf(marker);
  if (start === -1) return "";
  const from = start + marker.length;
  const rest = markdown.slice(from);
  const next = rest.search(/\n## |\n---\n|\n# /);
  return next === -1 ? rest : rest.slice(0, next);
}

function buildEmbeddedItems(markdown) {
  const items = [];
  const damageTypeMap = { рубящ:"slashing", колющ:"piercing", дробящ:"bludgeoning", огнен:"fire", кислот:"acid", некрот:"necrotic", психич:"psychic", молние:"lightning", ядовит:"poison", холодн:"cold", силов:"force", излучен:"radiant" };

  function addFromSection(sectionText, activationType) {
    const matches = [...sectionText.matchAll(/\*\*([^*]+?)\.\*\*\s+([^\n]+(?:\n(?!\*\*)[^\n]+)*)/g)];
    for (const [, rawName, rawDesc] of matches) {
      const name = rawName.trim();
      const desc = rawDesc.trim();
      const isAttack = /атака оружием|к попаданию/i.test(desc);
      const dmg = desc.match(/(\d+к\d+(?:\s*[+\-]\s*\d+)?)\s*(рубящ|колющ|дробящ|огнен|кислот|некрот|психич|молние|ядовит|холодн|силов|излучен)/i);
      const hit = desc.match(/[+](\d+)\s*к попаданию/i);
      const reach = desc.match(/(\d+)\s*фт/);
      const dmgKey = dmg ? Object.keys(damageTypeMap).find(k => dmg[2].toLowerCase().startsWith(k)) : null;
      const dmgType = dmgKey ? damageTypeMap[dmgKey] : "bludgeoning";
      if (isAttack && activationType === "action") {
        items.push({ name, type: "weapon", system: { description: { value: `<p>${escapeHtml(desc)}</p>` }, activation: { type: "action", cost: 1 }, target: { type: "creature", count: 1 }, range: { value: reach ? parseInt(reach[1], 10) : 5, units: "ft" }, actionType: "mwak", attackBonus: hit ? parseInt(hit[1], 10) : 0, damage: { parts: dmg ? [[dmg[1].replace(/\s/g, "").replace(/к/gi, "d"), dmgType]] : [["1d4", "bludgeoning"]] }, equipped: true, proficient: true, source: { custom: "Aeria Core" } } });
      } else {
        items.push({ name, type: "feat", system: { description: { value: `<p>${escapeHtml(desc)}</p>` }, activation: { type: activationType, cost: activationType === "passive" ? null : 1 }, source: { custom: "Aeria Core" } } });
      }
    }
  }

  const sections = { "## Особенности":"passive", "## Действия":"action", "## Бонусное действие":"bonus", "## Бонусные действия":"bonus", "## Реакция":"reaction", "## Реакции":"reaction", "## Легендарные действия":"legendary" };
  for (const [header, activation] of Object.entries(sections)) addFromSection(markdownSection(markdown, header), activation);

  const dobycha = markdown.match(/\*\*Добыча Ловчих:\*\*\s*([^\n]+)/i);
  if (dobycha) items.push({ name: "Добыча Ловчих", type: "feat", system: { description: { value: `<p><strong>Добыча Ловчих:</strong> ${escapeHtml(dobycha[1].trim())}</p>` }, activation: { type: "passive", cost: null }, source: { custom: "Aeria Core" } } });
  return items;
}

function actorFolderPath(sourcePath, fm, kind) {
  const prefix = kind === "npc" ? "Aeria Core / НИПы" : "Aeria Core / Бестиарий";
  const shard = fm.shard || (sourcePath.includes("shadow") ? "shadow-shard" : sourcePath.includes("scorching") ? "scorching-shard" : "middle-lands");
  const region = fm.region || "";
  const shardMap = { "middle-lands":"Срединные Земли", "shadow-shard":"Теневой Осколок", "scorching-shard":"Палящий Осколок" };
  const regionMap = { "ash-steppe":"Пепельная Степь", "black-whisper-forest":"Лес Чёрного Шёпота", "icy-limit":"Ледяной Предел", "burning-wastes":"Выжженные Пустоши", "burned-wasteland":"Выжженные Пустоши", "salt-deserts":"Соляные Пустыни", all:"Общие" };
  const shardName = shardMap[shard] ?? "Общие";
  const regionName = regionMap[region];
  return regionName ? `${prefix} / ${shardName} / ${regionName}` : `${prefix} / ${shardName}`;
}

async function loadTokenMap() {
  try {
    const manifest = JSON.parse(await fetchText("assets/manifests/old-world-assets.json"));
    const map = new Map();
    for (const token of manifest.tokens ?? []) if (token.status === "imported") map.set(token.name.toLowerCase(), token.path);
    return map;
  } catch { return new Map(); }
}

function buildActorData(block, sourcePath, fm, folderId, tokenMap, kind) {
  const md = block.markdown;
  const hpRaw = parseMetric(md, "ХП");
  const sensesText = parseMetric(md, "Чувства");
  const darkvision = sensesText.match(/тёмное зрение\s+(\d+)/i);
  const firstLine = md.split("\n").slice(1).find(line => line.trim()) ?? "";
  const tokenImg = tokenMap?.get(block.name.toLowerCase()) ?? DEFAULT_ACTOR_IMAGE;
  return {
    name: block.name, type: "npc", img: tokenImg, folder: folderId,
    system: {
      details: { biography: { value: mdToHtml(md, block.name), public: "" }, type: { value: inferType(firstLine), custom: "" }, cr: parseCR(parseMetric(md, "CR", "КО", "КД опасности")), source: { custom: fm.source || "Aeria Core" } },
      attributes: { ac: { flat: parseFirstNumber(parseMetric(md, "КД"), 10), calc: "flat" }, hp: { value: parseFirstNumber(hpRaw, 1), max: parseFirstNumber(hpRaw, 1), temp: 0, tempmax: 0, formula: (hpRaw.match(/\((.+?)\)/)?.[1] ?? "").replace(/к/gi, "d") }, movement: parseMovement(parseMetric(md, "Скорость")), senses: { darkvision: darkvision ? parseInt(darkvision[1], 10) : 0, special: sensesText, units: "ft", perception: 0 } },
      abilities: parseAbilityTable(md), skills: {}, traits: { size: inferSize(firstLine), languages: { value: [], custom: parseMetric(md, "Языки") || "" }, di:{value:[],custom:""}, dr:{value:[],custom:""}, dv:{value:[],custom:""}, ci:{value:[],custom:""} }
    },
    prototypeToken: { name: block.name, actorLink: false, disposition: kind === "npc" ? 0 : -1, displayName: 20, displayBars: 20, bar1: { attribute: "attributes.hp" }, texture: { src: tokenImg, scaleX: 1, scaleY: 1 }, sight: { enabled: false } },
    flags: { [MODULE_ID]: { sourcePath, sourceBlock: block.name, documentKind: kind, shard: fm.shard || (sourcePath.includes("shadow") ? "shadow-shard" : sourcePath.includes("scorching") ? "scorching-shard" : "middle-lands"), region: fm.region || "", importSchema: IMPORT_SCHEMA_VERSION } }
  };
}

async function replaceActorItems(actor, items) {
  const ids = actor.items?.map(item => item.id) ?? [];
  if (ids.length > 0) await actor.deleteEmbeddedDocuments("Item", ids);
  if (items.length > 0) await actor.createEmbeddedDocuments("Item", items);
}

function preserveExistingActorImages(existing, data) {
  if (!existing) return data;
  const img = existing.img;
  const tokenImg = existing.prototypeToken?.texture?.src;
  if (img && img !== DEFAULT_ACTOR_IMAGE && data.img === DEFAULT_ACTOR_IMAGE) data.img = img;
  if (tokenImg && tokenImg !== DEFAULT_ACTOR_IMAGE && data.prototypeToken?.texture?.src === DEFAULT_ACTOR_IMAGE) data.prototypeToken.texture.src = tokenImg;
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

const TABLE_STATBLOCK_PATHS = [
  { path: "content/actor-statblocks/middle-lands/npc-statblocks.md", kind: "npc" },
  { path: "content/actor-statblocks/middle-lands/monster-statblocks.md", kind: "bestiary" },
  { path: "content/actor-statblocks/shadow-shard/ash-steppe-npc-statblocks.md", kind: "npc" },
  { path: "content/actor-statblocks/shadow-shard/forest-npc-statblocks.md", kind: "npc" },
  { path: "content/actor-statblocks/shadow-shard/monster-statblocks.md", kind: "bestiary" },
  { path: "content/actor-statblocks/scorching-shard/monster-statblocks.md", kind: "bestiary" }
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
        const existing = game.actors.find(a => a.getFlag(MODULE_ID, "sourcePath") === sourcePath && a.getFlag(MODULE_ID, "sourceBlock") === block.name);
        if (existing && !overwrite) { result.skipped += 1; continue; }
        const items = buildEmbeddedItems(block.markdown);
        let data = preserveExistingActorImages(existing, buildActorData(block, sourcePath, fm, folder.id, tokenMap, kind));
        if (!Number.isFinite(data.system.details.cr)) data.system.details.cr = 0;
        try {
          if (existing && overwrite) { await existing.update(data); await replaceActorItems(existing, items); result.updated += 1; }
          else { await Actor.create({ ...data, items }); result.created += 1; }
        } catch (error) {
          try {
            if (existing && overwrite) { await existing.update(data); await replaceActorItems(existing, []); result.updated += 1; }
            else { await Actor.create(data); result.created += 1; }
          } catch (fallbackError) { result.failed.push({ sourcePath, block: block.name, error: fallbackError.message || error.message }); }
        }
      }
    } catch (error) { result.failed.push({ sourcePath, error: error.message }); }
  }
  return result;
}

function parseTableActors(markdown) {
  const results = [];
  const tablePattern = /\|[^\n]+\|\n\|[-: |]+\|\n((?:\|[^\n]+\|\n?)+)/g;
  let tableMatch;
  while ((tableMatch = tablePattern.exec(markdown)) !== null) {
    const allRows = tableMatch[0].trim().split("\n");
    const header = allRows[0].split("|").map(c => c.trim()).filter(Boolean);
    for (const row of allRows.slice(2)) {
      const cells = row.split("|").map(c => c.trim()).filter(Boolean);
      if (cells.length < 3) continue;
      const data = {};
      header.forEach((h, i) => { data[h] = cells[i] ?? ""; });
      const name = data["НИП / роль"] || data["НИП"] || data["Существо"] || cells[0];
      if (!name || name.startsWith("---") || name.startsWith("|")) continue;
      const actionsText = data["Действия и особенности"] || data["Действия"] || "";
      const items = [];
      if (actionsText) {
        for (const part of actionsText.split(/;\s*(?=[А-ЯA-Z])/)) {
          const itemName = part.match(/^([^:+]+?)(?:\s*\+\d+,|\s*:)/)?.[1]?.trim() || "Действие";
          if (itemName.length < 2 || itemName.length > 60) continue;
          const isAttack = /к попаданию|удар|атака|\+\d+,\s*\d+к/i.test(part);
          const dmg = part.match(/(\d+к\d+(?:\s*[+\-]\s*\d+)?)\s*(рубящ|колющ|дробящ|огнен|некрот|психич)/i);
          const hit = part.match(/[+](\d+),/);
          if (isAttack && dmg) items.push({ name: itemName, type: "weapon", system: { description: { value: `<p>${escapeHtml(part.trim())}</p>` }, activation: { type: "action", cost: 1 }, actionType: "mwak", attackBonus: hit ? parseInt(hit[1], 10) : 0, damage: { parts: [[dmg[1].replace(/\s/g, "").replace(/к/gi, "d"), "bludgeoning"]] }, equipped: true, proficient: true, source: { custom: "Aeria Core" } } });
          else items.push({ name: itemName, type: "feat", system: { description: { value: `<p>${escapeHtml(part.trim())}</p>` }, activation: { type: "action", cost: 1 }, source: { custom: "Aeria Core" } } });
        }
      }
      const stats = (data["Характеристики"] || "10/10/10/10/10/10").split("/").map(v => parseInt(v.trim(), 10) || 10);
      const sizeTypeText = data["Размер / тип"] || "";
      const skillsText = data["Навыки / чувства"] || data["Навыки"] || "";
      const biographyHtml = `<div class="aeriya-content"><h3>${escapeHtml(name)}</h3>${[data["Класс / архетип"] && `<p><strong>Класс:</strong> ${escapeHtml(data["Класс / архетип"])}</p>`, data["Ур."] && `<p><strong>Уровень:</strong> ${escapeHtml(data["Ур."])}</p>`, sizeTypeText && `<p><strong>Тип:</strong> ${escapeHtml(sizeTypeText)}</p>`, skillsText && `<p><strong>Навыки/чувства:</strong> ${escapeHtml(skillsText)}</p>`, actionsText && `<h4>Действия</h4><p>${escapeHtml(actionsText)}</p>`].filter(Boolean).join("\n")}</div>`;
      results.push({ name, cr: parseCR(data["CR"] || data["КО"] || "0"), acNum: parseFirstNumber(data["КД"] || "10", 10), hpNum: parseFirstNumber(data["Хиты"] || "1", 1), movement: parseMovement(data["Скорость"] || ""), abilities: { str:{value:stats[0]}, dex:{value:stats[1]}, con:{value:stats[2]}, int:{value:stats[3]}, wis:{value:stats[4]}, cha:{value:stats[5]} }, size: inferSize(sizeTypeText), creatureType: inferType(sizeTypeText), biographyHtml, skillsText, items });
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
        const existing = game.actors.find(a => a.getFlag(MODULE_ID, "sourcePath") === sourcePath && a.getFlag(MODULE_ID, "sourceBlock") === row.name);
        if (existing && !overwrite) { result.skipped += 1; continue; }
        const tokenImg = tokenMap?.get(row.name.toLowerCase()) ?? DEFAULT_ACTOR_IMAGE;
        let actorData = preserveExistingActorImages(existing, { name: row.name, type: "npc", img: tokenImg, folder: folder.id, system: { details: { biography: { value: row.biographyHtml, public: "" }, type: { value: row.creatureType, custom: "" }, cr: row.cr, source: { custom: fm.source || "Aeria Core" } }, attributes: { ac: { flat: row.acNum, calc: "flat" }, hp: { value: row.hpNum, max: row.hpNum, temp: 0, tempmax: 0, formula: "" }, movement: row.movement, senses: { darkvision: 0, special: row.skillsText || "", units: "ft", perception: 0 } }, abilities: row.abilities, skills: {}, traits: { size: row.size, languages: { value: [], custom: "общий" }, di:{value:[],custom:""}, dr:{value:[],custom:""}, dv:{value:[],custom:""}, ci:{value:[],custom:""} } }, prototypeToken: { name: row.name, actorLink: false, disposition: kind === "npc" ? 0 : -1, displayName: 20, displayBars: 20, bar1: { attribute: "attributes.hp" }, texture: { src: tokenImg, scaleX: 1, scaleY: 1 }, sight: { enabled: false } }, flags: { [MODULE_ID]: { sourcePath, sourceBlock: row.name, documentKind: kind, shard: fm.shard || "middle-lands", region: fm.region || "", importSchema: IMPORT_SCHEMA_VERSION } } });
        try {
          if (existing && overwrite) { await existing.update(actorData); await replaceActorItems(existing, row.items); result.updated += 1; }
          else { await Actor.create({ ...actorData, items: row.items }); result.created += 1; }
        } catch (error) {
          try {
            if (existing && overwrite) { await existing.update(actorData); await replaceActorItems(existing, []); result.updated += 1; }
            else { await Actor.create(actorData); result.created += 1; }
          } catch (fallbackError) { result.failed.push({ sourcePath, block: row.name, error: fallbackError.message || error.message }); }
        }
      }
    } catch (error) { result.failed.push({ sourcePath, error: error.message }); }
  }
  return result;
}

async function importActors({ overwrite = false } = {}) {
  const tokenMap = await loadTokenMap();
  return mergeResults(await importH1Actors(NPC_BATCH_PATHS, "npc", tokenMap, { overwrite }), await importH1Actors(BESTIARY_BATCH_PATHS, "bestiary", tokenMap, { overwrite }), await importTableActors(tokenMap, { overwrite }));
}

const LEGACY_HANDOUT_PATHS = [
  { sp:"content/handouts/middle-lands/common/quest-rynkovaya-zapis.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/common/quest-nochnoy-kolokol.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/common/adventure-dolg-na-rynke.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/common/adventure-kolokol-i-most.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/city-quests/quest-archive-and-empty-name.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/city-quests/quest-cargo-without-owner.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/city-quests/quest-water-and-wooden-paths.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/city-quests/quest-bell-and-house-debt.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/city-quests/quest-beast-roads-and-signs.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/city-quests/quest-lower-gears-and-black-smoke.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/middle-lands/common/player-city-customs-handout.md", folder:"Aeria Core / Раздаточные материалы" },
  { sp:"content/handouts/middle-lands/common/gm-city-scene-checklist.md", folder:"Aeria Core / Раздаточные материалы" },
  { sp:"content/handouts/shadow-shard/ash-steppe/city-quests/quest-okram-zakrytyy-uzel.md", folder:"Aeria Core / Квесты и приключения / Теневой Осколок / Пепельная Степь" },
  { sp:"content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-koren-i-dom-mha.md", folder:"Aeria Core / Квесты и приключения / Теневой Осколок / Лес Чёрного Шёпота" },
  { sp:"content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-seryy-priyut-i-staraya-zastava.md", folder:"Aeria Core / Квесты и приключения / Теневой Осколок / Лес Чёрного Шёпота" },
  { sp:"content/handouts/shadow-shard/icy-limit/city-quests/quest-ogon-i-ledyanoy-klyk.md", folder:"Aeria Core / Квесты и приключения / Теневой Осколок / Ледяной Предел" },
  { sp:"content/handouts/shadow-shard/icy-limit/city-quests/quest-pereval-i-belye-kamni.md", folder:"Aeria Core / Квесты и приключения / Теневой Осколок / Ледяной Предел" },
  { sp:"content/handouts/scorching-shard/city-quests/quest-tri-teni-i-posledniy-vzdoh.md", folder:"Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp:"content/handouts/scorching-shard/city-quests/quest-klinok-i-steklyannyy-gorodok.md", folder:"Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp:"content/handouts/scorching-shard/city-quests/quest-rodnik-i-belyy-kolodets.md", folder:"Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp:"content/handouts/scorching-shard/city-quests/quest-fort-dvorets-i-krasnaya-sol.md", folder:"Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp:"content/handouts/scorching-shard/city-quests/quest-melnitsa-porog-i-tihaya-korka.md", folder:"Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp:"content/handouts/shadow-shard/ash-steppe/encounters/encounter-tea-house-dispute.md", folder:"Aeria Core / Квесты и приключения / Теневой Осколок / Пепельная Степь" },
  { sp:"content/handouts/shadow-shard/black-whisper-forest/encounters/encounter-moss-path.md", folder:"Aeria Core / Квесты и приключения / Теневой Осколок / Лес Чёрного Шёпота" },
  { sp:"content/handouts/shadow-shard/icy-limit/encounters/encounter-last-fire.md", folder:"Aeria Core / Квесты и приключения / Теневой Осколок / Ледяной Предел" },
  { sp:"content/handouts/scorching-shard/encounters/encounter-dry-road.md", folder:"Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp:"content/handouts/middle-lands/encounters/encounter-market-debt.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/shadow-shard/ash-steppe/books/zapis-o-pyati-chashah.md", folder:"Aeria Core / Книги внутри мира / Предания" },
  { sp:"content/handouts/shadow-shard/black-whisper-forest/books/shest-pravil-mha.md", folder:"Aeria Core / Книги внутри мира / Предания" },
  { sp:"content/handouts/shadow-shard/icy-limit/books/zapis-ob-obschem-ogne.md", folder:"Aeria Core / Книги внутри мира / Предания" },
  { sp:"content/handouts/scorching-shard/books/spisok-suhoy-dorogi.md", folder:"Aeria Core / Книги внутри мира / Предания" },
  { sp:"content/handouts/middle-lands/books/kniga-dorozhnyh-zametok.md", folder:"Aeria Core / Книги внутри мира / Дорожные байки" },
  { sp:"content/handouts/middle-lands/books/pismo-bez-dveri.md", folder:"Aeria Core / Книги внутри мира / Дорожные байки" },
  { sp:"content/handouts/middle-lands/boards/city-board-middle-lands.md", folder:"Aeria Core / Квесты и приключения / Срединные Земли" },
  { sp:"content/handouts/shadow-shard/boards/city-board-shadow-shard.md", folder:"Aeria Core / Квесты и приключения / Теневой Осколок" },
  { sp:"content/handouts/scorching-shard/boards/city-board-scorching-shard.md", folder:"Aeria Core / Квесты и приключения / Палящий Осколок" },
  { sp:"content/handouts/all-shards/world-lore-master-guide.md", folder:"Aeria Core / Раздаточные материалы" }
];

const SPIRIT_PATHS = [
  "content/spirits/all-shards/common/niks.md", "content/spirits/all-shards/common/omulu.md", "content/spirits/all-shards/common/vechnyy-zmey.md",
  "content/spirits/middle-lands/common/duh-perekrestka.md", "content/spirits/middle-lands/common/poslednyaya-torgovka.md",
  "content/spirits/shadow-shard/ash-steppe/runay-stepnoy.md", "content/spirits/shadow-shard/ash-steppe/salbar.md",
  "content/spirits/shadow-shard/black-whisper-forest/mat-mha.md", "content/spirits/shadow-shard/black-whisper-forest/sam-les.md", "content/spirits/shadow-shard/black-whisper-forest/shepotnik.md",
  "content/spirits/shadow-shard/icy-limit/ayrun-severnyy.md", "content/spirits/shadow-shard/icy-limit/belyy-ugolek.md", "content/spirits/shadow-shard/icy-limit/iskra-predkov.md",
  "content/spirits/scorching-shard/common/glas-suhoy-dorogi.md", "content/spirits/scorching-shard/common/ignis-peschanyy-zmey.md", "content/spirits/scorching-shard/common/mat-soli.md", "content/spirits/scorching-shard/common/peschanaya-mat.md", "content/spirits/scorching-shard/common/runay-palyaschiy.md", "content/spirits/scorching-shard/common/shamas-solntselikiy.md"
];

async function deleteExtraJournalPages(entry, keepCount) {
  const ids = entry.pages.contents.slice(keepCount).map(page => page.id);
  if (ids.length > 0) await entry.deleteEmbeddedDocuments("JournalEntryPage", ids);
}

async function importJournals({ overwrite = false } = {}) {
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  let journalData = [];
  try { journalData = JSON.parse(await fetchText("content/generated/journal-content.json")); }
  catch (error) { result.failed.push({ sourcePath: "content/generated/journal-content.json", error: error.message }); }

  for (const { sp, folder } of LEGACY_HANDOUT_PATHS) {
    try { const md = await fetchText(sp); const { body, name } = parseFrontmatter(md); journalData.push({ folder, sourcePath: sp, shard: "all", name, pages: [{ name, content: mdToHtml(body, name) }] }); }
    catch { /* optional */ }
  }
  for (const sp of SPIRIT_PATHS) {
    try {
      const md = await fetchText(sp); const { fm, body, name } = parseFrontmatter(md);
      const shard = fm.shard || (sp.includes("shadow") ? "shadow-shard" : sp.includes("scorching") ? "scorching-shard" : "all");
      const shardFolderName = { "shadow-shard":"Теневой Осколок", "scorching-shard":"Палящий Осколок" }[shard] || "Все Осколки";
      journalData.push({ folder: `Aeria Core / Духи / ${shardFolderName}`, sourcePath: sp, shard, name, pages: [{ name, content: mdToHtml(body, name) }] });
    } catch { /* optional */ }
  }

  for (const entry of journalData) {
    try {
      const sourcePath = entry.sourcePath;
      const existing = game.journal.find(j => j.getFlag(MODULE_ID, "sourcePath") === sourcePath);
      if (existing && !overwrite) { result.skipped += 1; continue; }
      const folder = await getOrCreateFolder("JournalEntry", entry.folder || "Aeria Core / Справочник");
      const pages = (entry.pages || []).map((p, i) => ({ name: p.name || `Страница ${i + 1}`, type: "text", sort: (i + 1) * 100000, text: { format: 1, content: p.content || "<p></p>" } }));
      const flags = { [MODULE_ID]: { sourcePath, documentKind: "journal", shard: entry.shard || "all", region: entry.region || "", importSchema: IMPORT_SCHEMA_VERSION } };
      if (existing && overwrite) {
        await existing.update({ name: entry.name, folder: folder.id, flags });
        for (let i = 0; i < pages.length; i += 1) {
          const existingPage = existing.pages.contents[i];
          if (existingPage) await existingPage.update(pages[i]);
          else await JournalEntryPage.create(pages[i], { parent: existing });
        }
        await deleteExtraJournalPages(existing, pages.length);
        result.updated += 1;
      } else { await JournalEntry.create({ name: entry.name, folder: folder.id, flags, pages }); result.created += 1; }
    } catch (error) { result.failed.push({ sourcePath: entry.sourcePath || entry.name, error: error.message }); }
  }
  return result;
}

async function importScenes({ overwrite = false } = {}) {
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  let scenesData = [];
  try { scenesData = JSON.parse(await fetchText("content/generated/scenes-data.json")); }
  catch (error) { result.failed.push({ sourcePath: "content/generated/scenes-data.json", error: error.message }); return result; }

  if (overwrite) {
    const manifestPaths = new Set(scenesData.map(scene => scene.sourcePath));
    const obsolete = game.scenes.filter(scene => {
      const sourcePath = scene.getFlag(MODULE_ID, "sourcePath");
      return sourcePath && !manifestPaths.has(sourcePath) && scene.getFlag(MODULE_ID, "documentKind") === "scene";
    });
    if (obsolete.length > 0) await Scene.deleteDocuments(obsolete.map(scene => scene.id));
  }

  for (const spec of scenesData) {
    try {
      const existing = game.scenes.find(scene => scene.getFlag(MODULE_ID, "sourcePath") === spec.sourcePath);
      if (existing && !overwrite) { result.skipped += 1; continue; }
      const folder = await getOrCreateFolder("Scene", spec.folder || "Aeria Core / Сцены");
      const sceneData = { name: spec.name, folder: folder.id, width: existing?.width || 1600, height: existing?.height || 900, padding: 0, background: { src: "" }, grid: { type: 0, size: 100, distance: 5, units: "ft" }, tokenVision: false, fogExploration: false, navigation: false, darkness: 0, notes: [], tokens: [], tiles: [], walls: [], lights: [], sounds: [], drawings: [], flags: { [MODULE_ID]: { sourcePath: spec.sourcePath, documentKind: "scene", shard: spec.shard || "", region: spec.region || "", locationType: spec.type || "", description: spec.description || "", displayMode: "show-only-city-image", tacticalMap: false, playerMovement: false, importSchema: IMPORT_SCHEMA_VERSION } } };
      if (existing && overwrite) {
        // Only update folder and module flags — never touch user content (tokens, walls, tiles, lights, etc.)
        await existing.update({ name: sceneData.name, folder: sceneData.folder, flags: sceneData.flags });
        result.updated += 1;
      }
      else { await Scene.create(sceneData); result.created += 1; }
    } catch (error) { result.failed.push({ sourcePath: spec.sourcePath, error: error.message }); }
  }
  return result;
}

function mergeResults(...results) {
  const merged = { created: 0, updated: 0, skipped: 0, failed: [] };
  for (const r of results) { if (!r) continue; merged.created += r.created ?? 0; merged.updated += r.updated ?? 0; merged.skipped += r.skipped ?? 0; merged.failed.push(...(r.failed ?? [])); }
  return merged;
}

async function importAll({ overwrite = false } = {}) {
  if (!game.user?.isGM) { ui.notifications?.warn("Aeria Core: импорт доступен только мастеру."); return { created: 0, updated: 0, skipped: 0, failed: [] }; }
  ui.notifications?.info("Aeria Core: импортирую контент мира Аэрии...");
  _folderCache.clear();
  const result = mergeResults(await importJournals({ overwrite }), await importActors({ overwrite }), await importScenes({ overwrite }));
  const msg = `Aeria Core: импорт завершён. Создано: ${result.created}, обновлено: ${result.updated}, пропущено: ${result.skipped}, ошибок: ${result.failed.length}.`;
  if (result.failed.length > 0) { console.error("Aeria Core | import failures", result.failed); ui.notifications?.error(`${msg} Подробности записаны в консоль Foundry.`); }
  else ui.notifications?.info(msg);
  return result;
}

class AeriyaContentBootstrap {
  static async registerSettings() {
    game.settings.register(MODULE_ID, "autoImportReleaseContent", { name: "Aeria Core: автоимпорт материалов", hint: "Автоматически импортировать материалы мира Аэрии при включении модуля у мастера.", scope: "world", config: true, type: Boolean, default: true });
    game.settings.register(MODULE_ID, "releaseContentImportedVersion", { name: "Aeria Core: версия импортированных материалов", hint: "Служебная настройка.", scope: "world", config: false, type: String, default: "" });
  }
  static get importVersionKey() { return `${game.modules.get(MODULE_ID)?.version ?? "unknown"}:${IMPORT_SCHEMA_VERSION}`; }
  static exposeApi() { game.aeriya = game.aeriya ?? {}; game.aeriya.importAll = (o = {}) => importAll(o); game.aeriya.importJournals = (o = {}) => importJournals(o); game.aeriya.importActors = (o = {}) => importActors(o); game.aeriya.importScenes = (o = {}) => importScenes(o); game.aeriya.parseCR = parseCR; }
  static async runAutoImport() {
    if (!game.user?.isGM) return;
    if (!game.settings.get(MODULE_ID, "autoImportReleaseContent")) return;
    const currentKey = this.importVersionKey;
    const importedKey = game.settings.get(MODULE_ID, "releaseContentImportedVersion");
    if (importedKey === currentKey) { console.log(`Aeria Core | Already imported ${currentKey}`); return; }
    console.log(`Aeria Core | Auto-import ${currentKey}`);
    const result = await importAll({ overwrite: true });
    if (result && result.failed.length === 0) await game.settings.set(MODULE_ID, "releaseContentImportedVersion", currentKey);
  }
}

Hooks.once("init", () => { AeriyaContentBootstrap.registerSettings(); });
Hooks.once("ready", () => { AeriyaContentBootstrap.exposeApi(); AeriyaContentBootstrap.runAutoImport(); });