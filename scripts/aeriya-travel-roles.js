const AERIYA_TRAVEL_ROLES_MODULE_ID = "aeriya";

const AERIYA_TRAVEL_ROLE_DEFINITIONS = Object.freeze([
  {
    id: "pathfinder",
    title: "Проводник маршрута",
    responsibility: "выбирает путь, читает местность, замечает обходы и опасные сокращения"
  },
  {
    id: "watcher",
    title: "Дозорный",
    responsibility: "следит за угрозами, ночным дозором, засадами, хвостом и странными знаками"
  },
  {
    id: "quartermaster",
    title: "Снабженец",
    responsibility: "ведёт припасы, воду, фляги, лекарства, корм, состояние еды и расходников"
  },
  {
    id: "speaker",
    title: "Переговорщик",
    responsibility: "говорит с проводниками, караванами, заставами, местными и случайными попутчиками"
  },
  {
    id: "cargo_keeper",
    title: "Хранитель груза",
    responsibility: "следит за телегой, сумками, опасным грузом, креплениями, животными и пропажами"
  },
  {
    id: "chronicler",
    title: "Летописец пути",
    responsibility: "ведёт карту, слухи, приметы, долги, договоры и то, что дорога может потом вернуть"
  }
]);

class AeriyaTravelRoleAssigner {
  static get roles() {
    return AERIYA_TRAVEL_ROLE_DEFINITIONS;
  }

  static isTravelModeActive() {
    return Boolean(game.settings.get(AERIYA_TRAVEL_ROLES_MODULE_ID, "travelModeActive"));
  }

  static async assignAndPost(options = {}) {
    const isActive = this.isTravelModeActive();
    const force = options.force === true;

    if (isActive && !force) {
      const current = await this.getLastAssignment();
      if (!options.silentIfActive) ui.notifications?.info("Режим путешествия уже активен. Роли не переброшены.");
      return current;
    }

    if (force) await this.clearCurrentRoles({ silent: true });

    const actors = this.getPartyActors();
    if (!actors.length) {
      if (!options.silentIfNoActors) ui.notifications?.warn("Выдели токены персонажей на сцене. Дорожные роли назначаются только вручную выбранной группе мастера.");
      return null;
    }

    const assignment = this.assignRolesRandomly(actors);
    await this.persistAssignment(assignment);
    await this.postRolesToChat(assignment);

    return assignment;
  }

