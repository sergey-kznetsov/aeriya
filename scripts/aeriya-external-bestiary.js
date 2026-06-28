const MODULE_ID = 'aeriya';
const SCHEMA = 'external-bestiary-v5-safe-refresh';
const IMG = 'icons/svg/mystery-man.svg';
const cache = new Map();

const TYPE_RU = {
  aberration: 'аберрация', beast: 'зверь', celestial: 'небожитель', construct: 'конструкт', dragon: 'дракон',
  elemental: 'элементаль', fey: 'фея', fiend: 'исчадие', giant: 'великан', humanoid: 'гуманоид',
  monstrosity: 'монструозность', ooze: 'слизь', plant: 'растение', undead: 'нежить'
};

function cn(value) {
  const text = String(value || 0);
  if (text.includes('/')) {
    const [a, b] = text.split('/').map(Number);
    return b ? a / b : 0;
  }
  const number = parseFloat(text.replace(',', '.'));
  return Number.isFinite(number) ? number : 0;
}

function prof(value) {
  const cr = cn(value);
  return cr <= 4 ? 2 : Math.min(9, 2 + Math.ceil((cr - 4) / 4));
}

function sm(value) {
  return Math.floor((value - 10) / 2);
}

function sid(value) {
  return String(value || 'x')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9а-яе]+/giu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'x';
}

function abilities(record) {
  const cr = cn(record.cr);
  const base = 10 + Math.min(12, Math.floor(cr / 2));
  if (record.src === 'ЭНОА') {
    const n = Math.max(1, Math.round(cr));
    return [10 + n, 10 + Math.floor(n / 2), 10 + n, 7 + Math.ceil(n / 2), 10 + Math.floor(n / 2), 7 + Math.ceil(n / 2)].map((x) => Math.min(30, x));
  }
  const result = [base, base - 2, base, 10, 12, 10];
  if (['dragon', 'giant'].includes(record.type)) { result[0] = base + 4; result[2] = base + 3; result[5] = base; }
  if (/beast/.test(record.type) || /Скрыт|Штурм/i.test(record.role)) result[1] = base + 3;
  if (/construct|ooze|plant/.test(record.type)) result[2] = base + 4;
  if (/Контрол|Артил/i.test(record.role)) { result[3] = Math.max(result[3], base + 2); result[4] = Math.max(result[4], base + 1); }
  if (/Лидер|Элита/i.test(record.role)) { result[5] = Math.max(result[5], base + 2); result[4] = Math.max(result[4], base + 1); }
  return result.map((x) => Math.min(30, Math.max(1, Math.round(x))));
}

function ac(record) {
  const cr = cn(record.cr);
  return record.src === 'ЭНОА' ? 12 + Math.round(cr) : Math.min(26, 13 + Math.floor(cr / 3) + (/Солдат|Элита/i.test(record.role) ? 1 : 0));
}

function hp(record) {
  const cr = cn(record.cr);
  if (record.src === 'ЭНОА') return Math.max(1, Math.round(cr * 30));
  if (record.src === 'Ведьмак') return Math.max(7, Math.round(25 + cr * 18));
  return Math.round(45 + cr * 24 + (record.flags.includes('T') ? 80 : 0) + (record.flags.includes('K') ? 25 : 0));
}

function size(record) {
  const cr = cn(record.cr);
  if (record.flags.includes('T')) return 'grg';
  if (cr >= 18) return 'huge';
  if (cr >= 12) return 'lg';
  return 'med';
}

function movement(record) {
  const canFly = /dragon|celestial|fey/.test(record.type) || /Штурм|Артил/i.test(record.role);
  return { walk: 30, swim: 0, fly: canFly ? 60 : 0, climb: 0, burrow: 0, units: 'ft', special: canFly ? '30 фт, полёт 60 фт' : '30 фт' };
}

function damage(cr) {
  const value = Math.max(1, cn(cr));
  if (value < 2) return ['1d6+2', 'bludgeoning', 5];
  if (value < 5) return ['2d6+3', 'bludgeoning', 10];
  if (value < 9) return ['2d8+4', 'slashing', 13];
  if (value < 13) return ['3d8+5', 'slashing', 18];
  if (value < 17) return ['4d8+6', 'force', 24];
  if (value < 21) return ['5d10+7', 'force', 34];
  if (value < 25) return ['6d10+8', 'force', 41];
  if (value < 29) return ['8d10+9', 'force', 53];
  return ['10d10+10', 'force', 65];
}

