const AERIYA_TRAVEL_ROLES_MODULE_ID = "aeriya";

const AERIYA_TRAVEL_ROLE_DEFINITIONS = Object.freeze([
  {
    id: "pathfinder",
    title: "Проводник маршрута",
    responsibility: "выбирает путь, читает местность, замечает обходы и опасные сокращения",
    skills: ["sur", "nat", "prc"],
    abilities: ["wis", "int"]
  },
  {
    id: "watcher",
    title: "Дозорный",
    responsibility: "следит за угрозами, ночным дозором, засадами, хвостом и странными знаками",
    skills: ["prc", "ins", "ste"],
    abilities: ["wis", "dex"]
  },
  {
    id: "quartermaster",
    title: "Снабженец",
    responsibility: "ведёт припасы, воду, фляги, лекарства, корм, состояние еды и расходников",
    skills: ["sur", "med", "nat"],
    abilities: ["wis", "int"]
  },
  {
    id: "speaker",
    title: "Переговорщик",
    responsibility: "говорит с проводниками, караванами, заставами, местными и случайными попутчиками",
    skills: ["per", "ins", "dec", "itm"],
    abilities: ["cha", "wis"]
  },
  {
    id: "cargo_keeper",
    title: "Хранитель груза",
    responsibility: "следит за телегой, сумками, опасным грузом, креплениями, животными и пропажами",
    skills: ["inv", "ath", "sur"],
    abilities: ["int", "str", "wis"]
  },
  {
    id: "chronicler",
    title: "Летописец пути",
    responsibility: "ведёт карту, слухи, приметы, долги, договоры и то, что дорога может потом вернуть",
    skills: ["his", "rel", "arc", "inv"],
    abilities: ["int", "wis"]
  }
]);

class AeriyaTravelRoleAssigner {
  static get roles() {
    return AERIYA_TRAVEL_ROLE_DEFINITIONS;
  }

  static async assignAndPost(options = {}) {
    const actors = this.getPartyActors();
    if (!actors.length) {
      if (!options.silentIfNoActors) ui.notifications?.warn("Не найдены персонажи для распределения дорожных ролей.");
      return null;
    }

    const assignment = this.assignRoles(actors);
    await this.persistAssignment(assignment);
    await this.postRolesToChat(assignment);

    return assignment;
  }

  static getPartyActors() {
    const selected = this.getSelectedTokenActors();
    if (selected.length) return selected;

    const activeCharacters = game.users
      ?.filter((user) => !user.isGM && user.active && user.character)
      .map((user) => user.character) ?? [];

    if (activeCharacters.length) return this.uniqueActors(activeCharacters);

    const playerOwned = game.actors
      ?.filter((actor) => actor.type === "character" && actor.hasPlayerOwner) ?? [];

    return this.uniqueActors(playerOwned);
  }

  static getSelectedTokenActors() {
    const controlled = canvas?.tokens?.controlled ?? [];
    return this.uniqueActors(controlled.map((token) => token.actor).filter(Boolean));
  }

  static uniqueActors(actors = []) {
    const seen = new Set();
    const result = [];

    for (const actor of actors) {
      if (!actor?.id || seen.has(actor.id)) continue;
      seen.add(actor.id);
      result.push(actor);
    }

    return result;
  }

  static assignRoles(actors = []) {
    const usedActorIds = new Set();
    const assignments = [];

    for (const role of AERIYA_TRAVEL_ROLE_DEFINITIONS) {
      const unused = actors.filter((actor) => !usedActorIds.has(actor.id));
      const pool = unused.length ? unused : actors;
      const ranked = pool
        .map((actor) => ({ actor, score: this.scoreActorForRole(actor, role) }))
        .sort((a, b) => b.score - a.score || a.actor.name.localeCompare(b.actor.name, "ru"));
      const winner = ranked[0];

      if (!winner) continue;
      usedActorIds.add(winner.actor.id);
      assignments.push({
        roleId: role.id,
        roleTitle: role.title,
        responsibility: role.responsibility,
        actorId: winner.actor.id,
        actorName: winner.actor.name,
        score: winner.score,
        source: unused.length ? "основная роль" : "дополнительная роль"
      });
    }

    return {
      createdAt: new Date().toISOString(),
      source: this.describePartySource(),
      actorCount: actors.length,
      assignments
    };
  }

  static describePartySource() {
    if (canvas?.tokens?.controlled?.length) return "выбранные токены на сцене";
    const activeCharacters = game.users?.filter((user) => !user.isGM && user.active && user.character) ?? [];
    if (activeCharacters.length) return "персонажи активных игроков";
    return "все player-owned персонажи мира";
  }

