import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const MODULE_FILE = path.join(ROOT, 'module.json');

const REQUIRED_FIELDS = [
  'id',
  'title',
  'description',
  'version',
  'compatibility',
  'esmodules',
  'styles',
  'languages',
  'packs',
  'url',
  'manifest',
  'readme',
  'changelog'
];

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read JSON ${rel(file)}: ${error.message}`);
  }
}

async function assertFileExists(relativePath, label = relativePath) {
  const file = path.join(ROOT, relativePath);
  try {
    const stat = await fs.stat(file);
    assert(stat.isFile(), `${label} is not a file: ${relativePath}`);
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Missing ${label}: ${relativePath}`);
    throw error;
  }
}

function assertNonEmptyString(value, field) {
  assert(typeof value === 'string' && value.trim().length > 0, `module.json missing ${field}`);
}

async function validateReferencedFiles(module) {
  for (const script of module.esmodules) {
    assertNonEmptyString(script, 'esmodules[]');
    await assertFileExists(script, `module esmodule`);
  }

  for (const style of module.styles) {
    assertNonEmptyString(style, 'styles[]');
    await assertFileExists(style, `module style`);
  }

  for (const language of module.languages) {
    assertNonEmptyString(language.lang, 'languages[].lang');
    assertNonEmptyString(language.name, 'languages[].name');
    assertNonEmptyString(language.path, 'languages[].path');
    await assertFileExists(language.path, `language file ${language.lang}`);
    await readJson(path.join(ROOT, language.path));
  }

  await assertFileExists(module.readme, 'readme');
  await assertFileExists(module.changelog, 'changelog');
}

function validatePacks(module) {
  assert(Array.isArray(module.packs), 'module.json packs must be an array');

  const names = new Set();
  for (const pack of module.packs) {
    assertNonEmptyString(pack.name, 'packs[].name');
    assertNonEmptyString(pack.label, 'packs[].label');
    assertNonEmptyString(pack.path, 'packs[].path');
    assertNonEmptyString(pack.type, 'packs[].type');
    assert(!names.has(pack.name), `Duplicate pack name: ${pack.name}`);
    names.add(pack.name);
  }
}

async function main() {
  const module = await readJson(MODULE_FILE);

  for (const field of REQUIRED_FIELDS) {
    assert(Object.hasOwn(module, field), `module.json missing required field: ${field}`);
  }

  assert(module.id === 'aeriya', 'module.json id must be aeriya');
  assert(module.title === 'Aeria Core', 'module.json title must be Aeria Core');
  assertNonEmptyString(module.description, 'description');
  assertNonEmptyString(module.version, 'version');
  assertNonEmptyString(module.url, 'url');
  assertNonEmptyString(module.manifest, 'manifest');

  assert(module.compatibility && typeof module.compatibility === 'object', 'module.json compatibility must be an object');
  assertNonEmptyString(module.compatibility.minimum, 'compatibility.minimum');
  assertNonEmptyString(module.compatibility.verified, 'compatibility.verified');

  assert(Array.isArray(module.esmodules) && module.esmodules.length > 0, 'module.json esmodules must be a non-empty array');
  assert(Array.isArray(module.styles) && module.styles.length > 0, 'module.json styles must be a non-empty array');
  assert(Array.isArray(module.languages) && module.languages.length > 0, 'module.json languages must be a non-empty array');

  validatePacks(module);
  await validateReferencedFiles(module);

  console.log(`Verified module manifest ${rel(MODULE_FILE)} with ${module.esmodules.length} script(s), ${module.styles.length} style file(s), ${module.languages.length} language file(s), and ${module.packs.length} pack(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
