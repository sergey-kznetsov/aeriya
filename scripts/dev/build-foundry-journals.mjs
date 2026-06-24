import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'content');
const OUT_DIR = path.join(ROOT, 'build', 'foundry');
const OUT_FILE = path.join(OUT_DIR, 'journal-entries.json');

const TYPE_TO_FOLDER = {
  city: 'Города',
  faction: 'Фракции',
  spirit: 'Духи',
  handout: 'Книги и заметки',
  region: 'Регионы'
};

function slugId(input) {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, 16);
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
    const key = match[1];
    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
    data[key] = value;
  }

  return { data, body };
}

function markdownToHtml(markdown) {
  return markdown
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h')) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

async function walk(dir) {
  const result = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...await walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push(full);
    }
  }

  return result;
}

async function main() {
  const files = await walk(CONTENT_ROOT);
  const journals = [];

  for (const file of files) {
    const relativePath = path.relative(ROOT, file).replaceAll(path.sep, '/');
    if (relativePath.includes('/_templates/') || relativePath.includes('/_indexes/')) continue;
    if (relativePath.endsWith('/README.md')) continue;

    const text = await fs.readFile(file, 'utf8');
    const { data, body } = parseFrontmatter(text);
    if (!data.type || !data.name) continue;

    const folder = TYPE_TO_FOLDER[data.type] ?? 'Аэрия';
    const pageId = slugId(relativePath);

    journals.push({
      _id: pageId,
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
    });
  }

  journals.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(journals, null, 2), 'utf8');
  console.log(`Built ${journals.length} journal entries: ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
