import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST_FILE = path.join(ROOT, 'assets', 'manifests', 'old-world-assets.json');
const ALLOWED_STATUSES = new Set(['pending-import', 'imported', 'deprecated']);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.svg']);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read asset manifest: ${error.message}`);
  }
}

function collectRecords(manifest) {
  return [
    ...(manifest.cityScenes ?? []).map((record) => ({ ...record, section: 'cityScenes' })),
    ...(manifest.tokens ?? []).map((record) => ({ ...record, section: 'tokens' })),
    ...(manifest.portraits ?? []).map((record) => ({ ...record, section: 'portraits' }))
  ];
}

function validateRecord(record) {
  const label = `${record.section}:${record.id ?? 'missing-id'}`;

  assert(typeof record.id === 'string' && ID_PATTERN.test(record.id), `${label}: id must be kebab-case ASCII`);
  assert(typeof record.name === 'string' && record.name.trim().length > 0, `${label}: missing name`);
  assert(typeof record.path === 'string' && record.path.startsWith('assets/'), `${label}: path must start with assets/`);
  assert(!record.path.includes(' '), `${label}: path must not contain spaces`);
  assert(ALLOWED_STATUSES.has(record.status), `${label}: unsupported status ${record.status}`);

  const extension = path.extname(record.path).toLowerCase();
  assert(ALLOWED_IMAGE_EXTENSIONS.has(extension), `${label}: unsupported image extension ${extension}`);

  if (record.status === 'imported') {
    const fullPath = path.join(ROOT, record.path);
    assert(fs.existsSync(fullPath), `${label}: imported asset is missing at ${record.path}`);
  }
}

function validateUnique(records, field) {
  const seen = new Map();
  for (const record of records) {
    const value = record[field];
    if (!value) continue;
    if (seen.has(value)) {
      throw new Error(`Duplicate asset ${field}: ${value} (${seen.get(value)} / ${record.section}:${record.id})`);
    }
    seen.set(value, `${record.section}:${record.id}`);
  }
}

function main() {
  const manifest = readManifest();

  assert(manifest.schema === 1, 'Asset manifest schema must be 1');
  assert(Array.isArray(manifest.cityScenes), 'cityScenes must be an array');
  assert(Array.isArray(manifest.tokens), 'tokens must be an array');
  assert(Array.isArray(manifest.portraits), 'portraits must be an array');

  const records = collectRecords(manifest);
  assert(records.length > 0, 'Asset manifest must contain at least one record');

  records.forEach(validateRecord);
  validateUnique(records, 'id');
  validateUnique(records, 'path');

  const imported = records.filter((record) => record.status === 'imported').length;
  const pending = records.filter((record) => record.status === 'pending-import').length;

  console.log(`Asset manifest valid. ${records.length} records: ${imported} imported, ${pending} pending-import.`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
