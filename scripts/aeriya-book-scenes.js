const MODULE_ID = "aeriya";
const BOOK_SCENES_SCHEMA = "book-scenes-v2";
const BOOK_SOURCE = "Города и поселения Аэрии";

const BOOK_SCENES_TSV = `name	folder	shard	region	type	bookType
Гравен Холлоу	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	крупный город
Кладовая Перекрёстков	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	крупный город-склад
Морнстэд	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	крупный город
Фарн’Крот	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	подземный город
Озерник	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	водный город
Плавень	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	болотный город
Скрежетник	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	шахтёрский город
Бьющий Колокол	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	город-маяк
Усадьба Леденёвых	Aeria Core / Сцены / Срединные Земли / Поселения	middle-lands	common	settlement	усадебный центр
Крик Химеры	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	город опасных грузов
Тарный Столб	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	малый город-узел
Берег Сухих Глаз	Aeria Core / Сцены / Срединные Земли / Поселения	middle-lands	common	settlement	поселение
Горлица	Aeria Core / Сцены / Срединные Земли / Города	middle-lands	common	city	малый город
Острог Прахобоя	Aeria Core / Сцены / Срединные Земли / Поселения	middle-lands	common	settlement	крепость
Пустотень	Aeria Core / Сцены / Срединные Земли / Локации	middle-lands	common	location	особая локация
Сычий Брод	Aeria Core / Сцены / Срединные Земли / Поселения	middle-lands	common	settlement	болотное поселение
Липуши	Aeria Core / Сцены / Срединные Земли / Поселения	middle-lands	common	settlement	деревня
Лагерь Семиглазого	Aeria Core / Сцены / Срединные Земли / Поселения	middle-lands	common	settlement	лагерь
Тонкая Гряда	Aeria Core / Сцены / Срединные Земли / Локации	middle-lands	common	location	перевал
Рубеж Трясин	Aeria Core / Сцены / Срединные Земли / Поселения	middle-lands	common	settlement	пограничная стоянка
Варница Чёрного Дыма	Aeria Core / Сцены / Срединные Земли / Поселения	middle-lands	common	settlement	промышленное поселение
Перекрёсток Трёх Теней	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Поселения	shadow-shard	ash-steppe	settlement	торговый узел
Чёрная Кузня	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	город-кузница
А’алмар	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	крупный город
Окрам	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	город воды и охоты
Таш’Вейн	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	богатый город
Борос	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	горный город
Гар-Шахр	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	город воинов
Бату	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	город тишины
Саи’Рам	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	город у озера
Ак-Куль	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	солёный город
Кум-Алам	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	южный город мастеров
Хур’Наир	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Города	shadow-shard	ash-steppe	city	город перехода
Деревня ИП	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Поселения	shadow-shard	ash-steppe	settlement	малое поселение
Пепельное Сердце	Aeria Core / Сцены / Теневой Осколок / Пепельная Степь / Локации	shadow-shard	ash-steppe	location	священная локация
Лагерь «Сломанный Рог»	Aeria Core / Сцены / Теневой Осколок / Лес Чёрного Шёпота / Поселения	shadow-shard	black-whisper-forest	settlement	лесной лагерь
Дозорная Вышка у Озера	Aeria Core / Сцены / Теневой Осколок / Лес Чёрного Шёпота / Поселения	shadow-shard	black-whisper-forest	settlement	сторожевой пост
Гнилой Собор	Aeria Core / Сцены / Теневой Осколок / Лес Чёрного Шёпота / Поселения	shadow-shard	black-whisper-forest	settlement	культовое поселение
Прогалина Первого Костра	Aeria Core / Сцены / Теневой Осколок / Лес Чёрного Шёпота / Локации	shadow-shard	black-whisper-forest	location	нейтральная поляна
Ледяной Клык	Aeria Core / Сцены / Теневой Осколок / Морозный Предел / Города	shadow-shard	frost-limit	city	ледяной город
Станция «Последний Огонь»	Aeria Core / Сцены / Теневой Осколок / Морозный Предел / Поселения	shadow-shard	frost-limit	settlement	рубежная станция
Пылающий Клинок	Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши / Города	scorching-shard	burning-wastes	city	главный город
Три Тени	Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши / Поселения	scorching-shard	burning-wastes	settlement	торговая застава
Форт Раскалённой Соли	Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши / Поселения	scorching-shard	burning-wastes	settlement	военный форпост
Стеклянный Городок	Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши / Поселения	scorching-shard	burning-wastes	settlement	ремесленное поселение
Последний Вздох	Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши / Поселения	scorching-shard	burning-wastes	settlement	оазис-база банды
Дворец Золотого Каравана	Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши / Локации	scorching-shard	burning-wastes	location	руины
Небесный Якорь	Aeria Core / Сцены / Палящий Осколок / Выжженные Пустоши / Поселения	scorching-shard	burning-wastes	settlement	пиратская стоянка
Пещерный Порог	Aeria Core / Сцены / Палящий Осколок / Подземный Предел / Поселения	scorching-shard	underground-limit	settlement	подземно-наземный переход
Кровавый Родник	Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни / Поселения	scorching-shard	salt-deserts	settlement	оазис
Лагерь «Шёпот Ветра»	Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни / Поселения	scorching-shard	salt-deserts	settlement	наблюдательный пост
Тихая Корка	Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни / Поселения	scorching-shard	salt-deserts	settlement	поселение Солегрызов
Красная Соль	Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни / Локации	scorching-shard	salt-deserts	location	заброшенный пост
Руины Соляной Мельницы	Aeria Core / Сцены / Палящий Осколок / Соляные Пустыни / Локации	scorching-shard	salt-deserts	location	руины`;

