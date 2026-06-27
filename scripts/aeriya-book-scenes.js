const MODULE_ID = "aeriya";
const BOOK_SCENES_SCHEMA = "book-scenes-v4";
const BOOK_SOURCE = "Города и поселения Аэрии";

const ROWS = `Гравен Холлоу|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|крупный город
Кладовая Перекрёстков|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|крупный город-склад
Морнстэд|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|крупный город
Фарн’Крот|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|подземный город
Озерник|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|водный город
Плавень|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|болотный город
Скрежетник|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|шахтёрский город
Бьющий Колокол|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|город-маяк
Усадьба Леденёвых|Aeria Core / Сцены / Срединные Земли|middle-lands|common|settlement|усадебный центр
Крик Химеры|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|город опасных грузов
Тарный Столб|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|малый город-узел
Берег Сухих Глаз|Aeria Core / Сцены / Срединные Земли|middle-lands|common|settlement|поселение
Горлица|Aeria Core / Сцены / Срединные Земли|middle-lands|common|city|малый город
Острог Прахобоя|Aeria Core / Сцены / Срединные Земли|middle-lands|common|settlement|крепость
Пустотень|Aeria Core / Сцены / Срединные Земли|middle-lands|common|location|особая локация
Сычий Брод|Aeria Core / Сцены / Срединные Земли|middle-lands|common|settlement|болотное поселение
Липуши|Aeria Core / Сцены / Срединные Земли|middle-lands|common|settlement|деревня
Лагерь Семиглазого|Aeria Core / Сцены / Срединные Земли|middle-lands|common|settlement|лагерь
Тонкая Гряда|Aeria Core / Сцены / Срединные Земли|middle-lands|common|location|перевал
Рубеж Трясин|Aeria Core / Сцены / Срединные Земли|middle-lands|common|settlement|пограничная стоянка
Варница Чёрного Дыма|Aeria Core / Сцены / Срединные Земли|middle-lands|common|settlement|промышленное поселение
Перекрёсток Трёх Теней|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|settlement|торговый узел
Чёрная Кузня|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|город-кузница
А’алмар|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|крупный город
Окрам|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|город воды и охоты
Таш’Вейн|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|богатый город
Борос|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|горный город
Гар-Шахр|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|город воинов
Бату|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|город тишины
Саи’Рам|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|город у озера
Ак-Куль|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|солёный город
Кум-Алам|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|южный город мастеров
Хур’Наир|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|city|город перехода
Деревня ИП|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|settlement|малое поселение
Пепельное Сердце|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|location|священная локация
Лагерь «Сломанный Рог»|Aeria Core / Сцены / Теневой Осколок / Лес Чёрного Шёпота|shadow-shard|black-whisper-forest|settlement|лесной лагерь
Дозорная Вышка у Озера|Aeria Core / Сцены / Теневой Осколок / Лес Чёрного Шёпота|shadow-shard|black-whisper-forest|settlement|сторожевой пост
Гнилой Собор|Aeria Core / Сцены / Теневой Осколок / Лес Чёрного Шёпота|shadow-shard|black-whisper-forest|settlement|культовое поселение
Прогалина Первого Костра|Aeria Core / Сцены / Теневой Осколок / Лес Чёрного Шёпота|shadow-shard|black-whisper-forest|location|нейтральная поляна
Ледяной Клык|Aeria Core / Сцены / Теневой Осколок / Морозный Предел|shadow-shard|frost-limit|city|ледяной город
Станция «Последний Огонь»|Aeria Core / Сцены / Теневой Осколок / Морозный Предел|shadow-shard|frost-limit|settlement|рубежная станция
Пылающий Клинок|Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши|scorching-shard|burning-wastes|city|главный город
Три Тени|Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши|scorching-shard|burning-wastes|settlement|торговая застава
Форт Раскалённой Соли|Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши|scorching-shard|burning-wastes|settlement|военный форпост
Стеклянный Городок|Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши|scorching-shard|burning-wastes|settlement|ремесленное поселение
Последний Вздох|Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши|scorching-shard|burning-wastes|settlement|оазис-база банды
Дворец Золотого Каравана|Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши|scorching-shard|burning-wastes|location|руины
Небесный Якорь|Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши|scorching-shard|burning-wastes|settlement|пиратская стоянка
Пещерный Порог|Aeria Core / Сцены / Палящий Осколок / Подземный Предел|scorching-shard|underground-limit|settlement|подземно-наземный переход
Кровавый Родник|Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни|scorching-shard|salt-deserts|settlement|оазис
Лагерь «Шёпот Ветра»|Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни|scorching-shard|salt-deserts|settlement|наблюдательный пост
Тихая Корка|Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни|scorching-shard|salt-deserts|settlement|поселение Солегрызов
Красная Соль|Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни|scorching-shard|salt-deserts|location|заброшенный пост
Руины Соляной Мельницы|Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни|scorching-shard|salt-deserts|location|руины`;

