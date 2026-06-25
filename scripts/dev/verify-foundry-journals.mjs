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

function validateJournalEntry(entry, index) {
  const label = entry?.name ? `${entry.name}` : `entry #${index + 1}`;
  assert(entry && typeof entry === 'object', `Invalid journal entry at index ${index}`);
  assert(typeof entry._id === 'string' && entry._id.length > 0, `${label}: missing _id`);
  assert(typeof entry.name === 'string' && entry.name.length > 0, `${label}: missing name`);
  assert(entry.type === 'journalentry', `${label}: type must be journalentry`);
  assert(typeof entry.folder === 'string' && entry.folder.length > 0, `${label}: missing folder`);

  const sourcePath = entry.flags?.aeriya?.sourcePath;
  assert(typeof sourcePath === 'string' && sourcePath.startsWith('content/'), `${label}: missing flags.aeriya.sourcePath`);

  assert(Array.isArray(entry.pages) && entry.pages.length === 1, `${label}: expected exactly one text page`);
  const page = entry.pages[0];
  assert(page.type === 'text', `${label}: page type must be text`);
  assert(typeof page.name === 'string' && page.name.length > 0, `${label}: page missing name`);
  assert(typeof page.text?.content === 'string' && page.text.content.length > 0, `${label}: page missing text.content`);
}

function validateUnique(journals, field, getter) {
  const seen = new Map();
  for (const journal of journals) {
    const value = getter(journal);
    if (!value) continue;
    if (seen.has(value)) {
      throw new Error(`Duplicate ${field}: ${value} (${seen.get(value)} / ${journal.name})`);
    }
    seen.set(value, journal.name);
  }
}

async function main() {
  const journals = await readJson(OUT_FILE);
  assert(Array.isArray(journals), 'journal-entries.json must contain an array');
  assert(journals.length > 0, 'journal-entries.json is empty');

  journals.forEach(validateJournalEntry);
  validateUnique(journals, '_id', (journal) => journal._id);
  validateUnique(journals, 'flags.aeriya.sourcePath', (journal) => journal.flags?.aeriya?.sourcePath);

  const sourceFiles = await listJsonFiles(PACK_SOURCE_DIR);
  assert(sourceFiles.length === journals.length, `Pack source count mismatch: ${sourceFiles.length} files for ${journals.length} journals`);

  const manifest = await readJson(PACK_MANIFEST_FILE);
  assert(manifest.id === 'aeriya-journals', 'Pack manifest id must be aeriya-journals');
  assert(manifest.type === 'JournalEntry', 'Pack manifest type must be JournalEntry');
  assert(manifest.documentCount === journals.length, `Pack manifest documentCount mismatch: ${manifest.documentCount} / ${journals.length}`);
  assert(Array.isArray(manifest.folders) && manifest.folders.length > 0, 'Pack manifest folders must be a non-empty array');

  console.log(`Verified ${journals.length} journal entries and ${sourceFiles.length} pack source files.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