  static scoreActorForRole(actor, role) {
    const skillScore = Math.max(...role.skills.map((skill) => this.getSkillTotal(actor, skill)), -99);
    const abilityScore = Math.max(...role.abilities.map((ability) => this.getAbilityMod(actor, ability)), 0);
    const level = Number(actor.system?.details?.level ?? actor.system?.details?.cr ?? 0);
    return skillScore + Math.max(0, Math.floor(abilityScore / 2)) + Math.min(level, 20) / 20;
  }

  static getSkillTotal(actor, key) {
    const skill = actor.system?.skills?.[key];
    if (!skill) return -10;
    const candidates = [skill.total, skill.mod, skill.value, skill.bonus];
    const value = candidates.find((candidate) => Number.isFinite(Number(candidate)));
    return Number(value ?? -10);
  }

  static getAbilityMod(actor, key) {
    const ability = actor.system?.abilities?.[key];
    const candidates = [ability?.mod, ability?.value];
    const value = candidates.find((candidate) => Number.isFinite(Number(candidate)));
    return Number(value ?? 0);
  }

  static async persistAssignment(assignment) {
    await game.settings.set(AERIYA_TRAVEL_ROLES_MODULE_ID, "lastTravelRoles", assignment);

    const byActor = new Map();
    for (const item of assignment.assignments) {
      const list = byActor.get(item.actorId) ?? [];
      list.push({
        roleId: item.roleId,
        roleTitle: item.roleTitle,
        responsibility: item.responsibility,
        source: item.source,
        assignedAt: assignment.createdAt
      });
      byActor.set(item.actorId, list);
    }

    for (const [actorId, roles] of byActor.entries()) {
      const actor = game.actors.get(actorId);
      if (!actor) continue;
      await actor.setFlag(AERIYA_TRAVEL_ROLES_MODULE_ID, "travel.currentRoles", roles);
      await actor.setFlag(AERIYA_TRAVEL_ROLES_MODULE_ID, "travel.lastRoleAssignmentAt", assignment.createdAt);
    }

    return assignment;
  }

  static async getLastAssignment() {
    return game.settings.get(AERIYA_TRAVEL_ROLES_MODULE_ID, "lastTravelRoles");
  }

  static async postRolesToChat(assignment) {
    return ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content: this.renderAssignmentHtml(assignment)
    });
  }

  static renderAssignmentHtml(assignment) {
    const rows = assignment.assignments.map((item) => `
      <tr>
        <td><strong>${item.roleTitle}</strong></td>
        <td>${item.actorName}</td>
        <td>${item.responsibility}</td>
        <td>${item.source}</td>
      </tr>
    `).join("");

    return `
      <section class="aeriya-travel-output">
        <h2>Дорожные роли распределены</h2>
        <p><strong>Источник группы:</strong> ${assignment.source}. <strong>Персонажей:</strong> ${assignment.actorCount}.</p>
        <table class="aeriya-travel-table">
          <thead>
            <tr>
              <th>Роль</th>
              <th>Персонаж</th>
              <th>Зона ответственности</th>
              <th>Тип</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="aeriya-rules-note">Роли опубликованы в общий чат и записаны в flags.aeriya.travel.currentRoles у соответствующих персонажей. Если выбранных токенов нет, модуль берёт персонажей активных игроков, затем всех player-owned персонажей мира.</p>
      </section>
    `;
  }

  static patchTravelConsoleOpen() {
    if (!game.aeriya?.travel?.openConsole || game.aeriya.travel.__rolesPatchApplied) return;

    const originalOpenConsole = game.aeriya.travel.openConsole.bind(game.aeriya.travel);

    game.aeriya.travel.openConsole = (...args) => {
      if (game.user?.isGM && game.settings.get(AERIYA_TRAVEL_ROLES_MODULE_ID, "autoAssignTravelRoles")) {
        this.assignAndPost({ silentIfNoActors: true });
      }
      return originalOpenConsole(...args);
    };

    game.aeriya.travel.__rolesPatchApplied = true;
  }
}

Hooks.once("init", () => {
  game.settings.register(AERIYA_TRAVEL_ROLES_MODULE_ID, "autoAssignTravelRoles", {
    name: "AEЯIA.Settings.AutoAssignTravelRoles.Name",
    hint: "AEЯIA.Settings.AutoAssignTravelRoles.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(AERIYA_TRAVEL_ROLES_MODULE_ID, "lastTravelRoles", {
    scope: "world",
    config: false,
    type: Object,
    default: null
  });
});

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? { MODULE_ID: AERIYA_TRAVEL_ROLES_MODULE_ID };
  game.aeriya.travelRoles = AeriyaTravelRoleAssigner;
  AeriyaTravelRoleAssigner.patchTravelConsoleOpen();
});
