const MODULE_ID = "aeriya";
const SCHEMA = "combat-tools-v2-token-hud";
const REACTION_MACRO_NAME = "Аэрия: Реакция в бою";

const REACTION_FLAGS = Object.freeze({
  available: "reaction.available",
  usedThisRound: "reaction.usedThisRound",
  lastUseType: "reaction.lastUseType",
  lastRoll: "reaction.lastRoll",
  schema: "reaction.combatToolsSchema"
});

const HUD_ID = "aeriya-combat-hud";

function actorFromCombatant(combatant) {
  return combatant?.actor ?? null;
}

function controlledTokens() {
  return canvas?.tokens?.controlled ?? [];
}

function controlledActors() {
  return [...new Set(controlledTokens().map((token) => token.actor).filter(Boolean))];
}

function activeCombatantActor() {
  return actorFromCombatant(game.combat?.combatant);
}

function getTargetActor() {
  const selected = controlledActors();
  if (selected.length) return selected[0];
  return activeCombatantActor() ?? game.user?.character ?? null;
}

function canControlActor(actor) {
  if (!actor) return false;
  return game.user?.isGM || actor.isOwner || actor.testUserPermission?.(game.user, "OWNER");
}

function reactionAvailable(actor) {
  if (!actor) return false;
  return Boolean(actor.getFlag(MODULE_ID, REACTION_FLAGS.available));
}

async function setReaction(actor, available, reason = "manual") {
  if (!actor) return false;
  await actor.setFlag(MODULE_ID, REACTION_FLAGS.available, Boolean(available));
  await actor.setFlag(MODULE_ID, REACTION_FLAGS.usedThisRound, !available);
  await actor.setFlag(MODULE_ID, REACTION_FLAGS.lastUseType, reason);
  await actor.setFlag(MODULE_ID, REACTION_FLAGS.schema, SCHEMA);
  return true;
}

function reactionLabel(reason) {
  return {
    reaction: "реакция",
    dodge: "уклонение",
    parry: "парирование",
    counterattack: "контратака",
    weakspot: "выцеливание слабого места"
  }[reason] ?? reason;
}

async function recoverReaction(actor, reason = "start-turn") {
  if (!actor) return false;
  await setReaction(actor, true, reason);
  if (reason !== "silent") {
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>${actor.name}</strong> восстанавливает реакцию.</p>`
    });
  }
  refreshTokenHud();
  return true;
}

async function spendReaction(actor, reason = "reaction") {
  if (!actor) {
    ui.notifications?.warn("Aeria Core: выбери токен или активного участника боя.");
    return false;
  }
  if (!reactionAvailable(actor)) {
    ui.notifications?.warn(`Aeria Core: у ${actor.name} реакция уже потрачена.`);
    return false;
  }
  await setReaction(actor, false, reason);
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>${actor.name}</strong> тратит реакцию: ${reactionLabel(reason)}.</p>`
  });
  refreshTokenHud();
  return true;
}

