const MODULE_ID = "aeriya";
const SCHEMA = "actor-ability-repair-v1";

function folderPath(folder) {
  const names = [];
  let current = folder;
  while (current) { names.unshift(current.name); current = current.folder; }
  return names.join(" / ");
}

function isAeriaNpc(actor) {
  if (actor.type !== "npc") return false;
  if (actor.getFlag(MODULE_ID, "sourcePath")) return true;
  if (actor.getFlag(MODULE_ID, "externalBestiary")) return true;
  if (actor.getFlag(MODULE_ID, "documentKind")) return true;
  const path = actor.folder ? folderPath(actor.folder) : "";
  return path.startsWith("Aeria Core") || path.includes("Aeria Core");
}

function values(actor) {
  const a = actor.system?.abilities ?? {};
  return ["str", "dex", "con", "int", "wis", "cha"].map((key) => Number(a[key]?.value ?? 10));
}

function isDefault(actor) {
  return values(actor).every((n) => !Number.isFinite(n) || n === 10);
}

function cr(actor) {
  const raw = actor.system?.details?.cr ?? actor.getFlag(MODULE_ID, "cr") ?? 1;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 1;
  const s = String(raw || "1").trim();
  if (s.includes("/")) { const parts = s.split("/").map(Number); return parts[1] ? parts[0] / parts[1] : 1; }
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : 1;
}

function blob(actor) {
  return [
    actor.name,
    actor.system?.details?.type?.value,
    actor.system?.details?.type?.custom,
    actor.system?.details?.biography?.value,
    actor.getFlag(MODULE_ID, "externalRole"),
    actor.getFlag(MODULE_ID, "externalGroup")
  ].filter(Boolean).join(" ").toLowerCase();
}

function clamp(n) { return Math.max(1, Math.min(30, Math.round(n))); }

function build(actor) {
  const c = Math.max(0, cr(actor));
  const text = blob(actor);
  const type = String(actor.system?.details?.type?.value || "").toLowerCase();
  const size = String(actor.system?.traits?.size || "med").toLowerCase();
  const base = 10 + Math.min(12, Math.floor(c / 2));
  const v = { str: base, dex: base, con: base + 1, int: 10, wis: 12, cha: 10 };

  if (["dragon", "giant", "monstrosity", "aberration", "undead"].some((x) => type.includes(x))) { v.str += 2; v.con += 2; }
  if (["construct", "ooze", "plant"].some((x) => type.includes(x))) { v.con += 3; v.int -= 2; }
  if (["beast", "fey"].some((x) => type.includes(x))) { v.dex += 2; v.wis += 1; }
  if (["humanoid", "celestial", "fiend"].some((x) => type.includes(x))) { v.int += 1; v.wis += 1; v.cha += 1; }
  if (["huge", "grg", "lg"].includes(size)) { v.str += 2; v.con += 2; v.dex -= 1; }

  if (text.includes("артил") || text.includes("пушк") || text.includes("маг") || text.includes("заклин") || text.includes("контрол")) { v.dex += 2; v.int += 3; v.wis += 1; v.str -= 1; }
  if (text.includes("скрыт") || text.includes("тень") || text.includes("зме") || text.includes("паук") || text.includes("охот")) { v.dex += 3; v.wis += 1; }
  if (text.includes("лидер") || text.includes("элит") || text.includes("лорд") || text.includes("предвест") || text.includes("королев") || text.includes("легендар")) { v.cha += 3; v.wis += 2; }
  if (text.includes("зомби") || text.includes("гуль") || text.includes("лич") || text.includes("тлен") || text.includes("костян")) { v.con += 2; v.wis -= 1; v.cha -= 1; }

  const old = actor.system?.abilities ?? {};
  return {
    str: { value: clamp(v.str), proficient: old.str?.proficient ?? 0 },
    dex: { value: clamp(v.dex), proficient: old.dex?.proficient ?? 0 },
    con: { value: clamp(v.con), proficient: old.con?.proficient ?? 0 },
    int: { value: clamp(v.int), proficient: old.int?.proficient ?? 0 },
    wis: { value: clamp(v.wis), proficient: old.wis?.proficient ?? 0 },
    cha: { value: clamp(v.cha), proficient: old.cha?.proficient ?? 0 }
  };
}

async function repairActorAbilities({ overwrite = false } = {}) {
  if (!game.user?.isGM) return { updated: 0, skipped: 0, failed: [] };
  const result = { updated: 0, skipped: 0, failed: [] };
  for (const actor of game.actors) {
    if (!isAeriaNpc(actor)) continue;
    if (!overwrite && !isDefault(actor)) { result.skipped += 1; continue; }
    try {
      await actor.update({ system: { abilities: build(actor) }, flags: { [MODULE_ID]: { abilityRepairSchema: SCHEMA } } });
      result.updated += 1;
    } catch (error) { result.failed.push({ actor: actor.name, error: error.message }); }
  }
  if (result.updated > 0) ui.notifications?.info(`Aeria Core: исправлены характеристики Actor: ${result.updated}.`);
  if (result.failed.length > 0) console.error("Aeria Core | ability repair failures", result.failed);
  return result;
}

function wrapImportAll() {
  game.aeriya = game.aeriya ?? {};
  const original = game.aeriya.importAll;
  if (typeof original !== "function" || original.__aeriyaAbilityRepairWrapped) return;
  const wrapped = async (options = {}) => {
    const result = await original(options);
    const repaired = await repairActorAbilities({ overwrite: false });
    result.updated = (result.updated ?? 0) + repaired.updated;
    result.failed?.push?.(...repaired.failed);
    return result;
  };
  wrapped.__aeriyaAbilityRepairWrapped = true;
  game.aeriya.importAll = wrapped;
}

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.repairActorAbilities = (options = {}) => repairActorAbilities(options);
  wrapImportAll();
  if (!game.user?.isGM) return;
  const key = "actorAbilityRepairVersion";
  const current = `${game.modules.get(MODULE_ID)?.version ?? "unknown"}:${SCHEMA}`;
  game.settings.register(MODULE_ID, key, { name: "Aeria Core: ремонт характеристик Actor", scope: "world", config: false, type: String, default: "" });
  window.setTimeout(async () => {
    wrapImportAll();
    const result = await repairActorAbilities({ overwrite: false });
    if (result.failed.length === 0) await game.settings.set(MODULE_ID, key, current);
  }, 15000);
});
