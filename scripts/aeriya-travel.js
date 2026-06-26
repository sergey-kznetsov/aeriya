const AERIYA_TRAVEL_MODULE_ID = "aeriya";

const AERIYA_TRAVEL_STATES = Object.freeze(["норма", "напряжение", "кризис", "потеря"]);

const AERIYA_TRAVEL_RESOURCES = Object.freeze({
  supplies: "Припасы",
  gear: "Снаряжение",
  time: "Время",
  trust: "Доверие",
  water: "Вода",
  heat: "Тепло",
  perception: "Восприятие"
});

const AERIYA_TRAVEL_REGIONS = Object.freeze({
  sredinnye_zemli: {
    name: "Срединные Земли",
    shortName: "Срединные",
    primaryResource: "trust",
    pressure: "деньги, документы, репутация, чужие договоры и дорожные права",
    danger: "не сама природа, а люди, фракции, долги и сделки, которые были заключены раньше партии",
    checks: ["Мудрость (Выживание)", "Интеллект (Расследование)", "Харизма (Убеждение)", "Ловкость (Скрытность)", "Инструменты вора"],
    factions: ["Чёрный Караван", "Клинки Клятв", "Гильдия Пятого Зуба", "Ловчие", "Храм Последней Торговки", "Кровляные Черви"],
    supplies: [
      "припасы отсырели после ночного дождя и пахнут чужим погребом",
      "часть сухарей заменена дешёвой трухой с рынка",
      "на мешке появилась чужая складская печать",
      "крысы прогрызли нижний тюк, но оставили необычно ровный след",
      "вода из постоялого двора даёт металлический привкус"
    ],
    road: [
      "на обочине стоит телега без колёс; груз описан правильно, но владельца рядом нет",
      "старый указатель перебит новой доской, и обе дороги выглядят недавно использованными",
      "навстречу идёт хромой торговец без груза и просит не спрашивать, где его люди",
      "у моста висит свежая табличка с пошлиной, но печать города на ней поддельная",
      "на дороге лежит кошель с медяками и запиской: «верни до заката»"
    ],
    camp: [
      "ночью у костра появляется возчик и предлагает сведения вместо еды",
      "утром в одной суме всё аккуратно переложено; ничего не пропало, но добавлен чужой ключ",
      "попутчик рассказывает байку, в которой слишком точно описывает будущий участок дороги",
      "два наёмника спорят, кому принадлежит право охраны этого тракта",
      "кто-то из местных не садится к огню, пока не увидит, как партия делит хлеб"
    ],
    narrow: [
      "застава требует проверить груз и называет документ, которого у партии быть не должно",
      "мост держится на честном слове, а обход проходит через земли должника",
      "на перекрёстке караван перекрыл дорогу до решения торгового спора",
      "брод проходим, но на другом берегу ждут люди, заранее знающие маршрут партии",
      "постоялый двор у единственного перевала закрыт на внутренний карантин"
    ],
    arrival: [
      "партия приходит вовремя, но её уже внесли в чужую долговую книгу",
      "городские ворота открыты, однако один из стражников явно узнаёт груз",
      "проводник отказывается брать плату и просит забыть его имя",
      "на рынке уже пересказывают версию событий, которой ещё не было",
      "одна из дорожных потерь оказывается входной ценой в новый квест"
    ]
  },
  pepelnaya_steppe: {
    name: "Пепельная Степь",
    shortName: "Степь",
    primaryResource: "water",
    pressure: "вода, чайный обычай, обо, проводники, буря и долг гостя",
    danger: "пепел забивается в еду, буря меняет дорогу, а нарушение обычая делает путь враждебным",
    checks: ["Мудрость (Выживание)", "Мудрость (Проницательность)", "Харизма (Убеждение)", "Интеллект (Религия)", "Инструменты травника"],
    factions: ["вайтулы", "степные проводники", "караванные матроны", "шаманы у обо", "Пепельные Лезвия", "разбойные всадники"],
    supplies: [
      "пепел попал в мешки и сделал часть еды сомнительной",
      "бурдюк протёрся о седло, вода уходит медленно и почти незаметно",
      "чайный котёл пахнет чужой травой; кто-то добавил её ночью",
      "корм для животных стал серым и горьким",
      "в одном мешке вместо сухарей обнаружена красная лента у обо"
    ],
    road: [
      "красная лента движется против ветра и указывает не туда, куда ведёт карта",
      "на пепле видны следы каравана, но ни один след не принадлежит животному",
      "у старого обо лежит свежая чаша с тёплым чаем",
      "проводник останавливается и требует сделать крюк без объяснений",
      "над горизонтом поднимается стена пепла, но местные птицы летят прямо в неё"
    ],
    camp: [
      "к костру приходит чужак и молча ждёт первую чашу",
      "ночью кто-то слышит в ветре собственную невысказанную мысль",
      "проводник отказывается есть, пока не проверит, кому партия отказала в помощи",
      "один из вьючных зверей стоит мордой к пустому месту и не двигается",
      "у костра вспоминают человека, которого никто из партии не знает, но все узнают имя"
    ],
    narrow: [
      "единственный проход знает старуха, которая просит не плату, а правильный ответ за чаем",
      "буря перекрывает прямой путь; можно ждать, идти за проводником или срезать по старой карте",
      "у обо лежит чужой груз, и местные считают, что брать его без дара нельзя",
      "разбойники предлагают мир на время Слепых Ветров",
      "трещина с тёплым воздухом подходит для ночлега, но рядом свежий погребальный пепел"
    ],
    arrival: [
      "стойбище встречает партию первой чашей, но вторую пока не наливает",
      "местный проводник уже знает, какой дар партия оставила или не оставила у обо",
      "пепельная буря принесла след партии раньше самих путников",
      "груз цел, но теперь считается связанным с местным долгом",
      "на краю стоянки звенит колокольчик без языка"
    ]
  },
  black_forest: {
    name: "Лес Чёрного Шёпота",
    shortName: "Лес",
    primaryResource: "gear",
    pressure: "влага, плесень, память, корни, голоса и доверие у костра",
    danger: "лес не спешит нападать; он портит вещи, сбивает время и проверяет границы путника",
    checks: ["Мудрость (Выживание)", "Мудрость (Восприятие)", "Интеллект (Природа)", "Мудрость (Проницательность)", "Спасбросок Мудрости"],
    factions: ["Стражи Тропы", "Культ Кровавого Корня", "отшельники", "Ловчие", "лесные друиды", "голоса умерших"],
    supplies: [
      "хлеб покрылся тонкой синей плесенью, хотя был сухим час назад",
      "ткань мешка проросла мелкими корешками",
      "мясо пахнет свежо, но на нём проступили чужие отпечатки пальцев",
      "фляга полна, но вода отражает небо, которого здесь не видно",
      "часть припасов стала мягкой и тёплой, будто дышит"
    ],
    road: [
      "тропа раздваивается, хотя на карте и по памяти она всегда была одна",
      "на ветке висит чужой мешок с едой; он сухой посреди сырого леса",
      "метки Стражей Тропы ведут в сторону голоса знакомого человека",
      "между деревьями виден старый привал партии, которого ещё не было",
      "грибы у дороги светятся в ритме шагов последнего идущего"
    ],
    camp: [
      "ночью кто-то зовёт персонажа по имени голосом близкого человека",
      "у костра появляется отшельник и просит оставить одну правду Лесу",
      "утром все помнят разговор по-разному",
      "один из мешков отодвинут от лагеря ровно на семь шагов",
      "дым костра стелется не вверх, а к корням ближайшего дерева"
    ],
    narrow: [
      "туман закрывает тропу; можно ждать, идти по меткам или отвечать голосам",
      "мост из корней держит только тех, кто идёт без оружия в руках",
      "Стражи Тропы требуют доказать, что партия не несёт в Лес чужую войну",
      "корни закрыли проход и открываются только после малого дара",
      "болотная низина проходима, если оставить часть груза как приманку"
    ],
    arrival: [
      "партия выходит к цели, но один участник не уверен, сколько дней прошло",
      "лагерь уже знает имена путников",
      "снаряжение цело, но на ремнях появились узлы, которых никто не вязал",
      "на месте назначения лежит мешок, потерянный в начале пути",
      "Лес не взял плату сразу, но ясно дал понять, что помнит долг"
    ]
  },
  ice_border: {
    name: "Ледяной Предел",
    shortName: "Предел",
    primaryResource: "heat",
    pressure: "тепло, топливо, честный отчёт о запасах и взаимопомощь",
    danger: "холод убивает прямо, а ложь о запасах убивает всю группу",
    checks: ["Мудрость (Выживание)", "Телосложение (спасбросок)", "Сила (Атлетика)", "Интеллект (Природа)", "Инструменты кузнеца или плотника"],
    factions: ["Ледяная Стража", "клан Синих Языков", "Белое Пламя", "Цепные Псы", "ледокопы", "пограничные проводники"],
    supplies: [
      "еда промёрзла так, что её нельзя есть без огня",
      "масло загустело и стало бесполезным до прогрева",
      "одна связка дров исчезла с края лагеря",
      "фляги замёрзли; воду придётся топить, тратя топливо",
      "верёвки задубели и могут лопнуть при рывке"
    ],
    road: [
      "на льду видна трещина, которая повторяет форму старой карты",
      "далеко слышен крик, хотя вокруг белый штиль",
      "у дороги стоит замёрзший костёр, не покрытый снегом",
      "проводник требует пересчитать тепло и еду вслух",
      "под ногами проходит низкий звук, будто двигается гора"
    ],
    camp: [
      "путник просит место у огня и ничего не предлагает взамен",
      "один из персонажей просыпается от мысли, что ему совсем не холодно",
      "дозорный видит в сиянии имя человека, которого партия не похоронила",
      "кто-то тайно берёт лишнее тепло и оставляет другого на краю костра",
      "на снегу появляются следы вокруг лагеря, но ни один не подходит к нему"
    ],
    narrow: [
      "ледяной мост выдержит только половину груза за один проход",
      "буря требует молчания, иначе воздух и снег режут лёгкие",
      "Ледяная Стража не пустит дальше без честного отчёта о запасах",
      "трещина расширяется; можно бросить груз, тратить верёвки или идти в обход",
      "единственное укрытие занято другой группой, у которой не хватает топлива"
    ],
    arrival: [
      "партия приходит к теплу, но должна назвать, чем делилась в дороге",
      "груз цел, зато топливо почти на нуле",
      "проводник уважает партию или больше никогда не поведёт её по льду",
      "на воротах уже знают, кто отказал кому у костра",
      "лёд сохранил след ошибки и может вернуть его позднее"
    ]
  },
  scorched_wastes: {
    name: "Выжженные пустоши",
    shortName: "Пустоши",
    primaryResource: "water",
    pressure: "вода, тень, режим ночного хода, перегрев и цена каждого оазиса",
    danger: "жара не спорит и не торгуется; она просто сокращает запас решений",
    checks: ["Мудрость (Выживание)", "Телосложение (спасбросок)", "Интеллект (Природа)", "Харизма (Убеждение)", "Инструменты навигатора"],
    factions: ["Свободные Капли", "водоносы", "Песчаные Братья", "Белезные Пилигримы", "Солегрызы", "Цепные Псы Солнца"],
    supplies: [
      "вода убывает быстрее расчёта; одна фляга была плохо закрыта",
      "еда высохла до камня и требует воды для употребления",
      "кожаный бурдюк перегрелся и даёт горький привкус",
      "корм для животных испорчен песком",
      "часть груза нагрелась так, что её нельзя трогать голыми руками"
    ],
    road: [
      "вдали виден оазис, которого нет на карте",
      "стеклянный кактус указывает на старый маршрут, но его недавно срезали",
      "на песке лежит фляга с водой и знаком чужой фракции",
      "ночной путь пересекает след небесного плота",
      "проводник предлагает остановиться до жары, хотя до цели осталось немного"
    ],
    camp: [
      "к тени лагеря подходит человек и просит только первый глоток",
      "ночью кто-то пересчитывает фляги не тем порядком, как партия",
      "водонос предлагает сделку, которую нельзя проверить до следующего оазиса",
      "песок стучит по стенке палатки изнутри",
      "у одного персонажа начинается уверенность, что пить больше не нужно"
    ],
    narrow: [
      "единственный колодец контролирует группа, требующая услугу вместо монет",
      "день наступает раньше расчёта; нужно выбирать между переходом и укрытием",
      "песчаная буря меняет дюны и стирает ориентиры",
      "караван просит воды, но его груз явно опасен",
      "оазис отравлен или только выглядит отравленным"
    ],
    arrival: [
      "партия доходит до воды, но теперь должна объяснить, кому отказала в пути",
      "часть груза пережила жару, но стала предметом спора",
      "местные уважают соблюдение ночного хода или считают партию безумцами",
      "след песка в вещах указывает на скрытого попутчика",
      "цена воды в месте прибытия изменилась до прихода партии"
    ]
  },
  salt_desert: {
    name: "Соляные пустыни",
    shortName: "Соль",
    primaryResource: "perception",
    pressure: "зрение, кожа, соляная взвесь, миражи, чистота воды и проверка каждого шага",
    danger: "ошибка восприятия здесь опаснее злого умысла",
    checks: ["Мудрость (Восприятие)", "Мудрость (Выживание)", "Интеллект (Природа)", "Телосложение (спасбросок)", "Инструменты навигатора"],
    factions: ["Солегрызы Белого Лабиринта", "Хранители Пещер", "исследователи Глаза", "Соляные Стражи", "Белезные Пилигримы", "Дети огня"],
    supplies: [
      "вода загрязнена солью и требует фильтрации",
      "еда пересолена соляной взвесью и вызывает сильную жажду",
      "кожа бурдюка потрескалась от соли",
      "очки и защитные ткани покрыты белым налётом",
      "мешок кажется тяжёлым, но внутри только соль и старая записка"
    ],
    road: [
      "вдали стоит человек, которого один из персонажей точно знает",
      "белая поверхность выглядит твёрдой, но шест уходит в неё без звука",
      "на соляной корке отпечатаны следы будущего каравана",
      "мираж показывает склад припасов, слишком удобный, чтобы быть правдой",
      "красный пульс на горизонте сбивает счёт времени"
    ],
    camp: [
      "ночью соль хрустит вокруг лагеря, хотя никто не подходит",
      "один попутчик просит не звать мираж по имени",
      "у костра появляется спор: было ли найденное водой или отражением",
      "партия слышит капли, падающие в сухую чашу",
      "на ресницах спящего выступает соль, хотя он не плакал"
    ],
    narrow: [
      "путь проходит через тонкую корку; нужен шест, верёвки или проводник",
      "Соляной Страж стоит на маршруте и реагирует не на оружие, а на груз",
      "ветер поднимает взвесь, и видимость падает до нескольких шагов",
      "единственный безопасный обход ведёт мимо миража знакомого человека",
      "партия должна решить, какая вода настоящая, пока жажда усиливается"
    ],
    arrival: [
      "партия приходит с целым грузом, но не все уверены, что цель была именно здесь",
      "соль на вещах сложилась в знак или карту",
      "местные оценивают не скорость, а то, сколько раз партия проверяла шаг",
      "мираж, проигнорированный в пути, появляется у ворот",
      "одна фляга отражает не лицо владельца, а красный свет Глаза"
    ]
  },
  zavyaz_roads: {
    name: "Межосколочные дороги Завязи",
    shortName: "Завязь",
    primaryResource: "time",
    pressure: "логика расстояния, временные сбои, аномалии груза и нити между Осколками",
    danger: "здесь опасна не дорога, а уверенность, что дорога обязана вести прямо",
    checks: ["Интеллект (Аркана)", "Мудрость (Выживание)", "Мудрость (Проницательность)", "Харизма (Выступление)", "Спасбросок Мудрости"],
    factions: ["Чёрный Караван", "мастера маршрута", "культы Извне", "проводники Завязи", "архивисты", "охотники за аномалиями"],
    supplies: [
      "хлеб зачерствел за час, а мясо осталось свежим после нескольких дней",
      "в мешке появилась вещь, которой партия не брала",
      "вода отражает чужое небо",
      "часть груза стала легче, но тень от него тяжелее",
      "на припасах проступила дата, которая ещё не наступила"
    ],
    road: [
      "дорога делает петлю вокруг события, которого ещё не было",
      "указатель показывает не место, а имя человека",
      "караван идёт навстречу и утверждает, что уже видел партию завтра",
      "камень у дороги висит на высоте ладони и медленно стареет",
      "голос из пустоты предлагает короткий путь за простое обещание"
    ],
    camp: [
      "ночью у костра три тени от одного человека",
      "кто-то просыпается до того, как уснул",
      "попутчик рассказывает точный итог разговора, который начнётся через час",
      "один мешок оказывается мокрым от дождя другого Осколка",
      "у костра появляется пустое место, которое все обходят по привычке"
    ],
    narrow: [
      "переход держится, пока никто не называет настоящую цель маршрута",
      "мост из света требует оставить одно решение незавершённым",
      "тропа расходится на три версии одного и того же дня",
      "проводник говорит, что часть груза должна прибыть раньше партии",
      "аномалия пропускает только тех, кто признаёт ошибку пути"
    ],
    arrival: [
      "партия приходит, но один дорожный день отсутствует в памяти",
      "груз доставлен, хотя его часть уже была здесь",
      "место прибытия слегка не совпадает с описанием карты",
      "кто-то из встречающих знает итог пути раньше рассказа",
      "Завязь оставляет знак, который можно использовать в следующем переходе"
    ]
  }
});

