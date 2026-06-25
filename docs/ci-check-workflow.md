# CI check workflow Aeria Core

## Цель

GitHub Actions должен автоматически проверять, что модуль не сломан после изменений в репозитории.

Workflow-файл:

```text
.github/workflows/foundry-check.yml
```

## Когда запускается

Проверка запускается на:

- push в `main`;
- pull request в `main`.

## Что выполняется

Главная команда:

```bash
npm run foundry:check
```

Она включает:

```bash
npm run module:verify
npm run content:check
npm run journals:build
npm run journals:verify
```

## Что проверяется

| Шаг | Что ловит |
|---|---|
| `module:verify` | ошибки `module.json`, отсутствующие JS/CSS/lang/README/CHANGELOG |
| `content:check` | ошибки frontmatter и структуры content-карточек |
| `journals:build` | ошибки сборки Journal Entry export |
| `journals:verify` | битый `journal-entries.json`, дубли `_id`, дубли `sourcePath`, пустые страницы |

## Если CI упал

1. Открыть failed job в GitHub Actions.
2. Найти последнюю ошибку в логе.
3. Если ошибка в content-карточке — исправить markdown.
4. Если ошибка в `module.json` — исправить manifest или ссылку на файл.
5. Если ошибка в Journal export — проверить проблемную карточку и `build-foundry-journals.mjs`.
6. Локально выполнить:

```bash
npm run foundry:check
```

7. После успешной локальной проверки закоммитить правку.

## Важно

CI не запускает Foundry VTT и не проверяет UI внутри игрового мира. Он проверяет только техническую готовность репозитория к ручному smoke-test.

Ручная проверка Foundry описана здесь:

```text
docs/foundry-smoke-test.md
```
