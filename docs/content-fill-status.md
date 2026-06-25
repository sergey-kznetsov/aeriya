# Статус наполнения Aeria Core

## Текущий вывод

Базовое контентное наполнение закрыто по трём крупным блокам: Срединные Земли, Теневой Осколок, Палящий Осколок.

## Статус по крупным блокам

| Блок | Статус | Что есть | Что осталось именно по наполнению |
|---|---|---|---|
| Срединные Земли | content-core-complete | 21 город, 21 локальный НИП, доски, 6 городских квестовых цепочек, 9 монстров, 4 базовые сцены, 19 specific-scenes | 0 обязательных файлов |
| Теневой Осколок | content-core-complete | регионы, фракции, монстры, сцены, доска поручений, handouts, мини-сценарии, Окрам как закрытый узел, 4 city/location quest cards Леса и Льдов | 0 обязательных файлов до сверки старого мира |
| Палящий Осколок | content-core-complete | 15 городов/локаций, фракции, НИПы, монстры, поручения, мини-сценарии, доска, сцены, таблицы, 5 city/location quest cards | 0 обязательных файлов |

## Что было закрыто последним проходом

### Теневой Осколок

- `content/handouts/shadow-shard/ash-steppe/city-quests/quest-okram-zakrytyy-uzel.md`
- `content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-koren-i-dom-mha.md`
- `content/handouts/shadow-shard/black-whisper-forest/city-quests/quest-seryy-priyut-i-staraya-zastava.md`
- `content/handouts/shadow-shard/icy-limit/city-quests/quest-ogon-i-ledyanoy-klyk.md`
- `content/handouts/shadow-shard/icy-limit/city-quests/quest-pereval-i-belye-kamni.md`

### Палящий Осколок

- `content/handouts/scorching-shard/city-quests/quest-tri-teni-i-posledniy-vzdoh.md`
- `content/handouts/scorching-shard/city-quests/quest-klinok-i-steklyannyy-gorodok.md`
- `content/handouts/scorching-shard/city-quests/quest-rodnik-i-belyy-kolodets.md`
- `content/handouts/scorching-shard/city-quests/quest-fort-dvorets-i-krasnaya-sol.md`
- `content/handouts/scorching-shard/city-quests/quest-melnitsa-porog-i-tihaya-korka.md`

## Сколько осталось наполнить до технической проверки

Обязательное контентное наполнение: 0 файлов.

Следующий этап — не новое наполнение, а проверочный проход по уже созданному контенту:

| Этап | Количество |
|---|---:|
| Проверить индексы и связность путей | 1 проход |
| Проверить дубли и повторяющиеся смыслы | 1 проход |
| Проверить lore-ограничения: без кристалла души, продажи имени, продажи тени и пепла как товара | 1 проход |
| Прогнать `npm run foundry:check` | 1 команда |
| После успешной проверки — локальный Foundry smoke-test | 1 ручной тест |

## Что не считается незаполненным контентом

Эти этапы идут после наполнения:

- карты;
- токены;
- портреты;
- handout-изображения;
- конвертация Journal Entry в Actor / Item / RollTable / Scene;
- финальная правка текста после проверки.

## Следующий шаг

1. Провести внутренний аудит связности и дублей.
2. Обновить проблемные карточки, если аудит найдёт повторы или слабые места.
3. После этого запускать `npm run foundry:check` и готовиться к локальному Foundry smoke-test.
