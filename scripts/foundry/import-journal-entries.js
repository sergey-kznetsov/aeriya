/*
 * Aeria Core — Journal Entry importer for Foundry VTT.
 *
 * Usage:
 * 1. Run npm run journals:build outside Foundry.
 * 2. Copy build/foundry/journal-entries.json somewhere reachable.
 * 3. Open Foundry as GM.
 * 4. Paste this file into a script macro or browser console.
 * 5. Set AERIA_JOURNAL_JSON_URL below and run.
 */

const AERIA_JOURNAL_JSON_URL = "modules/aeriya/build/foundry/journal-entries.json";
const AERIA_IMPORT_FLAG = "import.sourcePath";

function aeriaAssertGm() {
  if (!game.user?.isGM) {
    throw new Error("Aeria import requires a GM user.");
  }
}

async function aeriaFetchJournalPayload(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function aeriaNormalizeEntries(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.entries)) return payload.entries;
  if (Array.isArray(payload?.journalEntries)) return payload.journalEntries;
  throw new Error("Unsupported journal payload format.");
}

function aeriaEntryName(entry) {
  return entry.name || entry.title || entry.data?.name || "Aeria Entry";
}

function aeriaEntryContent(entry) {
  return entry.content || entry.text || entry.body || "";
}

function aeriaEntryFolder(entry) {
  return entry.folder || entry.category || entry.type || "Aeria";
}

async function aeriaGetOrCreateFolder(name) {
  const existing = game.folders.find((folder) => folder.type === "JournalEntry" && folder.name === name);
  if (existing) return existing;
  return Folder.create({ name, type: "JournalEntry", sorting: "a", color: "#8f6b3d" });
}

async function aeriaFindExistingBySource(sourcePath) {
  if (!sourcePath) return null;
  for (const entry of game.journal.contents) {
    if (entry.getFlag("aeriya", AERIA_IMPORT_FLAG) === sourcePath) return entry;
  }
  return null;
}

async function aeriaImportJournalEntries(url = AERIA_JOURNAL_JSON_URL) {
  aeriaAssertGm();

  const payload = await aeriaFetchJournalPayload(url);
  const entries = aeriaNormalizeEntries(payload);
  let created = 0;
  let updated = 0;

  for (const entry of entries) {
    const name = aeriaEntryName(entry);
    const content = aeriaEntryContent(entry);
    const sourcePath = entry.sourcePath || entry.path || entry.file || null;
    const folderName = aeriaEntryFolder(entry);
    const folder = await aeriaGetOrCreateFolder(folderName);

    const pageData = {
      name,
      type: "text",
      text: { content, format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML }
    };

    const existing = await aeriaFindExistingBySource(sourcePath);
    if (existing) {
      const firstPage = existing.pages.contents[0];
      if (firstPage) await firstPage.update(pageData);
      else await existing.createEmbeddedDocuments("JournalEntryPage", [pageData]);
      await existing.update({ name, folder: folder.id });
      updated += 1;
      continue;
    }

    const createdEntry = await JournalEntry.create({
      name,
      folder: folder.id,
      pages: [pageData]
    });

    if (sourcePath) await createdEntry.setFlag("aeriya", AERIA_IMPORT_FLAG, sourcePath);
    created += 1;
  }

  ui.notifications?.info(`Aeria import complete: created ${created}, updated ${updated}.`);
  return { created, updated, total: entries.length };
}

await aeriaImportJournalEntries();
