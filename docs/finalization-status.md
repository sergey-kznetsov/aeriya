# Статус финализации карточек Aeria Core

## Правило проекта

Все карточки должны создаваться и обновляться сразу как финально наполненные материалы. Черновые статусы и заглушки не считаются готовым наполнением.

Запрещены статусы:

- `draft`;
- `todo`;
- `pending`;
- `stub`;
- `placeholder`;
- `needs-*`.

Технический контроль добавлен в `scripts/dev/validate-content-cards.mjs`: контентная карточка с таким статусом должна проваливать проверку.

## Пакет финализации 01

Финализированы базовые handout-карточки Срединных Земель:

| Карточка | Путь | Статус |
|---|---|---|
| Памятка игрокам: обычаи Срединных Земель | `content/handouts/middle-lands/common/player-city-customs-handout.md` | content-ready-final |
| Мастерская памятка: городская сцена Срединных Земель | `content/handouts/middle-lands/common/gm-city-scene-checklist.md` | content-ready-final |
| Поручение: рыночная запись | `content/handouts/middle-lands/common/quest-rynkovaya-zapis.md` | content-ready-final |
| Поручение: ночной колокол | `content/handouts/middle-lands/common/quest-nochnoy-kolokol.md` | content-ready-final |

## Пакет финализации 02

Финализированы расширенные игровые handout-карточки Срединных Земель:

| Карточка | Путь | Статус |
|---|---|---|
| Мини-сценарий: долг на рынке | `content/handouts/middle-lands/common/adventure-dolg-na-rynke.md` | content-ready-final |
| Мини-сценарий: колокол и мост | `content/handouts/middle-lands/common/adventure-kolokol-i-most.md` | content-ready-final |
| Набор встреч: рыночный долг | `content/handouts/middle-lands/encounters/encounter-market-debt.md` | content-ready-final |
| Доски поручений Срединных Земель | `content/handouts/middle-lands/boards/city-board-middle-lands.md` | content-ready-final |

## Пакет финализации 03

Финализированы городские квестовые цепочки Срединных Земель:

| Карточка | Путь | Статус |
|---|---|---|
| Городской квест: архив и пустая строка | `content/handouts/middle-lands/city-quests/quest-archive-and-empty-name.md` | content-ready-final |
| Городской квест: груз без владельца | `content/handouts/middle-lands/city-quests/quest-cargo-without-owner.md` | content-ready-final |
| Городской квест: вода и деревянные пути | `content/handouts/middle-lands/city-quests/quest-water-and-wooden-paths.md` | content-ready-final |
| Городской квест: колокол и домовой долг | `content/handouts/middle-lands/city-quests/quest-bell-and-house-debt.md` | content-ready-final |
| Городской квест: звериные дороги и ложные знаки | `content/handouts/middle-lands/city-quests/quest-beast-roads-and-signs.md` | content-ready-final |
| Городской квест: нижние зубцы и чёрный дым | `content/handouts/middle-lands/city-quests/quest-lower-gears-and-black-smoke.md` | content-ready-final |

## Пакет финализации 04

Финализированы in-world книги Срединных Земель:

| Карточка | Путь | Статус |
|---|---|---|
| Книга дорожных заметок | `content/handouts/middle-lands/books/kniga-dorozhnyh-zametok.md` | content-ready-final |
| Письмо без двери | `content/handouts/middle-lands/books/pismo-bez-dveri.md` | content-ready-final |

## Пакет финализации 05

Начата финализация handout-материалов Теневого Осколка:

| Карточка | Путь | Статус |
|---|---|---|
| Доски поручений Теневого Осколка | `content/handouts/shadow-shard/boards/city-board-shadow-shard.md` | content-ready-final |
| Городской квест: Окрам, закрытый узел | `content/handouts/shadow-shard/ash-steppe/city-quests/quest-okram-zakrytyy-uzel.md` | content-ready-final |

## Пакет финализации 06

Финализирован навигационный и лесной блок Теневого Осколка:

| Карточка | Путь | Статус |
|---|---|---|
| Игровой индекс Теневого Осколка | `content/_indexes/shadow-shard-play-index.md` | content-ready-final |
| Лесной квест: Корень и Дом Мха | `content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-koren-i-dom-mha.md` | content-ready-final |
| Лесной квест: Серый Приют и старая застава | `content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-seryy-priyut-i-staraya-zastava.md` | content-ready-final |

## Пакет финализации 07

Финализированы северные квесты Теневого Осколка:

| Карточка | Путь | Статус |
|---|---|---|
| Северный квест: огонь и Ледяной Клык | `content/handouts/shadow-shard/icy-limit/city-quests/quest-ogon-i-ledyanoy-klyk.md` | content-ready-final |
| Северный квест: перевал и Белые Камни | `content/handouts/shadow-shard/icy-limit/city-quests/quest-pereval-i-belye-kamni.md` | content-ready-final |

## Пакет финализации 08

Финализированы encounter-наборы Теневого Осколка:

| Карточка | Путь | Статус |
|---|---|---|
| Набор встреч: спор в чайном доме | `content/handouts/shadow-shard/ash-steppe/encounters/encounter-tea-house-dispute.md` | content-ready-final |
| Набор встреч: мховая тропа | `content/handouts/shadow-shard/black-whisper-forest/encounters/encounter-moss-path.md` | content-ready-final |
| Набор встреч: последний огонь | `content/handouts/shadow-shard/icy-limit/encounters/encounter-last-fire.md` | content-ready-final |

## Что изменяется при финализации

Карточки не просто получают новый статус. Каждая финализированная карточка дополняется до полноценного игрового состояния:

- назначение;
- участники и роли;
- проверки и последствия;
- сцены или акты;
- угрозы и связи с бестиарием;
- ссылки на NPC-чарники;
- Foundry-назначение;
- отсутствие внутренних пометок «дописать потом», «черновик», `todo`, `pending`.

## Текущий итог

Срединные Земли по handout-материалам закрыты: 16 из 16 карточек имеют статус `content-ready-final`.

Теневой Осколок по handout-материалам: 10 из 13 строк текущего handout-индекса имеют статус `content-ready-final`. Осталось закрыть 3 строки Теневого Осколка.

## Следующая партия

Следующими должны быть финализированы in-world записи Теневого Осколка:

1. `content/handouts/shadow-shard/ash-steppe/books/zapis-o-pyati-chashah.md`
2. `content/handouts/shadow-shard/black-whisper-forest/books/shest-pravil-mha.md`
3. `content/handouts/shadow-shard/icy-limit/books/zapis-ob-obschem-ogne.md`
