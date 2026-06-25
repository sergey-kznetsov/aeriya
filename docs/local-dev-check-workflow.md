# Local dev-check workflow Aeria Core

## Цель

Перед ручной проверкой в Foundry нужно убедиться, что модуль, контентные карточки и Journal export технически согласованы.

Главная команда:

```bash
npm run foundry:check
```

## Что делает foundry:check

Команда выполняет цепочку:

```bash
npm run module:verify
npm run content:check
npm run journals:build
npm run journals:verify
```

## Шаг 1. Проверка module.json

```bash
npm run module:verify
```

Проверяет:

- обязательные поля `module.json`;
- `id`, `title`, `version`, `compatibility`;
- наличие JS, CSS, language-файлов;
- наличие README и CHANGELOG;
- корректность массива `packs`.

Важно: сейчас `packs` может быть пустым. Это нормально, пока первый реальный pack не создан и не проверен.

## Шаг 2. Проверка контентных карточек

```bash
npm run content:check
```

Проверяет карточки в `content/` и обновляет индексы.

Карточки должны иметь frontmatter:

```yaml
type: "..."
name: "..."
shard: "..."
region: "..."
source: "..."
status: "..."
```

## Шаг 3. Сборка Journal export

```bash
npm run journals:build
```

Создаёт:

```text
build/foundry/journal-entries.json
build/foundry/aeriya-journals/_source/*.json
build/foundry/aeriya-journals/manifest.json
```

`journal-entries.json` используется Foundry-side импортёром:

```text
scripts/foundry/import-journal-entries.js
```

## Шаг 4. Проверка Journal export

```bash
npm run journals:verify
```

Проверяет:

- что `journal-entries.json` существует;
- что это непустой массив;
- что у каждой записи есть `_id`, `name`, `folder`, `pages`;
- что `pages[0].text.content` заполнен;
- что есть `flags.aeriya.sourcePath`;
- что нет дублей по `_id` и `sourcePath`;
- что staged pack source совпадает по количеству с JSON;
- что manifest staged pack имеет id `aeriya-journals`.

## Перед запуском Foundry

Минимальный порядок:

```bash
npm run foundry:check
```

Если команда проходит без ошибок, можно копировать модуль в:

```text
FoundryVTT/Data/modules/aeriya
```

Затем выполнять smoke-test:

```text
docs/foundry-smoke-test.md
```

## Если команда падает

1. Сначала читать последнюю строку ошибки.
2. Если ошибка в карточке — исправить markdown в `content/`.
3. Если ошибка в module.json — исправить manifest или отсутствующий файл.
4. Если ошибка в journal export — проверить `scripts/dev/build-foundry-journals.mjs` и проблемную карточку.
5. После правки снова выполнить `npm run foundry:check`.

## Критерий готовности к ручному тесту

Ручной тест в Foundry имеет смысл запускать только после успешного:

```bash
npm run foundry:check
```
