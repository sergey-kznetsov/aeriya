/**
 * validate-import-ready.mjs
 * Validates that all content JSON files are ready for Foundry import.
 * Run: node scripts/dev/validate-import-ready.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

let errors = 0;
let warnings = 0;

function err(msg) { console.error(`❌ ${msg}`); errors++; }
function warn(msg) { console.warn(`⚠️  ${msg}`); warnings++; }
function ok(msg) { console.log(`✅ ${msg}`); }

// ============================================================
// 1. Check module.json
// ============================================================
const modulePath = resolve(ROOT, "module.json");
if (!existsSync(modulePath)) { err("module.json not found"); process.exit(1); }

const module = JSON.parse(readFileSync(modulePath, "utf-8"));
if (!module.id) err("module.json: missing id");
if (!module.version) err("module.json: missing version");
if (!module.manifest) err("module.json: missing manifest URL");
if (!module.download) err("module.json: missing download URL");
if (!Array.isArray(module.esmodules) || module.esmodules.length === 0) err("module.json: no esmodules");
else ok(`module.json: ${module.esmodules.length} esmodules, v${module.version}`);

// ============================================================
// 2. Check all esmodules exist
// ============================================================
for (const script of module.esmodules ?? []) {
  const p = resolve(ROOT, script);
  if (!existsSync(p)) err(`esmodule not found: ${script}`);
  else ok(`esmodule exists: ${script}`);
}

// ============================================================
// 3. Check journal-content.json
// ============================================================
const journalPath = resolve(ROOT, "content/generated/journal-content.json");
if (!existsSync(journalPath)) {
  err("content/generated/journal-content.json not found");
} else {
  const journals = JSON.parse(readFileSync(journalPath, "utf-8"));
  if (!Array.isArray(journals) || journals.length === 0) {
    err("journal-content.json: empty or not an array");
  } else {
    const totalPages = journals.reduce((s, j) => s + (j.pages?.length ?? 0), 0);
    ok(`journal-content.json: ${journals.length} entries, ${totalPages} pages`);
    
    // Validate each entry
    for (const j of journals) {
      if (!j.name) err(`Journal entry missing name: ${JSON.stringify(j).slice(0, 80)}`);
      if (!j.folder) warn(`Journal entry missing folder: ${j.name}`);
      if (!Array.isArray(j.pages) || j.pages.length === 0) warn(`Journal entry has no pages: ${j.name}`);
      for (const p of j.pages ?? []) {
        if (!p.content || p.content === "<p></p>") warn(`Empty page "${p.name}" in "${j.name}"`);
        // Check for PRE tags (markdown tables rendered as pre)
        if (p.content?.includes("<pre>") && p.content?.includes("|")) {
          err(`Page "${p.name}" in "${j.name}" has markdown tables rendered as <pre> — use <table>`);
        }
      }
    }
  }
}

// ============================================================
// 4. Check scenes-data.json
// ============================================================
const scenesPath = resolve(ROOT, "content/generated/scenes-data.json");
if (!existsSync(scenesPath)) {
  err("content/generated/scenes-data.json not found");
} else {
  const scenes = JSON.parse(readFileSync(scenesPath, "utf-8"));
  if (!Array.isArray(scenes) || scenes.length === 0) {
    err("scenes-data.json: empty");
  } else {
    ok(`scenes-data.json: ${scenes.length} scenes`);
    const folders = new Set(scenes.map(s => s.folder));
    ok(`scenes-data.json: ${folders.size} unique folders`);
    
    // Check for flat structure (all in same folder = bad)
    if (folders.size < 3) err("scenes-data.json: too few folders, likely flat structure");
    
    for (const s of scenes) {
      if (!s.name) err(`Scene missing name: ${JSON.stringify(s).slice(0, 60)}`);
      if (!s.folder) err(`Scene missing folder: ${s.name}`);
      if (!s.shard) warn(`Scene missing shard: ${s.name}`);
    }
  }
}

// ============================================================
// 5. Check actor statblock files
// ============================================================
const actorFiles = [
  "content/actor-statblocks/npcs/middle-lands-city-npcs-batch-01.md",
  "content/actor-statblocks/npcs/shadow-shard-npcs-batch-01.md",
  "content/actor-statblocks/bestiary/new-middle-creatures-batch-01.md",
  "content/actor-statblocks/bestiary/source-shadow-creatures-batch-06.md",
];

let actorCount = 0;
for (const af of actorFiles) {
  const p = resolve(ROOT, af);
  if (!existsSync(p)) {
    warn(`Actor batch file not found: ${af}`);
    continue;
  }
  const text = readFileSync(p, "utf-8");
  const crMatches = [...text.matchAll(/\*\*(CR|КО):\*\*\s*([^\n]+)/g)];
  const names = [...text.matchAll(/^#\s+(.+)$/gm)].slice(1); // skip batch title
  actorCount += names.length;
  
  // Check CR is parseable as number
  for (const m of crMatches) {
    const raw = m[2].trim().split(/[\s(]/)[0];
    let cr;
    if (raw === "1/2") cr = 0.5;
    else if (raw === "1/4") cr = 0.25;
    else if (raw === "1/8") cr = 0.125;
    else cr = parseFloat(raw);
    if (!Number.isFinite(cr)) {
      err(`Non-numeric CR "${raw}" in ${af}`);
    }
  }
}
if (actorCount > 0) ok(`Actor statblocks: ~${actorCount} actors found across checked files`);
else err("No actors found in statblock files");

// ============================================================
// SUMMARY
// ============================================================
console.log("\n" + "=".repeat(50));
console.log(`Validation complete: ${errors} errors, ${warnings} warnings`);
if (errors > 0) {
  console.error("❌ FAILED — fix errors before release");
  process.exit(1);
} else {
  console.log("✅ PASSED — import should work in Foundry");
  process.exit(0);
}
