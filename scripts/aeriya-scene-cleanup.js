const MODULE_ID = "aeriya";
const SCENE_CLEANUP_SCHEMA = "book-scene-cleanup-v2";

const BOOK_SCENE_NAMES = new Set([
  "Гравен Холлоу", "Кладовая Перекрёстков", "Морнстэд", "Фарн’Крот", "Озерник", "Плавень", "Скрежетник", "Бьющий Колокол", "Усадьба Леденёвых", "Крик Химеры", "Тарный Столб", "Берег Сухих Глаз", "Горлица", "Острог Прахобоя", "Пустотень", "Сычий Брод", "Липуши", "Лагерь Семиглазого", "Тонкая Гряда", "Рубеж Трясин", "Варница Чёрного Дыма",
  "Перекрёсток Трёх Теней", "Чёрная Кузня", "А’алмар", "Окрам", "Таш’Вейн", "Борос", "Гар-Шахр", "Бату", "Саи’Рам", "Ак-Куль", "Кум-Алам", "Хур’Наир", "Деревня ИП", "Пепельное Сердце", "Лагерь «Сломанный Рог»", "Дозорная Вышка у Озера", "Гнилой Собор", "Прогалина Первого Костра", "Ледяной Клык", "Станция «Последний Огонь»",
  "Пылающий Клинок", "Три Тени", "Форт Раскалённой Соли", "Стеклянный Городок", "Последний Вздох", "Дворец Золотого Каравана", "Небесный Якорь", "Пещерный Порог", "Кровавый Родник", "Лагерь «Шёпот Ветра»", "Тихая Корка", "Красная Соль", "Руины Соляной Мельницы"
]);

const LEGACY_FOLDER_NAMES = new Set([
  "пепельная степь",
  "огненные каньоны",
  "ледяной предел",
  "восток",
  "запад",
  "подземные"
]);

const LEGACY_EXACT_PATHS = new Set([
  "Пепельная степь",
  "Aeria Core / Сцены / Палящий Осколок / Огненные Каньоны",
  "Aeria Core / Сцены / Теневой Осколок / Ледяной Предел",
  "Aeria Core / Сцены / Срединные Земли / Восток",
  "Aeria Core / Сцены / Срединные Земли / Запад",
  "Aeria Core / Сцены / Срединные Земли / Подземные"
]);

