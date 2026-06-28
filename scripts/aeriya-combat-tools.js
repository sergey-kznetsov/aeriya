const MODULE_ID = "aeriya";
const SCHEMA = "combat-tools-v1";
const REACTION_MACRO_NAME = "Аэрия: Реакция в бою";

const REACTION_FLAGS = Object.freeze({
  available: "reaction.available",
  usedThisRound: "reaction.usedThisRound",
  lastUseType: "reaction.lastUseType",
  lastRoll: "reaction.lastRoll",
  schema: "reaction.combatToolsSchema"
});

function actorFromCombatant(combatant) {
  return combatant?.actor ?? null;
}

function controlledActors() {
  return [...new Set((canvas?.tokens?.controlled ?? []).map((token) => token.actor).filter(Boolean))];
}

function activeCombatantActor() {
  return actorFromCombatant(game.combat?.combatant);
}

function getTargetActor() {
  const selected = controlledActors();
  if (selected.length) return selected[0];
  return activeCombatantActor() ?? game.user?.character ?? null;
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

async function recoverReaction(actor, reason = "start-turn") {
  if (!actor) return false;
  await setReaction(actor, true, reason);
  if (reason !== "silent") {
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><strong>${actor.name}</strong> восстанавливает реакцию.</p>`
    });
  }
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
    content: `<p><strong>${actor.name}</strong> тратит реакцию: ${reason}.</p>`
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
  return { updated };
}

async function refreshActiveCombatantReaction(combat = game.combat) {
  if (!game.user?.isGM || !combat) return false;
  if (!game.settings.get(MODULE_ID, "autoRefreshReactionEachTurn")) return false;
  const actor = activeCombatantActor();
  if (!actor) return false;
  await setReaction(actor, true, "start-turn");
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
      spend: {
        label: "Потратить реакцию",
        callback: () => spendReaction(actor, "reaction")
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
    default: "spend"
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
    ensureReactionMacro
  };
}

Hooks.once("init", registerSettings);

Hooks.once("ready", async () => {
  exposeApi();
  if (game.user?.isGM && game.settings.get(MODULE_ID, "ensureCombatReactionMacro")) {
    await ensureReactionMacro();
  }
});

Hooks.on("createCombat", async (combat) => {
  await resetCombatReactions(combat);
});

Hooks.on("updateCombat", async (combat, changed) => {
  if (!Object.hasOwn(changed, "turn") && !Object.hasOwn(changed, "round")) return;
  await refreshActiveCombatantReaction(combat);
});