async function folder(type, path) {
  const key = `${type}:${path}`;
  if (cache.has(key)) return cache.get(key);
  let parent = null;
  for (const name of path.split(/\s*\/\s*/).filter(Boolean)) {
    const existing = game.folders.find((candidate) => candidate.type === type && candidate.name === name && (candidate.folder?.id ?? null) === (parent?.id ?? null));
    parent = existing ?? await Folder.create({ name, type, folder: parent?.id ?? null, sorting: 'a' });
  }
  cache.set(key, parent);
  return parent;
}

function habitat(record) {
  const name = record.name.toLowerCase();
  if (record.src === 'Ведьмак') {
    if (/утоп|пияв|сколопенд/.test(name)) return 'влажные низины, затопленные подвалы, болота и берега стоячей воды';
    if (/леш/.test(name)) return 'древние леса, заросшие святилища и места, где тропа начинает повторяться';
    if (/гуль|альгуль|гнилец|падаль|баргест|стрыг|гаркаин/.test(name)) return 'кладбища, поля старых сражений, брошенные деревни и дороги после резни';
  }
  if (record.src === 'ЭНОА') return 'пограничные земли Аэрии, разорванные Завязью, пепельные равнины, соляные провалы и старые дороги';
  if (/dragon/.test(record.type) || /дракон/i.test(record.group)) return 'древние руины, каньоны, подземные чаши и территории, где воздух хранит след старой стихии';
  if (/plant/.test(record.type)) return 'искажённые чащи, влажные овраги, мёртвые сады и места сильной природной магии';
  if (/ooze/.test(record.type)) return 'подземелья, канализационные ходы, влажные пещеры и металлургические стоки';
  if (/construct/.test(record.type)) return 'арканные лаборатории, развалины башен, хранилища заклинателей и сломанные защитные комплексы';
  return 'опасные территории между поселениями, руины после Разлома и места, где обычная экология уже не работает';
}

function tactics(record) {
  const role = String(record.role || '');
  if (/Артил/i.test(role)) return 'держит дистанцию, выбирает открытые линии атаки, отступает за укрытие и наказывает плотные группы';
  if (/Контрол/i.test(role)) return 'ломает порядок боя: ограничивает движение, разделяет партию, сбивает концентрацию и заставляет тратить действия на спасение союзников';
  if (/Скрыт/i.test(role)) return 'атакует из засады, бьёт по раненым, меняет позицию и не задерживается в прямом обмене ударами';
  if (/Штурм/i.test(role)) return 'быстро входит в ближний бой, давит слабую линию и заставляет персонажей реагировать немедленно';
  if (/Лидер|Элита/i.test(role)) return 'держит центр сцены, использует подчинённых или среду и навязывает бой на своих условиях';
  return 'ведёт себя как региональная угроза: проверяет слабые места группы, давит ресурсами и использует местность';
}

function biography(record) {
  const type = TYPE_RU[record.type] || record.type || 'существо';
  const source = record.src === 'ЭНОА'
    ? 'чужеродная региональная угроза, след сбоя Завязи, старой катастрофы или занесённой через караваны твари'
    : record.src === 'Ведьмак'
      ? 'известная охотничья категория, которую ловчие распознают по приметам, следам и подготовительным запретам'
      : 'редкий внешний противник для высокорисковых сцен, руин и региональных кризисов';
  return `<div class="aeriya-content"><h2>${record.name}</h2><p><strong>Источник:</strong> ${record.src}. <strong>Группа:</strong> ${record.group}. <strong>Роль:</strong> ${record.role}. <strong>Тип:</strong> ${type}. <strong>КО:</strong> ${record.cr}.</p><h3>Описание</h3><p>${record.name} — ${type}, которого в Аэрии нужно подавать как конкретную угрозу сцены, а не как техническую заглушку. Его присутствие заметно заранее: местность меняет ритм, мелкие животные уходят, а жители говорят не о чудовище, а о последствиях его прохода.</p><p>В рамках сеттинга это ${source}.</p><h3>Среда и признаки</h3><p><strong>Где встречается:</strong> ${habitat(record)}.</p><p><strong>Как заметить:</strong> искажённые следы, отсутствие обычных звуков, повреждённые укрытия, странный запах, повторяющиеся слухи и тела добычи, оставленные не там, где их должны были найти.</p><h3>Поведение в бою</h3><p>${tactics(record)}. В бою мастер может опираться на роль, КО и тип существа: атаки, защитные значения и особые действия уже рассчитаны для листа Foundry.</p><h3>Использование в кампании</h3><p>Подходит для охоты, засады на дороге, охраны руин, последствий нарушенного обряда, побочного кризиса у поселения или как след более крупной угрозы. Для Палящего Осколка связывай его с водой, солью, жаром или подземными резервуарами; для Теневого — с духами, пеплом, лесом или холодом; для Срединных Земель — с торговлей, долгом и нарушенной сделкой.</p></div>`;
}

