const MODULE_ID = "aeriya";
const CALENDAR_SCHEMA = "aeria-calendar-v2";
const CALENDAR_SETTING = "calendarState";
const PANEL_MACRO_NAME = "Аэрия: Календарь и погода";
const CALENDAR_MACRO_NAME = "Аэрия: Календарь";
const LONG_REST_MACRO_NAME = "Аэрия: Долгий отдых";
const DAYS_IN_MONTH = 20;
const MONTHS_IN_YEAR = 18;
const DAYS_IN_YEAR = DAYS_IN_MONTH * MONTHS_IN_YEAR;
const REST_DEBOUNCE_MS = 5000;

const MONTH_NAMES = [
  "Абишая", "Тленного Зомби", "Песчаной Змеи", "Пепельного Волка", "Медного Гада", "Слепого Мракоглаза",
  "Гниющего Утопца", "Костяного Баргеста", "Кровавого Гуля", "Шатаха", "Тарбаша", "Пепельного Сарлага",
  "Кислотной Ивы", "Ледяного Архонта", "Драконьей Осы", "Соляной Слизи", "Чёрного Лешего", "Зверя без Тени"
];

const YEAR_NAMES = [
  "Повелителя Бурь", "Вечного Лича", "Первозданного Разрушителя Миров", "Древнего Имперского Дракона",
  "Лича-Лорда", "Палача Кровавой Коры", "Демидраколича", "Королевы Войны Брунгильды",
  "Предвестника Смерти", "Испепелителя", "Древнего Коричневого Дракона", "Живой Бури Заклинаний"
];

const SEASONS = [
  { name: "Ранняя весна", weatherSeason: "spring", starts: 1 },
  { name: "Поздняя весна", weatherSeason: "spring", starts: 61 },
  { name: "Жаркое лето", weatherSeason: "summer", starts: 121 },
  { name: "Пепельное лето", weatherSeason: "summer", starts: 181 },
  { name: "Мокрая осень", weatherSeason: "autumn", starts: 241 },
  { name: "Мёрзлая зима", weatherSeason: "winter", starts: 301 }
];

let lastRestAdvanceAt = 0;
let restHookInstalled = false;

function defaultState() {
  return { schema: CALENDAR_SCHEMA, absoluteDay: 0, day: 1, month: 1, year: 1, monthNames: MONTH_NAMES, yearNames: YEAR_NAMES, notes: [], history: [] };
}

function normalizeState(raw) {
  const state = { ...defaultState(), ...(raw || {}) };
  state.monthNames = Array.isArray(state.monthNames) && state.monthNames.length === MONTHS_IN_YEAR ? state.monthNames : MONTH_NAMES;
  state.yearNames = Array.isArray(state.yearNames) && state.yearNames.length > 0 ? state.yearNames : YEAR_NAMES;
  state.absoluteDay = Math.max(0, Number(state.absoluteDay || 0));
  return { ...state, ...deriveDate(state.absoluteDay, state), schema: CALENDAR_SCHEMA };
}

function getState() {
  return normalizeState(game.settings.get(MODULE_ID, CALENDAR_SETTING));
}

async function setState(state) {
  const normalized = normalizeState(state);
  await game.settings.set(MODULE_ID, CALENDAR_SETTING, normalized);
  return normalized;
}

function deriveDate(absoluteDay, state = defaultState()) {
  const dayOfYearIndex = absoluteDay % DAYS_IN_YEAR;
  const yearIndex = Math.floor(absoluteDay / DAYS_IN_YEAR);
  const month = Math.floor(dayOfYearIndex / DAYS_IN_MONTH) + 1;
  const day = (dayOfYearIndex % DAYS_IN_MONTH) + 1;
  const year = yearIndex + 1;
  const monthName = state.monthNames[(month - 1) % state.monthNames.length];
  const yearName = state.yearNames[yearIndex % state.yearNames.length];
  const dayOfYear = dayOfYearIndex + 1;
  const season = [...SEASONS].reverse().find((entry) => dayOfYear >= entry.starts) ?? SEASONS[0];
  return { day, month, year, dayOfYear, monthName, yearName, season: season.name, weatherSeason: season.weatherSeason };
}