const AERIYA_TRAVEL_ENCOUNTER_TYPES = Object.freeze([
  "След угрозы",
  "Нуждающийся",
  "Местный закон",
  "Порча припасов",
  "Малый хищник",
  "Фракция",
  "Примета",
  "Препятствие",
  "Возможность",
  "Чужой конфликт",
  "Аномалия Разлома",
  "Тихая сцена"
]);

const AERIYA_TRAVEL_TONES = Object.freeze([
  "враждебно",
  "настороженно",
  "нейтрально",
  "нуждается в помощи",
  "предлагает сделку",
  "скрывает правду"
]);

class AeriyaTravelRandom {
  static id() {
    return Math.random().toString(36).slice(2, 8);
  }

  static die(sides = 6) {
    return Math.floor(Math.random() * sides) + 1;
  }

  static pick(list = []) {
    if (!Array.isArray(list) || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  static clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  static sample(list = [], count = 1) {
    const pool = [...list];
    const result = [];
    while (pool.length > 0 && result.length < count) {
      const index = Math.floor(Math.random() * pool.length);
      result.push(pool.splice(index, 1)[0]);
    }
    return result;
  }
}

class AeriyaTravelGenerator {
  static get regions() {
    return AERIYA_TRAVEL_REGIONS;
  }

  static getRegion(regionId) {
    return AERIYA_TRAVEL_REGIONS[regionId] ?? AERIYA_TRAVEL_REGIONS.sredinnye_zemli;
  }

  static normalizeInput(input = {}) {
    return {
      from: String(input.from || "точка А").trim() || "точка А",
      to: String(input.to || "точка Б").trim() || "точка Б",
      purpose: String(input.purpose || "добраться до цели").trim() || "добраться до цели",
      cargo: String(input.cargo || "обычный дорожный груз").trim() || "обычный дорожный груз",
      regionId: input.region || "sredinnye_zemli",
      days: AeriyaTravelRandom.clamp(Number(input.days || 3), 1, 30),
      danger: AeriyaTravelRandom.clamp(Number(input.danger || 2), 1, 4),
      secrecy: input.secrecy === "on" || input.secrecy === true,
      deadline: input.deadline === "on" || input.deadline === true,
      dangerousCargo: input.dangerousCargo === "on" || input.dangerousCargo === true
    };
  }

  static generateJourney(input = {}) {
    const data = this.normalizeInput(input);
    const region = this.getRegion(data.regionId);
    const roadDice = Array.from({ length: data.days }, () => AeriyaTravelRandom.die(6));
    const complications = roadDice.filter((die) => die <= data.danger).length;
    const nodeCount = AeriyaTravelRandom.clamp(Math.ceil(data.days / 2) + 2, 3, 5);
    const pattern = ["road", "camp", "road", "narrow", "arrival"];
    const nodes = Array.from({ length: nodeCount }, (_, index) => this.buildNode(pattern[index] ?? "road", region, data, index + 1));
    const resources = this.buildResources(region, data, complications);
    const supplyIssue = this.generateSupplyIssue(data.regionId, data);
    const encounter = this.generateEncounter(data.regionId, data);
    const travelCost = this.buildTravelCost(region, data, complications);

    return {
      id: AeriyaTravelRandom.id(),
      createdAt: new Date().toISOString(),
      from: data.from,
      to: data.to,
      purpose: data.purpose,
      cargo: data.cargo,
      regionId: data.regionId,
      regionName: region.name,
      days: data.days,
      danger: data.danger,
      dangerLabel: this.dangerLabel(data.danger),
      roadDice,
      complications,
      pressure: region.pressure,
      dangerText: region.danger,
      resources,
      nodes,
      supplyIssue,
      encounter,
      travelCost,
      gmHint: this.buildGmHint(region, data, complications)
    };
  }

  static buildNode(type, region, data, number) {
    const titles = {
      road: "Дорога",
      camp: "Привал",
      narrow: "Узкое место",
      arrival: "Прибытие"
    };
    const banks = {
      road: region.road,
      camp: region.camp,
      narrow: region.narrow,
      arrival: region.arrival
    };
    const pressureResource = this.pickPressureResource(region, data);
    const check = AeriyaTravelRandom.pick(region.checks);
    const situation = AeriyaTravelRandom.pick(banks[type] ?? region.road);
    const choices = this.buildChoices(type, pressureResource, region);

    return {
      number,
      type,
      title: titles[type] ?? "Дорога",
      situation,
      check,
      pressureResource,
      pressureLabel: AERIYA_TRAVEL_RESOURCES[pressureResource] ?? pressureResource,
      choices,
      fail: this.failConsequence(pressureResource, region),
      success: this.successConsequence(type, region)
    };
  }

  static buildChoices(type, resource, region) {
    const base = {
      road: [
        "идти дальше и не тратить время",
        "остановиться, изучить следы и рискнуть задержкой",
        "спросить местного, проводника или духа дороги"
      ],
      camp: [
        "поставить безопасный лагерь и потратить ресурс",
        "разделить дозоры и проверить припасы",
        "вступить в разговор, даже если это создаёт долг"
      ],
      narrow: [
        "заплатить или отдать часть груза",
        "договориться через обычай региона",
        "обойти, пробиться или рискнуть коротким путём"
      ],
      arrival: [
        "сразу войти в локацию и принять последствия дороги",
        "сначала привести себя и груз в порядок",
        "проверить, кто уже знает о прибытии партии"
      ]
    };

    const regional = `учесть давление региона: ${region.pressure}`;
    const resourceChoice = `защитить ресурс «${AERIYA_TRAVEL_RESOURCES[resource] ?? resource}» ценой времени или услуги`;

    return [...(base[type] ?? base.road), regional, resourceChoice];
  }

  static buildResources(region, data, complications) {
    const keys = ["supplies", "gear", "time", "trust"];
    if (region.primaryResource && !keys.includes(region.primaryResource)) keys.push(region.primaryResource);

    return keys.map((key) => {
      const base = key === region.primaryResource ? 1 : 0;
      const deadlinePressure = key === "time" && data.deadline ? 1 : 0;
      const cargoPressure = key === "gear" && data.dangerousCargo ? 1 : 0;
      const secrecyPressure = key === "trust" && data.secrecy ? 1 : 0;
      const index = AeriyaTravelRandom.clamp(base + Math.floor((data.danger + complications - 1) / 2) + deadlinePressure + cargoPressure + secrecyPressure - 1, 0, 3);
      return {
        key,
        label: AERIYA_TRAVEL_RESOURCES[key] ?? key,
        state: AERIYA_TRAVEL_STATES[index]
      };
    });
  }

  static pickPressureResource(region, data) {
    const pool = ["supplies", "gear", "time", "trust", region.primaryResource];
    if (data.deadline) pool.push("time", "time");
    if (data.dangerousCargo) pool.push("gear", "supplies");
    if (data.secrecy) pool.push("trust");
    return AeriyaTravelRandom.pick(pool.filter(Boolean));
  }

  static failConsequence(resource, region) {
    const label = AERIYA_TRAVEL_RESOURCES[resource] ?? resource;
    const options = [
      `состояние ресурса «${label}» ухудшается на один шаг`,
      `появляется долг перед силой региона: ${AeriyaTravelRandom.pick(region.factions)}`,
      "следующий узел получает дополнительное осложнение",
      "партия теряет время, а дорога получает право показать худшую цену",
      "груз или припасы переходят в состояние «сомнительное»"
    ];
    return AeriyaTravelRandom.pick(options);
  }

  static successConsequence(type, region) {
    const options = [
      "партия снижает цену пути или получает предупреждение о следующем узле",
      "мастер убирает один малый риск из следующей сцены",
      `местная сила замечает уважительное поведение партии: ${AeriyaTravelRandom.pick(region.factions)}`,
      "партия сохраняет ресурс без лишней траты",
      "дорога даёт полезную деталь: слух, след, короткий путь или слабое место препятствия"
    ];
    if (type === "arrival") options.push("партия приходит не просто живой, а с преимуществом в первой сцене локации");
    return AeriyaTravelRandom.pick(options);
  }

  static generateSupplyIssue(regionId, input = {}) {
    const data = this.normalizeInput({ region: regionId, ...input });
    const region = this.getRegion(regionId);
    const issue = AeriyaTravelRandom.pick(region.supplies);
    const table = [
      "часть припасов портится; можно спасти половину, если потратить время",
      "припасы становятся сомнительными; употребление требует спасбросок Телосложения",
      "груз повреждён, но может стать уликой или зацепкой",
      "еда или вода привлекает малую угрозу региона",
      "кто-то явно трогал сумки; пропажа неочевидна",
      "припасы можно использовать как приманку, плату или дар"
    ];

    return {
      title: "Осложнение припасов",
      regionName: region.name,
      issue,
      mechanicalEffect: AeriyaTravelRandom.pick(table),
      suggestedCheck: AeriyaTravelRandom.pick(region.checks),
      onSuccess: "припасы сохраняются или становятся пригодными после обработки",
      onFail: "ресурс «Припасы» ухудшается на один шаг, либо появляется отдельная сцена вокруг груза"
    };
  }

  static generateEncounter(regionId, input = {}) {
    const data = this.normalizeInput({ region: regionId, ...input });
    const region = this.getRegion(regionId);
    const typeRoll = AeriyaTravelRandom.die(12);
    const toneRoll = AeriyaTravelRandom.die(6);
    const type = AERIYA_TRAVEL_ENCOUNTER_TYPES[typeRoll - 1];
    const tone = AERIYA_TRAVEL_TONES[toneRoll - 1];
    const faction = AeriyaTravelRandom.pick(region.factions);
    const hook = this.encounterHook(type, tone, region, faction);

    return {
      title: "Случайная встреча",
      regionName: region.name,
      typeRoll,
      toneRoll,
      type,
      tone,
      faction,
      hook,
      choice: this.encounterChoice(type, region),
      consequence: this.encounterConsequence(type, tone, region)
    };
  }

  static encounterHook(type, tone, region, faction) {
    const hooks = {
      "След угрозы": `на дороге найден след, который указывает на ${faction}; ситуация выглядит ${tone}`,
      "Нуждающийся": `путник просит помощи, но его история связана с ${faction}; он настроен ${tone}`,
      "Местный закон": `региональное правило требует платы, дара, молчания или проверки; свидетелем выступает ${faction}`,
      "Порча припасов": AeriyaTravelRandom.pick(region.supplies),
      "Малый хищник": `малая угроза не нападает в лоб, а бьёт по слабому месту: груз, вода, животные или дозор`,
      "Фракция": `${faction} появляется на маршруте и ${tone === "скрывает правду" ? "явно скрывает цель" : `ведёт себя ${tone}`}`,
      "Примета": `появляется знак региона: ${AeriyaTravelRandom.pick(region.road)}`,
      "Препятствие": AeriyaTravelRandom.pick(region.narrow),
      "Возможность": `дорога предлагает выгоду: короткий путь, схрон, слух или союзника, но цена связана с ${region.pressure}`,
      "Чужой конфликт": `партия видит спор, погоню или сделку, где одна сторона связана с ${faction}`,
      "Аномалия Разлома": `пространство, время или память ведут себя неправильно; ${region.danger}`,
      "Тихая сцена": AeriyaTravelRandom.pick(region.camp)
    };
    return hooks[type] ?? AeriyaTravelRandom.pick(region.road);
  }

  static encounterChoice(type, region) {
    const choices = [
      "помочь и получить долг, слух или репутацию",
      "проигнорировать и сохранить ресурс, но усилить будущую угрозу",
      "торговаться и перевести сцену в социальный конфликт",
      "разведать осторожно и потратить время",
      "использовать обычай региона вместо грубой силы"
    ];
    if (type === "Порча припасов") choices.push("съесть, очистить, выбросить, продать, отдать или использовать как приманку");
    if (type === "Фракция") choices.push(`признать влияние фракции: ${AeriyaTravelRandom.pick(region.factions)}`);
    return AeriyaTravelRandom.pick(choices);
  }

  static encounterConsequence(type, tone, region) {
    const base = [
      "следующий узел становится легче, если партия вложилась в сцену",
      "следующий узел становится жёстче, если партия решила пройти мимо",
      "появляется NPC, который может вернуться позже",
      "меняется цена пути: ресурс, время, доверие или груз",
      `отношение местной силы меняется: ${AeriyaTravelRandom.pick(region.factions)}`
    ];
    if (tone === "враждебно") base.push("сцена может перейти в бой, погоню или засаду");
    if (tone === "предлагает сделку") base.push("партия может получить короткий путь ценой долга");
    if (type === "Аномалия Разлома") base.push("результат должен оставить странный след после прибытия");
    return AeriyaTravelRandom.pick(base);
  }

  static buildTravelCost(region, data, complications) {
    const costs = [];
    if (complications > 0) costs.push(`дорога создаёт ${complications} осложн. по дорожным костям`);
    if (data.deadline) costs.push("срок давит на решения: обходы и долгие привалы опасны");
    if (data.secrecy) costs.push("скрытность важнее скорости: лишние свидетели становятся риском");
    if (data.dangerousCargo) costs.push("опасный груз должен получить отдельную сцену проверки");
    costs.push(`региональное давление: ${region.pressure}`);
    return costs;
  }

  static buildGmHint(region, data, complications) {
    const severity = complications >= 3 ? "жёсткий" : complications >= 1 ? "напряжённый" : "контролируемый";
    return `Веди переход как ${severity}: партия почти наверняка дойдёт, но цена должна проявиться через ${region.pressure}. Не отнимай ресурсы молча — сначала показывай знак, потом давай выбор.`;
  }

  static dangerLabel(value) {
    return {
      1: "спокойный путь",
      2: "обычный риск",
      3: "опасный путь",
      4: "смертельно опасный путь"
    }[value] ?? "обычный риск";
  }

  static renderJourneyHtml(journey) {
    const resources = journey.resources.map((resource) => `<li><strong>${resource.label}:</strong> ${resource.state}</li>`).join("");
    const dice = journey.roadDice.map((die) => `<span class="aeriya-travel-die">d6: ${die}</span>`).join(" ");
    const costs = journey.travelCost.map((cost) => `<li>${cost}</li>`).join("");
    const nodes = journey.nodes.map((node) => `
      <article class="aeriya-travel-card">
        <h4>${node.number}. ${node.title}</h4>
        <p>${node.situation}</p>
        <p><strong>Проверка:</strong> ${node.check}</p>
        <p><strong>Давление:</strong> ${node.pressureLabel}</p>
        <p><strong>Варианты:</strong> ${node.choices.slice(0, 3).join("; ")}.</p>
        <p><strong>Успех:</strong> ${node.success}</p>
        <p><strong>Провал:</strong> ${node.fail}</p>
      </article>
    `).join("");

    return `
      <section class="aeriya-travel-output">
        <h2>Переход: ${journey.from} → ${journey.to}</h2>
        <p><strong>Регион:</strong> ${journey.regionName}. <strong>Длительность:</strong> ${journey.days} дн. <strong>Риск:</strong> ${journey.dangerLabel}.</p>
        <p><strong>Цель:</strong> ${journey.purpose}</p>
        <p><strong>Груз:</strong> ${journey.cargo}</p>
        <p><strong>Дорожные кости:</strong> ${dice}</p>
        <h3>Цена пути</h3>
        <ul>${resources}</ul>
        <ul>${costs}</ul>
        <h3>Узлы перехода</h3>
        ${nodes}
        <h3>Осложнение припасов</h3>
        ${this.renderSupplyHtml(journey.supplyIssue)}
        <h3>Случайная встреча</h3>
        ${this.renderEncounterHtml(journey.encounter)}
        <p class="aeriya-rules-note"><strong>Заметка мастера:</strong> ${journey.gmHint}</p>
      </section>
    `;
  }

  static renderSupplyHtml(issue) {
    return `
      <article class="aeriya-travel-card">
        <p><strong>Сцена:</strong> ${issue.issue}</p>
        <p><strong>Эффект:</strong> ${issue.mechanicalEffect}</p>
        <p><strong>Проверка:</strong> ${issue.suggestedCheck}</p>
        <p><strong>Успех:</strong> ${issue.onSuccess}</p>
        <p><strong>Провал:</strong> ${issue.onFail}</p>
      </article>
    `;
  }

  static renderEncounterHtml(encounter) {
    return `
      <article class="aeriya-travel-card">
        <p><strong>d12:</strong> ${encounter.typeRoll} — ${encounter.type}. <strong>d6:</strong> ${encounter.toneRoll} — ${encounter.tone}.</p>
        <p><strong>Крючок:</strong> ${encounter.hook}</p>
        <p><strong>Выбор:</strong> ${encounter.choice}</p>
        <p><strong>Последствие:</strong> ${encounter.consequence}</p>
      </article>
    `;
  }
}

class AeriyaTravelConsole extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeriya-travel-console",
      title: "Аэрия: консоль путешествия",
      template: "modules/aeriya/templates/travel-console.hbs",
      width: 760,
      height: "auto",
      resizable: true,
      classes: ["aeriya", "aeriya-travel-console"]
    });
  }

  getData() {
    return {
      regions: Object.entries(AERIYA_TRAVEL_REGIONS).map(([id, region]) => ({ id, name: region.name })),
      dangerOptions: [
        { value: 1, label: "1 — спокойный путь" },
        { value: 2, label: "2 — обычный риск" },
        { value: 3, label: "3 — опасный путь" },
        { value: 4, label: "4 — смертельно опасный путь" }
      ]
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-action='generate-journey']").on("click", async (event) => {
      event.preventDefault();
      const data = this._collectFormData(html);
      const journey = AeriyaTravelGenerator.generateJourney(data);
      await AeriyaTravelManager.setLastJourney(journey);
      this._setOutput(html, AeriyaTravelGenerator.renderJourneyHtml(journey));
    });

    html.find("[data-action='generate-encounter']").on("click", async (event) => {
      event.preventDefault();
      const data = this._collectFormData(html);
      const encounter = AeriyaTravelGenerator.generateEncounter(data.region, data);
      const htmlContent = `<section class="aeriya-travel-output"><h2>Случайная встреча: ${encounter.regionName}</h2>${AeriyaTravelGenerator.renderEncounterHtml(encounter)}</section>`;
      this._setOutput(html, htmlContent);
      await AeriyaTravelManager.postToGmChat(htmlContent);
    });

    html.find("[data-action='generate-supplies']").on("click", async (event) => {
      event.preventDefault();
      const data = this._collectFormData(html);
      const issue = AeriyaTravelGenerator.generateSupplyIssue(data.region, data);
      const htmlContent = `<section class="aeriya-travel-output"><h2>Осложнение припасов: ${issue.regionName}</h2>${AeriyaTravelGenerator.renderSupplyHtml(issue)}</section>`;
      this._setOutput(html, htmlContent);
      await AeriyaTravelManager.postToGmChat(htmlContent);
    });

    html.find("[data-action='post-chat']").on("click", async (event) => {
      event.preventDefault();
      const journey = await AeriyaTravelManager.getLastJourney();
      if (!journey) {
        ui.notifications?.warn("Сначала сгенерируй переход.");
        return;
      }
      await AeriyaTravelManager.postToGmChat(AeriyaTravelGenerator.renderJourneyHtml(journey));
    });

    html.find("[data-action='create-journal']").on("click", async (event) => {
      event.preventDefault();
      const journey = await AeriyaTravelManager.getLastJourney();
      if (!journey) {
        ui.notifications?.warn("Сначала сгенерируй переход.");
        return;
      }
      await AeriyaTravelManager.createJourneyJournal(journey);
    });
  }

  _collectFormData(html) {
    const root = html?.[0] ?? html;
    const form = root.querySelector("form");
    return Object.fromEntries(new FormData(form).entries());
  }

  _setOutput(html, content) {
    const root = html?.[0] ?? html;
    const output = root.querySelector("[data-aeriya-travel-output]");
    if (output) output.innerHTML = content;
  }
}

