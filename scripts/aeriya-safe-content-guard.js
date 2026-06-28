const MODULE_ID = "aeriya";
const SCHEMA = "safe-content-guard-v1";

function sanitizeImportOptions(options = {}) {
  if (options.allowDestructiveOverwrite === true) return { ...options };
  return {
    ...options,
    overwrite: false,
    deleteLegacyScenes: false,
    safeMode: true
  };
}

function wrapImporter(name) {
  game.aeriya = game.aeriya ?? {};
  const original = game.aeriya[name];
  if (typeof original !== "function" || original.__aeriyaSafeGuardWrapped) return;
  const wrapped = async (options = {}) => original(sanitizeImportOptions(options));
  wrapped.__aeriyaSafeGuardWrapped = true;
  game.aeriya[name] = wrapped;
}

function installSafeGuard() {
  wrapImporter("importAll");
  wrapImporter("importJournals");
  wrapImporter("importActors");
  wrapImporter("importScenes");
  wrapImporter("importBookScenes");
  wrapImporter("importExternalBestiary");
  game.aeriya.safeImportOptions = sanitizeImportOptions;
  game.aeriya.safeContentGuardSchema = SCHEMA;
}

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  installSafeGuard();
  if (!game.user?.isGM) return;
  const key = "safeContentGuardVersion";
  const current = `${game.modules.get(MODULE_ID)?.version ?? "unknown"}:${SCHEMA}`;
  game.settings.register(MODULE_ID, key, { name: "Aeria Core: безопасный обновлятор", scope: "world", config: false, type: String, default: "" });
  game.settings.set(MODULE_ID, key, current);
});
