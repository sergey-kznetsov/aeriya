/** Aeria Core — External Bestiary Importer v0.3.7 */
const MODULE_ID = "aeriya";
const EXTERNAL_BESTIARY_SCHEMA = "external-bestiary-v1";
const DEFAULT_ACTOR_IMAGE = "icons/svg/monster.svg";

const RAW = `ЭНОА|Додор|1|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Мракоглаз|1|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Сакир|1|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Сарлаг|1|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Гоксар|2|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Мракоглаз Охотник|2|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Сарлаг Старший|2|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Тохар|2|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Бунти|3|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Мракоглаз Наблюдатель|3|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Муда|3|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Сарлаг Искажённый|3|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Луноликие|4|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Нинавеш|4|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Пцап|4|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Шатах|4|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Бату|5|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Падальщики ночи|5|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Самагхи|5|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Шатах Древний|5|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Зверь без тени|6|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Самагхи Пожиратель|6|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Теммулен|6|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Шатах Проклятый|6|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Самагхи Сновидец|7|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Слуга знамений|7|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Тарбаш|7|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Хондор|7|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Долгун|8|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Кзай’ти|8|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Песчаный охотник|8|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Тарбаш Искры|8|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Голос ветра|9|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Кайлан|9|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Тарбаш Разрушенный|9|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Шил’этэ|9|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Ай’эрги|10|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Багжын|10|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Гайкуэнрелл|10|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Багжын Буря|11|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Дхадулсар|11|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Нару-Туу|11|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Айур|12|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Багжын Страж|12|monstrosity|региональная угроза|ЭНОА|-
ЭНОА|Тэнсар|12|monstrosity|региональная угроза|ЭНОА|-
Ведьмак|Накер|1/8|fey|ведьмачье чудовище|Ведьмак|-
Ведьмак|Утопец|1/8|undead|ведьмачье чудовище|Ведьмак|-
Ведьмак|Альгуль|1|undead|ведьмачье чудовище|Ведьмак|-
Ведьмак|Гнилец|1|monstrosity|ведьмачье чудовище|Ведьмак|-
Ведьмак|Гуль|1|undead|ведьмачье чудовище|Ведьмак|-
Ведьмак|Драугир|1|undead|ведьмачье чудовище|Ведьмак|-
Ведьмак|Накер воин|1|fey|ведьмачье чудовище|Ведьмак|-
Ведьмак|Пиявка|1|monstrosity|ведьмачье чудовище|Ведьмак|-
Ведьмак|Сколопендроморф|1|monstrosity|ведьмачье чудовище|Ведьмак|-
Ведьмак|Стрыга|1|undead|ведьмачье чудовище|Ведьмак|-
Ведьмак|Пожиратель|3|undead|ведьмачье чудовище|Ведьмак|-
Ведьмак|Падальщик|5|undead|ведьмачье чудовище|Ведьмак|-
Ведьмак|Куролиск|8|monstrosity|ведьмачье чудовище|Ведьмак|-
Ведьмак|Химера|8|monstrosity|ведьмачье чудовище|Ведьмак|-
Ведьмак|Археспора|12|plant|ведьмачье чудовище|Ведьмак|-
Ведьмак|Леший|14|monstrosity|ведьмачье чудовище|Ведьмак|-
Ведьмак|Леший древний|20|monstrosity|ведьмачье чудовище|Ведьмак|-
ТПК|Энокитаке|5|plant|Бестия|Энокитаке|-
ТПК|Вирмлинг коричневого дракона|6|dragon|Бестия|Коричневые драконы|-
ТПК|Вирмлинг имперского дракона|8|dragon|Штурмовик|Имперские драконы|-
ТПК|Блуждающий смертоносец|10|plant|Штурмовик|Демонические растения|-
ТПК|Галлиевая слизь|10|ooze|Бестия|Металлические слизи|-
ТПК|Искривляющая ненависть|10|ooze|Скрытник|Малеофаги|-
ТПК|Легендарный тигр|10|beast|Бестия|Легендарные звери|L
ТПК|Полосатая гадюка агонии|10|beast|Скрытник|Гадюки-убийцы|-
ТПК|Благословленные рекой|11|humanoid|Лидер|Нартхенин|-
ТПК|Драконоподобная оса|11|monstrosity|Штурмовик|Драконоподобные насекомые|-
ТПК|Легендарный гигантский лось|11|beast|Бестия|Легендарные звери|L
ТПК|Ожившая Иллюзия|11|construct|Контролёр|Анимус Аркана|-
ТПК|Ожившая Некромания|11|construct|Контролёр|Анимус Аркана|-
ТПК|Ожившее Воплощение|11|construct|Контролёр|Анимус Аркана|-
ТПК|Ожившее Колдовство|11|construct|Контролёр|Анимус Аркана|-
ТПК|Ожившее Отречение|11|construct|Контролёр|Анимус Аркана|-
ТПК|Ожившее Очарование|11|construct|Контролер|Анимус Аркана|-
ТПК|Ожившее Предсказание|11|construct|Контролер|Анимус Аркана|-
ТПК|Ожившее Преобразование|11|construct|Контролёр|Анимус Аркана|-
ТПК|Глашатай Проклятия|12|humanoid|Элита|Глашатаи Истинной Речи|L
ТПК|Королевский певчий чаропряд|12|fey|Контролёр|Райские птицы|-
ТПК|Молодой коричневый дракон|12|dragon|Бестия|Коричневые драконы|-
ТПК|Осьмикула|12|monstrosity|Бестия|Отвратительные гибриды|-
ТПК|Роющий трапрот|12|plant|Скрытник|Демонические растения|-
ТПК|Смертница|12|ooze|Скрытник|Малеофаги|-
ТПК|Хадала-Лофи|12|fey|Контролёр|Хадала-Лафеда|-
ТПК|Щит божий|12|celestial|Солдат|Ангелы правосудия|-
ТПК|Глашатай Знаний|13|humanoid|Контролёр|Глашатаи Истинной Речи|-
ТПК|Глашатай Крови|13|humanoid|Лидер|Глашатаи Истинной Речи|-
ТПК|Дерево линча|13|plant|Бестия|Линчеватели|T
ТПК|Железноплодный терновник|13|plant|Артиллерия|Демонические растения|K
ТПК|Живой галеон|13|monstrosity|Скрытник|Исполинские мимики|T
ТПК|Проклятые солнцем|13|humanoid|Солдат|Нартхенин|-
ТПК|Феррофлегма|13|ooze|Штурмовик|Металлические слизи|-
ТПК|Возвышенное целомудрие|14|celestial|Лидер|Семь святых добродетелей|-
ТПК|Глашатай Разыменования|14|humanoid|Артиллерия|Глашатаи Истинной Речи|K
ТПК|Драконоподобный жук|14|monstrosity|Бестия|Драконоподобные насекомые|-
ТПК|Исказитель разума|14|ooze|Скрытник|Малеофаги|-
ТПК|Мечеклювый певец камней|14|fey|Контролёр|Райские птицы|-
ТПК|Нуль-прилив|14|aberration|Контролёр|Рожденные в пустоте|-
ТПК|Ракшаса Андхере|14|fiend|Скрытник|Ракшасы Арья|-
ТПК|Хадала-Левинос|14|fey|Бестия|Хадала-Лафеда|-
ТПК|Изумрудная теневая мамба|15|beast|Штурмовик|Гадюки-убийцы|L
ТПК|Кислотная ива|15|plant|Артиллерия|Демонические растения|-
ТПК|Молодой имперский дракон|15|dragon|Штурмовик|Имперские драконы|-
ТПК|Молот Божий|15|celestial|Бестия|Ангелы правосудия|-
ТПК|Ракшаса Йоддха|15|fiend|Бестия|Ракшасы Арья|K
ТПК|Шепот запределья|15|aberration|Контролёр|Падшие запределья|-
ТПК|Глаза, которые кусают|16|aberration|Бестия|Рожденные в пустоте|-
ТПК|Живой замок|16|monstrosity|Скрытник|Исполинские мимики|T
ТПК|Мучитель запределья|16|aberration|Бестия|Падшие запределья|-
ТПК|Остайя|16|plant|Бестия|Энокитаке|LK
ТПК|Слейпнирский пегас|16|celestial|-|Валькирии|-
ТПК|Дева щита|17|celestial|Солдат|Валькирии|-
ТПК|Золотая императорская Лирохвостка|17|fey|Контролёр|Райские птицы|LK
ТПК|Истязатель душ|17|aberration|Скрытник|Падшие запределья|-
ТПК|Легендарный Тираннозавр Рекс|17|beast|Бестия|Легендарные звери|LK
ТПК|Ледяной архонт|17|elemental|Солдат|Элементальные архонты|-
ТПК|Предвестник Голода|17|undead|Контролёр|Драгуны Апокалипсиса|-
ТПК|Ракшаса Хаддион|17|fiend|Артиллерия|Ракшасы Арья|-
ТПК|Эбеновый пиромант|17|humanoid|Контролёр|Нартхенин|K
ТПК|Архонт земли|18|elemental|Бестия|Элементальные архонты|-
ТПК|Взрослый коричневый дракон|18|dragon|Бестия|Коричневые драконы|L
ТПК|Душевная гниль|18|ooze|Скрытник|Малеофаги|K
ТПК|Кулак Божий|18|celestial|Штурмовик|Ангелы правосудия|K
ТПК|Обличитель запределья|18|aberration|Артиллерия|Падшие запределья|LK
ТПК|Повелитель удачи (Ахд Моар)|18|fey|Контролёр|Первобытные Фей|-
ТПК|Старший Линчеватель|18|plant|Бестия|Линчеватели|T
ТПК|Стая потерянных душ|18|aberration|Штурмовик|Рожденные в пустоте|K
ТПК|Хадала-Медуза|18|fey|Контролер|Хадала-Лафеда|K
ТПК|Шлаковая слизь|18|ooze|Бестия|Металлические слизи|LK
ТПК|Благодатное смирение|19|celestial|Штурмовик|Семь святых добродетелей|K
ТПК|Видящая Судьбы|19|celestial|Артиллерия|Валькирии|-
ТПК|Драконоподобный паук|19|monstrosity|Скрытник|Драконоподобные насекомые|L
ТПК|Живая башня мага|19|monstrosity|Артиллерия|Исполинские мимики|TK
ТПК|Огненный архонт|19|elemental|Бестия|Элементальные архонты|-
ТПК|Предвестник войны|19|undead|Бестия|Драгуны Апокалипсиса|-
ТПК|Акулопитораптопаукосьмипаха|20|monstrosity|Бестия|Отвратительные гибриды|-
ТПК|Кобра цареубийца|20|beast|Скрытник|Гадюки-убийцы|K
ТПК|Скульптор времени (Тасей-Ам)|20|fey|Контролёр|Первобытные феи|-
ТПК|Архонт молний|21|elemental|Штурмовик|Элементальные архонты|K
ТПК|Взрослый имперский дракон|21|dragon|Элита|Имперские драконы|L
ТПК|Древний фейский дракон|21|fey|Штурмовик|Первобытные Фей|LK
ТПК|Предвестник чумы|21|undead|Артиллерия|Драгуны Апокалипсиса|-
ТПК|Первозданный громовержец|22|giant|Элита|Первозданные разрушители|LT
ТПК|Парный лич|23|undead|Артиллерия|Великие личи|-
ТПК|Предвестник Смерти|23|undead|Элита|Драгуны Апокалипсиса|LK
ТПК|Королева войны Брунгильда|24|celestial|Элита|Валькирии|LK
ТПК|Демидраколич|25|undead|Артиллерия|Великие личи|LK
ТПК|Древний коричневый дракон|25|dragon|Бестия|Коричневые драконы|LK
ТПК|Испепелитель|26|giant|Элита|Первозданные разрушители|LT
ТПК|Драконоподобная сороконожка|27|monstrosity|Бестия|Драконоподобные насекомые|LK
ТПК|Древний имперский дракон|27|dragon|Элита|Имперские драконы|LK
ТПК|Лич-Лорд|27|undead|Элита|Великие личи|L
ТПК|Непреклонное усердие|28|celestial|Артиллерия|Семь святых добродетелей|-
ТПК|Палач кровавой коры|28|plant|Элита|Линчеватели|LTK
ТПК|Живая буря заклинаний|29|construct|Элита|Анимус Аркана|LK
ТПК|Вечный лич|30|undead|Бестия|Великие личи|L
ТПК|Первозданный разрушитель миров|30|giant|Элита|Первозданные разрушители|LTK`;