class AeriyaTravelManager {
  static app = null;

  static openConsole() {
    if (!game.user?.isGM) {
      ui.notifications?.warn("Консоль путешествий доступна только мастеру.");
      return null;
    }
    this.app ??= new AeriyaTravelConsole();
    this.app.render(true);
    return this.app;
  }

  static generateJourney(input = {}) {
    return AeriyaTravelGenerator.generateJourney(input);
  }

  static generateEncounter(regionId, input = {}) {
    return AeriyaTravelGenerator.generateEncounter(regionId, input);
  }

  static generateSupplyIssue(regionId, input = {}) {
    return AeriyaTravelGenerator.generateSupplyIssue(regionId, input);
  }

  static async setLastJourney(journey) {
    await game.settings.set(AERIYA_TRAVEL_MODULE_ID, "lastTravelJourney", journey);
    return journey;
  }

  static async getLastJourney() {
    return game.settings.get(AERIYA_TRAVEL_MODULE_ID, "lastTravelJourney");
  }

  static async postToGmChat(content) {
    const whisper = ChatMessage.getWhisperRecipients("GM").map((user) => user.id);
    return ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      whisper,
      content
    });
  }

  static async createJourneyJournal(journey) {
    const content = AeriyaTravelGenerator.renderJourneyHtml(journey);
    const entry = await JournalEntry.create({
      name: `Переход: ${journey.from} → ${journey.to}`,
      pages: [
        {
          name: `${journey.regionName}: ${journey.from} → ${journey.to}`,
          type: "text",
          text: {
            format: 1,
            content
          }
        }
      ]
    });
    ui.notifications?.info(`Создан журнал: ${entry.name}`);
    return entry;
  }

  static async ensureTravelMacro() {
    if (!game.user?.isGM) return null;
    const shouldCreate = game.settings.get(AERIYA_TRAVEL_MODULE_ID, "autoCreateTravelMacro");
    if (!shouldCreate) return null;

    const existing = game.macros?.find((macro) => macro.name === "Аэрия: Консоль путешествия");
    if (existing) return existing;

    return Macro.create({
      name: "Аэрия: Консоль путешествия",
      type: "script",
      img: "icons/svg/road.svg",
      command: "game.aeriya.travel.openConsole();"
    });
  }
}

