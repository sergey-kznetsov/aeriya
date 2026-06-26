const MODULE_ID = "aeriya";
const SCENE_SCHEMA = "city-scenes-with-manual-images-v1";

function aeriyaSceneFolderName(shard) {
  if (shard === "middle-lands") return "Aeria Core — Сцены: Срединные Земли";
  if (shard === "shadow-shard") return "Aeria Core — Сцены: Теневой Осколок";
  if (shard === "scorching-shard") return "Aeria Core — Сцены: Палящий Осколок";
  return "Aeria Core — Сцены: Общие";
}

async function aeriyaGetOrCreateSceneFolder(name) {
  const existing = game.folders.find((folder) => folder.type === "Scene" && folder.name === name);
  if (existing) return existing;
  return Folder.create({ name, type: "Scene", sorting: "a" });
}

async function aeriyaImportCityScenesWithManualImages({ overwrite = false } = {}) {
  if (!game.user?.isGM) return { created: 0, updated: 0, skipped: 0, failed: [] };

  const result = { created: 0, updated: 0, skipped: 0, failed: [] };
  const response = await fetch(`modules/${MODULE_ID}/assets/manifests/old-world-assets.json`);
  if (!response.ok) throw new Error(`Aeria Core scene manifest HTTP ${response.status}`);
  const manifest = await response.json();

  for (const record of manifest.cityScenes ?? []) {
    try {
      const folder = await aeriyaGetOrCreateSceneFolder(aeriyaSceneFolderName(record.shard));
      const existing = game.scenes.find((scene) => scene.getFlag(MODULE_ID, "assetId") === record.id);
      if (existing && !overwrite) {
        result.skipped += 1;
        continue;
      }

      const src = record.status === "imported" ? record.path : (existing?.background?.src || existing?.img || "");
      const data = {
        name: record.name,
        folder: folder.id,
        img: src,
        background: { src, offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1, rotation: 0, tint: "#ffffff" },
        width: existing?.width || 1600,
        height: existing?.height || 900,
        padding: 0,
        grid: { type: 0, size: 100, distance: 5, units: "ft" },
        tokenVision: false,
        fogExploration: false,
        navigation: false,
        notes: existing?.notes?.contents ?? existing?.notes ?? [],
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
            assetStatus: record.status,
            shard: record.shard || "",
            kind: record.kind || "city-scene",
            displayMode: "show-only-city-image",
            tacticalMap: false,
            playerMovement: false,
            importSchema: SCENE_SCHEMA
          }
        }
      };

      if (existing) {
        await existing.update(data);
        result.updated += 1;
      } else {
        await Scene.create(data);
        result.created += 1;
      }
    } catch (error) {
      result.failed.push({ id: record.id, name: record.name, error: error.message });
    }
  }

  if (result.failed.length > 0) console.error("Aeria Core | city scene import failures", result.failed);
  return result;
}

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.importCityScenes = aeriyaImportCityScenesWithManualImages;
  if (game.user?.isGM) aeriyaImportCityScenesWithManualImages({ overwrite: false });
});