const _folderCache = new Map();
const FOLDER_BY_SOURCE = { "ЭНОА": "ЭНОА", "Ведьмак": "Ведьмак", "ТПК": "Тотальное убийство партии" };
function splitRows(){return RAW.trim().split("\n").map(line=>{const [src,name,cr,type,role,group,flags="-"]=line.split("|");return {src,name,cr,type,role,group,flags};});}
function slugify(v){return String(v||"actor").toLowerCase().replace(/ё/g,"е").replace(/[’'`]/g,"").replace(/[^a-z0-9а-яе]+/giu,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")||"actor";}
function crNumber(raw){const s=String(raw||"0").trim();if(s.includes("/")){const [a,b]=s.split("/").map(Number);return b?a/b:0;}const n=parseFloat(s.replace(",","."));return Number.isFinite(n)?n:0;}
function pb(cr){const c=crNumber(cr);return c<=4?2:Math.min(9,2+Math.ceil((c-4)/4));}
function mod(score){return Math.floor((Number(score||10)-10)/2);}
function enoaAbilities(c){return [10+c,10+Math.floor(c/2),10+c,7+Math.ceil(c/2),10+Math.floor(c/2),7+Math.ceil(c/2)].map(v=>Math.min(30,Math.max(1,v)));}
function genericAbilities(r){const c=crNumber(r.cr);if(r.src==="ЭНОА")return enoaAbilities(Math.max(1,Math.round(c)));const base=10+Math.min(12,Math.floor(c/2));let a={str:base,dex:base-2,con:base,int:10,wis:12,cha:10};const t=r.type, role=r.role;if(t==="dragon"||t==="giant"){a.str=base+4;a.con=base+3;a.cha=base;}if(t==="beast"||role.includes("Скрыт")||role.includes("Штурм")){a.dex=base+3;}if(t==="construct"||t==="ooze"||t==="plant"){a.con=base+4;}if(role.includes("Контрол")||role.includes("Артил")){a.int=Math.max(a.int,base+2);a.wis=Math.max(a.wis,base+1);}if(role.includes("Лидер")||role.includes("Элита")){a.cha=Math.max(a.cha,base+2);a.wis=Math.max(a.wis,base+1);}return [a.str,a.dex,a.con,a.int,a.wis,a.cha].map(v=>Math.min(30,Math.max(1,Math.round(v))));}
function acFor(r){const c=crNumber(r.cr);if(r.src==="ЭНОА")return 12+Math.round(c);return Math.min(26,13+Math.floor(c/3)+(r.role.includes("Солдат")||r.role.includes("Элита")?1:0));}
function hpFor(r){const c=crNumber(r.cr);if(r.src==="ЭНОА")return Math.max(1,Math.round(c*30));if(r.src==="Ведьмак")return Math.max(7,Math.round(25+c*18));return Math.round(45+c*24+(r.flags.includes("T")?80:0)+(r.flags.includes("K")?25:0));}
function sizeFor(r){const c=crNumber(r.cr);if(r.flags.includes("T"))return "grg";if(c>=18)return "huge";if(c>=12)return "lg";return "med";}
function sourceText(r){if(r.src==="ЭНОА")return "Бестиарий ЭНОА, версия 8";if(r.src==="Ведьмак")return "Бестиарий мира Ведьмак для DnD 5";return "Тотальное убийство партии. Бестиарий часть 1";}
function speedFor(r){if(r.type==="dragon"||r.type==="celestial"||r.type==="fey"||r.role.includes("Штурм")||r.role.includes("Артил"))return "30 фт, полёт 60 фт";return "30 фт";}
function movement(t){const m={walk:30,swim:0,fly:0,climb:0,burrow:0,units:"ft",special:t};const fly=t.match(/пол[её]т\s*(\d+)/i);if(fly)m.fly=parseInt(fly[1],10);return m;}
function dmg(cr){const c=Math.max(1,crNumber(cr));if(c<2)return["1d6+2","bludgeoning",5];if(c<5)return["2d6+3","bludgeoning",10];if(c<9)return["2d8+4","slashing",13];if(c<13)return["3d8+5","slashing",18];if(c<17)return["4d8+6","force",24];if(c<21)return["5d10+7","force",34];if(c<25)return["6d10+8","force",41];if(c<29)return["8d10+9","force",53];return["10d10+10","force",65];}
function attackBonus(r,a){return pb(r.cr)+Math.max(mod(a[0]),mod(a[1]),1);}
function dc(r,a){return 8+pb(r.cr)+Math.max(mod(a[2]),mod(a[4]),mod(a[5]),1);}
async function getOrCreateFolder(type,path){const key=`${type}::${path}`;if(_folderCache.has(key))return _folderCache.get(key);let parent=null;for(const part of path.split(/\s*\/\s*/).filter(Boolean)){const existing=game.folders.find(f=>f.type===type&&f.name===part&&(f.folder?.id??null)===(parent?.id??null));parent=existing??await Folder.create({name:part,type,folder:parent?.id??null,sorting:"a"});}_folderCache.set(key,parent);return parent;}
function biography(r){const labels=[];if(r.flags.includes("L"))labels.push("легендарный");if(r.flags.includes("T"))labels.push("титан");if(r.flags.includes("K"))labels.push("убийца партии");const tags=labels.length?`<p><strong>Метки:</strong> ${labels.join(", ")}</p>`:"";return `<div class="aeriya-content"><h2>${r.name}</h2><p><strong>Источник:</strong> ${sourceText(r)}</p><p><strong>Группа:</strong> ${r.group}. <strong>Роль:</strong> ${r.role}.</p>${tags}<p>Actor-ready перенос: КО, КД, хиты, характеристики, тип, размер, токен и боевые действия заполнены структурно.</p></div>`;}
function itemsFor(r,a){const [formula,dtype,avg]=dmg(r.cr), hit=attackBonus(r,a), save=dc(r,a);const items=[{name:"Тактическая роль",type:"feat",system:{description:{value:`<p>Группа: ${r.group}. Роль: ${r.role}. Источник: ${sourceText(r)}.</p>`},activation:{type:"passive",cost:null},source:{custom:"Aeria Core"}}},{name:"Мультиатака",type:"feat",system:{description:{value:`<p>${r.name} совершает две атаки или одну атаку и использует особую способность.</p>`},activation:{type:"action",cost:1},source:{custom:"Aeria Core"}}},{name:"Основная атака",type:"weapon",system:{description:{value:`<p>Рукопашная или дальнобойная атака: +${hit} к попаданию. Попадание: ${avg} (${formula}) урона.</p>`},activation:{type:"action",cost:1},target:{type:"creature",count:1},range:{value:r.role.includes("Артил")?120:5,units:"ft"},actionType:r.role.includes("Артил")?"rsak":"mwak",attackBonus:hit,damage:{parts:[[formula,dtype]]},equipped:true,proficient:true,source:{custom:"Aeria Core"}}},{name:"Особая способность",type:"feat",system:{description:{value:`<p>Цель в пределах 60 фт проходит спасбросок Сл ${save}. При провале получает эффект роли существа: контроль, страх, яд, сбивание с ног, опутывание, ослабление или потеря реакции до конца следующего хода.</p>`},activation:{type:"action",cost:1},source:{custom:"Aeria Core"}}}];if(r.flags.includes("T"))items.push({name:"Титаническая анатомия",type:"feat",system:{description:{value:"<p>Существо может рассматриваться как несколько секций.</p>"},activation:{type:"passive",cost:null},source:{custom:"Aeria Core"}}});if(r.flags.includes("K"))items.push({name:"Клеймо убийцы партии",type:"feat",system:{description:{value:"<p>Существо особенно опасно при грамотной тактике.</p>"},activation:{type:"passive",cost:null},source:{custom:"Aeria Core"}}});if(r.flags.includes("L")||r.role.includes("Элита"))items.push({name:"Легендарное действие",type:"feat",system:{description:{value:"<p>Существо перемещается на половину скорости, совершает одну атаку или навязывает помеху одной цели.</p>"},activation:{type:"legendary",cost:1},source:{custom:"Aeria Core"}}});return items;}
function actorData(r,folder){const a=genericAbilities(r), sourcePath=`external-bestiary:${r.src}:${slugify(r.name)}`, speed=speedFor(r);return {name:r.name,type:"npc",img:DEFAULT_ACTOR_IMAGE,folder:folder.id,system:{details:{biography:{value:biography(r),public:""},type:{value:r.type,custom:""},cr:crNumber(r.cr),source:{custom:sourceText(r)}},attributes:{ac:{flat:acFor(r),calc:"flat"},hp:{value:hpFor(r),max:hpFor(r),temp:0,tempmax:0,formula:""},movement:movement(speed),senses:{darkvision:crNumber(r.cr)>=10?120:60,special:"пассивное Восприятие 10",units:"ft",perception:0}},abilities:{str:{value:a[0]},dex:{value:a[1]},con:{value:a[2]},int:{value:a[3]},wis:{value:a[4]},cha:{value:a[5]}},skills:{},traits:{size:sizeFor(r),languages:{value:[],custom:"—"},di:{value:[],custom:""},dr:{value:[],custom:""},dv:{value:[],custom:""},ci:{value:[],custom:""}}},prototypeToken:{name:r.name,actorLink:false,disposition:-1,displayName:20,displayBars:20,bar1:{attribute:"attributes.hp"},texture:{src:DEFAULT_ACTOR_IMAGE,scaleX:1,scaleY:1},sight:{enabled:false}},flags:{[MODULE_ID]:{sourcePath,sourceBlock:r.name,documentKind:"bestiary",shard:"external",region:r.src,externalBestiary:true,externalSource:r.src,externalGroup:r.group,externalRole:r.role,importedFromUploadedBestiary:true,importSchema:EXTERNAL_BESTIARY_SCHEMA}}};}
async function replaceActorItems(actor,items){const ids=actor.items?.map(i=>i.id)??[];if(ids.length>0)await actor.deleteEmbeddedDocuments("Item",ids);if(items.length>0)await actor.createEmbeddedDocuments("Item",items);}
function mergeResults(...rs){const m={created:0,updated:0,skipped:0,failed:[]};for(const r of rs){if(!r)continue;m.created+=r.created??0;m.updated+=r.updated??0;m.skipped+=r.skipped??0;m.failed.push(...(r.failed??[]));}return m;}
async function importExternalBestiary({overwrite=true}={}){if(!game.user?.isGM)return{created:0,updated:0,skipped:0,failed:[]};const result={created:0,updated:0,skipped:0,failed:[]};_folderCache.clear();for(const r of splitRows()){try{const folder=await getOrCreateFolder("Actor",`Aeria Core / Бестиарий / Внешние источники / ${FOLDER_BY_SOURCE[r.src]??r.src}`);const data=actorData(r,folder), a=genericAbilities(r), items=itemsFor(r,a);const existing=game.actors.find(actor=>actor.getFlag(MODULE_ID,"sourcePath")===data.flags[MODULE_ID].sourcePath||(actor.getFlag(MODULE_ID,"externalBestiary")&&actor.name===r.name&&actor.getFlag(MODULE_ID,"externalSource")===r.src));if(existing&&!overwrite){result.skipped+=1;continue;}if(existing){await existing.update(data);await replaceActorItems(existing,items);result.updated+=1;}else{await Actor.create({...data,items});result.created+=1;}}catch(error){result.failed.push({name:r.name,source:r.src,error:error.message});}}if(result.failed.length>0){console.error("Aeria Core | external bestiary import failures",result.failed);ui.notifications?.error(`Aeria Core: импорт внешнего бестиария завершён с ошибками: ${result.failed.length}.`);}else{ui.notifications?.info(`Aeria Core: внешний бестиарий готов. Создано: ${result.created}, обновлено: ${result.updated}, пропущено: ${result.skipped}.`);}return result;}
function wrapImportAllWithExternalBestiary(){game.aeriya=game.aeriya??{};const original=game.aeriya.importAll;if(typeof original!=="function"||original.__aeriyaExternalBestiaryWrapped)return;const wrapped=async(options={})=>mergeResults(await original(options),await importExternalBestiary({overwrite:options.overwrite??true}));wrapped.__aeriyaExternalBestiaryWrapped=true;game.aeriya.importAll=wrapped;}
Hooks.once("ready",()=>{game.aeriya=game.aeriya??{};game.aeriya.importExternalBestiary=(options={})=>importExternalBestiary(options);wrapImportAllWithExternalBestiary();if(!game.user?.isGM)return;const moduleVersion=game.modules.get(MODULE_ID)?.version??"unknown",settingKey="externalBestiaryImportedVersion";game.settings.register(MODULE_ID,settingKey,{name:"Aeria Core: версия внешнего бестиария",scope:"world",config:false,type:String,default:""});const current=`${moduleVersion}:${EXTERNAL_BESTIARY_SCHEMA}`;if(game.settings.get(MODULE_ID,settingKey)===current)return;window.setTimeout(async()=>{wrapImportAllWithExternalBestiary();const result=await importExternalBestiary({overwrite:true});if(result.failed.length===0)await game.settings.set(MODULE_ID,settingKey,current);},7000);});
