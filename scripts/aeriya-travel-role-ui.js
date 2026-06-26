const AERIYA_TRAVEL_ROLE_UI_MODULE_ID = "aeriya";

Hooks.once("ready", () => {
  document.addEventListener("click", async (event) => {
    const button = event.target?.closest?.("#aeriya-travel-console [data-action='assign-roles']");
    if (!button) return;

    event.preventDefault();

    if (!game.user?.isGM) {
      ui.notifications?.warn("Распределять дорожные роли может только мастер.");
      return;
    }

    if (!game.aeriya?.travelRoles?.assignAndPost) {
      ui.notifications?.warn("Инструмент дорожных ролей ещё не готов.");
      return;
    }

    await game.aeriya.travelRoles.assignAndPost();
  });
});
