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

## Первый пакет финализации

Финализированы базовые handout-карточки Срединных Земель:

| Карточка | Путь | Статус |
|---|---|---|
| Памятка игрокам: обычаи Срединных Земель | `content/handouts/middle-lands/common/player-city-customs-handout.md` | content-ready-final |
| Мастерская памятка: городская сцена Срединных Земель | `content/handouts/middle-lands/common/gm-city-scene-checklist.md` | content-ready-final |
| Поручение: рыночная запись | `content/handouts/middle-lands/common/quest-rynkovaya-zapis.md` | content-ready-final |
| Поручение: ночной колокол | `content/handouts/middle-lands/common/quest-nochnoy-kolokol.md` | content-ready-final |

## Что изменилось в финализированных карточках

Карточки не просто получили новый статус. Они дополнены до полноценного игрового состояния:

- добавлено назначение;
- добавлены участники и роли;
- добавлены проверки и последствия;
- добавлены связи с NPC-чарниками;
- добавлены связи с бестиарием и угрозами;
- добавлено Foundry-назначение;
- удалён черновой статус.

## Следующая партия

Следующими должны быть финализированы оставшиеся handout-карточки Срединных Земель:

1. `content/handouts/middle-lands/common/adventure-dolg-na-rynke.md`
2. `content/handouts/middle-lands/common/adventure-kolokol-i-most.md`
3. `content/handouts/middle-lands/encounters/encounter-market-debt.md`
4. `content/handouts/middle-lands/boards/city-board-middle-lands.md`
5. `content/handouts/middle-lands/city-quests/quest-archive-and-empty-name.md`
6. `content/handouts/middle-lands/city-quests/quest-cargo-without-owner.md`
7. `content/handouts/middle-lands/city-quests/quest-water-and-wooden-paths.md`
8. `content/handouts/middle-lands/city-quests/quest-bell-and-house-debt.md`
9. `content/handouts/middle-lands/city-quests/quest-beast-roads-and-signs.md`
10. `content/handouts/middle-lands/city-quests/quest-lower-gears-and-black-smoke.md`
11. `content/handouts/middle-lands/books/kniga-dorozhnyh-zametok.md`
12. `content/handouts/middle-lands/books/pismo-bez-dveri.md`

После этого таким же способом финализируются сцены, региональные handouts, квестовые карточки Теневого Осколка и Палящего Осколка.
