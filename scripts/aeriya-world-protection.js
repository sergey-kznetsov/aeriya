const MODULE_ID = "aeriya";
const SCHEMA = "world-protection-v1";

const SCENE_EMBEDDED_KEYS = ["tokens", "walls", "tiles", "notes", "lights", "sounds", "drawings"];

function folderPath(folder) {
  const parts = [];
  let current = folder;
  while (current) { parts.unshift(current.name); current = current.folder; }
  return parts.join(" / ");
}

function isAeriaScene(scene) {
  const sourcePath = String(scene?.getFlag?.(MODULE_ID, "sourcePath") || "");
  const folder = scene?.folder ? folderPath(scene.folder) : "";
  return sourcePath.startsWith("book:goroda-i-poseleniya-aerii/")
    || sourcePath.startsWith("content/generated/scenes")
    || scene?.getFlag?.(MODULE_ID, "documentKind") === "scene"
    || scene?.getFlag?.(MODULE_ID, "displayMode") === "show-only-city-image"
    || folder === "Aeria Core / Сцены"
    || folder.startsWith("Aeria Core / Сцены /");
}

function isAeriaSceneFolder(folder) {
  if (!folder || folder.type !== "Scene") return false;
  const path = folderPath(folder);
  return path === "Aeria Core / Сцены" || path.startsWith("Aeria Core / Сцены /");
}

function isAeriaActor(actor) {
  if (!actor) return false;
  const sourcePath = String(actor.getFlag?.(MODULE_ID, "sourcePath") || "");
  const folder = actor.folder ? folderPath(actor.folder) : "";
  return sourcePath.startsWith("content/actor-statblocks/")
    || sourcePath.startsWith("external-bestiary:")
    || actor.getFlag?.(MODULE_ID, "externalBestiary")
    || folder.startsWith("Aeria Core / Бестиарий")
    || folder.startsWith("Aeria Core / НИПы");
}

function allowDestructive() {
  return Boolean(globalThis.AERIA_ALLOW_DESTRUCTIVE_IMPORT === true || game.aeriya?.allowDestructiveImport === true);
}

function stripSceneEmbeddedChanges(scene, changes) {
  if (!isAeriaScene(scene) || allowDestructive()) return;
  let stripped = false;
  for (const key of SCENE_EMBEDDED_KEYS) {
    if (Object.hasOwn(changes, key)) {
      delete changes[key];
      stripped = true;
    }
  }
  if (changes.background?.src === "" && scene.background?.src) {
    delete changes.background;
    stripped = true;
  }
  if (stripped) {
    changes.flags = changes.flags ?? {};
    changes.flags[MODULE_ID] = { ...(changes.flags[MODULE_ID] ?? {}), worldProtectionSchema: SCHEMA, embeddedContentProtected: true };
    console.warn("Aeria Core | protected scene embedded content from importer", scene.name);
  }
}

Hooks.on("preUpdateScene", (scene, changes) => {
  stripSceneEmbeddedChanges(scene, changes);
});

Hooks.on("preDeleteScene", (scene) => {
  if (!isAeriaScene(scene) || allowDestructive()) return true;
  ui.notifications?.warn(`Aeria Core: удаление сцены «${scene.name}» заблокировано безопасным режимом.`);
  console.warn("Aeria Core | blocked scene deletion", scene.name);
  return false;
});

Hooks.on("preDeleteFolder", (folder) => {
  if (!isAeriaSceneFolder(folder) || allowDestructive()) return true;
  ui.notifications?.warn(`Aeria Core: удаление папки сцен «${folder.name}» заблокировано безопасным режимом.`);
  console.warn("Aeria Core | blocked scene folder deletion", folderPath(folder));
  return false;
});

Hooks.on("preDeleteActor", (actor) => {
  if (!isAeriaActor(actor) || allowDestructive()) return true;
  ui.notifications?.warn(`Aeria Core: удаление Actor «${actor.name}» заблокировано безопасным режимом.`);
  console.warn("Aeria Core | blocked actor deletion", actor.name);
  return false;
});

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.worldProtectionSchema = SCHEMA;
  game.aeriya.allowDestructiveImport = false;
  game.aeriya.enableDestructiveImportOnce = () => {
    globalThis.AERIA_ALLOW_DESTRUCTIVE_IMPORT = true;
    window.setTimeout(() => { globalThis.AERIA_ALLOW_DESTRUCTIVE_IMPORT = false; }, 60000);
    ui.notifications?.warn("Aeria Core: разрушительная перезапись разрешена на 60 секунд.");
  };
});