function items(record, abilityArray) {
  const [formula, damageType, average] = damage(record.cr);
  const hit = prof(record.cr) + Math.max(sm(abilityArray[0]), sm(abilityArray[1]), 1);
  const dc = 8 + prof(record.cr) + Math.max(sm(abilityArray[2]), sm(abilityArray[4]), sm(abilityArray[5]), 1);
  const range = /Артил/i.test(record.role) ? 120 : 5;
  const actionType = /Артил/i.test(record.role) ? 'rsak' : 'mwak';
  const output = [
    { name: 'Роль существа', type: 'feat', system: { description: { value: `<p>${record.group}; ${record.role}; источник: ${record.src}. ${tactics(record)}.</p>` }, activation: { type: 'passive', cost: null }, source: { custom: 'Aeria Core' } } },
    { name: 'Мультиатака', type: 'feat', system: { description: { value: `<p>${record.name} совершает две атаки или одну атаку и особое действие.</p>` }, activation: { type: 'action', cost: 1 }, source: { custom: 'Aeria Core' } } },
    { name: 'Основная атака', type: 'weapon', system: { description: { value: `<p>+${hit} к попаданию. Дистанция: ${range} фт. Попадание: ${average} (${formula}) урона.</p>` }, activation: { type: 'action', cost: 1 }, target: { type: 'creature', count: 1 }, range: { value: range, units: 'ft' }, actionType, attackBonus: hit, damage: { parts: [[formula, damageType]] }, equipped: true, proficient: true, source: { custom: 'Aeria Core' } } },
    { name: 'Особое действие', type: 'feat', system: { description: { value: `<p>Цель в пределах 60 фт проходит спасбросок Сл ${dc}. Эффект выбирается по роли существа: контроль, страх, яд, сбивание, опутывание, ослабление, перемещение или разрушение укрытия.</p>` }, activation: { type: 'action', cost: 1 }, source: { custom: 'Aeria Core' } } }
  ];
  if (record.flags.includes('T')) output.push({ name: 'Титаническая анатомия', type: 'feat', system: { description: { value: '<p>Существо может иметь несколько секций, отдельные уязвимые зоны и сценические цели. Не своди бой только к снижению хитов.</p>' }, activation: { type: 'passive', cost: null }, source: { custom: 'Aeria Core' } } });
  if (record.flags.includes('L') || /Элита/i.test(record.role)) output.push({ name: 'Легендарное действие', type: 'feat', system: { description: { value: '<p>Существо перемещается, атакует, давит страхом или мешает одной цели в конце хода другого существа.</p>' }, activation: { type: 'legendary', cost: 1 }, source: { custom: 'Aeria Core' } } });
  return output;
}

function actorDocument(record, targetFolder) {
  const abilityArray = abilities(record);
  const sourcePath = `external-bestiary:${record.src}:${sid(record.name)}`;
  return {
    name: record.name,
    type: 'npc',
    img: IMG,
    folder: targetFolder.id,
    system: {
      details: { biography: { value: biography(record), public: '' }, type: { value: record.type, custom: '' }, cr: cn(record.cr), source: { custom: record.src } },
      attributes: { ac: { flat: ac(record), calc: 'flat' }, hp: { value: hp(record), max: hp(record), temp: 0, tempmax: 0, formula: '' }, movement: movement(record), senses: { darkvision: cn(record.cr) >= 10 ? 120 : 60, special: 'пассивное Восприятие 10', units: 'ft', perception: 0 } },
      abilities: { str: { value: abilityArray[0], proficient: 0 }, dex: { value: abilityArray[1], proficient: 0 }, con: { value: abilityArray[2], proficient: 0 }, int: { value: abilityArray[3], proficient: 0 }, wis: { value: abilityArray[4], proficient: 0 }, cha: { value: abilityArray[5], proficient: 0 } },
      skills: {},
      traits: { size: size(record), languages: { value: [], custom: '—' }, di: { value: [], custom: '' }, dr: { value: [], custom: '' }, dv: { value: [], custom: '' }, ci: { value: [], custom: '' } }
    },
    prototypeToken: { name: record.name, actorLink: false, disposition: -1, displayName: 20, displayBars: 20, bar1: { attribute: 'attributes.hp' }, texture: { src: IMG, scaleX: 1, scaleY: 1 }, sight: { enabled: false } },
    flags: { [MODULE_ID]: { sourcePath, sourceBlock: record.name, documentKind: 'bestiary', shard: 'external', region: record.src, externalBestiary: true, externalSource: record.src, externalGroup: record.group, externalRole: record.role, importSchema: SCHEMA } }
  };
}

