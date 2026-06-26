import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const REQUIRED_PACKAGE_SCRIPTS = [
  'content:validate',
  'content:links',
  'content:index',
  'content:check',
  'assets:verify',
  'module:verify',
  'journals:build',
  'journals:verify',
  'actors:build',
  'actors:verify',
  'scenes:build',
  'scenes:verify',
  'foundry:check'
];

const REQUIRED_BUILD_FILES = [
  'build/foundry/journal-entries.json',
  'build/foundry/aeriya-journals/manifest.json',
  'build/foundry/actor-entries.json',
  'build/foundry/aeriya-actors/manifest.json',
  'build/foundry/scene-entries.json',
  'build/foundry/aeriya-scenes/manifest.json'
];

function readJson(repoPath) {
  const filePath = path.join(ROOT, repoPath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function exists(repoPath) {
  return fs.existsSync(path.join(ROOT, repoPath));
}

function countJsonFiles(repoPath) {
  const dir = path.join(ROOT, repoPath);
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith('.json')).length;
}

function verifyPackageScripts() {
  const packageJson = readJson('package.json');
  for (const scriptName of REQUIRED_PACKAGE_SCRIPTS) {
    assert(typeof packageJson.scripts?.[scriptName] === 'string', `package.json: missing script ${scriptName}`);
  }
}

function verifyModuleJson() {
  const moduleJson = readJson('module.json');
  assert(moduleJson.id === 'aeriya', 'module.json: id must be aeriya');
  assert(moduleJson.title === 'Aeria Core', 'module.json: title must be Aeria Core');
  assert(Array.isArray(moduleJson.packs), 'module.json: packs must be an array');

  if (moduleJson.packs.length > 0) {
    console.warn('module.json: packs are already declared. Confirm every pack was manually tested in Foundry before release.');
  } else {
    console.log('module.json: packs are empty. This is correct for release-test staging before manual Foundry compendium DB validation.');
  }
}

function verifyBuildOutputs() {
  for (const repoPath of REQUIRED_BUILD_FILES) {
    assert(exists(repoPath), `missing build output: ${repoPath}. Run npm run foundry:check first.`);
  }

  const journalManifest = readJson('build/foundry/aeriya-journals/manifest.json');
  const actorManifest = readJson('build/foundry/aeriya-actors/manifest.json');
  const sceneManifest = readJson('build/foundry/aeriya-scenes/manifest.json');

  assert(journalManifest.id === 'aeriya-journals', 'journal manifest id mismatch');
  assert(actorManifest.id === 'aeriya-actors', 'actor manifest id mismatch');
  assert(sceneManifest.id === 'aeriya-scenes', 'scene manifest id mismatch');
  assert(sceneManifest.displayMode === 'show-only-city-image', 'scene manifest must be show-only-city-image');

  const journalSourceCount = countJsonFiles('build/foundry/aeriya-journals/_source');
  const actorSourceCount = countJsonFiles('build/foundry/aeriya-actors/_source');
  const sceneSourceCount = countJsonFiles('build/foundry/aeriya-scenes/_source');

  assert(journalSourceCount === journalManifest.documentCount, `journal source count mismatch: ${journalSourceCount}/${journalManifest.documentCount}`);
  assert(actorSourceCount === actorManifest.documentCount, `actor source count mismatch: ${actorSourceCount}/${actorManifest.documentCount}`);
  assert(sceneSourceCount === sceneManifest.documentCount, `scene source count mismatch: ${sceneSourceCount}/${sceneManifest.documentCount}`);
}

function verifyAssetImportState() {
  const manifest = readJson('assets/manifests/old-world-assets.json');
  const records = [
    ...(manifest.cityScenes ?? []),
    ...(manifest.tokens ?? []),
    ...(manifest.portraits ?? [])
  ];
  const imported = records.filter((record) => record.status === 'imported').length;
  const pending = records.filter((record) => record.status === 'pending-import').length;

  console.log(`asset manifest: ${records.length} records, ${imported} imported, ${pending} pending-import.`);
  if (pending > 0) {
    console.log('asset manifest: pending-import records are allowed for release-test staging, but they will not appear in Foundry packs until files are imported.');
  }
}

function main() {
  verifyPackageScripts();
  verifyModuleJson();
  verifyBuildOutputs();
  verifyAssetImportState();
  console.log('Release-test preflight passed. The module is ready for manual Foundry staging test.');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
