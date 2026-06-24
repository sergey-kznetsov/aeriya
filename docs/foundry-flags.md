# Карта флагов Aeria Core

Этот документ описывает, какие данные Aeria Core хранит в Foundry через `flags.aeriya`.

Главный принцип: модуль не перезаписывает системные данные D&D 5e без необходимости. Всё, что относится к правилам Аэрии, хранится в отдельном namespace.

## Namespace

```text
flags.aeriya
```

## Общие правила

Флаги должны быть:

```text
читаемыми;
стабильными;
предсказуемыми;
разделёнными по механикам;
безопасными для удаления при отключении модуля.
```

Если флаг не нужен для долгого хранения, его лучше не записывать в Actor/Item/Scene, а держать временно в памяти модуля или передавать через диалог.

## Реакции

Используются для механики очка реакции Аэрии.

```text
flags.aeriya.reaction.available
```

Тип: `boolean`  
Значение: доступна ли реакция Аэрии у персонажа.

```text
flags.aeriya.reaction.lastRoll
```

Тип: `number | null`  
Значение: последний результат броска `1d10` на восстановление реакции.

```text
flags.aeriya.reaction.usedThisRound
```

Тип: `boolean`  
Значение: была ли реакция потрачена в текущем круге боя.

```text
flags.aeriya.reaction.lastUseType
```

Тип: `string | null`  
Значение: последнее действие реакции.

Возможные значения:

```text
dodge
parry
counterattack
protect-ally
backlash-deflection
custom
```

## Точные попадания

Используются для выбора слабых мест и прицельных атак.

```text
flags.aeriya.targeting.knownWeakSpots
```

Тип: `array`  
Значение: слабые места цели, которые известны конкретному персонажу или партии.

Пример:

```json
[
  "left-leg-tendon",
  "right-eye",
  "cracked-armor-plate"
]
```

```text
flags.aeriya.targeting.lastTargetedZone
```

Тип: `string | null`  
Значение: зона, по которой персонаж целился последней атакой.

```text
flags.aeriya.targeting.lastTargetingResult
```

Тип: `string | null`  
Значение: результат последнего точного попадания.

Возможные значения:

```text
success
partial-success
miss
critical-success
critical-failure
manual
```

## Слабые места существ

Используются на Actor или Item, если слабые места хранятся как данные существа.

```text
flags.aeriya.weakSpots
```

Тип: `array`  
Значение: список слабых мест существа.

Пример:

```json
[
  {
    "id": "leg-tendon",
    "name": "Сухожилия задних ног",
    "visibility": "gm-only",
    "knowledgeCheck": "nature",
    "dc": 14,
    "attackPenalty": -2,
    "effect": "Снижение скорости на 50% до конца следующего хода",
    "risk": "При провале цель получает преимущество на контратаку"
  }
]
```

Рекомендуемые поля слабого места:

```text
id;
name;
description;
visibility;
knowledgeCheck;
dc;
attackPenalty;
effect;
risk;
knownBy;
```

## Ритуалы

Используются для известных ритуалов, активных откатов и последствий.

```text
flags.aeriya.rituals.knownRituals
```

Тип: `array`  
Значение: список известных персонажу ритуалов.

```text
flags.aeriya.rituals.activeBacklash
```

Тип: `array`  
Значение: активные откаты, связанные с персонажем или сценой.

```text
flags.aeriya.rituals.lastRitualId
```

Тип: `string | null`  
Значение: последний проведённый ритуал.

```text
flags.aeriya.rituals.lastOutcome
```

Тип: `string | null`  
Значение: исход последнего ритуала.

Возможные значения:

```text
success
partial-success
failure
backlash
interrupted
manual
```

## Некромантия

Некромантия выделяется отдельно от обычных ритуалов, потому что связана с душами, смертью, погребением и патроном.

```text
flags.aeriya.necromancy.patron
```

Тип: `string | null`  
Значение: патрон некроманта или сущность, через которую идёт сила.

```text
flags.aeriya.necromancy.soulDebt
```

Тип: `number | object`  
Значение: долг, связанный с обменом души, нарушением перехода или вмешательством в смерть.

```text
flags.aeriya.necromancy.boundSouls
```

Тип: `array`  
Значение: души, тела, имена или памяти, связанные с персонажем.

```text
flags.aeriya.necromancy.funeralViolation
```

Тип: `boolean | object`  
Значение: нарушал ли персонаж погребальный порядок и как именно.

## Духи и обеты

Используются для связи персонажа или партии с духами.

```text
flags.aeriya.spirits.oaths
```

Тип: `array`  
Значение: активные обеты.

```text
flags.aeriya.spirits.favor
```

Тип: `object`  
Значение: расположение духов.

Пример:

```json
{
  "omulu": "neutral",
  "niks": "favorable",
  "azidahaka": "angered"
}
```

Рекомендуемые значения расположения:

```text
favorable
neutral
silent
warning
angered
hostile
```

```text
flags.aeriya.spirits.debt
```

Тип: `array`  
Значение: долги духам.

```text
flags.aeriya.spirits.lastSign
```

Тип: `string | null`  
Значение: последняя примета, знак или предупреждение духа.

## Фракционная репутация

Используется для отношения фракций к персонажу или партии.

```text
flags.aeriya.factions.reputation
```

Тип: `object`  
Значение: отношение фракций.

Пример:

```json
{
  "black-caravan": 2,
  "fifth-tooth-guild": -1,
  "oath-blades": 1
}
```

Рекомендуемый диапазон:

```text
-3 — враги;
-2 — враждебность;
-1 — недоверие;
 0 — нейтрально;
 1 — известные союзники;
 2 — доверие;
 3 — сильная поддержка.
```

```text
flags.aeriya.factions.debts
```

Тип: `array`  
Значение: долги перед фракциями или долги фракций перед партией.

```text
flags.aeriya.factions.access
```

Тип: `array`  
Значение: доступы, которые получила партия.

Пример:

```json
[
  "black-caravan-safe-route",
  "graven-hollow-market-license"
]
```

## Эпические действия

Используются для фиксации действий, которые вышли за стандартные правила.

```text
flags.aeriya.epicActions.history
```

Тип: `array`  
Значение: история эпических действий персонажа или партии.

```text
flags.aeriya.epicActions.lastCost
```

Тип: `string | object | null`  
Значение: цена последнего эпического действия.

```text
flags.aeriya.epicActions.lastOutcome
```

Тип: `string | null`  
Значение: результат последнего эпического действия.

## Региональные состояния

Используются на Scene или World для опасностей региона.

```text
flags.aeriya.region.currentRegion
```

Тип: `string | null`  
Значение: текущий регион сцены или путешествия.

```text
flags.aeriya.region.threatClock
```

Тип: `number | object`  
Значение: шкала угрозы региона.

```text
flags.aeriya.region.activeHazards
```

Тип: `array`  
Значение: активные угрозы.

Пример:

```json
[
  "blind-winds",
  "black-whisper-fog",
  "salt-mirage"
]
```

## Временные данные

Не всё нужно хранить в flags.

Не сохранять без необходимости:

```text
текущий выбор в диалоге;
предпросмотр цены эпического действия;
временные подсказки мастеру;
варианты, которые мастер отклонил;
результаты, которые не повлияли на мир.
```

## Правило удаления

Если модуль отключён, стандартный мир D&D 5e должен оставаться рабочим.

Флаги Aeria Core могут остаться в данных актёров и сцен, но они не должны ломать листы, броски, предметы и стандартные эффекты.
