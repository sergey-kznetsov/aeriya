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

Скрипт:

```bash
npm run journals:build
```

Он делает два результата:

```text
build/foundry/journal-entries.json
build/foundry/aeriya-journals/_source/*.json
```

`journal-entries.json` нужен как общий проверочный экспорт. `_source` нужен как staging-слой для первого будущего pack `aeriya-journals`.

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

1. Запустить `npm run journals:build` локально.
2. Проверить количество документов и структуру `build/foundry/aeriya-journals/manifest.json`.
3. Конвертировать `_source` в валидный Foundry compendium pack.
4. Добавить pack в `module.json`.
5. Проверить модуль в чистом мире Foundry.
6. После этого добавить второй слой packs по типам.
