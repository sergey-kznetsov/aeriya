# Индексация контента Aeria Core

Контент Аэрии хранится в виде чистых Markdown-карточек. Для удобной работы нужны два слоя навигации: человекочитаемые Markdown-индексы и машинный JSON-индекс для будущего интерфейса Foundry.

Главный машинный индекс:

```text
content/_indexes/content-index.json
```

Индекс собирается из YAML-блоков в начале карточек.

Пример:

```yaml
---
type: "city"
name: "Гравен Холлоу"
shard: "middle-lands"
region: "common"
source: "new-documents"
status: "draft-clean-card"
---
```

Поддерживаемые типы:

```text
city, faction, spirit, npc, monster, item, ritual, rolltable, scene, handout, region
```

Индексируются только `.md` файлы внутри `content/`, у которых есть YAML-поле `type`.

Не индексируются `README.md`, `content/_templates/`, `content/_indexes/`, ассеты, карты, токены, аудио, старые compendium packs и служебные данные старого мира.

На первом этапе индекс нужен для навигации. Позже модуль сможет использовать его для импорта карточек в Journal Entries, Actors, Items, RollTables и Scene drafts.