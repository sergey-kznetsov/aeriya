const MODULE_ID = "aeriya";
const SCHEMA = "combat-tools-v3-token-combat-panel";
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

function esc(value) {
  const text = String(value ?? "");
  return foundry?.utils?.escapeHTML?.(text) ?? text.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
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
      content: `<p><strong>${esc(actor.name)}</strong> восстанавливает реакцию.</p>`
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
    content: `<p><strong>${esc(actor.name)}</strong> тратит реакцию: ${esc(reactionLabel(reason))}.</p>`
  });
  refreshTokenHud();
  return true;
}

async function announceCombatAction(actor, title, body = "") {
  if (!actor) return false;
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="aeriya-content"><h3>${esc(title)}</h3><p><strong>${esc(actor.name)}</strong>${body ? ` ${esc(body)}` : ""}</p></div>`
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
      ? `<strong>${esc(actor.name)}</strong> восстанавливает реакцию. Порог: ${threshold}.`
      : `<strong>${esc(actor.name)}</strong> не восстанавливает реакцию. Порог: ${threshold}.`
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

function actorItems(actor) {
  return Array.from(actor?.items ?? []);
}

function itemActivationType(item) {
  return item?.system?.activation?.type ?? item?.system?.activities?.contents?.[0]?.activation?.type ?? "";
}

function itemActionType(item) {
  return item?.system?.actionType ?? item?.system?.activities?.contents?.[0]?.actionType ?? "";
}

function itemProperties(item) {
  const props = item?.system?.properties;
  if (!props) return [];
  if (props instanceof Set) return Array.from(props);
  if (Array.isArray(props)) return props;
  if (typeof props === "object") return Object.entries(props).filter(([, enabled]) => Boolean(enabled)).map(([key]) => key);
  return [];
}

function itemQuantity(item) {
  return item?.system?.quantity ?? item?.system?.uses?.value ?? "";
}

function isEquipped(item) {
  return item?.system?.equipped !== false;
}

function canToggleEquipped(item) {
  return typeof item?.system?.equipped === "boolean";
}

function isPreparedSpell(item) {
  const prep = item?.system?.preparation;
  if (!prep) return true;
  return prep.mode === "always" || prep.prepared !== false;
}

function isMagicItem(item) {
  if (item?.type === "spell") return true;
  const props = itemProperties(item).map((property) => String(property).toLowerCase());
  return props.includes("mgc") || props.includes("magic") || props.includes("magical") || /маг|spell|wand|scroll|potion|staff/i.test(item?.name ?? "");
}

function itemSubtitle(item) {
  const bits = [];
  if (item.type) bits.push(item.type);
  const activation = itemActivationType(item);
  if (activation) bits.push(`активация: ${activation}`);
  const actionType = itemActionType(item);
  if (actionType) bits.push(actionType);
  const qty = itemQuantity(item);
  if (qty !== "" && qty !== null && qty !== undefined) bits.push(`кол-во: ${qty}`);
  if (canToggleEquipped(item)) bits.push(item.system.equipped ? "экипировано" : "не экипировано");
  if (item.type === "spell") bits.push(isPreparedSpell(item) ? "подготовлено" : "не подготовлено");
  return bits.join(" · ");
}

function getWeapons(actor) {
  return actorItems(actor).filter((item) => item.type === "weapon");
}

function getInventory(actor) {
  return actorItems(actor).filter((item) => ["consumable", "loot", "backpack", "container", "tool"].includes(item.type));
}

function getMagic(actor) {
  return actorItems(actor).filter(isMagicItem);
}

function getFeatures(actor) {
  return actorItems(actor).filter((item) => item.type === "feat" || item.type === "class" || item.type === "subclass");
}

function getEquipment(actor) {
  return actorItems(actor).filter((item) => ["equipment", "weapon", "tool"].includes(item.type));
}

function getEquippedEffects(actor) {
  const rows = [];
  for (const item of getEquipment(actor).filter(isEquipped)) {
    for (const effect of item.effects ?? []) rows.push({ effect, source: item.name, sourceItem: item });
  }
  for (const effect of actor?.effects ?? []) rows.push({ effect, source: actor.name, sourceItem: null });
  return rows;
}

function findPrimaryAttack(actor) {
  const items = actorItems(actor);
  return items.find((item) => item.name === "Основная атака")
    ?? items.find((item) => item.type === "weapon" && isEquipped(item))
    ?? items.find((item) => ["mwak", "rwak", "msak", "rsak"].includes(itemActionType(item)))
    ?? items.find((item) => itemActivationType(item) === "action");
}

function findSpecialAction(actor) {
  const items = actorItems(actor);
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

async function toggleItemEquipped(item) {
  if (!item) return false;
  if (!canToggleEquipped(item)) {
    item.sheet?.render?.(true);
    return false;
  }
  await item.update({ "system.equipped": !item.system.equipped });
  refreshTokenHud();
  return true;
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

function itemRows(actor, items) {
  if (!items.length) return `<p class="aeriya-combat-browser__empty">Нет подходящих элементов.</p>`;
  return `<div class="aeriya-combat-browser__list">${items.map((item) => `
    <div class="aeriya-combat-browser__item" data-item-id="${esc(item.id)}">
      <img src="${esc(item.img ?? "icons/svg/item-bag.svg")}" alt="" />
      <div class="aeriya-combat-browser__body">
        <strong>${esc(item.name)}</strong>
        <span>${esc(itemSubtitle(item))}</span>
      </div>
      <div class="aeriya-combat-browser__actions">
        <button type="button" data-aeriya-item-action="use">Применить</button>
        ${canToggleEquipped(item) ? `<button type="button" data-aeriya-item-action="equip">${item.system.equipped ? "Снять" : "Экип."}</button>` : ""}
        <button type="button" data-aeriya-item-action="open">Лист</button>
      </div>
    </div>
  `).join("")}</div>`;
}

function getHtmlElement(html) {
  if (!html) return null;
  if (html instanceof HTMLElement) return html;
  if (html[0] instanceof HTMLElement) return html[0];
  return null;
}

function openItemBrowser(actor, title, items) {
  if (!actor) return ui.notifications?.warn("Aeria Core: выбери токен."), null;
  const dialog = new Dialog({
    title: `${title}: ${actor.name}`,
    content: `<div class="aeriya-combat-browser">${itemRows(actor, items)}</div>`,
    buttons: { close: { label: "Закрыть" } },
    render: (html) => {
      const root = getHtmlElement(html);
      if (!root) return;
      root.addEventListener("click", async (event) => {
        const buttonEl = event.target.closest("[data-aeriya-item-action]");
        if (!buttonEl) return;
        event.preventDefault();
        event.stopPropagation();
        const row = buttonEl.closest("[data-item-id]");
        const item = actor.items.get(row?.dataset?.itemId);
        if (!item) return;
        const action = buttonEl.dataset.aeriyaItemAction;
        if (action === "use") await useItemFromHud(item, actor);
        if (action === "equip") await toggleItemEquipped(item);
        if (action === "open") item.sheet?.render?.(true);
      });
    }
  }, { width: 620, resizable: true });
  dialog.render(true);
  return dialog;
}

function effectRows(actor, rows) {
  if (!rows.length) return `<p class="aeriya-combat-browser__empty">Нет активных эффектов или эффектов экипировки.</p>`;
  return `<div class="aeriya-combat-browser__list">${rows.map(({ effect, source }) => `
    <div class="aeriya-combat-browser__item" data-effect-id="${esc(effect.id)}" data-effect-parent="${esc(effect.parent?.id ?? "")}">
      <img src="${esc(effect.img ?? effect.icon ?? "icons/svg/aura.svg")}" alt="" />
      <div class="aeriya-combat-browser__body">
        <strong>${esc(effect.name ?? effect.label ?? "Эффект")}</strong>
        <span>${esc(source)} · ${effect.disabled ? "выключен" : "активен"}</span>
      </div>
      <div class="aeriya-combat-browser__actions">
        <button type="button" data-aeriya-effect-action="toggle">${effect.disabled ? "Вкл." : "Выкл."}</button>
        <button type="button" data-aeriya-effect-action="open">Лист</button>
      </div>
    </div>
  `).join("")}</div>`;
}

function findEffectById(actor, id) {
  const actorEffect = actor.effects?.get?.(id);
  if (actorEffect) return actorEffect;
  for (const item of actorItems(actor)) {
    const itemEffect = item.effects?.get?.(id);
    if (itemEffect) return itemEffect;
  }
  return null;
}

function openEffectsBrowser(actor) {
  if (!actor) return ui.notifications?.warn("Aeria Core: выбери токен."), null;
  const rows = getEquippedEffects(actor);
  const dialog = new Dialog({
    title: `Эффекты: ${actor.name}`,
    content: `<div class="aeriya-combat-browser">${effectRows(actor, rows)}</div>`,
    buttons: { close: { label: "Закрыть" } },
    render: (html) => {
      const root = getHtmlElement(html);
      if (!root) return;
      root.addEventListener("click", async (event) => {
        const buttonEl = event.target.closest("[data-aeriya-effect-action]");
        if (!buttonEl) return;
        event.preventDefault();
        event.stopPropagation();
        const row = buttonEl.closest("[data-effect-id]");
        const effect = findEffectById(actor, row?.dataset?.effectId);
        if (!effect) return;
        const action = buttonEl.dataset.aeriyaEffectAction;
        if (action === "toggle") {
          await effect.update({ disabled: !effect.disabled });
          refreshTokenHud();
        }
        if (action === "open") effect.sheet?.render?.(true);
      });
    }
  }, { width: 620, resizable: true });
  dialog.render(true);
  return dialog;
}

function openWeapons(actor = getTargetActor()) {
  return openItemBrowser(actor, "Оружие", getWeapons(actor));
}

function openInventory(actor = getTargetActor()) {
  return openItemBrowser(actor, "Инвентарь", getInventory(actor));
}

function openMagic(actor = getTargetActor()) {
  return openItemBrowser(actor, "Магия", getMagic(actor));
}

function openFeatures(actor = getTargetActor()) {
  return openItemBrowser(actor, "Особенности", getFeatures(actor));
}

function openEquipment(actor = getTargetActor()) {
  return openItemBrowser(actor, "Экипировка", getEquipment(actor));
}

async function openReactionDialog(actor = getTargetActor()) {
  if (!actor) {
    ui.notifications?.warn("Aeria Core: выбери токен или активного участника боя.");
    return null;
  }

  return Dialog.wait({
    title: REACTION_MACRO_NAME,
    content: `<p><strong>${esc(actor.name)}</strong></p><p>Статус реакции: ${reactionAvailable(actor) ? "доступна" : "потрачена"}.</p>`,
    buttons: {
      parry: { label: "Парирование", callback: () => useParry(actor) },
      counterattack: { label: "Контратака", callback: () => useCounterattack(actor) },
      dodgeReaction: { label: "Уклонение реакцией", callback: () => spendReaction(actor, "dodge") },
      recover: { label: "Восстановить", callback: () => recoverReaction(actor, "manual") },
      roll: { label: "Бросок восстановления 1к10", callback: () => rollReactionRecovery(actor) }
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

function getHudActor(app, data) {
  return app?.object?.actor
    ?? data?.object?.actor
    ?? canvas?.tokens?.get?.(data?._id)?.actor
    ?? getTargetActor();
}

function button(label, action, title = label, disabled = false) {
  return `<button type="button" class="aeriya-combat-hud__btn" data-aeriya-combat-action="${action}" title="${esc(title)}" ${disabled ? "disabled" : ""}>${esc(label)}</button>`;
}

function countLabel(label, count) {
  return `${label}${Number.isFinite(count) ? ` (${count})` : ""}`;
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
  const weapons = getWeapons(actor);
  const inventory = getInventory(actor);
  const magic = getMagic(actor);
  const features = getFeatures(actor);
  const equipment = getEquipment(actor);
  const effects = getEquippedEffects(actor);

  const panel = document.createElement("div");
  panel.className = HUD_ID;
  panel.innerHTML = `
    <div class="aeriya-combat-hud__title">Аэрия: бой ${isTurn ? "· ход" : ""}</div>
    <div class="aeriya-combat-hud__section">Лист</div>
    <div class="aeriya-combat-hud__row aeriya-combat-hud__row--3">
      ${button(countLabel("Оружие", weapons.length), "weapons", "Открыть оружие")}
      ${button(countLabel("Инвентарь", inventory.length), "inventory", "Открыть инвентарь")}
      ${button(countLabel("Магия", magic.length), "magic", "Открыть магию и магические предметы")}
    </div>
    <div class="aeriya-combat-hud__row aeriya-combat-hud__row--3">
      ${button(countLabel("Особенности", features.length), "features", "Открыть особенности")}
      ${button(countLabel("Экипировка", equipment.length), "equipment", "Открыть экипировку")}
      ${button(countLabel("Эффекты", effects.length), "effects", "Открыть активные эффекты и эффекты экипировки")}
    </div>
    <div class="aeriya-combat-hud__section">Быстро</div>
    <div class="aeriya-combat-hud__row">
      ${button("Атака", "attack", attack ? `Использовать: ${attack.name}` : "Атака не найдена")}
      ${button("Особое", "special", special ? `Использовать: ${special.name}` : "Особое действие")}
      ${button("Слабое место", "weakspot", "Выцелить слабое место")}
      ${button("Уклонение", "dodge", "Защитное действие")}
    </div>
    <div class="aeriya-combat-hud__section">Реакция</div>
    <div class="aeriya-combat-hud__row">
      ${button("Парирование", "parry", "Потратить реакцию на парирование", !available)}
      ${button("Контратака", "counterattack", "Потратить реакцию и выполнить атаку", !available)}
      ${button("1к10", "recovery", "Бросок восстановления реакции")}
      ${button("Вернуть", "recover", "Вернуть реакцию вручную")}
    </div>
    <div class="aeriya-combat-hud__row aeriya-combat-hud__row--2">
      ${button("Лист Actor", "sheet", "Открыть полный лист")}
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
    if (action === "weapons") openWeapons(currentActor);
    if (action === "inventory") openInventory(currentActor);
    if (action === "magic") openMagic(currentActor);
    if (action === "features") openFeatures(currentActor);
    if (action === "equipment") openEquipment(currentActor);
    if (action === "effects") openEffectsBrowser(currentActor);
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
      min-width: 356px;
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
    .aeriya-combat-hud__section {
      margin: 5px 0 3px;
      color: #c9ad72;
      font-size: 10px;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .aeriya-combat-hud__row {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 4px;
      margin-bottom: 4px;
    }
    .aeriya-combat-hud__row--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .aeriya-combat-hud__row--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .aeriya-combat-hud__btn {
      min-height: 25px;
      padding: 2px 4px;
      border: 1px solid rgba(210, 180, 110, 0.7);
      border-radius: 4px;
      background: rgba(65, 48, 28, 0.95);
      color: #f8e8bd;
      font-size: 11px;
      line-height: 1.1;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
    .aeriya-combat-browser__list {
      display: grid;
      gap: 6px;
      max-height: 520px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .aeriya-combat-browser__item {
      display: grid;
      grid-template-columns: 36px 1fr auto;
      gap: 8px;
      align-items: center;
      padding: 6px;
      border: 1px solid rgba(150, 130, 90, 0.45);
      border-radius: 6px;
      background: rgba(0,0,0,0.18);
    }
    .aeriya-combat-browser__item img {
      width: 36px;
      height: 36px;
      object-fit: cover;
      border: 1px solid rgba(180, 150, 90, 0.55);
      border-radius: 4px;
    }
    .aeriya-combat-browser__body strong {
      display: block;
      font-size: 13px;
      line-height: 1.2;
    }
    .aeriya-combat-browser__body span {
      display: block;
      color: #7b6c52;
      font-size: 11px;
      line-height: 1.2;
      margin-top: 2px;
    }
    .aeriya-combat-browser__actions {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .aeriya-combat-browser__actions button {
      min-height: 24px;
      padding: 2px 7px;
      font-size: 11px;
    }
    .aeriya-combat-browser__empty {
      margin: 0;
      padding: 10px;
      color: #6d6048;
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
    hint: "Показывает боевой лист Аэрии в Token HUD во время активного боя: оружие, инвентарь, магия, особенности, экипировка, эффекты и реакции.",
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
    finishTurn,
    openWeapons,
    openInventory,
    openMagic,
    openFeatures,
    openEquipment,
    openEffectsBrowser
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
Hooks.on("createItem", () => window.setTimeout(refreshTokenHud, 80));
Hooks.on("updateItem", () => window.setTimeout(refreshTokenHud, 80));
Hooks.on("deleteItem", () => window.setTimeout(refreshTokenHud, 80));
Hooks.on("createActiveEffect", () => window.setTimeout(refreshTokenHud, 80));
Hooks.on("updateActiveEffect", () => window.setTimeout(refreshTokenHud, 80));
Hooks.on("deleteActiveEffect", () => window.setTimeout(refreshTokenHud, 80));

Hooks.on("createCombat", async (combat) => {
  await resetCombatReactions(combat);
});

Hooks.on("updateCombat", async (combat, changed) => {
  if (!Object.hasOwn(changed, "turn") && !Object.hasOwn(changed, "round")) return;
  await refreshActiveCombatantReaction(combat);
});