function shouldSafeRefresh(existing) {
  if (!existing) return false;
  const schema = existing.getFlag(MODULE_ID, 'importSchema');
  const isExternal = existing.getFlag(MODULE_ID, 'externalBestiary') || String(existing.getFlag(MODULE_ID, 'sourcePath') || '').startsWith('external-bestiary:');
  if (!isExternal) return false;
  if (schema !== SCHEMA) return true;
  const bio = String(existing.system?.details?.biography?.value || '');
  return bio.includes('Actor-ready перенос') || bio.trim().length < 80;
}

async function setItems(actor, itemData) {
  const ids = actor.items?.map((item) => item.id) ?? [];
  if (ids.length) await actor.deleteEmbeddedDocuments('Item', ids);
  if (itemData.length) await actor.createEmbeddedDocuments('Item', itemData);
}

function preserveUserImages(existing, data) {
  if (!existing) return data;
  if (existing.img && existing.img !== IMG) data.img = existing.img;
  const tokenSrc = existing.prototypeToken?.texture?.src;
  if (tokenSrc && tokenSrc !== IMG) data.prototypeToken.texture.src = tokenSrc;
  return data;
}

function merge(...results) {
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

async function importExternalBestiary({ overwrite = false, refreshOldExternal = true } = {}) {
  if (!game.user?.isGM) return { created: 0, updated: 0, skipped: 0, failed: [] };
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  for (const record of globalThis.AERIA_EXTERNAL_BESTIARY_RECORDS ?? []) {
    try {
      const targetFolder = await folder('Actor', `Aeria Core / Бестиарий / Внешние источники / ${record.src}`);
      const data = actorDocument(record, targetFolder);
      const itemData = items(record, abilities(record));
      const existing = game.actors.find((actor) => actor.getFlag(MODULE_ID, 'sourcePath') === data.flags[MODULE_ID].sourcePath || (actor.getFlag(MODULE_ID, 'externalBestiary') && actor.name === record.name && actor.getFlag(MODULE_ID, 'externalSource') === record.src));

      if (existing) {
        const canRefresh = overwrite || (refreshOldExternal && shouldSafeRefresh(existing));
        if (!canRefresh) { result.skipped += 1; continue; }
        await existing.update(preserveUserImages(existing, data));
        await setItems(existing, itemData);
        result.updated += 1;
        continue;
      }

      await Actor.create({ ...data, items: itemData });
      result.created += 1;
    } catch (error) {
      result.failed.push({ name: record.name, source: record.src, error: error.message });
    }
  }
  if (result.failed.length) console.error('Aeria Core external bestiary failures', result.failed);
  ui.notifications?.info(`Aeria Core: внешний бестиарий. Создано: ${result.created}, обновлено: ${result.updated}, пропущено: ${result.skipped}, ошибок: ${result.failed.length}.`);
  return result;
}

function wrapImportAllWithExternalBestiary() {
  game.aeriya = game.aeriya ?? {};
  const original = game.aeriya.importAll;
  if (typeof original !== 'function' || original.__aeriyaExternalBestiaryWrapped) return;
  const wrapped = async (options = {}) => merge(await original(options), await importExternalBestiary({ overwrite: Boolean(options.allowDestructiveOverwrite), refreshOldExternal: true }));
  wrapped.__aeriyaExternalBestiaryWrapped = true;
  game.aeriya.importAll = wrapped;
}

Hooks.once('ready', () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.importExternalBestiary = (options = {}) => importExternalBestiary(options);
  wrapImportAllWithExternalBestiary();
  if (!game.user?.isGM) return;
  const key = 'externalBestiaryImportedVersion';
  const current = `${game.modules.get(MODULE_ID)?.version ?? 'unknown'}:${SCHEMA}`;
  game.settings.register(MODULE_ID, key, { name: 'Aeria Core: версия внешнего бестиария', scope: 'world', config: false, type: String, default: '' });
  if (game.settings.get(MODULE_ID, key) === current) return;
  window.setTimeout(async () => {
    wrapImportAllWithExternalBestiary();
    const result = await importExternalBestiary({ overwrite: false, refreshOldExternal: true });
    if (!result.failed.length) await game.settings.set(MODULE_ID, key, current);
  }, 7000);
});
