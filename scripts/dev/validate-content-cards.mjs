import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');

const REQUIRED_FIELDS = ['type', 'name', 'shard', 'region', 'source', 'status'];
const KNOWN_TYPES = new Set(['city','faction','npc','monster','spirit','ritual','item','handout','region','rolltable','scene']);
const FORBIDDEN_STATUS_PARTS = ['draft', 'todo', 'pending', 'stub', 'placeholder', 'needs'];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && entry.name.endsWith('.md')) return [fullPath];
    return [];
  });
}

function repoPath(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, '/');
}

function isContentCard(filePath) {
  const relativePath = repoPath(filePath);
  if (relativePath.includes('/_indexes/')) return false;
  if (relativePath.includes('/_templates/')) return false;
  if (relativePath.endsWith('/README.md')) return false;
  return true;
}

function parseFrontMatter(content) {
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = content.slice(3, end).trim();
  const data = {};
  for (const line of block.split('\n')) {
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*"?(.*?)"?\s*$/);
    if (match) data[match[1]] = match[2];
  }
  return data;
}

function validateStatus(status) {
  if (!status) return [];
  const lowered = status.toLowerCase();
  const errors = [];
  for (const forbidden of FORBIDDEN_STATUS_PARTS) {
    if (lowered.includes(forbidden)) errors.push(`non-final-status-${status}`);
  }
  return [...new Set(errors)];
}

function validateFile(filePath) {
  const relativePath = repoPath(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const frontMatter = parseFrontMatter(content);
  const errors = [];
  if (!frontMatter) return { path: relativePath, errors: ['missing-front-matter'] };
  for (const field of REQUIRED_FIELDS) if (!frontMatter[field]) errors.push(`missing-${field}`);
  if (frontMatter.type && !KNOWN_TYPES.has(frontMatter.type)) errors.push(`unknown-type-${frontMatter.type}`);
  if (frontMatter.name && !content.includes(`# ${frontMatter.name}`)) errors.push('missing-h1-title');
  errors.push(...validateStatus(frontMatter.status));
  return { path: relativePath, type: frontMatter.type, name: frontMatter.name, errors };
}

const files = walk(CONTENT_DIR).filter(isContentCard);
const results = files.map(validateFile);
const failed = results.filter((item) => item.errors.length > 0);

if (failed.length > 0) {
  console.error('Content validation failed:');
  for (const item of failed) console.error(`- ${item.path}: ${item.errors.join(', ')}`);
  process.exit(1);
}

console.log(`Content validation passed. Checked ${results.length} markdown files.`);