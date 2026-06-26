import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'build', 'foundry');
const OUT_FILE = path.join(OUT_DIR, 'scene-entries.json');
const PACK_SOURCE_DIR = path.join(OUT_DIR, 'aeriya-scenes', '_source');
const PACK_MANIFEST_FILE = path.join(OUT_DIR, 'aeriya-scenes', 'manifest.json');

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read JSON ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

async function listJsonFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => path.join(dir, entry.name))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    throw new Error(`Cannot read directory ${path.relative(ROOT, dir)}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEmptyArray(value, label) {
  assert(Array.isArray(value), `${label}: must be an array`);
  assert(value.length === 0, `${label}: must be empty for show-only city image scenes`);
}

function validateScene(scene, index) {
  const label = scene?.name ? `${scene.name}` : `scene #${index + 1}`;
  assert(scene && typeof scene === 'object', `Invalid scene at index ${index}`);
  assert(typeof scene._id === 'string' && scene._id.length > 0, `${label}: missing _id`);
  assert(typeof scene.name === 'string' && scene.name.length > 0, `${label}: missing name`);
  assert(typeof scene.img === 'string' && scene.img.startsWith('assets/'), `${label}: img must reference assets/`);
  assert(scene.background?.src === scene.img, `${label}: background.src must match img`);
  assert(typeof scene.width === 'number' && scene.width > 0, `${label}: invalid width`);
  assert(typeof scene.height === 'number' && scene.height > 0, `${label}: invalid height`);
  assert(scene.padding === 0, `${label}: padding must be 0 for show-only city image scenes`);
  assert(scene.grid?.type === 0, `${label}: grid.type must be 0 for show-only city image scenes`);
  assert(scene.tokenVision === false, `${label}: tokenVision must be false for show-only city image scenes`);
  assert(scene.fogExploration === false, `${label}: fogExploration must be false for show-only city image scenes`);
  assert(scene.navigation === false, `${label}: navigation must be false for show-only city image scenes`);
  assertEmptyArray(scene.notes, `${label}: notes`);
  assertEmptyArray(scene.tokens, `${label}: tokens`);
  assertEmptyArray(scene.tiles, `${label}: tiles`);
  assertEmptyArray(scene.walls, `${label}: walls`);
  assertEmptyArray(scene.lights, `${label}: lights`);
  assertEmptyArray(scene.sounds, `${label}: sounds`);
  assertEmptyArray(scene.drawings, `${label}: drawings`);
  assert(scene.flags?.aeriya?.stagingOnly === true, `${label}: scene staging flag must be true`);
  assert(scene.flags?.aeriya?.displayMode === 'show-only-city-image', `${label}: displayMode must be show-only-city-image`);
  assert(scene.flags?.aeriya?.tacticalMap === false, `${label}: tacticalMap must be false`);
  assert(scene.flags?.aeriya?.playerMovement === false, `${label}: playerMovement must be false`);
  assert(typeof scene.flags?.aeriya?.sourcePath === 'string' && scene.flags.aeriya.sourcePath === scene.img, `${label}: sourcePath must match img`);
}

function validateUnique(items, field, getter) {
  const seen = new Map();
  for (const item of items) {
    const value = getter(item);
    if (!value) continue;
    if (seen.has(value)) {
      throw new Error(`Duplicate ${field}: ${value} (${seen.get(value)} / ${item.name})`);
    }
    seen.set(value, item.name);
  }
}

async function main() {
  const scenes = await readJson(OUT_FILE);
  assert(Array.isArray(scenes), 'scene-entries.json must contain an array');

  const manifest = await readJson(PACK_MANIFEST_FILE);
  assert(manifest.id === 'aeriya-scenes', 'Scene pack manifest id must be aeriya-scenes');
  assert(manifest.type === 'Scene', 'Scene pack manifest type must be Scene');
  assert(manifest.displayMode === 'show-only-city-image', 'Scene manifest displayMode must be show-only-city-image');
  assert(manifest.documentCount === scenes.length, `Scene manifest documentCount mismatch: ${manifest.documentCount} / ${scenes.length}`);

  scenes.forEach(validateScene);
  validateUnique(scenes, '_id', (scene) => scene._id);
  validateUnique(scenes, 'img', (scene) => scene.img);

  const sourceFiles = await listJsonFiles(PACK_SOURCE_DIR);
  assert(sourceFiles.length === scenes.length, `Scene source count mismatch: ${sourceFiles.length} files for ${scenes.length} scenes`);

  console.log(`Verified ${scenes.length} show-only scene entries and ${sourceFiles.length} scene source files.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