const OVERVIEWS = `Срединные Земли|Aeria Core / Сцены / Срединные Земли|middle-lands|common|overview|обзор региона
Теневой Осколок|Aeria Core / Сцены / Теневой Осколок|shadow-shard|common|overview|обзор осколка
Пепельная Степь|Aeria Core / Сцены / Теневой Осколок / Пепельная Степь|shadow-shard|ash-steppe|overview|обзор региона
Лес Чёрного Шёпота|Aeria Core / Сцены / Теневой Осколок / Лес Чёрного Шёпота|shadow-shard|black-whisper-forest|overview|обзор региона
Морозный Предел|Aeria Core / Сцены / Теневой Осколок / Морозный Предел|shadow-shard|frost-limit|overview|обзор региона
Палящий Осколок|Aeria Core / Сцены / Палящий Осколок|scorching-shard|common|overview|обзор осколка
Выжженные Пустоши|Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши|scorching-shard|burning-wastes|overview|обзор региона
Огненные Каньоны|Aeria Core / Сцены / Палящий Осколок / Огненные Каньоны|scorching-shard|fire-canyons|overview|обзор региона
Подземный Предел|Aeria Core / Сцены / Палящий Осколок / Подземный Предел|scorching-shard|underground-limit|overview|обзор региона
Соляные Пустыни|Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни|scorching-shard|salt-deserts|overview|обзор региона`;

const folderCache = new Map();