function formatDate(state) {
  return `${state.day} день месяца ${state.monthName}, год ${state.yearName}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function buildDayCard(state, reason = "Новый день") {
  return `<div class="aeriya-content aeriya-calendar-card"><h2>${escapeHtml(reason)}</h2><p><strong>Настал ${escapeHtml(formatDate(state))}.</strong></p><p>Месяц ${escapeHtml(state.month)} из ${MONTHS_IN_YEAR}. День года: ${escapeHtml(state.dayOfYear)} из ${DAYS_IN_YEAR}. Сезон: ${escapeHtml(state.season)}.</p></div>`;
}

function buildStatusCard(state) {
  return `<div class="aeriya-content aeriya-calendar-card"><h2>Календарь Аэрии</h2><p><strong>${escapeHtml(formatDate(state))}</strong></p><p>Год ${escapeHtml(state.year)}. Месяц ${escapeHtml(state.month)} из ${MONTHS_IN_YEAR}. День месяца ${escapeHtml(state.day)} из ${DAYS_IN_MONTH}. День года ${escapeHtml(state.dayOfYear)} из ${DAYS_IN_YEAR}.</p><p>Сезон: ${escapeHtml(state.season)}.</p></div>`;
}

async function postCalendarCard(content, whisperGM = false) {
  const data = { user: game.user?.id, speaker: ChatMessage.getSpeaker({ alias: "Календарь Аэрии" }), content };
  if (whisperGM) data.whisper = ChatMessage.getWhisperRecipients("GM").map((user) => user.id);
  return ChatMessage.create(data);
}

async function showCalendar(options = {}) {
  const state = getState();
  await postCalendarCard(buildStatusCard(state), options.whisperGM ?? false);
  return state;
}

async function advanceCalendar({ days = 1, reason = "Настал новый день", rollWeather = false, whisperGM = false, silent = false } = {}) {
  if (!game.user?.isGM) return getState();
  const current = getState();
  const next = await setState({
    ...current,
    absoluteDay: current.absoluteDay + Math.max(0, Number(days || 0)),
    history: [...(current.history || []), { at: new Date().toISOString(), days, reason }].slice(-100)
  });
  if (!silent) await postCalendarCard(buildDayCard(next, reason), whisperGM);
  if (rollWeather && game.aeriya?.rollUnnaturalWeather) {
    await game.aeriya.rollUnnaturalWeather({ season: next.weatherSeason, includeChange: true, includeCurse: true, whisperGM });
  }
  return next;
}

async function resetCalendar({ absoluteDay = 0 } = {}) {
  if (!game.user?.isGM) return getState();
  const next = await setState({ ...defaultState(), absoluteDay: Math.max(0, Number(absoluteDay || 0)) });
  await postCalendarCard(buildStatusCard(next), true);
  return next;
}

async function longRestSelectedTokens({ rollWeather = false } = {}) {
  const tokens = canvas?.tokens?.controlled ?? [];
  let rested = 0;
  for (const token of tokens) {
    const actor = token.actor;
    if (!actor) continue;
    const rest = actor.longRest ?? actor.system?.longRest;
    if (typeof rest === "function") {
      await rest.call(actor, { dialog: true, chat: true });
      rested += 1;
    }
  }
  await advanceCalendar({ days: 1, reason: rested > 0 ? "Долгий отдых завершён" : "Долгий отдых: день изменён", rollWeather });
}

async function rollCalendarWeather({ includeChange = true, includeCurse = true, whisperGM = false } = {}) {
  const state = getState();
  if (!game.aeriya?.rollUnnaturalWeather) {
    ui.notifications?.warn("Aeria Core: макрос погоды ещё не загружен.");
    return null;
  }
  return game.aeriya.rollUnnaturalWeather({ season: state.weatherSeason, includeChange, includeCurse, whisperGM });
}

async function maybeAdvanceAfterRest(actor, payload = {}) {
  if (!game.user?.isGM) return;
  const now = Date.now();
  if (now - lastRestAdvanceAt < REST_DEBOUNCE_MS) return;
  const restType = String(payload?.type ?? payload?.restType ?? payload?.variant ?? payload?.longRest ?? "").toLowerCase();
  const looksLikeLongRest = payload?.longRest === true || restType.includes("long") || restType.includes("долг");
  if (!looksLikeLongRest && payload && Object.keys(payload).length > 0) return;
  lastRestAdvanceAt = now;
  await advanceCalendar({ days: 1, reason: `Долгий отдых завершён${actor?.name ? `: ${actor.name}` : ""}`, rollWeather: false });
}

function installRestHooks() {
  if (restHookInstalled || !globalThis.Hooks) return;
  restHookInstalled = true;
  for (const hookName of ["dnd5e.restCompleted", "dnd5e.longRest", "restCompleted", "longRest"]) {
    Hooks.on(hookName, async (...args) => {
      const actor = args.find((arg) => arg?.documentName === "Actor" || arg?.type === "character" || arg?.type === "npc") ?? args[0];
      const payload = args.find((arg) => arg && typeof arg === "object" && arg !== actor) ?? {};
      await maybeAdvanceAfterRest(actor, payload);
    });
  }
}

async function getOrCreateFolder(documentType, folderPath) {
  const parts = String(folderPath || "Aeria Core / Макросы").split(/\s*\/\s*/).filter(Boolean);
  let parent = null;
  for (const part of parts) {
    const existing = game.folders.find((folder) => folder.type === documentType && folder.name === part && (folder.folder?.id ?? null) === (parent?.id ?? null));
    parent = existing ?? await Folder.create({ name: part, type: documentType, folder: parent?.id ?? null, sorting: "a" });
  }
  return parent;
}

async function ensureMacro(name, command, macroId, img = "icons/svg/calendar.svg") {
  if (!game.user?.isGM || !globalThis.Macro) return null;
  const folder = await getOrCreateFolder("Macro", "Aeria Core / Макросы");
  const data = { name, type: "script", img, command, folder: folder?.id ?? null, flags: { [MODULE_ID]: { macroId, importSchema: CALENDAR_SCHEMA } } };
  const existing = game.macros.find((macro) => macro.getFlag(MODULE_ID, "macroId") === macroId || macro.name === name);
  if (existing) { await existing.update(data); return existing; }
  return Macro.create(data);
}

async function ensureCalendarMacros() {
  const panel = await ensureMacro(PANEL_MACRO_NAME, "game.aeriya.calendar.openPanel();", "calendar-weather-panel", "icons/svg/d20-grey.svg");
  await ensureMacro(CALENDAR_MACRO_NAME, "game.aeriya.calendar.show();", "calendar-show", "icons/svg/calendar.svg");
  await ensureMacro(LONG_REST_MACRO_NAME, "game.aeriya.calendar.longRestSelectedTokens({ rollWeather: false });", "calendar-long-rest", "icons/svg/sleep.svg");
  if (game.aeriya?.ensureWeatherMacro) await game.aeriya.ensureWeatherMacro();
  return panel;
}

function panelContent() {
  const state = getState();
  return `<div class="aeriya-content aeriya-calendar-panel"><h2>Календарь и погода</h2><p><strong>${escapeHtml(formatDate(state))}</strong></p><p>Сезон: ${escapeHtml(state.season)}. Месяц ${state.month}/${MONTHS_IN_YEAR}, день ${state.day}/${DAYS_IN_MONTH}, день года ${state.dayOfYear}/${DAYS_IN_YEAR}.</p><p>Выбери действие. Все изменения даты выполняются только у GM.</p></div>`;
}

async function openCalendarPanel() {
  const buttons = {
    show: { label: "Показать дату", callback: () => showCalendar() },
    nextDay: { label: "+1 день", callback: () => advanceCalendar({ days: 1, reason: "Настал новый день" }) },
    nextDayWeather: { label: "+1 день + погода", callback: () => advanceCalendar({ days: 1, reason: "Настал новый день", rollWeather: true }) },
    longRest: { label: "Долгий отдых", callback: () => longRestSelectedTokens({ rollWeather: false }) },
    weather: { label: "Погода", callback: () => rollCalendarWeather({ includeChange: true, includeCurse: true }) },
    close: { label: "Закрыть" }
  };
  new Dialog({ title: "Аэрия: Календарь и погода", content: panelContent(), buttons, default: "show" }).render(true);
}

async function initializeCalendar() {
  if (!game.user?.isGM) return;
  await setState(getState());
  await ensureCalendarMacros();
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, CALENDAR_SETTING, { name: "Aeria Core: календарь мира", scope: "world", config: false, type: Object, default: defaultState() });
});

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.calendar = {
    getState,
    show: showCalendar,
    advance: advanceCalendar,
    reset: resetCalendar,
    longRestSelectedTokens,
    rollWeather: rollCalendarWeather,
    openPanel: openCalendarPanel,
    ensureMacros: ensureCalendarMacros,
    formatDate: () => formatDate(getState())
  };
  installRestHooks();
  if (!game.user?.isGM) return;
  const settingKey = "calendarInstalledVersion";
  const current = `${game.modules.get(MODULE_ID)?.version ?? "unknown"}:${CALENDAR_SCHEMA}`;
  game.settings.register(MODULE_ID, settingKey, { name: "Aeria Core: версия календаря", scope: "world", config: false, type: String, default: "" });
  window.setTimeout(async () => {
    await initializeCalendar();
    await game.settings.set(MODULE_ID, settingKey, current);
  }, 2500);
});
