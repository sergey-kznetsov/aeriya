# Assets Aeria Core

Папка для визуальных ассетов Foundry-модуля.

## Структура

```text
assets/
  scenes/
    cities/
      middle-lands/
      shadow-shard/
      scorching-shard/
  tokens/
    npcs/
    creatures/
  portraits/
    npcs/
  manifests/
    old-world-assets.json
```

## Правило импорта

Файлы из старого мира добавляются по путям, указанным в `assets/manifests/old-world-assets.json`.

Пока файл физически не перенесён, у записи должен быть статус `pending-import`. Такие записи не используются как готовые ассеты и не должны подключаться в Actor/Journal напрямую.

После переноса файла статус меняется на `imported`, и путь начинает проверяться валидатором `npm run assets:verify`.

## Форматы

Рекомендуемые форматы:

- сцены / города: `.webp` или `.jpg`;
- токены: `.webp` или `.png` с прозрачностью;
- портреты: `.webp` или `.jpg`.

## Имена файлов

Использовать kebab-case без пробелов:

```text
mornsted-city.webp
okram-city.webp
peschanaya-piyavka-token.webp
```
