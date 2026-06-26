# Матрица бестиария по локациям Аэрии

## Назначение

Релизная матрица бестиария по регионам и игровым локациям. Старый смысл файла — «минимум одна угроза на локацию» — больше не используется как основной критерий. Теперь матрица показывает полный набор доступных actor-ready угроз по локациям, включая source-based существ и модульные дополнения.

## Статусы

- `actor-ready-final` — существо уже добавлено в `content/actor-statblocks` и готово как карточка для будущей конвертации в Foundry Actor.
- `boss-use` — существо подходит как сюжетная / финальная угроза, а не как случайная встреча.
- `optional-layer` — существо уместно как дополнительный слой сцены, но не обязательно для базового прохождения.
- `external-closed-node` — внутренняя часть локации закрыта, используется внешний периметр.

## Срединные Земли

| Локация / город | Полный набор доступных угроз | Основные файлы | Статус |
|---|---|---|---|
| Гравен Холлоу | Сухоглазый сторож; Сонокрад; Слышащий сталкер; Мракоглаз-охотник | `new-middle-creatures-batch-01.md`; `source-middle-creatures-batch-04.md` | actor-ready-final |
| Морнстэд | Складской хват; Пыльник-технопат; Эхо-крыс; Мракоглаз-охотник | `new-middle-creatures-batch-01.md`; `source-import-batch-01.md`; `source-middle-creatures-batch-02.md`; `source-middle-creatures-batch-04.md` | actor-ready-final |
| Кладовая Перекрёстков | Складской хват; Пыльник-технопат; Эхо-крыс; Шатах | `new-middle-creatures-batch-01.md`; `source-import-batch-01.md`; `source-middle-creatures-batch-02.md`; `source-middle-creatures-batch-03.md` | actor-ready-final |
| Фарн’Крот | Рудный клещ; Рудоед; Пыльник-технопат; Шлаковый голем; Каменный страж | `source-middle-creatures-batch-02.md`; `source-import-batch-01.md`; `source-middle-creatures-batch-05.md` | actor-ready-final |
| Озерник | Глубинник, водяной; Дух Молчаливого Зева; Болотный шатун; Глубинный пожиратель | `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-05.md`; `new-middle-creatures-batch-01.md` | actor-ready-final + boss-use |
| Плавень | Болотная химера, малая; Болотная гарпия; Болотный шатун; Глубинный пожиратель; Глубинник | `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md`; `source-middle-creatures-batch-05.md`; `new-middle-creatures-batch-01.md` | actor-ready-final |
| Скрежетник | Рудный клещ; Рудоед; Рудный светляк; Звонный червь; Сонокрад; Шлаковый голем; Каменный страж; Голод Зубила | `source-middle-creatures-batch-02.md`; `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md`; `source-middle-creatures-batch-05.md` | actor-ready-final + boss-use |
| Бьющий Колокол | Эхо-крыс; Резонансный волк; Слышащий сталкер; Колокольный фантом; Вестник Раскола; Колокольный ворон | `source-middle-creatures-batch-02.md`; `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md`; `source-middle-creatures-batch-05.md`; `new-middle-creatures-batch-01.md` | actor-ready-final |
| Усадьба Леденёвых | Сухоглазый сторож; Колокольный ворон; Сонокрад; Мракоглаз-охотник | `new-middle-creatures-batch-01.md`; `source-middle-creatures-batch-04.md` | actor-ready-final |
| Крик Химеры | Химерный выкормок; Живая Артиллерия; Болотная химера, малая; Мракоглаз-охотник | `new-middle-creatures-batch-01.md`; `source-import-batch-01.md`; `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md` | actor-ready-final |
| Тарный Столб | Складской хват; Пыльник-технопат; Эхо-крыс; Шлаковый голем | `new-middle-creatures-batch-01.md`; `source-import-batch-01.md`; `source-middle-creatures-batch-02.md`; `source-middle-creatures-batch-05.md` | actor-ready-final |
| Берег Сухих Глаз | Сухоглазый сторож; Глубинник; Болотная химера; Мракоглаз-охотник | `new-middle-creatures-batch-01.md`; `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md` | actor-ready-final |
| Горлица | Колокольный ворон; Эхо-крыс; Резонансный волк; Сонокрад | `new-middle-creatures-batch-01.md`; `source-middle-creatures-batch-02.md`; `source-middle-creatures-batch-04.md` | actor-ready-final |
| Острог Прахобоя | Сухоглазый сторож; Каменный страж; Мракоглаз-охотник; Слышащий сталкер | `new-middle-creatures-batch-01.md`; `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md`; `source-middle-creatures-batch-05.md` | actor-ready-final |
| Пустотень | Сухоглазый сторож; Сонокрад; Мракоглаз-охотник; Самагхи-сновидец | `new-middle-creatures-batch-01.md`; `source-middle-creatures-batch-04.md`; `source-middle-creatures-batch-05.md` | actor-ready-final |
| Сычий Брод | Болотная химера, малая; Глубинник, водяной; Болотный шатун; Болотная гарпия | `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md`; `new-middle-creatures-batch-01.md` | actor-ready-final |
| Липуши | Липовый роевик; Грибной шёпот как кросс-лесной аналог; Болотная гарпия | `new-middle-creatures-batch-01.md`; `source-shadow-creatures-batch-06.md`; `source-middle-creatures-batch-04.md` | actor-ready-final + optional-layer |
| Лагерь Семиглазого | Семиглазая тень; Мракоглаз-охотник; Шатах; Самагхи-сновидец | `new-middle-creatures-batch-01.md`; `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md`; `source-middle-creatures-batch-05.md` | actor-ready-final |
| Тонкая Гряда | Грядовый прыгун; Шатах; Мракоглаз-охотник; Резонансный волк | `new-middle-creatures-batch-01.md`; `source-middle-creatures-batch-02.md`; `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md` | actor-ready-final |
| Рубеж Трясин | Болотный шатун; Болотная химера; Болотная гарпия; Глубинник; Глубинный пожиратель | `new-middle-creatures-batch-01.md`; `source-middle-creatures-batch-03.md`; `source-middle-creatures-batch-04.md`; `source-middle-creatures-batch-05.md` | actor-ready-final |
| Варница Чёрного Дыма | Складской хват; Пыльник-технопат; Живая Артиллерия; Шлаковый голем; Рудоед | `new-middle-creatures-batch-01.md`; `source-import-batch-01.md`; `source-middle-creatures-batch-02.md`; `source-middle-creatures-batch-05.md` | actor-ready-final |

