# Workflow импорта Journal Entry в Foundry

## Цель

Быстро загрузить текущую markdown-базу Аэрии в чистый мир Foundry как Journal Entry, не дожидаясь полноценной сборки compendium pack.

Это промежуточный, но рабочий путь для первого playable-релиза.

## Что уже есть

Скрипт сборки:

```bash
npm run journals:build
```

Он создаёт JSON с Journal Entry-заготовками в:

```text
build/foundry/journal-entries.json
```

Foundry-side импортёр:

```text
scripts/foundry/import-journal-entries.js
```

## Порядок проверки

1. В локальной копии репозитория выполнить:

```bash
npm run content:check
npm run journals:build
```

2. Скопировать модуль в папку Foundry:

```text
FoundryVTT/Data/modules/aeriya
```

3. Запустить чистый мир на D&D 5e.

4. Активировать модуль `Aeria Core`.

5. Открыть консоль или создать Script Macro.

6. Выполнить содержимое файла:

```text
scripts/foundry/import-journal-entries.js
```

7. Проверить, что созданы Journal Entry и папки.

## Что делает импортёр

- Загружает `modules/aeriya/build/foundry/journal-entries.json`.
- Создаёт папки Journal Entry.
- Создаёт или обновляет записи.
- Сохраняет путь исходной карточки во `flags.aeriya.import.sourcePath`.

## Ограничения

- Это ещё не полноценный compendium pack.
- Это импорт в активный мир Foundry.
- Изображения, сцены, токены и портреты пока не привязываются автоматически.
- RollTable, Actor, Item и Scene пока импортируются как Journal Entry, если они есть в JSON.

## Почему это нужно

Это даёт первый рабочий результат быстрее, чем полноценная сборка LevelDB compendium pack. Мастер уже сможет открыть материалы в Foundry, читать карточки, показывать handouts игрокам и использовать мини-сценарии.

После проверки этого пути можно переходить к настоящим packs.
