import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const INDEX_PATH = path.join(CONTENT_DIR, '_indexes', 'content-index.json');

const buckets = {
  cities: [],
  factions: [],
  spirits: [],
  npcs: [],
  monsters: [],
  items: [],
  rituals: [],
  rolltables: [],
  scenes: [],
  handouts: [],
  regions: []
};

const typeToBucket = {
  city: 'cities',
  faction: 'factions',
  spirit: 'spirits',
  npc: 'npcs',
  monster: 'monsters',
  item: 'items',
  ritual: 'rituals',
  rolltable: 'rolltables',
  scene: 'scenes',
  handout: 'handouts',
  region: 'regions'
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push(fullPath);
    }
  }
  return result;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;

  const data = {};
  for (const line of match[1].split('\n')) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    data[key] = value;
  }
  return data;
}

function slugFromPath(filePath) {
  return path.basename(filePath, '.md');
}

function toRepoPath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

for (const filePath of walk(CONTENT_DIR)) {
  const repoPath = toRepoPath(filePath);

  if (repoPath.endsWith('/README.md')) continue;
  if (repoPath.includes('/_templates/')) continue;
  if (repoPath.includes('/_indexes/')) continue;

  const text = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(text);
  if (!frontmatter?.type) continue;

  const bucketName = typeToBucket[frontmatter.type];
  if (!bucketName) continue;

  buckets[bucketName].push({
    id: slugFromPath(filePath),
    name: frontmatter.name || slugFromPath(filePath),
    type: frontmatter.type,
    shard: frontmatter.shard || '',
    region: frontmatter.region || '',
    path: repoPath,
    source: frontmatter.source || '',
    status: frontmatter.status || ''
  });
}

for (const items of Object.values(buckets)) {
  items.sort((a, b) => `${a.shard}/${a.region}/${a.name}`.localeCompare(`${b.shard}/${b.region}/${b.name}`, 'ru'));
}

fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
fs.writeFileSync(INDEX_PATH, `${JSON.stringify(buckets, null, 2)}\n`, 'utf8');

console.log(`Content index written: ${path.relative(ROOT, INDEX_PATH)}`);
for (const [bucket, items] of Object.entries(buckets)) {
  if (items.length) console.log(`${bucket}: ${items.length}`);
}