function comparableName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/й/g, "и")
    .replace(/[’ʼ'`«»\"()\[\].,;:!?-]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

const BOOK_COMPARABLE_NAMES = new Set([...BOOK_SCENE_NAMES].map(comparableName));

function folderPath(folder) {
  const names = [];
  let current = folder;
  while (current) { names.unshift(current.name); current = current.folder; }
  return names.join(" / ");
}

function descendantsOf(folder) {
  const result = [folder];
  for (const child of game.folders.filter((candidate) => candidate.type === "Scene" && candidate.folder?.id === folder.id)) {
    result.push(...descendantsOf(child));
  }
  return result;
}

function isAeriaScene(scene) {
  return scene.getFlag(MODULE_ID, "documentKind") === "scene" || scene.getFlag(MODULE_ID, "displayMode") === "show-only-city-image" || String(scene.getFlag(MODULE_ID, "sourcePath") || "").startsWith("content/generated/scenes");
}

function isBookScene(scene) {
  const sourcePath = String(scene.getFlag(MODULE_ID, "sourcePath") || "");
  return sourcePath.startsWith("book:goroda-i-poseleniya-aerii/") || BOOK_COMPARABLE_NAMES.has(comparableName(scene.name));
}

function isLegacyFolder(folder) {
  if (folder.type !== "Scene") return false;
  const path = folderPath(folder);
  if (LEGACY_EXACT_PATHS.has(path)) return true;
  const name = String(folder.name || "").toLowerCase().replace(/ё/g, "е");
  return LEGACY_FOLDER_NAMES.has(name);
}

function shouldInspectSceneFolder(folder) {
  const path = folderPath(folder);
  return folder.type === "Scene" && (path === "Aeria Core / Сцены" || path.startsWith("Aeria Core / Сцены /") || isLegacyFolder(folder));
}

function folderHasDocumentsOrChildren(folder) {
  return game.scenes.some((scene) => scene.folder?.id === folder.id) || game.folders.some((child) => child.type === "Scene" && child.folder?.id === folder.id);
}

async function cleanupLegacyFolders() {
  let deletedScenes = 0;
  const legacyFolders = game.folders.filter(isLegacyFolder);
  for (const folder of legacyFolders) {
    const folderIds = new Set(descendantsOf(folder).map((entry) => entry.id));
    const staleIds = game.scenes
      .filter((scene) => folderIds.has(scene.folder?.id))
      .filter((scene) => !isBookScene(scene))
      .map((scene) => scene.id);
    if (staleIds.length > 0) {
      await Scene.deleteDocuments(staleIds);
      deletedScenes += staleIds.length;
    }
  }
  return deletedScenes;
}

async function cleanupStaleAeriaScenes() {
  const staleSceneIds = game.scenes
    .filter((scene) => isAeriaScene(scene) || (scene.folder && shouldInspectSceneFolder(scene.folder)))
    .filter((scene) => !isBookScene(scene))
    .map((scene) => scene.id);
  if (staleSceneIds.length > 0) await Scene.deleteDocuments(staleSceneIds);
  return staleSceneIds.length;
}

async function cleanupEmptySceneFolders() {
  let deleted = 0;
  for (let pass = 0; pass < 12; pass += 1) {
    const emptyFolders = game.folders
      .filter(shouldInspectSceneFolder)
      .filter((folder) => folderPath(folder) !== "Aeria Core / Сцены")
      .filter((folder) => !folderHasDocumentsOrChildren(folder));
    if (emptyFolders.length === 0) break;
    await Folder.deleteDocuments(emptyFolders.map((folder) => folder.id));
    deleted += emptyFolders.length;
  }
  return deleted;
}

async function cleanupBookSceneStructure({ deleteLegacyScenes = true } = {}) {
  if (!game.user?.isGM) return { deletedScenes: 0, deletedFolders: 0 };
  let deletedScenes = 0;
  if (deleteLegacyScenes) {
    deletedScenes += await cleanupLegacyFolders();
    deletedScenes += await cleanupStaleAeriaScenes();
  }
  const deletedFolders = await cleanupEmptySceneFolders();
  if (deletedScenes || deletedFolders) ui.notifications?.info(`Aeria Core: очищены старые сцены/папки. Сцен: ${deletedScenes}, папок: ${deletedFolders}.`);
  return { deletedScenes, deletedFolders };
}

function wrapImportAllWithSceneCleanup() {
  game.aeriya = game.aeriya ?? {};
  const originalImportAll = game.aeriya.importAll;
  if (typeof originalImportAll !== "function" || originalImportAll.__aeriyaSceneCleanupWrapped) return;
  const wrapped = async (options = {}) => {
    const result = await originalImportAll(options);
    const cleanup = await cleanupBookSceneStructure({ deleteLegacyScenes: options.deleteLegacyScenes ?? true });
    result.deleted = (result.deleted ?? 0) + cleanup.deletedScenes;
    result.updated = (result.updated ?? 0) + cleanup.deletedFolders;
    return result;
  };
  wrapped.__aeriyaSceneCleanupWrapped = true;
  game.aeriya.importAll = wrapped;
}

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.cleanupBookSceneStructure = (options = {}) => cleanupBookSceneStructure(options);
  wrapImportAllWithSceneCleanup();
  if (!game.user?.isGM) return;
  const settingKey = "sceneCleanupInstalledVersion";
  game.settings.register(MODULE_ID, settingKey, { name: "Aeria Core: версия очистки сцен", scope: "world", config: false, type: String, default: "" });
  const current = `${game.modules.get(MODULE_ID)?.version ?? "unknown"}:${SCENE_CLEANUP_SCHEMA}`;
  window.setTimeout(async () => {
    wrapImportAllWithSceneCleanup();
    await cleanupBookSceneStructure({ deleteLegacyScenes: true });
    await game.settings.set(MODULE_ID, settingKey, current);
  }, 12000);
});
