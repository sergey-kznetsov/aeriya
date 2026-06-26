import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const ACTOR_CONTENT_ROOT = path.join(ROOT, 'content', 'actor-statblocks');
const OUT_DIR = path.join(ROOT, 'build', 'foundry');
const OUT_FILE = path.join(OUT_DIR, 'actor-entries.json');
const PACK_DIR = path.join(OUT_DIR, 'aeriya-actors');
const PACK_SOURCE_DIR = path.join(PACK_DIR, '_source');
const PACK_MANIFEST_FILE = path.join(PACK_DIR, 'manifest.json');

const FOLDERS = {
  npcs: 'NPCs',
  bestiary: 'Creatures',
  unknown: 'Actors'
};

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

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: text };
  const raw = text.slice(3, end).trim();
  const body = text.slice(end + 4).trim();
  const data = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return { data, body };
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(markdown) {
  return escapeHtml(markdown).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function markdownToHtml(markdown) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      const h3 = trimmed.match(/^###\s+(.+)$/);
      if (h3) return `<h3>${renderInline(h3[1])}</h3>`;
      const h2 = trimmed.match(/^##\s+(.+)$/);
      if (h2) return `<h2>${renderInline(h2[1])}</h2>`;
      const h1 = trimmed.match(/^#\s+(.+)$/);
      if (h1) return `<h1>${renderInline(h1[1])}</h1>`;
      return `<p>${renderInline(trimmed).replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

async function walk(dir) {
  const result = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(full);
  }
  return result;
}

function repoPath(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, '/');
}

function folderNameFor(relativePath) {
  if (relativePath.includes('/npcs/')) return FOLDERS.npcs;
  if (relativePath.includes('/bestiary/')) return FOLDERS.bestiary;
  return FOLDERS.unknown;
}

function extractH1Blocks(body, sourceTitle) {
  const matches = [...body.matchAll(/^#\s+(.+)$/gm)];
  const blocks = [];

  for (let index = 0; index < matches.length; index += 1) {
    const heading = matches[index][1].trim();
    if (heading === sourceTitle) continue;

    const start = matches[index].index;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    const markdown = body.slice(start, end).trim();
    if (markdown.length > 0) blocks.push({ name: heading, markdown });
  }

  return blocks;
}

function parseMetric(markdown, label) {
  const pattern = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, 'i');
  const match = markdown.match(pattern);
  return match ? match[1].trim().replace(/\s{2,}$/g, '') : null;
}

function buildFolderDocuments(folderNames) {
  return folderNames.map((name) => ({
    _id: slugId(`actor-folder:${name}`),
    name,
    type: 'Actor',
    sorting: 'a',
    color: null,
    folder: null,
    flags: {
      aeriya: {
        pack: 'aeriya-actors',
        role: 'actor-folder'
      }
    }
  }));
}

function buildActorDocument({ block, sourcePath, batchData, folderName }) {
  const id = slugId(`${sourcePath}:${block.name}`);
  const cr = parseMetric(block.markdown, 'CR') ?? parseMetric(block.markdown, 'КО');
  const ac = parseMetric(block.markdown, 'КД');
  const hp = parseMetric(block.markdown, 'ХП');
  const speed = parseMetric(block.markdown, 'Скорость');

  return {
    _id: id,
    name: block.name,
    type: 'npc',
    folder: slugId(`actor-folder:${folderName}`),
    img: 'icons/svg/mystery-man.svg',
    system: {
      details: {
        biography: {
          value: markdownToHtml(block.markdown),
          public: ''
        },
        type: {
          value: 'custom'
        },
        cr: cr ?? ''
      },
      attributes: {
        ac: { flat: ac ?? '' },
        hp: { value: hp ?? '', max: hp ?? '' },
        movement: { special: speed ?? '' }
      }
    },
    flags: {
      aeriya: {
        pack: 'aeriya-actors',
        sourcePath,
        sourceBatch: batchData.name ?? 'unknown',
        shard: batchData.shard ?? 'unknown',
        region: batchData.region ?? 'unknown',
        source: batchData.source ?? 'unknown',
        status: batchData.status ?? 'unknown',
        folderName,
        cr,
        ac,
        hp,
        speed,
        stagingOnly: true
      }
    }
  };
}

async function resetDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function writePackSource(actors) {
  await resetDir(PACK_SOURCE_DIR);

  const usedNames = new Set();
  for (const actor of actors) {
    const baseName = safeFileName(`${actor.name}-${actor._id}`) || actor._id;
    let fileName = `${baseName}.json`;
    let counter = 2;
    while (usedNames.has(fileName)) {
      fileName = `${baseName}-${counter}.json`;
      counter += 1;
    }
    usedNames.add(fileName);
    await fs.writeFile(path.join(PACK_SOURCE_DIR, fileName), JSON.stringify(actor, null, 2), 'utf8');
  }

  const folderNames = [...new Set(actors.map((actor) => actor.flags.aeriya.folderName))].sort((a, b) => a.localeCompare(b, 'ru'));
  const folders = buildFolderDocuments(folderNames);
  const manifest = {
    id: 'aeriya-actors',
    type: 'Actor',
    generatedFrom: 'content/actor-statblocks/**/*.md',
    sourceDirectory: 'build/foundry/aeriya-actors/_source',
    documentCount: actors.length,
    folderCount: folders.length,
    folders,
    note: 'Staging output for Aeria Core Actor pack. Actor documents preserve the source statblock as biography HTML and basic parsed metrics in flags/system fields. This output still must be converted into a valid Foundry compendium database and tested in a clean world before adding the pack to module.json.'
  };
  await fs.writeFile(PACK_MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');
}

async function main() {
  const files = await walk(ACTOR_CONTENT_ROOT);
  const actors = [];

  for (const file of files) {
    const relativePath = repoPath(file);
    const text = await fs.readFile(file, 'utf8');
    const { data, body } = parseFrontmatter(text);
    const blocks = extractH1Blocks(body, data.name);
    const folderName = folderNameFor(relativePath);

    for (const block of blocks) {
      actors.push(buildActorDocument({ block, sourcePath: relativePath, batchData: data, folderName }));
    }
  }

  actors.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(actors, null, 2), 'utf8');
  await writePackSource(actors);

  console.log(`Built ${actors.length} actor entries: ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`Staged actor pack source: ${path.relative(ROOT, PACK_SOURCE_DIR)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
