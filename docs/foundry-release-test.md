# Foundry release-test checklist: Aeria Core

## Цель

Проверить модуль перед релизной сборкой Foundry без преждевременного подключения compendium packs в `module.json`.

Этот этап нужен, чтобы подтвердить:

- контентные карточки валидны;
- внутренние ссылки не ведут в отсутствующие пути;
- манифест ассетов корректен;
- Journal staging собирается и проверяется;
- Actor staging собирается и проверяется;
- Scene staging собирается и проверяется как show-only слой городских изображений;
- модуль открывается в Foundry VTT без ошибок.

## Главная команда

Перед ручной проверкой выполнить локально:

```bash
npm run release:test
```

Команда запускает полный технический цикл:

1. `module:verify`
2. `content:check`
3. `assets:verify`
4. `journals:build`
5. `journals:verify`
6. `actors:build`
7. `actors:verify`
8. `scenes:build`
9. `scenes:verify`
10. `verify-release-test-ready`

## Ожидаемый результат

Команда должна завершиться без ошибки и вывести финальную строку:

```text
Release-test preflight passed. The module is ready for manual Foundry staging test.
```

Если команда падает, модуль не считается готовым к ручному Foundry-тесту. Сначала исправить указанную ошибку, затем снова запустить `npm run release:test`.

## Что проверять в Foundry вручную

1. Модуль `Aeria Core` виден в списке модулей.
2. Модуль включается в чистом мире без ошибок в консоли.
3. Скрипты и стили модуля загружаются.
4. Локализация не ломает интерфейс.
5. Journal staging можно конвертировать / открыть как тестовый Journal pack.
6. Actor staging можно конвертировать / открыть как тестовый Actor pack.
7. Scene staging можно конвертировать / открыть как тестовый Scene pack.
8. Городские сцены отображаются как картинки, а не как тактические карты.
9. В городских сценах нет сетки, fog, token vision, стен, токенов и боевой навигации.
10. Imported-токены, если они уже загружены в `assets`, подтягиваются в Actor staging.

## Show-only city scenes

Городские картинки нужны только для показа вида города. Игроки по ним не ходят.

Поэтому Scene staging должен сохранять следующие правила:

- `grid.type = 0`;
- `tokenVision = false`;
- `fogExploration = false`;
- `navigation = false`;
- `tokens = []`;
- `walls = []`;
- `lights = []`;
- `drawings = []`;
- `flags.aeriya.displayMode = show-only-city-image`;
- `flags.aeriya.tacticalMap = false`;
- `flags.aeriya.playerMovement = false`.

`npm run scenes:verify` должен падать, если эти правила нарушены.

## Ассеты старого мира

Манифест ассетов находится здесь:

```text
assets/manifests/old-world-assets.json
```

Статусы записей:

| Статус | Значение |
|---|---|
| `pending-import` | путь зарезервирован, файла ещё нет, в Foundry pack не попадает |
| `imported` | файл физически лежит в репозитории и должен пройти проверку |
| `deprecated` | запись больше не используется |

Пока файл не перенесён физически, не менять статус на `imported`.

## module.json

До ручной проверки реальных Foundry compendium DB массив `packs` должен оставаться пустым:

```json
"packs": []
```

Подключать packs в `module.json` можно только после того, как Journal, Actor и Scene packs:

1. собраны;
2. прошли verify;
3. открылись в Foundry VTT;
4. проверены в чистом тестовом мире.

## Критерий перехода к релизной сборке

Модуль можно переводить из release-test в release-candidate только если:

- `npm run release:test` прошёл без ошибок;
- модуль включился в Foundry;
- Journal/Actor/Scene staging проверены вручную;
- show-only city scenes отображаются корректно;
- imported-токены не дают битых путей;
- принято решение, какие packs подключаются в `module.json`.
