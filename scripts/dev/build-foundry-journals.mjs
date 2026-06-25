import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'content');
const OUT_DIR = path.join(ROOT, 'build', 'foundry');
const OUT_FILE = path.join(OUT_DIR, 'journal-entries.json');
const PACK_DIR = path.join(OUT_DIR, 'aeriya-journals');
const PACK_SOURCE_DIR = path.join(PACK_DIR, '_source');
const PACK_MANIFEST_FILE = path.join(PACK_DIR, 'manifest.json');

const TYPE_TO_FOLDER = {
  city: 'Cities',
  faction: 'Factions',
  spirit: 'Spirits',
  npc: 'NPCs',
  monster: 'Creatures',
  item: 'Items',
  ritual: 'Rituals',
  rolltable: 'Tables',
  scene: 'Scenes',
  handout: 'Handouts',
  region: 'Regions'
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

function shouldSkip(relativePath) {
  if (relativePath.includes('/_templates/')) return true;
  if (relativePath.includes('/_indexes/')) return true;
  if (relativePath.endsWith('/README.md')) return true;
  return false;
}

function buildJournalEntry({ relativePath, data, body }) {
  const folder = TYPE_TO_FOLDER[data.type] ?? 'Aeria';
  const id = slugId(relativePath);
  return {
    _id: id,
    name: data.name,
    type: 'journalentry',
    folder,
    flags: {
      aeriya: {
        type: data.type,
        shard: data.shard ?? 'unknown',
        region: data.region ?? 'unknown',
        source: data.source ?? 'unknown',
        sourcePath: relativePath
      }
    },
    pages: [
      {
        _id: slugId(`${relativePath}:page`),
        name: data.name,
        type: 'text',
        text: {
          format: 1,
          content: markdownToHtml(body)
        }
      }
    ]
  };
}

async function resetDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function writePackSource(journals) {
  await resetDir(PACK_SOURCE_DIR);

  const usedNames = new Set();
  for (const journal of journals) {
    const baseName = safeFileName(`${journal.name}-${journal._id}`) || journal._id;
    let fileName = `${baseName}.json`;
    let counter = 2;
    while (usedNames.has(fileName)) {
      fileName = `${baseName}-${counter}.json`;
      counter += 1;
    }
    usedNames.add(fileName);
    await fs.writeFile(path.join(PACK_SOURCE_DIR, fileName), JSON.stringify(journal, null, 2), 'utf8');
  }

  const folders = [...new Set(journals.map((journal) => journal.folder))].sort((a, b) => a.localeCompare(b, 'ru'));
  const manifest = {
    id: 'aeriya-journals',
    type: 'JournalEntry',
    generatedFrom: 'content/**/*.md',
    sourceDirectory: 'build/foundry/aeriya-journals/_source',
    documentCount: journals.length,
    folders,
    note: 'Staging output for the first Aeria Core Journal Entry pack. Do not add this pack to module.json until it is converted into a valid Foundry compendium database and tested in a clean world.'
  };
  await fs.writeFile(PACK_MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');
}

async function main() {
  const files = await walk(CONTENT_ROOT);
  const journals = [];

  for (const file of files) {
    const relativePath = path.relative(ROOT, file).replaceAll(path.sep, '/');
    if (shouldSkip(relativePath)) continue;

    const text = await fs.readFile(file, 'utf8');
    const { data, body } = parseFrontmatter(text);
    if (!data.type || !data.name) continue;

    journals.push(buildJournalEntry({ relativePath, data, body }));
  }

  journals.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(journals, null, 2), 'utf8');
  await writePackSource(journals);

  console.log(`Built ${journals.length} journal entries: ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`Staged pack source: ${path.relative(ROOT, PACK_SOURCE_DIR)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
