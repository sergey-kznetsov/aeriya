import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const ASSET_MANIFEST_FILE = path.join(ROOT, 'assets', 'manifests', 'old-world-assets.json');
const OUT_DIR = path.join(ROOT, 'build', 'foundry');
const OUT_FILE = path.join(OUT_DIR, 'scene-entries.json');
const PACK_DIR = path.join(OUT_DIR, 'aeriya-scenes');
const PACK_SOURCE_DIR = path.join(PACK_DIR, '_source');
const PACK_MANIFEST_FILE = path.join(PACK_DIR, 'manifest.json');

function slugId(input) {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, 16);
}

function safeFileName(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]+/giu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96);
}

async function readManifest() {
  return JSON.parse(await fs.readFile(ASSET_MANIFEST_FILE, 'utf8'));
}

async function resetDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

function buildScene(record) {
  return {
    _id: slugId(`scene:${record.id}`),
    name: record.name,
    type: 'base',
    img: record.path,
    background: {
      src: record.path,
      offsetX: 0,
      offsetY: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      tint: '#ffffff'
    },
    width: 1600,
    height: 900,
    padding: 0.25,
    grid: {
      type: 0,
      size: 100,
      distance: 5,
      units: 'ft'
    },
    tokenVision: true,
    fogExploration: true,
    navigation: true,
    notes: [],
    tokens: [],
    tiles: [],
    walls: [],
    lights: [],
    sounds: [],
    drawings: [],
    flags: {
      aeriya: {
        pack: 'aeriya-scenes',
        assetId: record.id,
        shard: record.shard ?? 'unknown',
        kind: record.kind ?? 'unknown',
        source: record.source ?? 'unknown',
        sourcePath: record.path,
        stagingOnly: true
      }
    }
  };
}

async function writePackSource(scenes) {
  await resetDir(PACK_SOURCE_DIR);

  const usedNames = new Set();
  for (const scene of scenes) {
    const baseName = safeFileName(`${scene.name}-${scene._id}`) || scene._id;
    let fileName = `${baseName}.json`;
    let counter = 2;
    while (usedNames.has(fileName)) {
      fileName = `${baseName}-${counter}.json`;
      counter += 1;
    }
    usedNames.add(fileName);
    await fs.writeFile(path.join(PACK_SOURCE_DIR, fileName), JSON.stringify(scene, null, 2), 'utf8');
  }

  const manifest = {
    id: 'aeriya-scenes',
    type: 'Scene',
    generatedFrom: 'assets/manifests/old-world-assets.json cityScenes imported records',
    sourceDirectory: 'build/foundry/aeriya-scenes/_source',
    documentCount: scenes.length,
    note: 'Staging output for city and location scenes imported from old-world visual assets. Only manifest records marked imported are converted. Scene dimensions are staging defaults and must be checked manually in Foundry before adding the pack to module.json.'
  };
  await fs.writeFile(PACK_MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');
}

async function main() {
  const manifest = await readManifest();
  const scenes = (manifest.cityScenes ?? [])
    .filter((record) => record.status === 'imported')
    .map(buildScene)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(scenes, null, 2), 'utf8');
  await writePackSource(scenes);

  console.log(`Built ${scenes.length} scene entries: ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`Staged scene pack source: ${path.relative(ROOT, PACK_SOURCE_DIR)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
