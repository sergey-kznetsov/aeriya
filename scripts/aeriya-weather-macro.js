const MODULE_ID = "aeriya";
const WEATHER_MACRO_SCHEMA = "unnatural-weather-v2";
const WEATHER_MACRO_NAME = "Аэрия: Неестественная погода";
const WEATHER_MACRO_ID = "unnatural-weather";

const SEASONS = {
  spring: { label: "Весна", entries: [
    "Тягучая сырость застыла в воздухе. В непроглядном тумане трудно дышать.",
    "Со всех уголков струятся ручьи талой воды. Они движутся вверх, супротив гравитации.",
    "Всё, что ниже метра над уровнем земли, сокрыто противоестественным мраком. Он по-могильному холоден.",
    "Бурное цветение принесло с лёгким бризом завесь из пыльцы и лепестков. Чихание неизбежно.",
    "Надвигается пыльная буря медного цвета. Пахнет спекшейся кровью. Это не песок.",
    "Земля теплее воздуха и исходит влажным паром. Соприкасаясь с живыми существами, капли воды протяжно звенят."
  ] },
  summer: { label: "Лето", entries: [
    "Воздух раскалён от духоты и похож на студень. Странные миражи чудятся на горизонте.",
    "Солнце едва угадывается за непроницаемым полотном облаков. Всё вокруг кажется красным.",
    "Периодический дождь устилает землю тушками лягушек, грызунов, птиц или рыб. Они были мертвы ещё в воздухе.",
    "Тут и там лениво ползут тонкие вихри, тянущиеся до небес. Некоторые охвачены огнём.",
    "Небосвод темнеет, а на землю медленно опускаются серые хлопья. Это пепел.",
    "Испепеляющая жара стоит в абсолютном мраке. Легчайший ветерок жжёт кожу."
  ] },
  autumn: { label: "Осень", entries: [
    "Мелкая морось щиплет глаза и слегка раздражает открытую кожу. Пахнет чем-то кислым.",
    "Ливень режет пространство на полосы. Из стены дождя слышны голоса ваших знакомых. Они давно умерли.",
    "Дождь из крови разжижает почву, вытравливая подземных гадов наружу.",
    "Отдалённый шум нарастает. Вскоре эту область накроет беспощадный град.",
    "Каждые 3 минуты и 33 секунды по местности прокатывается ударная волна. Внутри неё на секунду слышен ангельский хор.",
    "Потусторонний холод сгущается вокруг источников огня. Чем жарче пламя, тем болезненнее стынь."
  ] },
  winter: { label: "Зима", entries: [
    "Конденсат оседает на поверхностях, затем схватывается тонкой коркой льда.",
    "Нестерпимо колючий холод обжигает лёгкие и неприкрытые участки тела.",
    "Небо скручено в монструозную спираль из бурана. Снег отказывается падать.",
    "Поднялась жестокая метель. Летящие кристаллы снега царапаются словно абразив.",
    "Где-то в вышине стоит низкий гул бурана. Он похож на ритуальное пение и мешает думать.",
    "Из-под земли медленно вырастают ледяные шпили. Они образуют пучки острых кристаллов высотой с человека."
  ] }
};

const CHANGE_TABLE = [
  "Сама собой спустя [[D12]] часов.",
  "На следующий день.",
  "Через [[D6]] дней.",
  "Как только произнесут имя Нечрубель.",
  "Когда случится знаковое событие.",
  "Когда кого-нибудь убьют."
];

const CURSE_TABLE = [
  { name: "Немота", text: "Находясь в прямом контакте с погодным явлением, невозможно использовать свитки, артефакты и другие магические силы, включая врождённые." },
  { name: "Консервация", text: "Действующие негативные эффекты не могут быть отменены, полученные ранения не излечиваются, а отдых не оказывает эффекта до смены погоды." },
  { name: "Порча", text: "Вода и съестные припасы, хранящиеся на открытом воздухе, безвозвратно портятся." },
  { name: "Паника", text: "Животные сходят с ума, стараясь найти укрытие. Они непокорны, трусливы и агрессивны." },
  { name: "Коррозия", text: "Железо стремительно ржавеет. Металлические изделия ломаются, оружие и доспехи становятся менее эффективными." },
  { name: "Делириум", text: "Некоторые вещи кажутся не тем, чем являются: спутник — ожившим трупом, оружие — ядовитой змеёй, мост — бездонной пропастью, вой — сладким пением." }
];

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function normalizeSeason(season) {
  const raw = String(season ?? "random").toLowerCase().trim();
  const map = { весна: "spring", spring: "spring", лето: "summer", summer: "summer", осень: "autumn", autumn: "autumn", fall: "autumn", зима: "winter", winter: "winter", current: "current", текущий: "current", random: "random", случайный: "random" };
  return map[raw] ?? "random";
}

function currentSeason() {
  if (game.aeriya?.calendar?.getState) return game.aeriya.calendar.getState().weatherSeason ?? "spring";
  const month = new Date().getMonth() + 1;
  if ([3, 4, 5].includes(month)) return "spring";
  if ([6, 7, 8].includes(month)) return "summer";
  if ([9, 10, 11].includes(month)) return "autumn";
  return "winter";
}