async function announceCombatAction(actor, title, body = "") {
  if (!actor) return false;
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="aeriya-content"><h3>${title}</h3><p><strong>${actor.name}</strong>${body ? ` ${body}` : ""}</p></div>`
  });
  return true;
}

async function rollReactionRecovery(actor = getTargetActor()) {
  if (!actor) {
    ui.notifications?.warn("Aeria Core: выбери токен или активного участника боя.");
    return null;
  }
  const threshold = Number(game.settings.get(MODULE_ID, "reactionRecoveryThreshold") ?? 4);
  const roll = await new Roll("1d10").evaluate();
  const recovered = roll.total <= threshold;
  await actor.setFlag(MODULE_ID, REACTION_FLAGS.lastRoll, roll.total);
  await setReaction(actor, recovered, "recovery-roll");
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: recovered
      ? `<strong>${actor.name}</strong> восстанавливает реакцию. Порог: ${threshold}.`
      : `<strong>${actor.name}</strong> не восстанавливает реакцию. Порог: ${threshold}.`
  });
  refreshTokenHud();
  return { actor, roll, recovered };
}

async function useSelectedReaction(reason = "reaction") {
  return spendReaction(getTargetActor(), reason);
}

async function resetCombatReactions(combat = game.combat) {
  if (!game.user?.isGM || !combat) return { updated: 0 };
  let updated = 0;
  for (const combatant of combat.combatants ?? []) {
    const actor = actorFromCombatant(combatant);
    if (!actor) continue;
    await setReaction(actor, true, "combat-start");
    updated += 1;
  }
  refreshTokenHud();
  return { updated };
}

async function refreshActiveCombatantReaction(combat = game.combat) {
  if (!game.user?.isGM || !combat) return false;
  if (!game.settings.get(MODULE_ID, "autoRefreshReactionEachTurn")) return false;
  const actor = activeCombatantActor();
  if (!actor) return false;
  await setReaction(actor, true, "start-turn");
  refreshTokenHud();
  return true;
}

function itemActivationType(item) {
  return item?.system?.activation?.type ?? item?.system?.activities?.contents?.[0]?.activation?.type ?? "";
}

function itemActionType(item) {
  return item?.system?.actionType ?? item?.system?.activities?.contents?.[0]?.actionType ?? "";
}

function isEquipped(item) {
  return item?.system?.equipped !== false;
}

function findPrimaryAttack(actor) {
  if (!actor?.items) return null;
  const items = Array.from(actor.items);
  return items.find((item) => item.name === "Основная атака")
    ?? items.find((item) => item.type === "weapon" && isEquipped(item))
    ?? items.find((item) => ["mwak", "rwak", "msak", "rsak"].includes(itemActionType(item)))
    ?? items.find((item) => itemActivationType(item) === "action");
}

function findSpecialAction(actor) {
  if (!actor?.items) return null;
  const items = Array.from(actor.items);
  return items.find((item) => item.name === "Особое действие")
    ?? items.find((item) => /особ|special|feature|приём|прием|способн/i.test(item.name) && itemActivationType(item) !== "passive")
    ?? items.find((item) => item.type === "feat" && itemActivationType(item) === "action");
}

async function useItemFromHud(item, actor) {
  if (!item) return false;
  try {
    if (typeof item.use === "function") {
      await item.use({ configureDialog: true, event: undefined });
      return true;
    }
    if (typeof item.roll === "function") {
      await item.roll({ configureDialog: true });
      return true;
    }
    item.sheet?.render?.(true);
    return true;
  } catch (error) {
    console.error("Aeria Core: combat HUD item use failed", error);
    ui.notifications?.error(`Aeria Core: не удалось применить ${item.name}. Лист Actor открыт для ручного броска.`);
    actor?.sheet?.render?.(true);
    return false;
  }
}

async function usePrimaryAttack(actor = getTargetActor()) {
  if (!actor) return ui.notifications?.warn("Aeria Core: выбери токен."), false;
  const item = findPrimaryAttack(actor);
  if (!item) {
    actor.sheet?.render?.(true);
    ui.notifications?.warn(`Aeria Core: у ${actor.name} не найдена атака. Открыл лист.`);
    return false;
  }
  return useItemFromHud(item, actor);
}

async function useSpecialAction(actor = getTargetActor()) {
  if (!actor) return ui.notifications?.warn("Aeria Core: выбери токен."), false;
  const item = findSpecialAction(actor);
  if (!item) {
    await announceCombatAction(actor, "Особое действие", "использует особое действие по описанию существа или ситуации.");
    return false;
  }
  return useItemFromHud(item, actor);
}

async function useDodge(actor = getTargetActor()) {
  if (!actor) return ui.notifications?.warn("Aeria Core: выбери токен."), false;
  return announceCombatAction(actor, "Уклонение", "занимает защитную позицию и концентрируется на уходе от атаки.");
}

async function useWeakSpot(actor = getTargetActor()) {
  if (!actor) return ui.notifications?.warn("Aeria Core: выбери токен."), false;
  return announceCombatAction(actor, "Выцеливание слабого места", "пытается найти уязвимую точку цели. Мастер назначает проверку и эффект по ситуации.");
}

async function useParry(actor = getTargetActor()) {
  return spendReaction(actor, "parry");
}

async function useCounterattack(actor = getTargetActor()) {
  const ok = await spendReaction(actor, "counterattack");
  if (ok) await usePrimaryAttack(actor);
  return ok;
}

async function finishTurn(actor = getTargetActor()) {
  if (!game.combat) return ui.notifications?.warn("Aeria Core: сейчас нет активного боя."), false;
  const activeActor = activeCombatantActor();
  if (activeActor && actor && activeActor.id !== actor.id && !game.user?.isGM) {
    ui.notifications?.warn("Aeria Core: сейчас ход другого участника.");
    return false;
  }
  await game.combat.nextTurn();
  return true;
}

async function openReactionDialog(actor = getTargetActor()) {
  if (!actor) {
    ui.notifications?.warn("Aeria Core: выбери токен или активного участника боя.");
    return null;
  }

  return Dialog.wait({
    title: REACTION_MACRO_NAME,
    content: `<p><strong>${actor.name}</strong></p><p>Статус реакции: ${reactionAvailable(actor) ? "доступна" : "потрачена"}.</p>`,
    buttons: {
      parry: {
        label: "Парирование",
        callback: () => useParry(actor)
      },
      counterattack: {
        label: "Контратака",
        callback: () => useCounterattack(actor)
      },
      dodgeReaction: {
        label: "Уклонение реакцией",
        callback: () => spendReaction(actor, "dodge")
      },
      recover: {
        label: "Восстановить",
        callback: () => recoverReaction(actor, "manual")
      },
      roll: {
        label: "Бросок восстановления 1к10",
        callback: () => rollReactionRecovery(actor)
      }
    },
    default: "parry"
  });
}

async function ensureReactionMacro() {
  if (!game.user?.isGM) return null;
  const command = `game.aeriya?.combat?.openReactionDialog?.();`;
  const existing = game.macros?.find((macro) => macro.name === REACTION_MACRO_NAME);
  const data = { name: REACTION_MACRO_NAME, type: "script", img: "icons/svg/sword.svg", command, flags: { [MODULE_ID]: { macroSchema: SCHEMA } } };
  if (existing) {
    await existing.update(data);
    return existing;
  }
  return Macro.create(data);
}

function getHtmlElement(html) {
  if (!html) return null;
  if (html instanceof HTMLElement) return html;
  if (html[0] instanceof HTMLElement) return html[0];
  return null;
}

function getHudActor(app, data) {
  return app?.object?.actor
    ?? data?.object?.actor
    ?? canvas?.tokens?.get?.(data?._id)?.actor
    ?? getTargetActor();
}

function button(label, action, title = label, disabled = false) {
  return `<button type="button" class="aeriya-combat-hud__btn" data-aeriya-combat-action="${action}" title="${title}" ${disabled ? "disabled" : ""}>${label}</button>`;
}

function renderCombatHud(app, html, data) {
  if (!game.settings.get(MODULE_ID, "showCombatTokenHud")) return;
  if (!game.combat) return;

  const root = getHtmlElement(html);
  const actor = getHudActor(app, data);
  if (!root || !actor || !canControlActor(actor)) return;

  root.querySelector(`.${HUD_ID}`)?.remove();
  const available = reactionAvailable(actor);
  const isTurn = activeCombatantActor()?.id === actor.id;
  const attack = findPrimaryAttack(actor);
  const special = findSpecialAction(actor);

  const panel = document.createElement("div");
  panel.className = HUD_ID;
  panel.innerHTML = `
    <div class="aeriya-combat-hud__title">Аэрия: бой ${isTurn ? "· ход" : ""}</div>
    <div class="aeriya-combat-hud__row">
      ${button("Атака", "attack", attack ? `Использовать: ${attack.name}` : "Атака не найдена")}
      ${button("Особое", "special", special ? `Использовать: ${special.name}` : "Особое действие")}
      ${button("Слабое место", "weakspot", "Выцелить слабое место")}
      ${button("Уклонение", "dodge", "Защитное действие")}
    </div>
    <div class="aeriya-combat-hud__row">
      ${button("Парирование", "parry", "Потратить реакцию на парирование", !available)}
      ${button("Контратака", "counterattack", "Потратить реакцию и выполнить атаку", !available)}
      ${button("Реакция 1к10", "recovery", "Бросок восстановления реакции")}
      ${button("Вернуть", "recover", "Вернуть реакцию вручную")}
    </div>
    <div class="aeriya-combat-hud__row">
      ${button("Лист", "sheet", "Открыть лист персонажа")}
      ${button("Конец хода", "endturn", "Передать ход")}
    </div>
    <div class="aeriya-combat-hud__state">Реакция: ${available ? "доступна" : "потрачена"}</div>
  `;

  panel.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-aeriya-combat-action]");
    if (!target || target.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    const action = target.dataset.aeriyaCombatAction;
    const currentActor = getHudActor(app, data) ?? actor;
    if (action === "attack") await usePrimaryAttack(currentActor);
    if (action === "special") await useSpecialAction(currentActor);
    if (action === "weakspot") await useWeakSpot(currentActor);
    if (action === "dodge") await useDodge(currentActor);
    if (action === "parry") await useParry(currentActor);
    if (action === "counterattack") await useCounterattack(currentActor);
    if (action === "recovery") await rollReactionRecovery(currentActor);
    if (action === "recover") await recoverReaction(currentActor, "manual");
    if (action === "sheet") currentActor?.sheet?.render?.(true);
    if (action === "endturn") await finishTurn(currentActor);
  });

  const right = root.querySelector(".col.right") ?? root.querySelector(".right") ?? root;
  right.append(panel);
}

function refreshTokenHud() {
  try {
    if (canvas?.tokens?.hud?.rendered) canvas.tokens.hud.render(true);
  } catch (error) {
    console.warn("Aeria Core: Token HUD refresh skipped", error);
  }
}

function injectCombatHudStyles() {
  if (document.getElementById("aeriya-combat-hud-style")) return;
  const style = document.createElement("style");
  style.id = "aeriya-combat-hud-style";
  style.textContent = `
    .${HUD_ID} {
      position: absolute;
      right: 52px;
      top: -4px;
      min-width: 292px;
      padding: 8px;
      border: 1px solid rgba(180, 150, 90, 0.9);
      border-radius: 8px;
      background: rgba(18, 14, 10, 0.94);
      box-shadow: 0 0 10px rgba(0,0,0,0.55);
      pointer-events: auto;
      z-index: 100;
    }
    .aeriya-combat-hud__title {
      margin: 0 0 6px;
      color: #f0d59a;
      font-size: 12px;
      line-height: 1.2;
      font-weight: 700;
      text-align: center;
    }
    .aeriya-combat-hud__row {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 4px;
      margin-bottom: 4px;
    }
    .aeriya-combat-hud__btn {
      min-height: 24px;
      padding: 2px 4px;
      border: 1px solid rgba(210, 180, 110, 0.7);
      border-radius: 4px;
      background: rgba(65, 48, 28, 0.95);
      color: #f8e8bd;
      font-size: 11px;
      line-height: 1.1;
      cursor: pointer;
    }
    .aeriya-combat-hud__btn:hover:not(:disabled) {
      background: rgba(104, 73, 35, 0.98);
    }
    .aeriya-combat-hud__btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .aeriya-combat-hud__state {
      color: #d8c49b;
      font-size: 11px;
      line-height: 1.2;
      text-align: center;
    }
  `;
  document.head.append(style);
}

function registerSettings() {
  game.settings.register(MODULE_ID, "autoRefreshReactionEachTurn", {
    name: "Aeria Core: реакция восстанавливается в начале хода",
    hint: "Включает нормальную боевую логику: на старте хода участник боя снова может использовать реакцию.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(MODULE_ID, "ensureCombatReactionMacro", {
    name: "Aeria Core: создать макрос реакции",
    hint: "Создаёт и обновляет макрос «Аэрия: Реакция в бою» у мастера.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(MODULE_ID, "showCombatTokenHud", {
    name: "Aeria Core: боевая панель на токене",
    hint: "Показывает боевые кнопки Аэрии в Token HUD во время активного боя.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}

function exposeApi() {
  game.aeriya = game.aeriya ?? {};
  game.aeriya.combat = {
    schema: SCHEMA,
    reactionAvailable,
    spendReaction,
    recoverReaction,
    rollReactionRecovery,
    useSelectedReaction,
    resetCombatReactions,
    refreshActiveCombatantReaction,
    openReactionDialog,
    ensureReactionMacro,
    usePrimaryAttack,
    useSpecialAction,
    useDodge,
    useWeakSpot,
    useParry,
    useCounterattack,
    finishTurn
  };
}

Hooks.once("init", registerSettings);

Hooks.once("ready", async () => {
  exposeApi();
  injectCombatHudStyles();
  if (game.user?.isGM && game.settings.get(MODULE_ID, "ensureCombatReactionMacro")) {
    await ensureReactionMacro();
  }
});

Hooks.on("renderTokenHUD", renderCombatHud);
Hooks.on("controlToken", () => window.setTimeout(refreshTokenHud, 80));
Hooks.on("updateActor", () => window.setTimeout(refreshTokenHud, 80));

Hooks.on("createCombat", async (combat) => {
  await resetCombatReactions(combat);
});

Hooks.on("updateCombat", async (combat, changed) => {
  if (!Object.hasOwn(changed, "turn") && !Object.hasOwn(changed, "round")) return;
  await refreshActiveCombatantReaction(combat);
});