function slug(value) {
  return String(value || "scene").toLowerCase().replace(/ё/g, "е").replace(/[’ʼ'`«»]/g, "").replace(/[^a-z0-9а-яе]+/giu, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "scene";
}

function comparable(value) {
  return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/й/g, "и").replace(/[’ʼ'`«»\"()\[\].,;:!?-]/g, "").replace(/\s+/g, "").trim();
}

function parseRows(text, overview = false) {
  return text.trim().split("\n").map((line) => {
    const [name, folder, shard, region, type, bookType] = line.split("|");
    return { name, folder, shard, region, type, bookType, overview, sourcePath: `book:goroda-i-poseleniya-aerii/${slug(folder)}/${slug(name)}`, description: `${name} — ${bookType}. Источник: ${overview ? "служебная обзорная сцена" : `книга «${BOOK_SOURCE}»`}.` };
  });
}

function specs() {
  return [...parseRows(OVERVIEWS, true), ...parseRows(ROWS, false)];
}

async function getOrCreateFolder(documentType, path) {
  const key = `${documentType}:${path}`;
  if (folderCache.has(key)) return folderCache.get(key);
  let parent = null;
  for (const part of String(path || "Aeria Core / Сцены").split(/\s*\/\s*/).filter(Boolean)) {
    const existing = game.folders.find((folder) => folder.type === documentType && folder.name === part && (folder.folder?.id ?? null) === (parent?.id ?? null));
    parent = existing ?? await Folder.create({ name: part, type: documentType, folder: parent?.id ?? null, sorting: "a" });
  }
  folderCache.set(key, parent);
  return parent;
}

function isAeriaScene(scene) {
  return scene.getFlag(MODULE_ID, "documentKind") === "scene" || scene.getFlag(MODULE_ID, "displayMode") === "show-only-city-image" || String(scene.getFlag(MODULE_ID, "sourcePath") || "").startsWith("book:goroda-i-poseleniya-aerii/");
}

function sceneData(spec, folder, existing) {
  const data = {
    name: spec.name,
    folder: folder.id,
    width: existing?.width || 1600,
    height: existing?.height || 900,
    padding: 0,
    grid: { type: 0, size: 100, distance: 5, units: "ft" },
    tokenVision: false,
    fogExploration: false,
    navigation: false,
    darkness: 0,
    notes: [], tokens: [], tiles: [], walls: [], lights: [], sounds: [], drawings: [],
    flags: { [MODULE_ID]: { sourcePath: spec.sourcePath, documentKind: "scene", shard: spec.shard, region: spec.region, locationType: spec.type, bookType: spec.bookType, bookSource: BOOK_SOURCE, description: spec.description, displayMode: "show-only-city-image", tacticalMap: false, playerMovement: false, overview: spec.overview, importSchema: BOOK_SCENES_SCHEMA } }
  };
  if (!existing?.background?.src) data.background = { src: "" };
  return data;
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

async function importBookScenes({ overwrite = true, notify = true } = {}) {
  if (!game.user?.isGM) return { created: 0, updated: 0, skipped: 0, failed: [] };
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  folderCache.clear();
  for (const spec of specs()) {
    try {
      const folder = await getOrCreateFolder("Scene", spec.folder);
      const target = comparable(spec.name);
      const matches = game.scenes.filter((scene) => scene.getFlag(MODULE_ID, "sourcePath") === spec.sourcePath || (isAeriaScene(scene) && comparable(scene.name) === target));
      const existing = matches[0] ?? null;
      if (existing && !overwrite) { result.skipped += 1; continue; }
      if (existing) {
        await existing.update(sceneData(spec, folder, existing));
        result.updated += 1;
        const duplicateIds = matches.slice(1).map((scene) => scene.id);
        if (duplicateIds.length) await Scene.deleteDocuments(duplicateIds);
      } else {
        await Scene.create(sceneData(spec, folder, null));
        result.created += 1;
      }
    } catch (error) {
      result.failed.push({ name: spec.name, error: error.message });
    }
  }
  if (notify) {
    if (result.failed.length) {
      console.error("Aeria Core | book scene import failures", result.failed);
      ui.notifications?.error(`Aeria Core: импорт сцен завершён с ошибками: ${result.failed.length}.`);
    } else {
      ui.notifications?.info(`Aeria Core: все сцены проверены. Создано: ${result.created}, обновлено: ${result.updated}, пропущено: ${result.skipped}.`);
    }
  }
  return result;
}

async function repairBookScenes() {
  const imported = await importBookScenes({ overwrite: true, notify: false });
  if (game.aeriya?.cleanupBookSceneStructure) await game.aeriya.cleanupBookSceneStructure({ deleteLegacyScenes: true });
  ui.notifications?.info(`Aeria Core: сцены восстановлены. Создано: ${imported.created}, обновлено: ${imported.updated}.`);
  return imported;
}

function wrapImportAllWithBookScenes() {
  game.aeriya = game.aeriya ?? {};
  const original = game.aeriya.importAll;
  if (typeof original !== "function" || original.__aeriyaBookScenesWrapped) return;
  const wrapped = async (options = {}) => mergeResults(await original(options), await importBookScenes({ overwrite: options.overwrite ?? true, notify: false }));
  wrapped.__aeriyaBookScenesWrapped = true;
  game.aeriya.importAll = wrapped;
}

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.importBookScenes = (options = {}) => importBookScenes(options);
  game.aeriya.repairBookScenes = () => repairBookScenes();
  wrapImportAllWithBookScenes();
  if (!game.user?.isGM) return;
  const key = "bookScenesImportedVersion";
  game.settings.register(MODULE_ID, key, { name: "Aeria Core: версия сцен", scope: "world", config: false, type: String, default: "" });
  const current = `${game.modules.get(MODULE_ID)?.version ?? "unknown"}:${BOOK_SCENES_SCHEMA}`;
  window.setTimeout(async () => {
    wrapImportAllWithBookScenes();
    const result = await importBookScenes({ overwrite: true, notify: true });
    if (!result.failed.length) await game.settings.set(MODULE_ID, key, current);
  }, 4000);
});
