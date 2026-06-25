import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'build', 'foundry');
const OUT_FILE = path.join(OUT_DIR, 'journal-entries.json');
const PACK_SOURCE_DIR = path.join(OUT_DIR, 'aeriya-journals', '_source');
const PACK_MANIFEST_FILE = path.join(OUT_DIR, 'aeriya-journals', 'manifest.json');

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

function validateJournalEntry(entry, index, folderIds) {
  const label = entry?.name ? `${entry.name}` : `entry #${index + 1}`;
  assert(entry && typeof entry === 'object', `Invalid journal entry at index ${index}`);
  assert(typeof entry._id === 'string' && entry._id.length > 0, `${label}: missing _id`);
  assert(typeof entry.name === 'string' && entry.name.length > 0, `${label}: missing name`);
  assert(entry.type === 'journalentry', `${label}: type must be journalentry`);
  assert(typeof entry.folder === 'string' && folderIds.has(entry.folder), `${label}: folder must reference a known folder id`);

  const sourcePath = entry.flags?.aeriya?.sourcePath;
  assert(typeof sourcePath === 'string' && sourcePath.startsWith('content/'), `${label}: missing flags.aeriya.sourcePath`);
  assert(typeof entry.flags?.aeriya?.folderName === 'string' && entry.flags.aeriya.folderName.length > 0, `${label}: missing flags.aeriya.folderName`);

  assert(Array.isArray(entry.pages) && entry.pages.length === 1, `${label}: expected exactly one text page`);
  const page = entry.pages[0];
  assert(page.type === 'text', `${label}: page type must be text`);
  assert(typeof page.name === 'string' && page.name.length > 0, `${label}: page missing name`);
  assert(typeof page.text?.content === 'string' && page.text.content.length > 0, `${label}: page missing text.content`);
}

function validateFolder(folder, index) {
  const label = folder?.name ? `${folder.name}` : `folder #${index + 1}`;
  assert(folder && typeof folder === 'object', `Invalid folder at index ${index}`);
  assert(typeof folder._id === 'string' && folder._id.length > 0, `${label}: missing _id`);
  assert(typeof folder.name === 'string' && folder.name.length > 0, `${label}: missing name`);
  assert(folder.type === 'JournalEntry', `${label}: type must be JournalEntry`);
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
  const journals = await readJson(OUT_FILE);
  assert(Array.isArray(journals), 'journal-entries.json must contain an array');
  assert(journals.length > 0, 'journal-entries.json is empty');

  const manifest = await readJson(PACK_MANIFEST_FILE);
  assert(manifest.id === 'aeriya-journals', 'Pack manifest id must be aeriya-journals');
  assert(manifest.type === 'JournalEntry', 'Pack manifest type must be JournalEntry');
  assert(manifest.documentCount === journals.length, `Pack manifest documentCount mismatch: ${manifest.documentCount} / ${journals.length}`);
  assert(Array.isArray(manifest.folders) && manifest.folders.length > 0, 'Pack manifest folders must be a non-empty array');
  assert(manifest.folderCount === manifest.folders.length, `Pack manifest folderCount mismatch: ${manifest.folderCount} / ${manifest.folders.length}`);

  manifest.folders.forEach(validateFolder);
  validateUnique(manifest.folders, 'folder _id', (folder) => folder._id);
  validateUnique(manifest.folders, 'folder name', (folder) => folder.name);

  const folderIds = new Set(manifest.folders.map((folder) => folder._id));
  journals.forEach((journal, index) => validateJournalEntry(journal, index, folderIds));
  validateUnique(journals, '_id', (journal) => journal._id);
  validateUnique(journals, 'flags.aeriya.sourcePath', (journal) => journal.flags?.aeriya?.sourcePath);

  const folderNames = new Set(manifest.folders.map((folder) => folder.name));
  for (const journal of journals) {
    assert(folderNames.has(journal.flags.aeriya.folderName), `${journal.name}: folderName is not present in manifest folders`);
  }

  const sourceFiles = await listJsonFiles(PACK_SOURCE_DIR);
  assert(sourceFiles.length === journals.length, `Pack source count mismatch: ${sourceFiles.length} files for ${journals.length} journals`);

  console.log(`Verified ${journals.length} journal entries, ${manifest.folders.length} folders and ${sourceFiles.length} pack source files.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