function slugify(value) {
  const map = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", "’": "", "ʼ": "", "«": "", "»": ""
  };
  return String(value || "scene")
    .toLowerCase()
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "scene";
}

function comparableName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/й/g, "и")
    .replace(/[’ʼ'`«»\"()\[\].,;:!?-]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function parseBookScenes() {
  const lines = BOOK_SCENES_TSV.trim().split("\n");
  const header = lines.shift().split("\t");
  return lines.map((line) => {
    const row = Object.fromEntries(line.split("\t").map((value, index) => [header[index], value]));
    return {
      ...row,
      sourcePath: `book:goroda-i-poseleniya-aerii/${slugify(row.folder)}/${slugify(row.name)}`,
      description: `${row.name} — ${row.bookType}. Источник: книга «${BOOK_SOURCE}».`
    };
  });
}

const _folderCache = new Map();
async function getOrCreateFolder(documentType, folderPath) {
  const key = `${documentType}::${folderPath}`;
  if (_folderCache.has(key)) return _folderCache.get(key);
  const parts = String(folderPath || "Aeria Core / Сцены").split(/\s*\/\s*/).filter(Boolean);
  let parent = null;
  for (const part of parts) {
    const existing = game.folders.find((folder) => folder.type === documentType && folder.name === part && (folder.folder?.id ?? null) === (parent?.id ?? null));
    parent = existing ?? await Folder.create({ name: part, type: documentType, folder: parent?.id ?? null, sorting: "a" });
  }
  _folderCache.set(key, parent);
  return parent;
}

function isAeriaScene(scene) {
  return scene.getFlag(MODULE_ID, "documentKind") === "scene" || scene.getFlag(MODULE_ID, "displayMode") === "show-only-city-image";
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
    flags: {
      [MODULE_ID]: {
        sourcePath: spec.sourcePath,
        documentKind: "scene",
        shard: spec.shard,
        region: spec.region,
        locationType: spec.type,
        bookType: spec.bookType,
        bookSource: BOOK_SOURCE,
        description: spec.description,
        displayMode: "show-only-city-image",
        tacticalMap: false,
        playerMovement: false,
        importSchema: BOOK_SCENES_SCHEMA
      }
    }
  };
  if (!existing?.background?.src) data.background = { src: "" };
  return data;
}

function mergeResults(...results) {
  const merged = { created: 0, updated: 0, skipped: 0, failed: [] };
  for (const r of results) {
    if (!r) continue;
    merged.created += r.created ?? 0;
    merged.updated += r.updated ?? 0;
    merged.skipped += r.skipped ?? 0;
    merged.failed.push(...(r.failed ?? []));
  }
  return merged;
}

async function importBookScenes({ overwrite = true } = {}) {
  if (!game.user?.isGM) return { created: 0, updated: 0, skipped: 0, failed: [] };
  const specs = parseBookScenes();
  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  _folderCache.clear();

  for (const spec of specs) {
    try {
      const folder = await getOrCreateFolder("Scene", spec.folder);
      const targetName = comparableName(spec.name);
      const matches = game.scenes.filter((scene) =>
        scene.getFlag(MODULE_ID, "sourcePath") === spec.sourcePath ||
        (isAeriaScene(scene) && comparableName(scene.name) === targetName)
      );
      const existing = matches[0] ?? null;
      if (existing && !overwrite) { result.skipped += 1; continue; }
      if (existing) {
        await existing.update(sceneData(spec, folder, existing));
        result.updated += 1;
        const duplicateIds = matches.slice(1).map((scene) => scene.id);
        if (duplicateIds.length > 0) await Scene.deleteDocuments(duplicateIds);
      } else {
        await Scene.create(sceneData(spec, folder, null));
        result.created += 1;
      }
    } catch (error) {
      result.failed.push({ name: spec.name, error: error.message });
    }
  }

  if (result.failed.length > 0) {
    console.error("Aeria Core | book scene import failures", result.failed);
    ui.notifications?.error(`Aeria Core: импорт сцен из книги завершён с ошибками: ${result.failed.length}.`);
  } else {
    ui.notifications?.info(`Aeria Core: сцены из книги «${BOOK_SOURCE}» готовы. Создано: ${result.created}, обновлено: ${result.updated}, пропущено: ${result.skipped}.`);
  }
  return result;
}

function wrapImportAllWithBookScenes() {
  game.aeriya = game.aeriya ?? {};
  const originalImportAll = game.aeriya.importAll;
  if (typeof originalImportAll !== "function" || originalImportAll.__aeriyaBookScenesWrapped) return;
  const wrapped = async (options = {}) => mergeResults(await originalImportAll(options), await importBookScenes({ overwrite: options.overwrite ?? true }));
  wrapped.__aeriyaBookScenesWrapped = true;
  game.aeriya.importAll = wrapped;
}

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.importBookScenes = (options = {}) => importBookScenes(options);
  wrapImportAllWithBookScenes();
  if (!game.user?.isGM) return;
  const moduleVersion = game.modules.get(MODULE_ID)?.version ?? "unknown";
  const settingKey = "bookScenesImportedVersion";
  game.settings.register(MODULE_ID, settingKey, { name: "Aeria Core: версия сцен из книги городов", scope: "world", config: false, type: String, default: "" });
  const current = `${moduleVersion}:${BOOK_SCENES_SCHEMA}`;
  const imported = game.settings.get(MODULE_ID, settingKey);
  if (imported === current) return;
  window.setTimeout(async () => {
    wrapImportAllWithBookScenes();
    const result = await importBookScenes({ overwrite: true });
    if (result.failed.length === 0) await game.settings.set(MODULE_ID, settingKey, current);
  }, 5000);
});
