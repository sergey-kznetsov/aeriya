# Статус финализации карточек Aeria Core

## Правило проекта

Все карточки должны создаваться и обновляться сразу как финально наполненные материалы. Черновые статусы и заглушки не считаются готовым наполнением.

Технический контроль добавлен в `scripts/dev/validate-content-cards.mjs`: контентная карточка со старым черновым статусом должна проваливать проверку.

Дополнительный ссылочный контроль добавлен в `scripts/dev/validate-content-links.mjs`: Markdown-файлы в `content` и `docs` проверяются на внутренние пути `content/...`, `docs/...`, `scripts/...`, `module.json`, `README.md`, `CHANGELOG.md`.

## Текущий итог

| Блок | Готово | Статус |
|---|---:|---|
| Срединные Земли handout | 16/16 | closed |
| Теневой Осколок handout | 13/13 | closed |
| Палящий Осколок handout | 9/9 | closed |
| Статблоки NPC | 53/53 | closed |
| Основной и расширенный бестиарий | closed | actor-ready-final |
| Основной handout-слой трёх регионов | closed | content-ready-final |

## Закрытые пакеты

| Пакет | Содержание | Статус |
|---|---|---|
| 01–04 | handout-карточки Срединных Земель | content-ready-final |
| 05–09 | handout-карточки Теневого Осколка | content-ready-final |
| 10 | Доска поручений Палящего Осколка; квесты `Три Тени и Последний Вздох`, `Клинок и Стеклянный Городок` | content-ready-final |
| 11 | квесты `Родник и Белый Колодец`, `форт, дворец и Красная Соль`, `мельница, порог и Тихая Корка` | content-ready-final |
| 12 | encounter `Сухая дорога`, player-facing `Список сухой дороги`, игровой индекс Палящего Осколка | content-ready-final |

## Контроль запрещённых статусов

По текущему поиску в репозитории не найдено старых маркеров `draft`, `todo`, `pending`, `stub`, `placeholder`, `needs`.

Следующий обязательный контроль — локальный запуск `npm run foundry:check`, потому что поиск по репозиторию не заменяет выполнение валидаторов и сборщиков.

## Технические команды перед релизом

| Команда | Назначение |
|---|---|
| `npm run content:validate` | проверка frontmatter, H1, типов и финальных статусов |
| `npm run content:links` | проверка внутренних Markdown-ссылок на существующие пути |
| `npm run content:index` | пересборка контентного индекса |
| `npm run content:check` | проверка карточек, ссылок и индекса |
| `npm run module:verify` | проверка `module.json` и ссылок на файлы модуля |
| `npm run journals:build` | сборка Journal staging |
| `npm run journals:verify` | проверка Journal staging |
| `npm run actors:build` | сборка Actor staging из actor-ready Markdown-статблоков |
| `npm run actors:verify` | проверка Actor staging, manifest, папок и source JSON |
| `npm run foundry:check` | полный технический прогон модуля: module, content, journals, actors |

## Foundry pack-статус

`module.json` пока содержит пустой массив `packs`. Это остаётся корректным до ручной проверки реальных Foundry compendium DB.

Journal pack и Actor pack теперь имеют staging build/verify-скрипты. Они всё ещё не являются готовыми LevelDB compendium packs до ручной проверки в Foundry VTT.

Паки нельзя подключать в `module.json`, пока Journal pack и Actor pack не собраны, не проверены и не открыты вручную в Foundry VTT.

## Следующий порядок работы

1. Локально прогнать `npm run foundry:check`.
2. Исправить найденные валидатором карточки, ссылки или staging-ошибки, если они появятся.
3. После успешного локального прогона зафиксировать фактический результат.
4. Провести ручную проверку Journal pack и Actor pack в Foundry VTT.
5. После ручной Foundry-проверки подключить packs в `module.json`.
