import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['content', 'docs'];
const PATH_PREFIXES = ['content/', 'docs/', 'scripts/', 'module.json', 'README.md', 'CHANGELOG.md'];
const IGNORE_SUFFIXES = ['/**', '/*'];

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

function stripAnchor(rawPath) {
  return rawPath.split('#')[0];
}

function stripTrailingPunctuation(rawPath) {
  return rawPath.replace(/[),.;:]+$/g, '');
}

function isInternalCandidate(value) {
  return PATH_PREFIXES.some((prefix) => value === prefix || value.startsWith(prefix));
}

function isIgnoredPattern(value) {
  return IGNORE_SUFFIXES.some((suffix) => value.endsWith(suffix));
}

function extractCandidates(content) {
  const candidates = new Set();

  const backtickPattern = /`([^`]+)`/g;
  for (const match of content.matchAll(backtickPattern)) {
    const parts = match[1].split(/\s+/).filter(Boolean);
    for (const part of parts) candidates.add(part);
  }

  const markdownLinkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of content.matchAll(markdownLinkPattern)) {
    candidates.add(match[1]);
  }

  return [...candidates]
    .map((item) => stripTrailingPunctuation(stripAnchor(item.trim())))
    .filter(Boolean)
    .filter(isInternalCandidate)
    .filter((item) => !isIgnoredPattern(item));
}

function pathExists(repoRelativePath) {
  return fs.existsSync(path.join(ROOT, repoRelativePath));
}

const files = SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
const failures = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const sourcePath = repoPath(file);
  const candidates = extractCandidates(content);

  for (const candidate of candidates) {
    if (!pathExists(candidate)) {
      failures.push({ sourcePath, candidate });
    }
  }
}

if (failures.length > 0) {
  console.error('Internal content link validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure.sourcePath}: missing ${failure.candidate}`);
  }
  process.exit(1);
}

console.log(`Internal content link validation passed. Checked ${files.length} markdown files.`);
