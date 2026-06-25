# План Foundry packs для Aeria Core

## Цель

Перевести текущую markdown-базу в структуру, которую мастер сможет открыть прямо в Foundry через Compendium Packs.

Сейчас контент уже лежит в `content/` и индексах. Следующий шаг — не писать ещё больше лора, а сделать первый рабочий pack-слой.

## Принцип быстрого релиза

Для первого playable-релиза не нужно сразу превращать всё в полноценные Actor, Item, RollTable и Scene.

Быстрый безопасный путь:

1. Все карточки из `content/` сначала экспортируются как Journal Entry.
2. Мастер получает один справочный compendium pack.
3. После проверки в Foundry отдельными итерациями делаются настоящие RollTable, Actor, Item и Scene.

Так модуль можно быстро начать использовать, а не ждать полной технической идеальности.

## Первый pack-слой

| Pack | Тип Foundry | Что внутри | Статус |
|---|---|---|---|
| `aeriya-journals` | JournalEntry | все markdown-карточки, кроме `_indexes` и `_templates` | in progress |

Этот вариант самый быстрый и безопасный. Он не требует сразу конвертировать монстров, предметы и сцены в системные документы dnd5e.

## Текущий технический экспорт

Скрипт сборки:

```bash
npm run journals:build
```

Он делает два результата:

```text
build/foundry/journal-entries.json
build/foundry/aeriya-journals/_source/*.json
build/foundry/aeriya-journals/manifest.json
```

`journal-entries.json` нужен как общий проверочный экспорт. `_source` нужен как staging-слой для первого будущего pack `aeriya-journals`. `manifest.json` фиксирует состав staging-экспорта, количество документов и набор папок.

Journal Entry уже получают стабильный `folder` id. Человекочитаемое имя папки дополнительно сохраняется в `flags.aeriya.folderName`, а сами folder-заготовки лежат в `manifest.json`. Это промежуточный формат для конвертера, а не финальная база Foundry.

Проверочный скрипт Journal Entry export:

```bash
npm run journals:verify
```

Он проверяет:

- что `journal-entries.json` существует и содержит массив;
- что каждая запись имеет `_id`, `name`, `folder`, `flags.aeriya.sourcePath`, `flags.aeriya.folderName` и одну text page;
- что `folder` у каждой записи ссылается на folder id из `manifest.json`;
- что `pages[0].text.content` заполнен;
- что `_id` и `sourcePath` не дублируются;
- что количество файлов в `_source` совпадает с количеством Journal Entry;
- что `manifest.json` описывает `aeriya-journals` как `JournalEntry` pack staging;
- что folder-заготовки в `manifest.json` имеют уникальные id и имена.

Проверочный скрипт Foundry module manifest:

```bash
npm run module:verify
```

Он проверяет:

- обязательные поля `module.json`;
- подключённые JS, CSS и файлы локализации;
- валидность JSON локализации;
- наличие `README.md` и `CHANGELOG.md`;
- структуру массива `packs`, даже если он пока пустой.

Полная локальная проверка перед ручным Foundry smoke test:

```bash
npm run foundry:check
```

Важно: это ещё не финальная LevelDB-база Foundry. `module.json` не должен ссылаться на `aeriya-journals`, пока pack не будет превращён в валидный compendium и проверен в чистом мире.

## Второй pack-слой

После успешной проверки первого pack:

| Pack | Тип Foundry | Что внутри | Статус |
|---|---|---|---|
| `aeriya-regions` | JournalEntry | регионы и осколки | planned |
| `aeriya-cities` | JournalEntry | города, поселения, стоянки | planned |
| `aeriya-factions` | JournalEntry | фракции и организации | planned |
| `aeriya-handouts` | JournalEntry | книги, записки, памятки, поручения, мини-сценарии | planned |
| `aeriya-spirits` | JournalEntry | духи, обеты, знаки, последствия | planned |
| `aeriya-rituals` | JournalEntry | ритуалы и обряды | planned |

## Третий pack-слой

После того как Journal packs стабильно открываются:

| Pack | Тип Foundry | Что внутри | Статус |
|---|---|---|---|
| `aeriya-rolltables` | RollTable | таблицы событий, слухов, осложнений | planned |
| `aeriya-actors` | Actor | НИПы и существа | planned |
| `aeriya-items` | Item | предметы, реликвии, дорожные вещи | planned |
| `aeriya-scenes` | Scene | сцены-заготовки с будущими картами | planned |

## Почему не включать packs в module.json прямо сейчас

Пустые или невалидные pack-папки могут создать проблемы при установке модуля. Поэтому `module.json` должен получить `packs` только после того, как будет создан первый рабочий pack и проверен путь.

## Что нужно сделать дальше

1. Запустить `npm run foundry:check` локально.
2. Проверить, что `build/foundry/aeriya-journals/manifest.json` содержит `documentCount`, `folderCount` и folder-заготовки.
3. Конвертировать `_source` и folder metadata в валидный Foundry compendium pack.
4. Добавить pack в `module.json`.
5. Проверить модуль в чистом мире Foundry.
6. После этого добавить второй слой packs по типам.
