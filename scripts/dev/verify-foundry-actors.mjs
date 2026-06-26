import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'build', 'foundry');
const OUT_FILE = path.join(OUT_DIR, 'actor-entries.json');
const PACK_SOURCE_DIR = path.join(OUT_DIR, 'aeriya-actors', '_source');
const PACK_MANIFEST_FILE = path.join(OUT_DIR, 'aeriya-actors', 'manifest.json');

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

function validateActor(actor, index, folderIds) {
  const label = actor?.name ? `${actor.name}` : `actor #${index + 1}`;
  assert(actor && typeof actor === 'object', `Invalid actor at index ${index}`);
  assert(typeof actor._id === 'string' && actor._id.length > 0, `${label}: missing _id`);
  assert(typeof actor.name === 'string' && actor.name.length > 0, `${label}: missing name`);
  assert(actor.type === 'npc', `${label}: type must be npc`);
  assert(typeof actor.folder === 'string' && folderIds.has(actor.folder), `${label}: folder must reference a known folder id`);

  const sourcePath = actor.flags?.aeriya?.sourcePath;
  assert(typeof sourcePath === 'string' && sourcePath.startsWith('content/actor-statblocks/'), `${label}: missing flags.aeriya.sourcePath`);
  assert(typeof actor.flags?.aeriya?.folderName === 'string' && actor.flags.aeriya.folderName.length > 0, `${label}: missing flags.aeriya.folderName`);
  assert(actor.flags?.aeriya?.stagingOnly === true, `${label}: actor staging flag must be true`);

  const biography = actor.system?.details?.biography?.value;
  assert(typeof biography === 'string' && biography.length > 0, `${label}: missing biography HTML`);
  assert(biography.includes('<h1>'), `${label}: biography must include h1 source heading`);
}

function validateFolder(folder, index) {
  const label = folder?.name ? `${folder.name}` : `folder #${index + 1}`;
  assert(folder && typeof folder === 'object', `Invalid folder at index ${index}`);
  assert(typeof folder._id === 'string' && folder._id.length > 0, `${label}: missing _id`);
  assert(typeof folder.name === 'string' && folder.name.length > 0, `${label}: missing name`);
  assert(folder.type === 'Actor', `${label}: type must be Actor`);
  assert(folder.folder === null, `${label}: expected root-level folder`);
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
  const actors = await readJson(OUT_FILE);
  assert(Array.isArray(actors), 'actor-entries.json must contain an array');
  assert(actors.length > 0, 'actor-entries.json is empty');

  const manifest = await readJson(PACK_MANIFEST_FILE);
  assert(manifest.id === 'aeriya-actors', 'Actor pack manifest id must be aeriya-actors');
  assert(manifest.type === 'Actor', 'Actor pack manifest type must be Actor');
  assert(manifest.documentCount === actors.length, `Actor manifest documentCount mismatch: ${manifest.documentCount} / ${actors.length}`);
  assert(Array.isArray(manifest.folders) && manifest.folders.length > 0, 'Actor manifest folders must be a non-empty array');
  assert(manifest.folderCount === manifest.folders.length, `Actor manifest folderCount mismatch: ${manifest.folderCount} / ${manifest.folders.length}`);

  manifest.folders.forEach(validateFolder);
  validateUnique(manifest.folders, 'folder _id', (folder) => folder._id);
  validateUnique(manifest.folders, 'folder name', (folder) => folder.name);

  const folderIds = new Set(manifest.folders.map((folder) => folder._id));
  actors.forEach((actor, index) => validateActor(actor, index, folderIds));
  validateUnique(actors, '_id', (actor) => actor._id);

  const folderNames = new Set(manifest.folders.map((folder) => folder.name));
  for (const actor of actors) {
    assert(folderNames.has(actor.flags.aeriya.folderName), `${actor.name}: folderName is not present in manifest folders`);
  }

  const sourceFiles = await listJsonFiles(PACK_SOURCE_DIR);
  assert(sourceFiles.length === actors.length, `Actor source count mismatch: ${sourceFiles.length} files for ${actors.length} actors`);

  console.log(`Verified ${actors.length} actor entries, ${manifest.folders.length} folders and ${sourceFiles.length} actor source files.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
