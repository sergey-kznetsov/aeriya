const MODULE_ID = "aeriya";
const ACTOR_NORMALIZER_SCHEMA = "actor-normalizer-v2";

const DAMAGE_MAP = {
  кислот: "acid",
  дробящ: "bludgeoning",
  холод: "cold",
  огон: "fire",
  огнен: "fire",
  силов: "force",
  молни: "lightning",
  некрот: "necrotic",
  колющ: "piercing",
  яд: "poison",
  ядовит: "poison",
  психич: "psychic",
  излучен: "radiant",
  рубящ: "slashing",
  громов: "thunder"
};

const CONDITION_MAP = {
  ослеплен: "blinded",
  очарован: "charmed",
  оглохш: "deafened",
  истощен: "exhaustion",
  испуган: "frightened",
  схвачен: "grappled",
  недееспособ: "incapacitated",
  невидим: "invisible",
  парализован: "paralyzed",
  окаменел: "petrified",
  отравлен: "poisoned",
  сбит: "prone",
  лежащ: "prone",
  опутан: "restrained",
  удержан: "restrained",
  ошеломлен: "stunned",
  без сознания: "unconscious"
};

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchText(path) {
  const response = await fetch(`modules/${MODULE_ID}/${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
  return response.text();
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n[\s\S]*?\n---\n?/);
  return match ? markdown.slice(match[0].length).trim() : markdown.trim();
}

function extractBlock(markdown, title) {
  const body = parseFrontmatter(markdown);
  const heading = new RegExp(`^#\\s+${escapeRegExp(title)}\\s*$`, "m");
  const match = body.match(heading);
  if (!match || match.index === undefined) return "";
  const start = match.index;
  const rest = body.slice(start + match[0].length);
  const next = rest.search(/\n---\n\s*#\s+|\n#\s+/);
  return next === -1 ? body.slice(start).trim() : body.slice(start, start + match[0].length + next).trim();
}

function parseMetric(markdown, ...labels) {
  for (const label of labels) {
    const match = markdown.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\n]+)`, "i"));
    if (match) return match[1].trim();
  }
  return "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mapByDictionary(raw, dictionary) {
  const text = String(raw || "").toLowerCase();
  const values = [];
  for (const [needle, key] of Object.entries(dictionary)) {
    if (text.includes(needle)) values.push(key);
  }
  return unique(values);
}

function normalizedTrait(raw, dictionary) {
  const custom = String(raw || "").trim();
  return { value: mapByDictionary(custom, dictionary), custom };
}

function splitImmunities(raw) {
  const text = String(raw || "").trim();
  const conditionParts = [];
  const damageParts = [];
  for (const part of text.split(/[;,]/).map((p) => p.trim()).filter(Boolean)) {
    if (/состояни|отравлен|испуган|очарован|парализован|ошеломлен|ослеплен|оглохш|схвачен|опутан|удержан|истощен|невидим|окаменел/i.test(part)) conditionParts.push(part);
    else damageParts.push(part);
  }
  return {
    damage: normalizedTrait(damageParts.join("; "), DAMAGE_MAP),
    conditions: normalizedTrait(conditionParts.join("; "), CONDITION_MAP)
  };
}

function parseAbilityScore(cell) {
  const match = String(cell || "").match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function parseAbilityTable(markdown) {
  const lines = String(markdown || "").split("\n");
  const headerIndex = lines.findIndex((line) => /\|\s*СИЛ\s*\|\s*ЛОВ\s*\|\s*ТЕЛ\s*\|\s*ИНТ\s*\|\s*М[ДУ]Р\s*\|\s*ХАР\s*\|/i.test(line));
  if (headerIndex === -1) return null;
  for (const line of lines.slice(headerIndex + 1, headerIndex + 6)) {
    if (!line.includes("|")) continue;
    if (/^\s*\|?\s*:?-{2,}/.test(line)) continue;
    const cells = line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
    if (cells.length < 6) continue;
    const values = cells.slice(0, 6).map(parseAbilityScore);
    if (values.every((value) => Number.isFinite(value))) {
      const [str, dex, con, int, wis, cha] = values;
      return {
        str: { value: str, proficient: 0 },
        dex: { value: dex, proficient: 0 },
        con: { value: con, proficient: 0 },
        int: { value: int, proficient: 0 },
        wis: { value: wis, proficient: 0 },
        cha: { value: cha, proficient: 0 }
      };
    }
  }
  return null;
}

function parseMovement(raw, current = {}) {
  const text = String(raw || "");
  const movement = { ...current, units: current.units || "ft" };
  const walk = text.match(/^(\d+)\s*фт/i);
  const fly = text.match(/(?:пол[её]т|левитац)[^\d]*(\d+)/i);
  const swim = text.match(/(?:плав|плыв)[^\d]*(\d+)/i);
  const climb = text.match(/(?:лаз|карабк)[^\d]*(\d+)/i);
  const burrow = text.match(/(?:копан|рыть|нор|подкоп)[^\d]*(\d+)/i);
  if (walk) movement.walk = parseInt(walk[1], 10);
  if (fly) movement.fly = parseInt(fly[1], 10);
  if (swim) movement.swim = parseInt(swim[1], 10);
  if (climb) movement.climb = parseInt(climb[1], 10);
  if (burrow) movement.burrow = parseInt(burrow[1], 10);
  movement.special = text;
  return movement;
}

function parseSenses(raw, current = {}) {
  const text = String(raw || "");
  const darkvision = text.match(/т[её]мное зрение\s+(\d+)/i);
  const tremorsense = text.match(/чувство вибрации\s+(\d+)/i);
  const blindsight = text.match(/слепое зрение\s+(\d+)/i);
  const truesight = text.match(/истинное зрение\s+(\d+)/i);
  return {
    ...current,
    darkvision: darkvision ? parseInt(darkvision[1], 10) : current.darkvision ?? 0,
    tremorsense: tremorsense ? parseInt(tremorsense[1], 10) : current.tremorsense ?? 0,
    blindsight: blindsight ? parseInt(blindsight[1], 10) : current.blindsight ?? 0,
    truesight: truesight ? parseInt(truesight[1], 10) : current.truesight ?? 0,
    special: text,
    units: current.units || "ft",
    perception: current.perception ?? 0
  };
}

function buildActorUpdate(actor, block) {
  const saves = parseMetric(block, "Спасброски");
  const skills = parseMetric(block, "Навыки");
  const resistances = parseMetric(block, "Сопротивления", "Сопротивление");
  const vulnerabilities = parseMetric(block, "Уязвимости", "Уязвимость");
  const immunitiesRaw = parseMetric(block, "Иммунитеты", "Иммунитет");
  const senses = parseMetric(block, "Чувства");
  const languages = parseMetric(block, "Языки");
  const speed = parseMetric(block, "Скорость");
  const abilities = parseAbilityTable(block);
  const immunities = splitImmunities(immunitiesRaw);

  const traits = actor.system?.traits ?? {};
  const system = {
    attributes: {
      movement: parseMovement(speed, actor.system?.attributes?.movement ?? {}),
      senses: parseSenses(senses, actor.system?.attributes?.senses ?? {})
    },
    traits: {
      ...traits,
      languages: { ...(traits.languages ?? {}), custom: languages || traits.languages?.custom || "" },
      dr: resistances ? normalizedTrait(resistances, DAMAGE_MAP) : traits.dr,
      dv: vulnerabilities ? normalizedTrait(vulnerabilities, DAMAGE_MAP) : traits.dv,
      di: immunities.damage.custom ? immunities.damage : traits.di,
      ci: immunities.conditions.custom ? immunities.conditions : traits.ci
    }
  };
  if (abilities) system.abilities = abilities;

  return {
    system,
    flags: {
      [MODULE_ID]: {
        actorNormalizerSchema: ACTOR_NORMALIZER_SCHEMA,
        rawSaves: saves,
        rawSkills: skills,
        rawResistances: resistances,
        rawVulnerabilities: vulnerabilities,
        rawImmunities: immunitiesRaw,
        rawSenses: senses,
        rawLanguages: languages,
        rawAbilitiesUpdated: Boolean(abilities)
      }
    }
  };
}

async function normalizeActors({ overwrite = true } = {}) {
  if (!game.user?.isGM) return { updated: 0, skipped: 0, failed: [] };
  const result = { updated: 0, skipped: 0, failed: [] };
  for (const actor of game.actors) {
    const sourcePath = actor.getFlag(MODULE_ID, "sourcePath");
    const sourceBlock = actor.getFlag(MODULE_ID, "sourceBlock");
    if (!sourcePath?.startsWith("content/actor-statblocks/") || !sourceBlock) continue;
    if (!overwrite && actor.getFlag(MODULE_ID, "actorNormalizerSchema") === ACTOR_NORMALIZER_SCHEMA) { result.skipped += 1; continue; }
    try {
      const markdown = await fetchText(sourcePath);
      const block = extractBlock(markdown, sourceBlock);
      if (!block) { result.failed.push({ actor: actor.name, sourcePath, sourceBlock, error: "source block not found" }); continue; }
      await actor.update(buildActorUpdate(actor, block));
      result.updated += 1;
    } catch (error) {
      result.failed.push({ actor: actor.name, sourcePath, sourceBlock, error: error.message });
    }
  }
  if (result.failed.length > 0) {
    console.error("Aeria Core | actor normalization failures", result.failed);
    ui.notifications?.warn(`Aeria Core: нормализация чарников завершена с ошибками: ${result.failed.length}.`);
  } else if (result.updated > 0) {
    ui.notifications?.info(`Aeria Core: чарники НИПов и существ дозаполнены. Обновлено: ${result.updated}.`);
  }
  return result;
}

function wrapActorImports() {
  game.aeriya = game.aeriya ?? {};
  const originalImportAll = game.aeriya.importAll;
  if (typeof originalImportAll === "function" && !originalImportAll.__aeriyaActorNormalizerWrapped) {
    const wrapped = async (options = {}) => {
      const result = await originalImportAll(options);
      const normalization = await normalizeActors({ overwrite: true });
      result.failed?.push?.(...(normalization.failed ?? []));
      result.updated = (result.updated ?? 0) + (normalization.updated ?? 0);
      result.skipped = (result.skipped ?? 0) + (normalization.skipped ?? 0);
      return result;
    };
    wrapped.__aeriyaActorNormalizerWrapped = true;
    game.aeriya.importAll = wrapped;
  }
}

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.normalizeActors = (options = {}) => normalizeActors(options);
  wrapActorImports();
  if (!game.user?.isGM) return;
  const moduleVersion = game.modules.get(MODULE_ID)?.version ?? "unknown";
  const settingKey = "actorNormalizerImportedVersion";
  game.settings.register(MODULE_ID, settingKey, { name: "Aeria Core: версия нормализации чарников", scope: "world", config: false, type: String, default: "" });
  const current = `${moduleVersion}:${ACTOR_NORMALIZER_SCHEMA}`;
  if (game.settings.get(MODULE_ID, settingKey) === current) return;
  window.setTimeout(async () => {
    wrapActorImports();
    const result = await normalizeActors({ overwrite: true });
    if (result.failed.length === 0) await game.settings.set(MODULE_ID, settingKey, current);
  }, 9000);
});
