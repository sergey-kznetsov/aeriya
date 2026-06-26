const AERIYA_TRAVEL_ROLE_UI_MODULE_ID = "aeriya";

Hooks.once("ready", () => {
  document.addEventListener("click", async (event) => {
    const button = event.target?.closest?.("#aeriya-travel-console [data-action]");
    if (!button) return;

    const action = button.dataset.action;
    if (!["assign-roles", "complete-travel"].includes(action)) return;

    event.preventDefault();

    if (!game.user?.isGM) {
      ui.notifications?.warn("Управлять дорожными ролями может только мастер.");
      return;
    }

    if (!game.aeriya?.travelRoles) {
      ui.notifications?.warn("Инструмент дорожных ролей ещё не готов.");
      return;
    }

    if (action === "assign-roles") {
      await game.aeriya.travelRoles.assignAndPost({ force: true });
      return;
    }

    if (action === "complete-travel") {
      await game.aeriya.travelRoles.clearCurrentRoles();
    }
  });
});
