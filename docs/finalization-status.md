# Статус финализации карточек Aeria Core

## Правило проекта

Все карточки должны создаваться и обновляться сразу как финально наполненные материалы. Черновые статусы и заглушки не считаются готовым наполнением.

Технический контроль добавлен в `scripts/dev/validate-content-cards.mjs`: контентная карточка со старым черновым статусом должна проваливать проверку.

Дополнительный ссылочный контроль добавлен в `scripts/dev/validate-content-links.mjs`: Markdown-файлы в `content` и `docs` проверяются на внутренние пути `content/...`, `docs/...`, `scripts/...`, `module.json`, `README.md`, `CHANGELOG.md`.

Визуальный слой старого мира вынесен в `assets/manifests/old-world-assets.json`. Записи со статусом `pending-import` являются планом переноса и не подключаются как готовые ассеты. Записи со статусом `imported` проверяются валидатором на физическое наличие файла.

## Текущий итог

| Блок | Готово | Статус |
|---|---:|---|
| Срединные Земли handout | 16/16 | closed |
| Теневой Осколок handout | 13/13 | closed |
| Палящий Осколок handout | 9/9 | closed |
| Статблоки NPC | 53/53 | closed |
| Основной и расширенный бестиарий | closed | actor-ready-final |
| Основной handout-слой трёх регионов | closed | content-ready-final |
| Манифест старых city/token assets | 24 records | pending-import |
| Release-test preflight | script-ready | ready-to-run-local |

## Закрытые пакеты

| Пакет | Содержание | Статус |
|---|---|---|
| 01–04 | handout-карточки Срединных Земель | content-ready-final |
| 05–09 | handout-карточки Теневого Осколка | content-ready-final |
| 10 | Доска поручений Палящего Осколка; квесты `Три Тени и Последний Вздох`, `Клинок и Стеклянный Городок` | content-ready-final |
| 11 | квесты `Родник и Белый Колодец`, `форт, дворец и Красная Соль`, `мельница, порог и Тихая Корка` | content-ready-final |
| 12 | encounter `Сухая дорога`, player-facing `Список сухой дороги`, игровой индекс Палящего Осколка | content-ready-final |
| 13 | структура `assets`, манифест старых городских картинок и токенов, assets/scene/token staging | pending-import-ready |
| 14 | show-only city scene staging и единая команда `release:test` | release-test-ready-local |

## Контроль запрещённых контентных статусов

В контентных карточках не должно быть старых маркеров `draft`, `todo`, `pending`, `stub`, `placeholder`, `needs`.

Отдельно: `pending-import` разрешён только для записей ассет-манифеста `assets/manifests/old-world-assets.json`. Это не статус контентной карточки и не считается черновиком игрового материала.

Следующий обязательный контроль — локальный запуск `npm run release:test`, потому что поиск по репозиторию не заменяет выполнение валидаторов, сборщиков и preflight-проверки build-выходов.

## Технические команды перед релизом

| Команда | Назначение |
|---|---|
| `npm run content:validate` | проверка frontmatter, H1, типов и финальных статусов |
| `npm run content:links` | проверка внутренних Markdown-ссылок на существующие пути |
| `npm run content:index` | пересборка контентного индекса |
| `npm run content:check` | проверка карточек, ссылок и индекса |
| `npm run assets:verify` | проверка манифеста старых картинок и токенов |
| `npm run module:verify` | проверка `module.json` и ссылок на файлы модуля |
| `npm run journals:build` | сборка Journal staging |
| `npm run journals:verify` | проверка Journal staging |
| `npm run actors:build` | сборка Actor staging из actor-ready Markdown-статблоков с автоподхватом imported-токенов |
| `npm run actors:verify` | проверка Actor staging, manifest, папок и source JSON |
| `npm run scenes:build` | сборка show-only Scene staging из imported cityScenes |
| `npm run scenes:verify` | проверка Scene staging и source JSON |
| `npm run foundry:check` | полный технический прогон модуля: module, content, assets, journals, actors, scenes |
| `npm run release:test` | полный прогон `foundry:check` + preflight готовности к ручному Foundry-тесту |

## Foundry pack-статус

`module.json` пока содержит пустой массив `packs`. Это остаётся корректным до ручной проверки реальных Foundry compendium DB.

Journal pack, Actor pack и Scene pack теперь имеют staging build/verify-скрипты. Scene staging создаётся как show-only city image layer: без тактической сетки, vision, fog, токенов, стен и перемещения по городу.

Staging-выходы всё ещё не являются готовыми LevelDB compendium packs до ручной проверки в Foundry VTT.

Паки нельзя подключать в `module.json`, пока Journal pack, Actor pack и Scene pack не собраны, не проверены и не открыты вручную в Foundry VTT.

## Следующий порядок работы

1. Локально прогнать `npm run release:test`.
2. Исправить найденные валидатором карточки, ссылки, ассеты или staging-ошибки, если они появятся.
3. Физически перенести старые картинки городов и токены по путям из `assets/manifests/old-world-assets.json`.
4. Для перенесённых файлов сменить статус с `pending-import` на `imported`.
5. Повторно прогнать `npm run release:test`.
6. Провести ручную проверку Journal, Actor и Scene pack в Foundry VTT.
7. После ручной Foundry-проверки подключить packs в `module.json`.
