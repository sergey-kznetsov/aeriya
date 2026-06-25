# Asset manifest Aeria Core

Файл нужен, чтобы наполнение картинками, картами, портретами и токенами не превратилось в хаос.

## Правило

Сначала у каждой сущности есть карточка в `content/`. Потом для неё добавляется ассет в `assets/` и фиксируется здесь.

## Папки

```text
assets/maps/       — карты регионов, городов, маршрутов
assets/scenes/     — фоновые изображения сцен Foundry
assets/tokens/     — токены существ и НИПов
assets/portraits/  — портреты НИПов, духов, важных персонажей
assets/handouts/   — изображения книг, записок, артефактов и памяток
assets/ui/         — элементы интерфейса модуля
```

## Статусы

```text
needed   — нужен ассет
optional — можно добавить позже
done     — ассет готов и лежит в репозитории
```

## Приоритет сцен и токенов по наборам встреч

| Набор | Карточка | Ассеты high priority |
|---|---|---|
| Рыночный долг | `content/handouts/middle-lands/encounters/encounter-market-debt.md` | Рыночная площадь, Дорожный трактир, Городские ворота |
| Спор в чайном доме | `content/handouts/shadow-shard/ash-steppe/encounters/encounter-tea-house-dispute.md` | Чайный двор, Караванная стоянка, Пепельный маяк |
| Мховая тропа | `content/handouts/shadow-shard/black-whisper-forest/encounters/encounter-moss-path.md` | Мховая тропа, Серая часовня, токен мхового ходока |
| Последний огонь | `content/handouts/shadow-shard/icy-limit/encounters/encounter-last-fire.md` | Общий огонь станции, Перевал Синего Ветра, токен белого бегуна |
| Сухая дорога | `content/handouts/scorching-shard/encounters/encounter-dry-road.md` | Ворота форта, Караванный двор, Родник у красного камня, токен соляного шороха |

## Приоритет handout-изображений

| Сущность | Карточка | Тип ассета | Статус | Комментарий |
|---|---|---|---|---|
| Книга дорожных заметок | `content/handouts/middle-lands/books/kniga-dorozhnyh-zametok.md` | handout image | needed | старая дорожная тетрадь |
| Письмо без двери | `content/handouts/middle-lands/books/pismo-bez-dveri.md` | handout image | needed | записка и железный ключ |
| Запись о пяти чашах | `content/handouts/shadow-shard/ash-steppe/books/zapis-o-pyati-chashah.md` | handout image | needed | тонкая пластина с текстом |
| Шесть правил мха | `content/handouts/shadow-shard/black-whisper-forest/books/shest-pravil-mha.md` | handout image | needed | береста с продавленными буквами |
| Запись об общем огне | `content/handouts/shadow-shard/icy-limit/books/zapis-ob-obschem-ogne.md` | handout image | needed | кожаный лист у очага |
| Список сухой дороги | `content/handouts/scorching-shard/books/spisok-suhoy-dorogi.md` | handout image | needed | дорожная дощечка со списком |

## Срединные Земли

| Сущность | Карточка | Тип ассета | Статус | Комментарий |
|---|---|---|---|---|
| Морнстэд | `content/cities/middle-lands/common/mornsted.md` | map, scene | needed | карта города и 1 видовая сцена |
| Фарн'Крот | `content/cities/middle-lands/common/farnkrot.md` | map, scene | needed | вертикальный/подземный город |
| Плавень | `content/cities/middle-lands/common/plaven.md` | map, scene | needed | водная/болотная структура |
| Скрежетник | `content/cities/middle-lands/common/skrezhetnik.md` | map, scene | needed | промышленный или жёсткий силуэт |
| Крик Химеры | `content/cities/middle-lands/common/krik-himery.md` | map, scene | needed | город с яркой особенностью |

## Теневой Осколок

| Сущность | Карточка | Тип ассета | Статус | Комментарий |
|---|---|---|---|---|
| Пепельная Степь | `content/regions/shadow-shard/ash-steppe/ash-steppe-overview.md` | map | needed | региональная карта |
| Караванная стоянка | `content/scenes/shadow-shard/ash-steppe/karavannaya-stoyanka.md` | scene | needed | боевая/социальная сцена |
| Лес Чёрного Шёпота | `content/regions/shadow-shard/black-whisper-forest/black-whisper-forest-overview.md` | map | needed | региональная карта |
| Мховая тропа | `content/scenes/shadow-shard/black-whisper-forest/mhovaya-tropa.md` | scene | needed | лесная сцена |
| Вечные Льды | `content/regions/shadow-shard/icy-limit/icy-limit-overview.md` | map | needed | региональная карта |
| Общий огонь станции | `content/scenes/shadow-shard/icy-limit/obshchiy-ogon-stantsii.md` | scene | needed | сцена станции |

## Палящий Осколок

| Сущность | Карточка | Тип ассета | Статус | Комментарий |
|---|---|---|---|---|
| Палящий Осколок | `content/regions/scorching-shard/scorching-shard-overview.md` | map | needed | карта Осколка |
| Выжженные Пустоши | `content/regions/scorching-shard/burning-wastes-overview.md` | map | needed | региональный маршрут |
| Ворота форта | `content/scenes/scorching-shard/common/fort-vorota.md` | scene | needed | сцена у ворот |
| Родник у красного камня | `content/scenes/scorching-shard/common/krasnyy-rodnik-scene.md` | scene | needed | сцена источника |
| Руины Соляной Мельницы | `content/scenes/scorching-shard/common/ruiny-solyanoy-melnitsy-scene.md` | scene | needed | сцена руин |
| Караванный двор | `content/scenes/scorching-shard/common/karavannyy-dvor.md` | scene | needed | социальная сцена |
| Стеклянная площадка | `content/scenes/scorching-shard/common/steklyannaya-ploschadka.md` | scene | needed | сцена поиска образца |

## Токены и портреты: приоритет

1. НИПы мини-сценариев.
2. Существа, которые уже есть в сценах.
3. Духи регионов.
4. Лидеры фракций.
5. Второстепенные торговцы и проводники.

## Как добавлять

1. Положить файл в нужную папку `assets/`.
2. Не использовать пробелы и кириллицу в имени файла.
3. Пример: `assets/tokens/scorching-shard/salt-scorpion.webp`.
4. Обновить этот manifest: статус `done`, путь к файлу, комментарий.