  static getPartyActors() {
    return this.getSelectedTokenActors();
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

  static shuffle(list = []) {
    const result = [...list];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  }

  static assignRolesRandomly(actors = []) {
    const shuffledRoles = this.shuffle(AERIYA_TRAVEL_ROLE_DEFINITIONS);
    const primaryActors = this.shuffle(actors);
    const extraActors = this.shuffle(actors);
    const assignments = [];

    for (let index = 0; index < shuffledRoles.length; index += 1) {
      const role = shuffledRoles[index];
      const actor = index < primaryActors.length
        ? primaryActors[index]
        : extraActors[(index - primaryActors.length) % extraActors.length];

      if (!actor) continue;

      assignments.push({
        roleId: role.id,
        roleTitle: role.title,
        responsibility: role.responsibility,
        actorId: actor.id,
        actorName: actor.name,
        source: index < primaryActors.length ? "основная роль" : "дополнительная роль"
      });
    }

    return {
      createdAt: new Date().toISOString(),
      source: this.describePartySource(),
      mode: "random-selected-tokens-only",
      actorCount: actors.length,
      assignments
    };
  }

  static describePartySource() {
    return "токены, вручную выбранные мастером на сцене";
  }

  static async persistAssignment(assignment) {
    await game.settings.set(AERIYA_TRAVEL_ROLES_MODULE_ID, "lastTravelRoles", assignment);
    await game.settings.set(AERIYA_TRAVEL_ROLES_MODULE_ID, "travelModeActive", true);

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

  static getActorsWithTravelFlags(assignment = null) {
    const actorIds = new Set(assignment?.assignments?.map((item) => item.actorId).filter(Boolean) ?? []);

    for (const actor of game.actors ?? []) {
      if (actor?.type !== "character") continue;
      if (actor.getFlag(AERIYA_TRAVEL_ROLES_MODULE_ID, "travel.currentRoles")) actorIds.add(actor.id);
      if (actor.getFlag(AERIYA_TRAVEL_ROLES_MODULE_ID, "travel.lastRoleAssignmentAt")) actorIds.add(actor.id);
    }

    return [...actorIds].map((actorId) => game.actors.get(actorId)).filter(Boolean);
  }

  static async clearCurrentRoles(options = {}) {
    const assignment = await this.getLastAssignment();
    const actors = this.getActorsWithTravelFlags(assignment);

    for (const actor of actors) {
      await actor.unsetFlag(AERIYA_TRAVEL_ROLES_MODULE_ID, "travel.currentRoles");
      await actor.unsetFlag(AERIYA_TRAVEL_ROLES_MODULE_ID, "travel.lastRoleAssignmentAt");
    }

    await game.settings.set(AERIYA_TRAVEL_ROLES_MODULE_ID, "lastTravelRoles", null);
    await game.settings.set(AERIYA_TRAVEL_ROLES_MODULE_ID, "travelModeActive", false);

    if (!options.silent) await this.postTravelEndedToChat(actors.length);
    return { clearedActors: actors.length };
  }

  static async postRolesToChat(assignment) {
    return ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content: this.renderAssignmentHtml(assignment)
    });
  }

  static async postTravelEndedToChat(clearedActors = 0) {
    return ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content: this.renderTravelEndedHtml(clearedActors)
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
        <h2>Путешествие началось</h2>
        <p><strong>Дорожные роли распределены случайно между токенами, выбранными мастером.</strong></p>
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
        <p class="aeriya-rules-note">Роли опубликованы в общий чат и записаны в flags.aeriya.travel.currentRoles. Пока режим путешествия активен, повторное открытие консоли не перебрасывает роли. После прибытия мастер завершает путешествие, и роли снимаются.</p>
      </section>
    `;
  }

  static renderTravelEndedHtml(clearedActors = 0) {
    return `
      <section class="aeriya-travel-output">
        <h2>Путешествие завершено</h2>
        <p>Партия прибыла в точку назначения. Дорожные роли сняты, режим путешествия отключён.</p>
        <p><strong>Очищено персонажей:</strong> ${clearedActors}.</p>
        <p class="aeriya-rules-note">В следующем приключении мастер вручную выбирает токены группы, после чего роли будут назначены заново и случайно.</p>
      </section>
    `;
  }

  static patchTravelConsoleOpen() {
    if (!game.aeriya?.travel?.openConsole || game.aeriya.travel.__rolesPatchApplied) return;

    const originalOpenConsole = game.aeriya.travel.openConsole.bind(game.aeriya.travel);

    game.aeriya.travel.openConsole = (...args) => {
      if (game.user?.isGM && game.settings.get(AERIYA_TRAVEL_ROLES_MODULE_ID, "autoAssignTravelRoles")) {
        this.assignAndPost({ silentIfActive: true });
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

  game.settings.register(AERIYA_TRAVEL_ROLES_MODULE_ID, "travelModeActive", {
    name: "AEЯIA.Settings.TravelModeActive.Name",
    hint: "AEЯIA.Settings.TravelModeActive.Hint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
});

Hooks.once("ready", () => {
  game.aeriya = game.aeriya ?? { MODULE_ID: AERIYA_TRAVEL_ROLES_MODULE_ID };
  game.aeriya.travelRoles = AeriyaTravelRoleAssigner;
  AeriyaTravelRoleAssigner.patchTravelConsoleOpen();
});