## Теневой Осколок

### Пепельная Степь

| Локация | Полный набор доступных угроз | Основные файлы | Статус |
|---|---|---|---|
| Чайный двор | Пепельный шакал; Костяная гадюка; Птица пепельного маяка | `source-import-batch-01.md`; `module-shadow-creatures-batch-02.md` | actor-ready-final |
| Караванная стоянка | Пепельный шакал; Костяная гадюка; Сухой бегун; Пепельный вихрь | `source-import-batch-01.md`; `module-shadow-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Пепельные маяки | Птица пепельного маяка; Сухой бегун; Пепельный шакал; Пепельный вихрь | `module-shadow-creatures-batch-02.md`; `source-import-batch-01.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Дорога к Окраму | Костяная гадюка; Пепельный шакал; Сухой бегун; Пепельный вихрь | `source-import-batch-01.md`; `module-shadow-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Окрам, внешний периметр | Костяная гадюка; Пепельный шакал; Сухой бегун | `source-import-batch-01.md`; `module-shadow-creatures-batch-02.md` | actor-ready-final + external-closed-node |

### Лес Чёрного Шёпота

| Локация | Полный набор доступных угроз | Основные файлы | Статус |
|---|---|---|---|
| Мховая тропа | Шорох ветвей; Грибной шёпот; Корневой страж; Слепая сова | `module-shadow-creatures-batch-02.md`; `source-shadow-creatures-batch-06.md` | actor-ready-final |
| Корень Тёмного Мха | Корневой страж; Грибной шёпот; Шорох ветвей; Голодная тень | `source-shadow-creatures-batch-06.md`; `module-shadow-creatures-batch-02.md` | actor-ready-final |
| Сердечная Поляна | Корневой страж; Грибной шёпот; Шорох ветвей | `source-shadow-creatures-batch-06.md`; `module-shadow-creatures-batch-02.md` | actor-ready-final |
| Дом Мха | Корневой страж; Грибной шёпот; Шорох ветвей | `source-shadow-creatures-batch-06.md`; `module-shadow-creatures-batch-02.md` | actor-ready-final |
| Серый Приют | Шорох ветвей; Слепая сова; Голодная тень | `module-shadow-creatures-batch-02.md`; `source-shadow-creatures-batch-06.md` | actor-ready-final |
| Старая Лесная Застава | Шорох ветвей; Слепая сова; Корневой страж | `module-shadow-creatures-batch-02.md`; `source-shadow-creatures-batch-06.md` | actor-ready-final |
| Серая часовня | Голодная тень; Шорох ветвей; Слепая сова | `source-shadow-creatures-batch-06.md`; `module-shadow-creatures-batch-02.md` | actor-ready-final |

### Вечные Льды / Морозный Предел

| Локация | Полный набор доступных угроз | Основные файлы | Статус |
|---|---|---|---|
| Станция Последний Огонь | Ледяной сторож; Северное снежное существо; Ледяной плясун | `module-shadow-creatures-batch-02.md`; `source-shadow-creatures-batch-06.md` | actor-ready-final |
| Общий огонь станции | Ледяной сторож; Ледяной плясун; Северное снежное существо | `module-shadow-creatures-batch-02.md`; `source-shadow-creatures-batch-06.md` | actor-ready-final |
| Ледяной Клык | Йормунга, фрагмент сознания; Ледяной сторож; Морозный исполин, детёныш | `source-scorching-creatures-batch-07.md`; `module-shadow-creatures-batch-02.md`; `source-shadow-creatures-batch-06.md` | actor-ready-final + boss-use |
| Перевал Синего Ветра | Ледяной плясун; Белый бегун; Тонколёдная змея | `source-shadow-creatures-batch-06.md`; `module-shadow-creatures-batch-02.md` | actor-ready-final |
| Лагерь Белых Камней | Морозный исполин, детёныш; Белый бегун; Северное снежное существо | `source-shadow-creatures-batch-06.md`; `module-shadow-creatures-batch-02.md` | actor-ready-final |
| Тонкий лёд / северная дорога | Тонколёдная змея; Ледяной плясун; Белый бегун | `module-shadow-creatures-batch-02.md`; `source-shadow-creatures-batch-06.md` | actor-ready-final |

## Палящий Осколок

| Локация | Полный набор доступных угроз | Основные файлы | Статус |
|---|---|---|---|
| Три Тени | Песчаный бегун; Песчаная пиявка; Пепельный вихрь | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Пылающий Клинок | Жаровой сторож; Огненный страж; Пепельный вихрь | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Стеклянный Городок | Стеклянная ящерица; Стеклянная Змея; Ослепительный жук | `module-scorching-creatures-batch-02.md`; `source-import-batch-01.md` | actor-ready-final |
| Последний Вздох | Песчаный бегун; Песчаная пиявка; Поющий бархан | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Пещерный Порог | Соляной шорох; Песчаная пиявка; Пожиратель Звуков | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Красная Соль | Соляной скорпион; Соляной шорох; Песчаный червь, молодь; Огненный страж | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final + boss-use |
| Небесный Якорь | Ослепительный жук; Стеклянная Змея; Пепельный вихрь | `module-scorching-creatures-batch-02.md`; `source-import-batch-01.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Лагерь Шёпот Ветра | Песчаный бегун; Поющий бархан; Песчаная пиявка | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Тихая Корка | Соляной шорох; Пожиратель Звуков; Песчаная пиявка | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Форт Раскалённой Соли | Жаровой сторож; Огненный страж; Песчаный червь, молодь | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final + boss-use |
| Дворец Золотого Каравана | Ослепительный жук; Песчаный бегун; Пожиратель Звуков; Поющий бархан | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Кровавый Родник | Соляной скорпион; Песчаная пиявка; Пепельный вихрь | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Руины Соляной Мельницы | Соляной шорох; Жаровой сторож; Огненный страж; Пожиратель Звуков | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Белый Колодец | Соляной скорпион; Песчаная пиявка; Пожиратель Звуков | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |
| Каменный Навес | Песчаный бегун; Поющий бархан; Песчаный червь, молодь | `module-scorching-creatures-batch-02.md`; `source-scorching-creatures-batch-07.md` | actor-ready-final |

## Вывод аудита

Локационное покрытие угрозами закрыто по всем крупным локациям, но теперь матрица показывает не минимальную угрозу, а полный доступный набор существ на каждую локацию.

Закрыто сейчас:

1. Срединные Земли — все 21 локация имеют несколько actor-ready угроз, включая source-based и модульные.
2. Теневой Осколок — все ключевые локации текущего слоя имеют actor-ready угрозы, включая лесные, степные и северные source-based существа.
3. Палящий Осколок — все 15 городов и локаций имеют actor-ready угрозы, включая песчаные, огненные, звуковые и boss-use угрозы.

Следующее действие: провести аудит расширенных разделов Книги III и региональных расширений Книги VII, затем проверить дубли, CR, названия и ссылки из квестов.