function registerTravelSceneControl(controls) {
  if (!game.user?.isGM) return;

  const button = {
    name: "aeriya-travel-console",
    title: "Аэрия: путешествие",
    icon: "fas fa-route",
    button: true,
    onClick: () => AeriyaTravelManager.openConsole()
  };

  if (Array.isArray(controls)) {
    const target = controls.find((control) => control.name === "token") ?? controls[0];
    if (target?.tools && !target.tools.some((tool) => tool.name === button.name)) {
      target.tools.push(button);
    }
    return;
  }

  const target = controls?.tokens ?? controls?.token ?? Object.values(controls ?? {})[0];
  if (target?.tools && !target.tools[button.name]) {
    if (Array.isArray(target.tools)) target.tools.push(button);
    else target.tools[button.name] = button;
  }
}

Hooks.once("init", () => {
  game.settings.register(AERIYA_TRAVEL_MODULE_ID, "autoCreateTravelMacro", {
    name: "AEЯIA.Settings.AutoCreateTravelMacro.Name",
    hint: "AEЯIA.Settings.AutoCreateTravelMacro.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(AERIYA_TRAVEL_MODULE_ID, "lastTravelJourney", {
    scope: "world",
    config: false,
    type: Object,
    default: null
  });

  game.aeriya = game.aeriya ?? { MODULE_ID: AERIYA_TRAVEL_MODULE_ID };
  game.aeriya.travel = AeriyaTravelManager;
  game.aeriya.travelGenerator = AeriyaTravelGenerator;
});

Hooks.once("ready", async () => {
  await AeriyaTravelManager.ensureTravelMacro();
});

Hooks.on("getSceneControlButtons", registerTravelSceneControl);
