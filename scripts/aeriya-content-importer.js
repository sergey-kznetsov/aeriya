const MODULE_ID = "aeriya";

class AeriyaReleaseContentBootstrap {
  static async registerSettings() {
    game.settings.register(MODULE_ID, "autoImportReleaseContent", {
      name: "Aeria Core: автоимпорт материалов",
      hint: "Автоматически импортировать релизные Journal-материалы Аэрии в мир при включении модуля у мастера.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(MODULE_ID, "releaseContentImportedVersion", {
      name: "Aeria Core: версия импортированных материалов",
      hint: "Служебная настройка. Хранит версию модуля, для которой релизные материалы уже импортированы в этот мир.",
      scope: "world",
      config: false,
      type: String,
      default: ""
    });
  }

  static get moduleVersion() {
    return game.modules.get(MODULE_ID)?.version ?? "unknown";
  }

  static async runAutoImport() {
    if (!game.user?.isGM) return;

    const importer = game.aeriya?.importReleaseContent;
    if (typeof importer !== "function") {
      ui.notifications?.error("Aeria Core: импортёр материалов не найден. Обнови модуль и перезагрузи мир.");
      console.error("Aeria Core | release content importer is not available on game.aeriya.importReleaseContent");
      return;
    }

    const autoImport = game.settings.get(MODULE_ID, "autoImportReleaseContent");
    if (!autoImport) return;

    const currentVersion = this.moduleVersion;
    const importedVersion = game.settings.get(MODULE_ID, "releaseContentImportedVersion");
    if (importedVersion === currentVersion) return;

    ui.notifications?.info("Aeria Core: импортирую материалы Аэрии в Journal Entries мира.");

    const result = await importer({ overwrite: false });
    if (result?.failed?.length > 0) {
      ui.notifications?.error(`Aeria Core: импорт завершён с ошибками: ${result.failed.length}. Подробности в консоли F12.`);
      console.error("Aeria Core | release content import failures", result.failed);
      return;
    }

    await game.settings.set(MODULE_ID, "releaseContentImportedVersion", currentVersion);
    ui.notifications?.info(`Aeria Core: материалы импортированы. Создано: ${result.created}, пропущено: ${result.skipped}.`);
  }
}

Hooks.once("init", () => {
  AeriyaReleaseContentBootstrap.registerSettings();
});

Hooks.once("ready", () => {
  AeriyaReleaseContentBootstrap.runAutoImport();
});