async function rollDie(sides) {
  if (globalThis.Roll) return (await new Roll(`1d${sides}`).evaluate({ async: true })).total;
  return Math.floor(Math.random() * sides) + 1;
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

async function resolveChange(changeIndex) {
  let text = CHANGE_TABLE[changeIndex - 1];
  const rolls = [];
  if (text.includes("[[D12]]")) { const d12 = await rollDie(12); rolls.push(`d12=${d12}`); text = text.replace("[[D12]]", String(d12)); }
  if (text.includes("[[D6]]")) { const d6 = await rollDie(6); rolls.push(`d6=${d6}`); text = text.replace("[[D6]]", String(d6)); }
  return { text, rolls };
}

function buildWeatherCard(result) {
  const curse = result.curse ? `<section><h3>Модификатор проклятия: ${escapeHtml(result.curse.name)} <small>(d6=${result.curse.roll})</small></h3><p>${escapeHtml(result.curse.text)}</p></section>` : "";
  const change = result.change ? `<section><h3>Когда переменится погода <small>(d6=${result.change.roll}${result.change.extraRolls.length ? `; ${escapeHtml(result.change.extraRolls.join(", "))}` : ""})</small></h3><p>${escapeHtml(result.change.text)}</p></section>` : "";
  return `<div class="aeriya-content aeriya-weather-card"><h2>Неестественная погода: ${escapeHtml(result.season.label)}</h2><section><h3>Погодное явление <small>(d6=${result.weather.roll})</small></h3><p>${escapeHtml(result.weather.text)}</p></section>${change}${curse}<p><em>Эффекты не применяются автоматически. Мастер трактует последствия по сцене, маршруту и состоянию отряда.</em></p></div>`;
}

async function rollUnnaturalWeather(options = {}) {
  const seasonMode = normalizeSeason(options.season ?? "random");
  let seasonKey = seasonMode;
  let seasonRoll = null;
  if (seasonMode === "current") seasonKey = currentSeason();
  if (seasonMode === "random") { seasonRoll = await rollDie(4); seasonKey = ["spring", "summer", "autumn", "winter"][seasonRoll - 1]; }
  const weatherRoll = await rollDie(6);
  const season = SEASONS[seasonKey] ?? SEASONS.spring;
  const includeChange = options.includeChange ?? options.duration ?? true;
  const includeCurse = options.includeCurse ?? true;
  let change = null;
  let curse = null;
  if (includeChange) { const changeRoll = await rollDie(6); const resolved = await resolveChange(changeRoll); change = { roll: changeRoll, text: resolved.text, extraRolls: resolved.rolls }; }
  if (includeCurse) { const curseRoll = await rollDie(6); curse = { roll: curseRoll, ...CURSE_TABLE[curseRoll - 1] }; }
  const result = { source: "Генератор Неестественной Погоды", season: { key: seasonKey, label: season.label, roll: seasonRoll }, weather: { roll: weatherRoll, text: season.entries[weatherRoll - 1] }, change, curse };
  const chatData = { user: game.user?.id, speaker: ChatMessage.getSpeaker({ alias: "Погода Аэрии" }), content: buildWeatherCard(result), flags: { [MODULE_ID]: { macroId: WEATHER_MACRO_ID, result } } };
  if (options.whisperGM) chatData.whisper = ChatMessage.getWhisperRecipients("GM").map((user) => user.id);
  await ChatMessage.create(chatData);
  return result;
}

async function ensureWeatherMacro() {
  if (!game.user?.isGM || !globalThis.Macro) return null;
  const folder = await getOrCreateFolder("Macro", "Aeria Core / Макросы");
  const data = {
    name: WEATHER_MACRO_NAME,
    type: "script",
    img: "icons/svg/d20-grey.svg",
    command: `game.aeriya.rollUnnaturalWeather({ season: "current", includeChange: true, includeCurse: true });`,
    folder: folder?.id ?? null,
    flags: { [MODULE_ID]: { macroId: WEATHER_MACRO_ID, importSchema: WEATHER_MACRO_SCHEMA } }
  };
  const existing = game.macros.find((macro) => macro.getFlag(MODULE_ID, "macroId") === WEATHER_MACRO_ID || macro.name === WEATHER_MACRO_NAME);
  if (existing) { await existing.update(data); return existing; }
  return Macro.create(data);
}

async function restoreWeatherMacro() {
  if (!game.user?.isGM) return null;
  try {
    const macro = await ensureWeatherMacro();
    if (!macro) ui.notifications?.warn("Aeria Core: макрос погоды не создан — нет доступа GM или Macro API.");
    return macro;
  } catch (error) {
    console.error("Aeria Core | weather macro restore failed", error);
    ui.notifications?.error(`Aeria Core: не удалось создать макрос погоды: ${error.message}`);
    return null;
  }
}

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.rollUnnaturalWeather = (options = {}) => rollUnnaturalWeather(options);
  game.aeriya.ensureWeatherMacro = () => restoreWeatherMacro();
  if (!game.user?.isGM) return;
  const settingKey = "weatherMacroInstalledVersion";
  const current = `${game.modules.get(MODULE_ID)?.version ?? "unknown"}:${WEATHER_MACRO_SCHEMA}`;
  game.settings.register(MODULE_ID, settingKey, { name: "Aeria Core: версия макроса погоды", scope: "world", config: false, type: String, default: "" });
  window.setTimeout(async () => {
    const macro = await restoreWeatherMacro();
    if (macro) await game.settings.set(MODULE_ID, settingKey, current);
  }, 3000);
});
