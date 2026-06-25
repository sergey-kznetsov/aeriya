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

## Следующая партия

Следующими должны быть финализированы городские квестовые карточки Срединных Земель:

1. `content/handouts/middle-lands/city-quests/quest-archive-and-empty-name.md`
2. `content/handouts/middle-lands/city-quests/quest-cargo-without-owner.md`
3. `content/handouts/middle-lands/city-quests/quest-water-and-wooden-paths.md`
4. `content/handouts/middle-lands/city-quests/quest-bell-and-house-debt.md`
5. `content/handouts/middle-lands/city-quests/quest-beast-roads-and-signs.md`
6. `content/handouts/middle-lands/city-quests/quest-lower-gears-and-black-smoke.md`
7. `content/handouts/middle-lands/books/kniga-dorozhnyh-zametok.md`
8. `content/handouts/middle-lands/books/pismo-bez-dveri.md`

После этого таким же способом финализируются сцены, региональные handouts, квестовые карточки Теневого Осколка и Палящего Осколка.
