const socket = io();
(() => {
  /**
   * Elemental Battlegrounds game
   *
   * This script implements a simple auto‑battler inspired by Hearthstone Battlegrounds
   * and Doodle God. Players choose a hero, buy units from a shop, fuse units into
   * more powerful versions, and battle an AI opponent. The last hero standing wins.
   */

  // === Unit definitions ===
  // Each unit has a class (Elemental or Tech), base attack, base health,
  // display emoji, and a list of constituent elements for fusion/abilities.
  const unitDefinitions = {
    Fire:    { class: 'Elemental', attack: 1, health: 2, emoji: '🔥', elements: ['Fire'] },
    Water:   { class: 'Elemental', attack: 1, health: 2, emoji: '💧', elements: ['Water'] },
    Earth:   { class: 'Elemental', attack: 1, health: 2, emoji: '🌱', elements: ['Earth'] },
    Air:     { class: 'Elemental', attack: 1, health: 2, emoji: '💨', elements: ['Air'] },
    Lava:    { class: 'Elemental', attack: 3, health: 4, emoji: '🌋', elements: ['Fire', 'Fire'] },
    Steam:   { class: 'Elemental', attack: 2, health: 3, emoji: '🌫️', elements: ['Fire', 'Water'] },
    Mud:     { class: 'Elemental', attack: 2, health: 4, emoji: '🟫', elements: ['Water', 'Earth'] },
    Dust:    { class: 'Elemental', attack: 1, health: 3, emoji: '🌬️', elements: ['Earth', 'Air'] },
    Energy:  { class: 'Elemental', attack: 3, health: 2, emoji: '⚡', elements: ['Air', 'Fire'] },
    Ice:     { class: 'Elemental', attack: 1, health: 3, emoji: '🧊', elements: ['Water', 'Water'] },
    Rock:    { class: 'Elemental', attack: 2, health: 4, emoji: '🪨', elements: ['Earth', 'Earth'] },
    Storm:   { class: 'Elemental', attack: 4, health: 4, emoji: '🌪️', elements: ['Air', 'Air'] },
    Gear:    { class: 'Tech',       attack: 1, health: 3, emoji: '⚙️', elements: ['Tech'] },
    Chip:    { class: 'Tech',       attack: 2, health: 2, emoji: '🔌', elements: ['Tech'] },
    Android: { class: 'Tech',       attack: 3, health: 4, emoji: '🤖', elements: ['Tech', 'Tech'] },
    AI:      { class: 'Tech',       attack: 3, health: 3, emoji: '🧠', elements: ['Tech', 'Tech'] },
    Robot:   { class: 'Tech',       attack: 4, health: 5, emoji: '🤖', elements: ['Tech', 'Tech'] },
    // --- New Elemental units with interesting mechanics ---
    Lightning: {
      class: 'Elemental', attack: 2, health: 1, emoji: '⚡', elements: ['Lightning'],
      // Gains extra attack at the start of battle
      startAttackBonus: 1
    },
    Sand: {
      class: 'Elemental', attack: 1, health: 3, emoji: '🏜️', elements: ['Sand'],
      // Grows tougher after each battle
      afterBattleHealthBonus: 1
    },
    Mist: {
      class: 'Elemental', attack: 1, health: 2, emoji: '🌫️', elements: ['Mist'],
      // Incoming damage reduced by 1
      reduceIncomingAttack: 1
    },
    Ash: {
      class: 'Elemental', attack: 2, health: 1, emoji: '♨️', elements: ['Ash'],
      // Burns attackers for 1 damage
      burnEffect: 1
    },
    // --- New Tech units with interesting mechanics ---
    Drone: {
      class: 'Tech', attack: 1, health: 2, emoji: '🛸', elements: ['Drone'],
      // Increases attack after each kill
      gainAttackOnKill: 1
    },
    Nanobot: {
      class: 'Tech', attack: 1, health: 2, emoji: '🧬', elements: ['Nanobot'],
      // Heals hero at the start of battle
      healHero: 1
    },
    Turret: {
      class: 'Tech', attack: 3, health: 1, emoji: '🔫', elements: ['Turret']
    },
    Processor: {
      class: 'Tech', attack: 0, health: 4, emoji: '💻', elements: ['Processor'],
      // Increases board limit while on board
      boardLimitBonus: 1
    },
    // === Additional Elemental units with unique abilities ===
    // Flora heals your hero slightly at the start of each battle.
    Flora: {
      class: 'Elemental', attack: 1, health: 3, emoji: '🌿', elements: ['Flora'],
      healHero: 1
    },
    // Quake deals 1 damage to all enemies when the battle starts (AOE).
    Quake: {
      class: 'Elemental', attack: 2, health: 3, emoji: '⛰️', elements: ['Quake'],
      aoeDamage: 1
    },
    // Zephyr gains a large attack bonus at the start of battle (first strike feel).
    Zephyr: {
      class: 'Elemental', attack: 1, health: 4, emoji: '🍃', elements: ['Zephyr'],
      startAttackBonus: 2
    },
    // Frost reduces incoming damage by 1, similar to Mist but hardier.
    Frost: {
      class: 'Elemental', attack: 1, health: 4, emoji: '❄️', elements: ['Frost'],
      reduceIncomingAttack: 1
    },
    // === Additional Tech units with unique abilities ===
    // Firewall grants all allied tech units an additional damage reduction.
    Firewall: {
      class: 'Tech', attack: 1, health: 4, emoji: '🛡️', elements: ['Firewall'],
      // reduceIncomingAttackAll applies to all allied units
      reduceIncomingAttackAll: 1
    },
    // Cyborg heals your hero at the start of battle, similar to Nanobot but tougher.
    Cyborg: {
      class: 'Tech', attack: 3, health: 3, emoji: '🦾', elements: ['Cyborg'],
      healHero: 1
    },
    // Quantum deals extra hero damage when it survives a battle.
    Quantum: {
      class: 'Tech', attack: 2, health: 2, emoji: '⚛️', elements: ['Quantum'],
      survivorDamageBonus: 1
    },
    // DroneSwarm gains extra attack for each enemy it kills, more aggressive than Drone.
    DroneSwarm: {
      class: 'Tech', attack: 2, health: 1, emoji: '🪰', elements: ['DroneSwarm'],
      gainAttackOnKill: 2
    }
  };

  // Attach an image path to every predefined unit.  Images live in
  // `assets/images` and are named after the unit in lowercase.  Should the
  // image fail to load the game falls back to a generic placeholder.
  Object.keys(unitDefinitions).forEach((name) => {
    const key = name.toLowerCase();
    unitDefinitions[name].img = `assets/images/${key}.png`;
  });

  /**
   * Load any custom units persisted in localStorage.  Custom units are
   * stored under the 'customUnits' key.  Each entry augments
   * `unitDefinitions` and `baseUnitNames` so that new cards can appear in
   * subsequent games.  Custom units also get a default image path, but you
   * can replace the corresponding file in assets/images to customise the
   * artwork.
   */
  function loadCustomUnits() {
    try {
      const data = localStorage.getItem('customUnits');
      if (!data) return;
      const custom = JSON.parse(data);
      Object.entries(custom).forEach(([name, def]) => {
        // Avoid overwriting existing definitions
        if (!unitDefinitions[name]) {
          unitDefinitions[name] = { ...def };
          // Assign a default image path for the custom unit
          const slug = name.toLowerCase().replace(/\s+/g, '-');
          unitDefinitions[name].img = `assets/images/${slug}.png`;
          baseUnitNames.push(name);
        }
      });
    } catch (err) {
      console.warn('Failed to load custom units:', err);
    }
  }

  // Fusion mapping: combining two units yields a more powerful unit.
  // Both orders (A+B and B+A) are included for convenience.
  const fusionMap = {
    'Fire+Fire': 'Lava', 'Water+Water': 'Ice', 'Earth+Earth': 'Rock', 'Air+Air': 'Storm',
    'Fire+Water': 'Steam', 'Water+Fire': 'Steam',
    'Water+Earth': 'Mud', 'Earth+Water': 'Mud',
    'Earth+Air': 'Dust', 'Air+Earth': 'Dust',
    'Air+Fire': 'Energy', 'Fire+Air': 'Energy',
    'Gear+Gear': 'Android', 'Chip+Chip': 'AI',
    'Gear+Chip': 'Robot', 'Chip+Gear': 'Robot'
  };

  /**
   * Custom fusion rules defined by the user through the card editor.  This
   * object maps keys of the form "NameA+NameB" to the resulting unit name.
   * It is loaded from and persisted to localStorage under the key
   * 'customFusions'.  Unlike static fusionMap, customFusions may grow
   * dynamically at runtime.  When a fusion is not present in either
   * fusionMap or customFusions, the engine will automatically create a
   * default fused unit combining the stats of the two components.
   */
  const customFusions = {};

  /**
   * Load custom fusions persisted in localStorage.  Each entry is added
   * into customFusions and also into fusionMap for quick lookup.  The
   * function guards against malformed data.  After loading fusions, new
   * fusion results are also defined as units if they do not already
   * exist.  Custom fusions are stored as keys of the form 'A+B'.
   */
  function loadCustomFusions() {
    try {
      const data = localStorage.getItem('customFusions');
      if (!data) return;
      const saved = JSON.parse(data);
      Object.entries(saved).forEach(([key, resultName]) => {
        // record in customFusions and fusionMap (both directions)
        customFusions[key] = resultName;
        fusionMap[key] = resultName;
        const parts = key.split('+');
        if (parts.length === 2) {
          const revKey = parts[1] + '+' + parts[0];
          fusionMap[revKey] = resultName;
          customFusions[revKey] = resultName;
        }
        // If the result unit does not exist yet, create a default fused
        // definition using constituent units if they exist.  Stats are
        // computed as the sum of the components' stats.  Class is taken
        // from the first component.  Emoji defaults to placeholder.
        if (!unitDefinitions[resultName]) {
          const [a, b] = key.split('+');
          const defA = unitDefinitions[a];
          const defB = unitDefinitions[b];
          if (defA && defB) {
            const newDef = {
              class: defA.class,
              attack: defA.attack + defB.attack,
              health: defA.health + defB.health,
              emoji: defA.emoji, // default to first component's emoji
              elements: (defA.elements || []).concat(defB.elements || [])
            };
            // Create default image path based on name
            const slug = resultName.toLowerCase().replace(/\s+/g, '-');
            newDef.img = `assets/images/${slug}.png`;
            unitDefinitions[resultName] = newDef;
          }
        }
      });
    } catch (err) {
      console.warn('Failed to load custom fusions:', err);
    }
  }

  /**
   * Create or update a fused unit definition given two component names.  If
   * the resulting unit already exists it is left untouched.  Otherwise a
   * new definition is constructed by summing the attack and health of
   * both components.  The class is set to the class of the first unit.
   * The emoji defaults to the first unit's emoji.  The name is used to
   * generate an image path.  The new definition is registered in
   * unitDefinitions but not added to baseUnitNames because fused units
   * should not appear directly in the shop.
   */
  function createFusionDefinition(resultName, unitA, unitB) {
    if (unitDefinitions[resultName]) return;
    const defA = unitDefinitions[unitA];
    const defB = unitDefinitions[unitB];
    if (!defA || !defB) return;
    const newDef = {
      class: defA.class,
      attack: defA.attack + defB.attack,
      health: defA.health + defB.health,
      emoji: defA.emoji,
      elements: (defA.elements || []).concat(defB.elements || [])
    };
    const slug = resultName.toLowerCase().replace(/\s+/g, '-');
    newDef.img = `assets/images/${slug}.png`;
    unitDefinitions[resultName] = newDef;
  }

  /**
   * Update the board limit based on units currently on the player's board.
   * The base limit is 5.  Each unit with the property 'boardLimitBonus'
   * contributes its bonus.  The board length is truncated if necessary.
   */
  // Compute the maximum number of units allowed on a player's board.  The
  // limit starts at 5 and is increased by each unit's boardLimitBonus.
  // The player's board is truncated if it exceeds the calculated limit.
  function updateBoardLimit(player) {
    let limit = 5;
    player.board.forEach(u => {
      if (u.boardLimitBonus) {
        limit += u.boardLimitBonus;
      }
    });
    player.boardLimit = limit;
    if (player.board.length > player.boardLimit) {
      player.board = player.board.slice(0, player.boardLimit);
    }
  }

  /**
   * Initialise the array of players for the current game.  The human
   * player (index 0) uses the chosen relic from hero selection.  AI
   * players are assigned random relics.  Each player starts with 20
   * health, an empty board, an empty shop, and 3 gold.  The board
   * limit is set to 5 until modified by units like Processor.
   * @param {Object} humanHero The hero object selected by the user.
   */
  function initializePlayers(humanHero) {
    state.players = [];
    // Create the human player
    const human = {
      heroName: humanHero.name,
      heroEmoji: humanHero.emoji,
      heroAbility: humanHero.ability,
      heroHealth: 20,
      heroMaxHealth: 20,
      board: [],
      shop: [],
      gold: 3,
      boardLimit: 5,
      isAI: false
    };
    state.players.push(human);
    // Create AI players
    for (let i = 1; i < state.playerCount; i++) {
      // Pick a random relic for each AI
      const aiHero = heroes[Math.floor(Math.random() * heroes.length)];
      const aiPlayer = {
        heroName: aiHero.name,
        heroEmoji: aiHero.emoji,
        heroAbility: aiHero.ability,
        heroHealth: 20,
        heroMaxHealth: 20,
        board: [],
        shop: [],
        gold: 3,
        boardLimit: 5,
        isAI: true
      };
      state.players.push(aiPlayer);
    }
    // Reset round and pointer
    state.round = 1;
    state.currentPlayerIndex = 0;
    state.isShopPhase = true;
    state.gameOver = false;
  }

  /**
   * Initialise the players array for a game with potentially multiple
   * human participants.  The human players use the relics in the
   * provided array.  Additional players beyond the number of humans are
   * filled by AI opponents with random relics.  Each player starts
   * with 20 health, an empty board, an empty shop, 3 gold and a base
   * board limit of 5.  The round counter is reset and turn state
   * initialised.
   * @param {Array} humanRelics Array of hero objects selected by each human.
   * @param {number} totalCount Total number of players (humans + AI)
   */
  function initializePlayersWithHumans(humanRelics, totalCount) {
    state.players = [];
    // Create human players using the provided relics
    humanRelics.forEach((hero) => {
      state.players.push({
        heroName: hero.name,
        heroEmoji: hero.emoji,
        heroAbility: hero.ability,
        heroHealth: 20,
        heroMaxHealth: 20,
        board: [],
        shop: [],
        gold: 3,
        boardLimit: 5,
        isAI: false
      });
    });
    // Fill remaining slots with AI players
    for (let i = humanRelics.length; i < totalCount; i++) {
      const aiHero = heroes[Math.floor(Math.random() * heroes.length)];
      state.players.push({
        heroName: aiHero.name,
        heroEmoji: aiHero.emoji,
        heroAbility: aiHero.ability,
        heroHealth: 20,
        heroMaxHealth: 20,
        board: [],
        shop: [],
        gold: 3,
        boardLimit: 5,
        isAI: true
      });
    }
    state.playerCount = totalCount;
    state.round = 1;
    state.currentPlayerIndex = 0;
    state.isShopPhase = true;
    state.gameOver = false;
  }

  /**
   * Retrieve the player object whose turn is currently visible.  In
   * single‑player games this returns the only player.  In multiplayer
   * modes the currentPlayerIndex points to the human player whose
   * shop/board should be displayed.
   */
  function getCurrentPlayer() {
    return state.players[state.currentPlayerIndex];
  }

  /**
   * Populate a player's shop with random base units.  The number of
   * offered slots is fixed at 3.  Costs are computed using getUnitCost().
   * @param {Object} player The player whose shop should be refreshed.
   */
  function refreshShopForPlayer(player) {
    player.shop = [];
    const slots = 3;
    for (let i = 0; i < slots; i++) {
      const randName = baseUnitNames[Math.floor(Math.random() * baseUnitNames.length)];
      player.shop.push({ name: randName, cost: getUnitCost(randName) });
    }
  }

  /**
   * Perform AI purchasing and fusing for a given AI player.  The AI
   * naively purchases affordable units until out of gold or the board
   * limit is reached.  It then attempts to fuse any identical units
   * repeatedly.  This is a rudimentary strategy but provides some
   * competition.
   * @param {Object} player The AI player to act upon.
   */
  function performAIActions(player) {
    if (!player.isAI) return;
    // Spend gold on units.  The AI tries to focus on a dominant class
    // (Elemental or Tech) based on its current board composition.  It
    // purchases the highest‑value card of that class it can afford; if
    // none match the focus or are unaffordable, it buys the cheapest
    // available card.  It stops when out of gold or the board is full.
    let attempts = 0;
    while (player.gold > 0 && player.board.length < player.boardLimit && attempts < 10) {
      // Count classes on the board to determine focus
      const counts = { Elemental: 0, Tech: 0 };
      player.board.forEach(u => {
        if (u.class === 'Elemental') counts.Elemental++;
        else if (u.class === 'Tech') counts.Tech++;
      });
      let focusClass;
      if (counts.Elemental === 0 && counts.Tech === 0) {
        // If no units yet, pick a random focus
        focusClass = Math.random() < 0.5 ? 'Elemental' : 'Tech';
      } else {
        focusClass = counts.Elemental >= counts.Tech ? 'Elemental' : 'Tech';
      }
      // Find a candidate within the shop matching the focus class and affordable
      let candidateIndex = -1;
      let candidateValue = -Infinity;
      player.shop.forEach((item, idx) => {
        const def = unitDefinitions[item.name];
        if (def && def.class === focusClass && item.cost <= player.gold) {
          const value = def.attack + def.health;
          if (value > candidateValue) {
            candidateValue = value;
            candidateIndex = idx;
          }
        }
      });
      // If no candidate of the focus class, choose the cheapest affordable card
      if (candidateIndex === -1) {
        let cheapestCost = Infinity;
        player.shop.forEach((item, idx) => {
          if (item.cost <= player.gold && item.cost < cheapestCost) {
            cheapestCost = item.cost;
            candidateIndex = idx;
          }
        });
      }
      if (candidateIndex === -1) break;
      const item = player.shop[candidateIndex];
      player.gold -= item.cost;
      player.board.push(createUnit(item.name));
      // Replace the purchased slot with a new random base unit
      const randName = baseUnitNames[Math.floor(Math.random() * baseUnitNames.length)];
      player.shop[candidateIndex] = { name: randName, cost: getUnitCost(randName) };
      attempts++;
    }
    // After purchasing, attempt to fuse identical units repeatedly
    let fusedSomething = true;
    while (fusedSomething) {
      fusedSomething = false;
      const indicesByName = {};
      player.board.forEach((u, idx) => {
        if (!indicesByName[u.name]) indicesByName[u.name] = [];
        indicesByName[u.name].push(idx);
      });
      for (const name in indicesByName) {
        const list = indicesByName[name];
        if (list.length >= 2) {
          const i1 = list[0];
          const i2 = list[1];
          const unit1 = player.board[i1];
          const unit2 = player.board[i2];
          if (unit1 && unit2 && unit1.class === unit2.class) {
            let key = unit1.name + '+' + unit2.name;
            let resultName = fusionMap[key] || customFusions[key];
            if (!resultName) {
              const sortedNames = [unit1.name, unit2.name].sort();
              resultName = sortedNames[0] + '-' + sortedNames[1];
              fusionMap[key] = resultName;
              fusionMap[unit2.name + '+' + unit1.name] = resultName;
              customFusions[key] = resultName;
              customFusions[unit2.name + '+' + unit1.name] = resultName;
            }
            createFusionDefinition(resultName, unit1.name, unit2.name);
            // Remove the two units and add the fused one
            if (i2 > i1) {
              player.board.splice(i2, 1);
              player.board.splice(i1, 1);
            } else {
              player.board.splice(i1, 1);
              player.board.splice(i2, 1);
            }
            player.board.push(createUnit(resultName));
            fusedSomething = true;
            break;
          }
        }
      }
    }
    // Ensure board does not exceed limit
    updateBoardLimit(player);
  }

  // Base unit names used for the shop pool. Fused units do not appear
  // directly in the shop; players must fuse to obtain them.
  // Base unit names used for the shop pool.  Newly added units are
  // included here so that they appear in the shop. Fused units never
  // appear directly in the shop; players must fuse them to obtain them.
  const baseUnitNames = [
    'Fire','Water','Earth','Air', // Elemental basics
    'Gear','Chip',               // Tech basics
    'Lightning','Sand','Mist','Ash',
    'Flora','Quake','Zephyr','Frost',
    'Drone','Nanobot','Turret','Processor',
    'Firewall','Cyborg','Quantum','DroneSwarm'
  ];

  // === Relic definitions ===
  // The old hero/sigil system has been replaced by global "relics" that apply
  // universal effects to all units. Each relic has a name, emoji,
  // description, and ability hooks. These hooks operate on the entire
  // board rather than specific classes so that every card can benefit.
  const heroes = [
    {
      name: 'Relic of Strength', emoji: '💪',
      description: 'All your units gain +1 attack at the start of each battle.',
      ability: {
        roundStart: (state) => {
          // No round bonus for attack relic.
        },
        battleStart: (units) => {
          units.forEach(u => { u.attack += 1; });
        }
      }
    },
    {
      name: 'Relic of Vitality', emoji: '❤️',
      description: 'Heal 1 health for your hero at the start of each round (up to max).',
      ability: {
        roundStart: (state) => {
          state.heroHealth = Math.min(state.heroMaxHealth, state.heroHealth + 1);
        },
        battleStart: (units) => {
          // No battle bonus for vitality relic.
        }
      }
    },
    {
      name: 'Relic of Fortitude', emoji: '🛡️',
      description: 'At the start of each battle, all your units gain +1 health.',
      ability: {
        roundStart: (state) => {},
        battleStart: (units) => {
          units.forEach(u => {
            u.health += 1;
            u.maxHealth = (u.maxHealth || u.health);
          });
        }
      }
    },
    {
      name: 'Relic of Prosperity', emoji: '💰',
      description: 'Gain +1 extra gold at the start of each round.',
      ability: {
        roundStart: (state) => {
          state.gold += 1;
        },
        battleStart: (units) => {}
      }
    }
  ];

  // === Game state ===
  /**
   * Central game state.  Multiplayer is implemented by storing an array
   * of players.  Each entry represents a human or AI participant and
   * contains their relic choice, hero health, board, shop, available gold
   * and board limit.  The `currentPlayerIndex` tracks whose board is
   * currently visible during the shop phase.  The `isShopPhase` flag
   * toggles between purchasing and battling.
   */
  const state = {
    // List of player objects.  Index 0 is always the human player.
    players: [],
    // Number of players (human + AI).  Determined at game start.
    playerCount: 1,
    // Number of rounds completed.  Starts at 1 and increases after each battle phase.
    round: 1,
    // Index of the player whose shop/board is currently visible.
    currentPlayerIndex: 0,
    // True during the shop phase, false during battle resolution.
    isShopPhase: true,
    // Tracks if the game has ended.  Once true, no further actions are allowed.
    gameOver: false,
    // Global message log used to display notifications.  This remains
    // global for simplicity rather than per player.
    messageLog: [],
    // Currently selected indices for drag‑and‑drop or click based fusion on
    // the visible player's board.
    selectedIndices: []
  ,
    // Number of human players participating.  Set during start screen.
    numHumans: 1,
    // Array of relics selected by human players before the game starts.
    selectedRelics: [],
    // Legacy single‑player values.  When only one player participates,
    // these fields are used to track hero and opponent health.  In
    // multiplayer these values are unused.
    heroHealth: 20,
    heroMaxHealth: 20,
    opponentHealth: 20,
    opponentMaxHealth: 20
  };

  // === Audio and sound effects ===
  // Global volume for both background music and sound effects.  Loaded
  // from localStorage under 'audioVolume'.
  let audioVolume = 0.05;

  // Initialize audio volume from localStorage if present
  function initAudioVolume() {
    try {
      const saved = localStorage.getItem('audioVolume');
      if (saved !== null) {
        audioVolume = parseFloat(saved);
      }
    } catch (err) {
      console.warn('Failed to load audio volume', err);
    }
    const audio = document.getElementById('bg-music');
    if (audio) {
      audio.volume = audioVolume;
    }
  }

  // Set volume and persist it
  function setAudioVolume(vol) {
    audioVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('audioVolume', String(audioVolume));
    } catch {}
    const audio = document.getElementById('bg-music');
    if (audio) {
      audio.volume = audioVolume;
    }
  }

  // Play a short sound effect using the Web Audio API.  Different types
  // map to different frequencies.  The global audioVolume scales the
  // output volume.  Browsers may require user interaction before audio
  // context can be created; this function is typically called after
  // some interaction.
  function playSound(type) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    // Choose frequency based on type
    let freq;
    switch (type) {
      case 'buy': freq = 440; break; // A4
      case 'fuse': freq = 523.25; break; // C5
      case 'battle': freq = 659.25; break; // E5
      case 'click':
      default:
        freq = 330; // E4
        break;
    }
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(Math.min(0.2, audioVolume), ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    // Clean up audio context after sound stops
    osc.onended = () => ctx.close();
  }

  // Helper to create a deep copy of a unit definition
  function createUnit(name) {
    const def = unitDefinitions[name];
    if (!def) {
      console.warn('Unknown unit', name);
      return null;
    }
    return {
      name: name,
      class: def.class,
      attack: def.attack,
      health: def.health,
      maxHealth: def.health,
      emoji: def.emoji,
      elements: def.elements.slice()
    };
  }

  /**
   * Advance the turn in multi‑human games.  When a human ends their
   * turn, this function moves to the next human player.  AI players
   * automatically perform their actions and are skipped.  When all
   * human players have completed their turns (i.e. we wrap around to
   * the first human again), the battle phase is triggered.
   */
  function endTurn() {
    if (state.gameOver || !state.isShopPhase) return;
    const startIdx = state.currentPlayerIndex;
    let idx = startIdx;
    let loops = 0;
    let nextHumanFound = false;
    while (loops < state.players.length) {
      idx = (idx + 1) % state.players.length;
      loops++;
      // If we have looped back to the starting player, break
      if (idx === startIdx) break;
      const p = state.players[idx];
      if (!p) continue;
      if (p.isAI) {
        performAIActions(p);
        continue;
      }
      // Found another human
      nextHumanFound = true;
      break;
    }
    // If no next human found or we wrapped back to the starting human, begin battle phase
    if (!nextHumanFound || idx === startIdx) {
      startBattlePhase();
    } else {
      state.currentPlayerIndex = idx;
      renderGameScreen();
    }
  }

  // Calculate the cost of purchasing a unit based on its stats. Base units cost
  // less than fused units. The formula can be tuned for balance.
  function getUnitCost(name) {
    const def = unitDefinitions[name];
    if (!def) return 1;
    // Basic heuristic: average of attack and health, but at least 1.
    return Math.max(1, Math.floor((def.attack + def.health) / 2));
  }

  // Append a message to the log and update the display.
  function addMessage(text) {
    state.messageLog.push(text);
    // Limit log length to avoid infinite growth
    if (state.messageLog.length > 50) state.messageLog.shift();
    renderMessage();
  }

  // Refresh the shop for the current player.  Delegates to the
  // per‑player refresh function so that each player maintains an
  // independent shop.  The number of slots is fixed at 3.
  function refreshShop() {
    const player = getCurrentPlayer();
    refreshShopForPlayer(player);
  }

  // Render the hero selection screen.
  function renderStartScreen() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    // Ask for number of human players if not yet specified
    if (!state.selectedRelics || state.selectedRelics.length === 0) {
      // Only prompt once
      let numHumans = 1;
      try {
        const input = prompt('Enter number of human players (1-8):', String(state.numHumans || 1));
        if (input !== null) {
          const n = parseInt(input, 10);
          if (!isNaN(n) && n >= 1) {
            numHumans = Math.min(8, n);
          }
        }
      } catch (err) {
        console.warn('Failed to read human player count', err);
      }
      state.numHumans = numHumans;
      state.selectedRelics = [];
    }
    // Determine which human is choosing a relic now
    const currentHuman = state.selectedRelics.length + 1;
    // Title and instruction
    const title = document.createElement('h1');
    title.innerText = 'Elemental Battlegrounds';
    title.style.textAlign = 'center';
    app.appendChild(title);
    const subtitle = document.createElement('p');
    subtitle.innerText = `Human ${currentHuman} of ${state.numHumans}: Choose your relic`;
    subtitle.style.textAlign = 'center';
    app.appendChild(subtitle);
    // Show relic cards
    const heroContainer = document.createElement('div');
    heroContainer.className = 'hero-selection';
    heroes.forEach((hero) => {
      const card = document.createElement('div');
      card.className = 'hero-card';
      card.innerHTML = `<div class="emoji">${hero.emoji}</div><h3>${hero.name}</h3><p>${hero.description}</p>`;
      card.addEventListener('click', () => {
        selectHero(hero);
      });
      heroContainer.appendChild(card);
    });
    app.appendChild(heroContainer);
  }

  // Handle hero selection and initialise game state accordingly.
  function selectHero(hero) {
    // Reset message log and selection lists
    state.messageLog = [];
    state.selectedIndices = [];
    // Store the chosen relic for this human
    state.selectedRelics.push(hero);
    playSound('click');
    // If not all humans have selected a relic yet, render selection for the next human
    if (state.selectedRelics.length < state.numHumans) {
      renderStartScreen();
      return;
    }
    // All human relics selected.  Now prompt for total number of players
    let count = state.numHumans;
    try {
      const input = prompt(`Enter total number of players (humans + AI, ${state.numHumans}-8):`, String(state.numHumans));
      if (input !== null) {
        const n = parseInt(input, 10);
        if (!isNaN(n) && n >= state.numHumans) {
          count = Math.min(8, n);
        }
      }
    } catch (err) {
      console.warn('Failed to read total player count', err);
    }
    state.playerCount = count;
    // Initialize players with the chosen relics and AI opponents
    initializePlayersWithHumans(state.selectedRelics, count);
    // Generate shops for all players
    state.players.forEach(p => {
      refreshShopForPlayer(p);
    });
    // Let AI players make their first moves
    state.players.forEach(p => {
      if (p.isAI) performAIActions(p);
    });
    // Reset currentPlayerIndex to the first human (index 0)
    state.currentPlayerIndex = 0;
    state.isShopPhase = true;
    // Render the game screen for the first human
    renderGameScreen();
    // Start background music
    try {
      const audio = document.getElementById('bg-music');
      if (audio) {
        audio.volume = audioVolume;
        audio.play().catch(() => {});
      }
    } catch (e) {}
  }

  // Render the game screen with top bar, board, shop, messages, and actions.
  function renderGameScreen() {
    const app = document.getElementById('app');
    // Determine the current player and recalculate their board limit
    const player = getCurrentPlayer();
    updateBoardLimit(player);
    app.innerHTML = '';
    // Top bar containing scoreboard, current gold and round
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';
    const stats = document.createElement('div');
    stats.className = 'stats';
    // Build scoreboard for all players
    let scoreboard = '';
    state.players.forEach((p, idx) => {
      scoreboard += `<span>P${idx + 1} (${p.heroEmoji}) HP: ${p.heroHealth}/${p.heroMaxHealth}</span>`;
    });
    stats.innerHTML = `
      ${scoreboard}
      <span>Gold: ${player.gold}</span>
      <span>Round: ${state.round}</span>
    `;
    topBar.appendChild(stats);
    const actions = document.createElement('div');
    actions.className = 'actions';
    // Reroll button
    const rerollBtn = document.createElement('button');
    rerollBtn.className = 'button';
    rerollBtn.innerText = 'Reroll (1 gold)';
    rerollBtn.disabled = player.gold < 1;
    rerollBtn.addEventListener('click', () => {
      if (player.gold >= 1) {
        player.gold -= 1;
        refreshShopForPlayer(player);
        renderGameScreen();
        playSound('click');
      }
    });
    actions.appendChild(rerollBtn);
    // Battle button
    const battleBtn = document.createElement('button');
    battleBtn.className = 'button';
    battleBtn.innerText = 'Battle!';
    battleBtn.disabled = player.board.length === 0 || state.gameOver;
    battleBtn.addEventListener('click', () => {
      if (state.gameOver) return;
      if (state.playerCount > 1) {
        startBattlePhase();
      } else {
        doBattle();
      }
      playSound('click');
    });
    actions.appendChild(battleBtn);
    // End turn button for games with multiple human players.  When
    // pressed, the current human finishes their shop phase and the
    // next human (if any) gets a turn.  AI players are skipped
    // automatically.  Once all humans have taken a turn, the battle
    // phase begins.
    if (state.numHumans > 1) {
      const endTurnBtn = document.createElement('button');
      endTurnBtn.className = 'button';
      endTurnBtn.innerText = 'End Turn';
      endTurnBtn.addEventListener('click', () => {
        playSound('click');
        endTurn();
      });
      actions.appendChild(endTurnBtn);
    }
    // Card editor button
    const editorBtn = document.createElement('button');
    editorBtn.className = 'button';
    editorBtn.innerText = 'Card Editor';
    editorBtn.addEventListener('click', openEditor);
    actions.appendChild(editorBtn);

    // Game editor button (manages mechanics and fusions)
    const gameEditBtn = document.createElement('button');
    gameEditBtn.className = 'button';
    gameEditBtn.innerText = 'Game Editor';
    gameEditBtn.addEventListener('click', openGameEditor);
    actions.appendChild(gameEditBtn);

    // Volume slider
    const volumeContainer = document.createElement('div');
    volumeContainer.style.display = 'flex';
    volumeContainer.style.alignItems = 'center';
    volumeContainer.style.marginLeft = '10px';
    const vLabel = document.createElement('span');
    vLabel.style.fontSize = '12px';
    vLabel.style.marginRight = '4px';
    vLabel.textContent = 'Vol';
    const vSlider = document.createElement('input');
    vSlider.type = 'range';
    vSlider.min = '0';
    vSlider.max = '1';
    vSlider.step = '0.05';
    vSlider.value = String(audioVolume);
    vSlider.style.width = '80px';
    vSlider.addEventListener('input', (e) => {
      setAudioVolume(parseFloat(e.target.value));
    });
    volumeContainer.appendChild(vLabel);
    volumeContainer.appendChild(vSlider);
    actions.appendChild(volumeContainer);
    topBar.appendChild(actions);
    app.appendChild(topBar);
    // Board section
    const boardSection = document.createElement('div');
    boardSection.className = 'board';
    for (let i = 0; i < player.boardLimit; i++) {
      const hasUnit = i < player.board.length;
      const card = document.createElement('div');
      card.className = 'unit-card';
      // Highlight selected card for click‑based interaction
      if (hasUnit && state.selectedIndices.includes(i)) card.classList.add('selected');
      if (hasUnit) {
        const unit = player.board[i];
        card.innerHTML = `
          <img src="${unit.img}" alt="${unit.name}" class="unit-img" onerror="this.src='assets/images/placeholder.png'">
          <div class="name">${unit.name}</div>
          <div class="stats">${unit.attack}/${unit.health}</div>
        `;
      } else {
        card.style.opacity = '0.3';
        card.innerHTML = `<div class="name">Empty</div>`;
      }
      // Click handler for legacy interaction
      card.addEventListener('click', () => handleBoardClick(i));
      // Drag and drop handlers
      card.addEventListener('dragover', (ev) => {
        ev.preventDefault();
        card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });
      card.addEventListener('drop', (ev) => {
        ev.preventDefault();
        card.classList.remove('drag-over');
        const from = parseInt(ev.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(from)) {
          handleBoardDrop(from, i);
        }
      });
      if (hasUnit) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (ev) => {
          ev.dataTransfer.setData('text/plain', i.toString());
        });
      }
      boardSection.appendChild(card);
    }
    // Shop section
    const shopSection = document.createElement('div');
    shopSection.className = 'shop';
    player.shop.forEach((item, index) => {
      const unitDef = unitDefinitions[item.name];
      const card = document.createElement('div');
      card.className = 'unit-card';
      card.innerHTML = `
        <img src="${unitDef.img}" alt="${item.name}" class="unit-img" onerror="this.src='assets/images/placeholder.png'">
        <div class="name">${item.name}</div>
        <div class="stats">${unitDef.attack}/${unitDef.health}</div>
        <div class="cost">${item.cost} gold</div>
      `;
      card.addEventListener('click', () => {
        buyUnit(index);
      });
      if (player.gold < item.cost || player.board.length >= player.boardLimit) {
        card.style.opacity = '0.5';
      }
      shopSection.appendChild(card);
    });
    // Append sections in order: shop first, then board
    app.appendChild(shopSection);
    app.appendChild(boardSection);
    // Message log
    const message = document.createElement('div');
    message.className = 'message';
    message.id = 'message-log';
    state.messageLog.forEach((msg) => {
      const p = document.createElement('p');
      p.textContent = msg;
      message.appendChild(p);
    });
    app.appendChild(message);
    // Instructions
    const instructions = document.createElement('p');
    instructions.style.fontSize = '12px';
    instructions.style.color = '#666';
    instructions.style.marginTop = '10px';
    instructions.innerHTML = 'Tip: Click two units on your board to fuse them. Click a unit then another spot to move it.';
    app.appendChild(instructions);
  }

  // Update just the message log area to avoid full reflow.
  function renderMessage() {
    const message = document.getElementById('message-log');
    if (!message) return;
    message.innerHTML = '';
    state.messageLog.forEach((msg) => {
      const p = document.createElement('p');
      p.textContent = msg;
      message.appendChild(p);
    });
    // Auto scroll to bottom
    message.scrollTop = message.scrollHeight;
  }

  // Handle purchasing a unit from the shop
  function buyUnit(index) {
    const player = getCurrentPlayer();
    const item = player.shop[index];
    if (!item) return;
    if (player.gold < item.cost) {
      addMessage('Not enough gold to buy ' + item.name + '!');
      return;
    }
    if (player.board.length >= player.boardLimit) {
      addMessage('Your board is full!');
      return;
    }
    player.gold -= item.cost;
    player.board.push(createUnit(item.name));
    // Remove item from shop and replace it with a new one
    player.shop.splice(index, 1);
    const randName = baseUnitNames[Math.floor(Math.random() * baseUnitNames.length)];
    player.shop.push({ name: randName, cost: getUnitCost(randName) });
    renderGameScreen();
    playSound('buy');
  }

  // Handle clicking on the player's board: selection, fusion, or reposition.
  function handleBoardClick(index) {
    // Provide a click sound for every selection or reposition
    playSound('click');
    const player = getCurrentPlayer();
    // If clicking beyond current board length, treat as empty slot
    if (index >= player.board.length) {
      // Attempt to move selected unit here
      if (state.selectedIndices.length === 1) {
        const from = state.selectedIndices[0];
        if (from < player.board.length) {
          const unit = player.board.splice(from, 1)[0];
          // Insert at end of board
          player.board.push(unit);
          addMessage(`Moved ${unit.name} to end of board.`);
        }
        state.selectedIndices = [];
        renderGameScreen();
      }
      return;
    }
    // If we click on a card
    if (state.selectedIndices.length === 0) {
      // Select this index
      state.selectedIndices = [index];
    } else if (state.selectedIndices.length === 1) {
      const first = state.selectedIndices[0];
      if (first === index) {
        // Deselect
        state.selectedIndices = [];
      } else {
        // There are two selections now
        // If both slots have units, attempt fusion; otherwise, reposition
        const hasFirst = first < player.board.length;
        const hasSecond = index < player.board.length;
        if (hasFirst && hasSecond) {
          // Attempt fusion
          attemptFusion(first, index);
          state.selectedIndices = [];
        } else {
          // Reposition: move unit from first to end
          if (hasFirst) {
            const unit = player.board.splice(first, 1)[0];
            player.board.push(unit);
            addMessage(`Moved ${unit.name} to end of board.`);
          }
          state.selectedIndices = [];
        }
      }
    } else {
      // Reset selection if more than one selected (shouldn't happen)
      state.selectedIndices = [];
    }
    renderGameScreen();
  }

  // Handle a drop event on the board for drag‑and‑drop operations.  The
  // `fromIndex` is the original index of the unit being dragged and
  // `toIndex` is the index of the card being dropped onto.  If both
  // positions contain units, a fusion is attempted; otherwise the unit
  // is moved to the end of the board.
  function handleBoardDrop(fromIndex, toIndex) {
    const player = getCurrentPlayer();
    if (fromIndex === toIndex) return;
    const hasFrom = fromIndex < player.board.length;
    const hasTo = toIndex < player.board.length;
    if (!hasFrom) return;
    if (hasFrom && hasTo) {
      attemptFusion(fromIndex, toIndex);
    } else {
      const unit = player.board.splice(fromIndex, 1)[0];
      player.board.push(unit);
      addMessage(`Moved ${unit.name} to end of board.`);
    }
    renderGameScreen();
  }

  // Attempt to fuse two units on the board at indices i1 and i2.
  function attemptFusion(i1, i2) {
    const player = getCurrentPlayer();
    if (i1 === i2) return;
    const firstIndex = Math.min(i1, i2);
    const secondIndex = Math.max(i1, i2);
    const unit1 = player.board[firstIndex];
    const unit2 = player.board[secondIndex];
    if (!unit1 || !unit2) return;
    // Disallow cross‑class fusions (e.g. Elemental with Tech).  If the
    // classes differ, fusion fails.
    if (unit1.class !== unit2.class) {
      addMessage(`Cannot fuse ${unit1.name} (class ${unit1.class}) and ${unit2.name} (class ${unit2.class}).`);
      return;
    }
    // Determine the fusion result
    let key = unit1.name + '+' + unit2.name;
    let resultName = fusionMap[key] || customFusions[key];
    if (!resultName) {
      const sorted = [unit1.name, unit2.name].sort();
      resultName = sorted[0] + '-' + sorted[1];
      fusionMap[key] = resultName;
      fusionMap[unit2.name + '+' + unit1.name] = resultName;
      customFusions[key] = resultName;
      customFusions[unit2.name + '+' + unit1.name] = resultName;
      try {
        const stored = localStorage.getItem('customFusions');
        const saved = stored ? JSON.parse(stored) : {};
        saved[key] = resultName;
        saved[unit2.name + '+' + unit1.name] = resultName;
        localStorage.setItem('customFusions', JSON.stringify(saved));
      } catch (err) {
        console.warn('Failed to persist custom fusion:', err);
      }
    }
    createFusionDefinition(resultName, unit1.name, unit2.name);
    // Remove from board
    player.board.splice(secondIndex, 1);
    player.board.splice(firstIndex, 1);
    const fused = createUnit(resultName);
    player.board.push(fused);
    addMessage(`Fused ${unit1.name} + ${unit2.name} → ${resultName}!`);
    showFusionAnimation(fused.emoji);
    playSound('fuse');
  }

  /**
   * Pair up all players randomly and resolve battles between each pair.  In
   * multiplayer mode this function orchestrates AI vs AI fights in the
   * background and identifies the human player's opponent.  After all
   * battles except the human pair are resolved, the human pair's battle
   * is visualised using renderBattleScreen().  Once the player clicks
   * Continue, results are applied and the game proceeds to the next
   * round.  If the human is eliminated or no opponents remain, a game
   * over screen is shown.
   */
  function startBattlePhase() {
    if (state.gameOver || !state.isShopPhase) return;
    // Reset selection and mark that we are in the battle phase
    state.selectedIndices = [];
    state.isShopPhase = false;
    // Gather alive players and separate human and AI indices
    const alive = [];
    const humanIndices = [];
    const aiIndicesAll = [];
    state.players.forEach((p, idx) => {
      if (p.heroHealth > 0) {
        alive.push(idx);
        if (!p.isAI) humanIndices.push(idx);
        else aiIndicesAll.push(idx);
      }
    });
    // If the game ends (only one player alive)
    if (alive.length <= 1) {
      state.gameOver = true;
      const won = alive.length === 1 && !state.players[alive[0]].isAI;
      renderGameOver(won);
      return;
    }
    // Multi‑human battle flow
    if (state.numHumans > 1) {
      // Copy AI indices for pairing
      const aiIndices = aiIndicesAll.slice();
      // Shuffle AI indices
      aiIndices.sort(() => Math.random() - 0.5);
      // If odd number of AI, duplicate a random one to make pairs
      if (aiIndices.length % 2 === 1 && aiIndices.length > 1) {
        const dup = aiIndices[Math.floor(Math.random() * aiIndices.length)];
        aiIndices.push(dup);
      }
      // Resolve AI vs AI battles
      for (let i = 0; i < aiIndices.length; i += 2) {
        const iA = aiIndices[i];
        const iB = aiIndices[i + 1];
        const playerA = state.players[iA];
        const playerB = state.players[iB];
        if (!playerA || !playerB || playerA.heroHealth <= 0 || playerB.heroHealth <= 0) continue;
        const boardA = playerA.board.map(u => ({ ...u }));
        const boardB = playerB.board.map(u => ({ ...u }));
        const res = simulateBattle(boardA, boardB, playerA.heroAbility, playerB.heroAbility);
        const dmgA = computeDamageFromUnits(res.playerSurvivors);
        const dmgB = computeDamageFromUnits(res.opponentSurvivors);
        const healA = res.playerHeal || 0;
        const healB = res.opponentHeal || 0;
        playerA.board = res.playerSurvivors;
        playerB.board = res.opponentSurvivors;
        if (healA > 0) playerA.heroHealth = Math.min(playerA.heroMaxHealth, playerA.heroHealth + healA);
        if (healB > 0) playerB.heroHealth = Math.min(playerB.heroMaxHealth, playerB.heroHealth + healB);
        if (dmgA > 0) playerB.heroHealth = Math.max(0, playerB.heroHealth - dmgA);
        if (dmgB > 0) playerA.heroHealth = Math.max(0, playerA.heroHealth - dmgB);
        addMessage(`AI battle: P${iA + 1} vs P${iB + 1} → P${iA + 1} deals ${dmgA}, P${iB + 1} deals ${dmgB}.`);
      }
      // Remove dead AI players (humans remain until their battles are resolved)
      state.players = state.players.filter((p, idx) => p.heroHealth > 0 || !p.isAI);
      // Prepare pending battles for each human by sampling opponents
      state._pendingHumanBattles = [];
      const humans = state.players.filter(p => !p.isAI && p.heroHealth > 0);
      humans.forEach(humanPlayer => {
        // Choose a random opponent among all alive players excluding this human
        const oppChoices = state.players.filter(p => p !== humanPlayer && p.heroHealth > 0);
        if (oppChoices.length === 0) return;
        const oppPlayer = oppChoices[Math.floor(Math.random() * oppChoices.length)];
        const boardH = humanPlayer.board.map(u => ({ ...u }));
        const boardO = oppPlayer.board.map(u => ({ ...u }));
        const res = simulateBattle(boardH, boardO, humanPlayer.heroAbility, oppPlayer.heroAbility);
        const dmgOpp = computeDamageFromUnits(res.playerSurvivors);
        const dmgHum = computeDamageFromUnits(res.opponentSurvivors);
        const healHum = res.playerHeal || 0;
        const healOpp = res.opponentHeal || 0;
        state._pendingHumanBattles.push({
          humanRef: humanPlayer,
          opponentRef: oppPlayer,
          humanSurvivors: res.playerSurvivors,
          opponentSurvivors: res.opponentSurvivors,
          damageToOpponent: dmgOpp,
          damageToHuman: dmgHum,
          healForHuman: healHum,
          healForOpponent: healOpp,
          log: res.log
        });
      });
      // If there are pending battles, render the first one; otherwise finish round
      if (state._pendingHumanBattles.length > 0) {
        const first = state._pendingHumanBattles[0];
        renderBattleScreen(first.humanSurvivors, first.opponentSurvivors, first.log, first.damageToOpponent, first.damageToHuman, first.healForHuman, first.healForOpponent);
      } else {
        finishRound();
      }
      return;
    }
    // === Single human battle flow (previous implementation) ===
    // Identify the single human player index
    let humanIndex = -1;
    const aiIndices = [];
    alive.forEach(idx => {
      const p = state.players[idx];
      if (!p.isAI) humanIndex = idx;
      else aiIndices.push(idx);
    });
    if (humanIndex < 0) {
      // if no human found, pick the first as human
      humanIndex = alive[0];
    }
    // Choose a random opponent for the human from remaining players
    let oppIndex;
    if (aiIndices.length > 0) {
      const rand = Math.floor(Math.random() * aiIndices.length);
      oppIndex = aiIndices.splice(rand, 1)[0];
    } else {
      // If no AI opponents, human wins
      state.gameOver = true;
      renderGameOver(true);
      return;
    }
    // Shuffle and pair remaining AI players
    aiIndices.sort(() => Math.random() - 0.5);
    if (aiIndices.length % 2 === 1 && aiIndices.length > 1) {
      const dup = aiIndices[Math.floor(Math.random() * aiIndices.length)];
      aiIndices.push(dup);
    }
    for (let i = 0; i < aiIndices.length; i += 2) {
      const iA = aiIndices[i];
      const iB = aiIndices[i + 1];
      const playerA = state.players[iA];
      const playerB = state.players[iB];
      if (!playerA || !playerB || playerA.heroHealth <= 0 || playerB.heroHealth <= 0) continue;
      const boardA = playerA.board.map(u => ({ ...u }));
      const boardB = playerB.board.map(u => ({ ...u }));
      const res = simulateBattle(boardA, boardB, playerA.heroAbility, playerB.heroAbility);
      const dmgA = computeDamageFromUnits(res.playerSurvivors);
      const dmgB = computeDamageFromUnits(res.opponentSurvivors);
      const healA = res.playerHeal || 0;
      const healB = res.opponentHeal || 0;
      playerA.board = res.playerSurvivors;
      playerB.board = res.opponentSurvivors;
      if (healA > 0) playerA.heroHealth = Math.min(playerA.heroMaxHealth, playerA.heroHealth + healA);
      if (healB > 0) playerB.heroHealth = Math.min(playerB.heroMaxHealth, playerB.heroHealth + healB);
      if (dmgA > 0) playerB.heroHealth = Math.max(0, playerB.heroHealth - dmgA);
      if (dmgB > 0) playerA.heroHealth = Math.max(0, playerA.heroHealth - dmgB);
      addMessage(`AI battle: P${iA + 1} vs P${iB + 1} → P${iA + 1} deals ${dmgA}, P${iB + 1} deals ${dmgB}.`);
    }
    // Remove dead players except human and their chosen opponent
    state.players = state.players.filter((p, idx) => p.heroHealth > 0 || idx === humanIndex || idx === oppIndex);
    // Find references after removal
    const humanPlayer = state.players.find(p => !p.isAI);
    const oppPlayer = state.players.find((p, idx) => p !== humanPlayer);
    // If human died, game over
    if (!humanPlayer || humanPlayer.heroHealth <= 0) {
      state.gameOver = true;
      renderGameOver(false);
      return;
    }
    // Simulate battle for human vs chosen opponent
    const boardH = humanPlayer.board.map(u => ({ ...u }));
    const boardO = oppPlayer.board.map(u => ({ ...u }));
    const res = simulateBattle(boardH, boardO, humanPlayer.heroAbility, oppPlayer.heroAbility);
    const dmgOpp = computeDamageFromUnits(res.playerSurvivors);
    const dmgHum = computeDamageFromUnits(res.opponentSurvivors);
    const healHum = res.playerHeal || 0;
    const healOpp = res.opponentHeal || 0;
    renderBattleScreen(res.playerSurvivors, res.opponentSurvivors, res.log, dmgOpp, dmgHum, healHum, healOpp);
    state._pendingBattleResult = {
      humanRef: humanPlayer,
      opponentRef: oppPlayer,
      damageToOpponent: dmgOpp,
      damageToHuman: dmgHum,
      healForHuman: healHum,
      healForOpponent: healOpp,
      playerSurvivors: res.playerSurvivors,
      opponentSurvivors: res.opponentSurvivors
    };
  }

  /**
   * Apply the outcome of the human player's battle and proceed to the next
   * round.  This is called when the player clicks Continue on the battle
   * screen.  It uses the stored _pendingBattleResult created in
   * startBattlePhase().  After applying damage and healing, any
   * defeated players are removed, round counters are advanced, AI actions
   * are performed and the game returns to the shop phase.
   */
  function finishBattleForHumanPair() {
    const res = state._pendingBattleResult;
    if (!res) return;
    // Find the human and opponent players by reference
    const humanPlayer = res.humanRef;
    const oppPlayer = res.opponentRef;
    // Update boards with survivors
    if (humanPlayer) humanPlayer.board = res.playerSurvivors;
    if (oppPlayer) oppPlayer.board = res.opponentSurvivors;
    // Apply healing
    if (res.healForHuman > 0 && humanPlayer) {
      humanPlayer.heroHealth = Math.min(humanPlayer.heroMaxHealth, humanPlayer.heroHealth + res.healForHuman);
      addMessage(`Your hero heals ${res.healForHuman} health from surviving units.`);
    }
    if (res.healForOpponent > 0 && oppPlayer) {
      oppPlayer.heroHealth = Math.min(oppPlayer.heroMaxHealth, oppPlayer.heroHealth + res.healForOpponent);
    }
    // Apply damage
    if (res.damageToOpponent > 0 && oppPlayer) {
      oppPlayer.heroHealth = Math.max(0, oppPlayer.heroHealth - res.damageToOpponent);
      addMessage(`You deal ${res.damageToOpponent} damage to your opponent.`);
    }
    if (res.damageToHuman > 0 && humanPlayer) {
      humanPlayer.heroHealth = Math.max(0, humanPlayer.heroHealth - res.damageToHuman);
      addMessage(`Your opponent deals ${res.damageToHuman} damage to you.`);
    }
    // Remove any dead players
    state.players = state.players.filter(p => p.heroHealth > 0);
    // Determine if human survived
    // Find the human (non AI) player index
    const humanIdx = state.players.findIndex(p => !p.isAI);
    if (humanIdx < 0) {
      state.gameOver = true;
      renderGameOver(false);
      return;
    }
    // Clear pending result
    delete state._pendingBattleResult;
    // If only one player remains (the human), human wins
    if (state.players.length === 1 && humanIdx === 0) {
      state.gameOver = true;
      renderGameOver(true);
      return;
    }
    // Proceed to next round
    finishRound();
  }

  /**
   * Apply the outcome of the next pending human battle in multi‑human games.
   * Each call pops one entry from state._pendingHumanBattles and applies
   * board survivors, healing and damage to the involved players.  If
   * further battles remain, the next battle is displayed.  Once all
   * battles have been resolved, the round is finished and the shop
   * phase begins anew.
   */
  function finishNextHumanBattle() {
    if (!state._pendingHumanBattles || state._pendingHumanBattles.length === 0) {
      // Safety: if no pending battles, just finish round
      finishRound();
      return;
    }
    const res = state._pendingHumanBattles.shift();
    if (!res) {
      finishRound();
      return;
    }
    const humanPlayer = res.humanRef;
    const oppPlayer = res.opponentRef;
    // Update boards
    if (humanPlayer) humanPlayer.board = res.humanSurvivors;
    if (oppPlayer) oppPlayer.board = res.opponentSurvivors;
    // Apply healing
    if (res.healForHuman > 0 && humanPlayer) {
      humanPlayer.heroHealth = Math.min(humanPlayer.heroMaxHealth, humanPlayer.heroHealth + res.healForHuman);
      addMessage(`Player ${state.players.indexOf(humanPlayer) + 1} heals ${res.healForHuman} health from surviving units.`);
    }
    if (res.healForOpponent > 0 && oppPlayer) {
      oppPlayer.heroHealth = Math.min(oppPlayer.heroMaxHealth, oppPlayer.heroHealth + res.healForOpponent);
    }
    // Apply damage
    if (res.damageToOpponent > 0 && oppPlayer) {
      oppPlayer.heroHealth = Math.max(0, oppPlayer.heroHealth - res.damageToOpponent);
      addMessage(`Player ${state.players.indexOf(humanPlayer) + 1} deals ${res.damageToOpponent} damage to their opponent.`);
    }
    if (res.damageToHuman > 0 && humanPlayer) {
      humanPlayer.heroHealth = Math.max(0, humanPlayer.heroHealth - res.damageToHuman);
      addMessage(`Player ${state.players.indexOf(humanPlayer) + 1} takes ${res.damageToHuman} damage from their opponent.`);
    }
    // Remove any dead players (their heroHealth <=0)
    state.players = state.players.filter(p => p.heroHealth > 0);
    // If the human controlling all players lost all humans, game over
    const anyHumanAlive = state.players.some(p => !p.isAI);
    if (!anyHumanAlive) {
      state.gameOver = true;
      renderGameOver(false);
      return;
    }
    // If there are more pending battles, show the next one
    if (state._pendingHumanBattles.length > 0) {
      const next = state._pendingHumanBattles[0];
      renderBattleScreen(next.humanSurvivors, next.opponentSurvivors, next.log, next.damageToOpponent, next.damageToHuman, next.healForHuman, next.healForOpponent);
    } else {
      // All battles resolved; clear pending list and finish round
      delete state._pendingHumanBattles;
      finishRound();
    }
  }

  /**
   * Finish the current round after all battles have resolved (both AI and
   * human).  This resets the phase to shop, increments the round,
   * applies roundStart bonuses, resets gold, refreshes shops for all
   * players and executes AI purchases.  Finally the game screen is
   * rendered for the human player.
   */
  function finishRound() {
    state.round++;
    // Update number of human players remaining
    state.numHumans = state.players.filter(p => !p.isAI).length;
    // Determine base gold: 3 + round - 1 (capped at 10)
    const baseGold = Math.min(10, 3 + state.round - 1);
    // Reset shop phase
    state.isShopPhase = true;
    // Apply roundStart and distribute gold
    state.players.forEach(p => {
      p.gold = baseGold;
      if (p.heroAbility && typeof p.heroAbility.roundStart === 'function') {
        p.heroAbility.roundStart(p);
      }
      refreshShopForPlayer(p);
      updateBoardLimit(p);
    });
    // Let AI perform their actions before any human sees the board
    state.players.forEach(p => {
      if (p.isAI) performAIActions(p);
    });
    // Reset selections and set current player to the first human (index 0) or to 0 if no human (should not occur)
    state.selectedIndices = [];
    state.currentPlayerIndex = 0;
    renderGameScreen();
  }

  // Show a fusion animation overlay when fusing units.
  function showFusionAnimation(emoji) {
    let overlay = document.querySelector('.fusion-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'fusion-overlay';
      const inner = document.createElement('div');
      inner.className = 'fusion-emoji';
      overlay.appendChild(inner);
      document.body.appendChild(overlay);
    }
    const inner = overlay.querySelector('.fusion-emoji');
    inner.textContent = emoji;
    overlay.classList.add('active');
    // Fade out after 800ms
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 800);
  }

  // Generate an opponent board based on the current round. Difficulty scales
  // with the round number.  Different strategies are randomly selected to
  // provide variety and increasing challenge.
  function generateOpponent() {
    // Define various opponent strategies
    const strategies = [];
    // Elemental Master: focuses on elemental units and their fusions
    strategies.push((round) => {
      const units = [];
      // Use the human player's board limit if available or default to 5
      const limit = (state.players && state.players[0] && state.players[0].boardLimit) ? state.players[0].boardLimit : 5;
      const count = Math.min(limit, Math.max(1, Math.floor(round / 2) + 1));
      const elementalBases = ['Fire','Water','Earth','Air'];
      for (let i = 0; i < count; i++) {
        let name;
        if (round > 3 && Math.random() < 0.4) {
          // pick a fused elemental unit
          const fused = ['Lava','Steam','Mud','Dust','Energy','Ice','Rock','Storm'];
          name = fused[Math.floor(Math.random() * fused.length)];
        } else {
          name = elementalBases[Math.floor(Math.random() * elementalBases.length)];
        }
        units.push(createUnit(name));
      }
      return units;
    });
    // Tech Tactician: focuses on tech units and their fusions
    strategies.push((round) => {
      const units = [];
      const limit = (state.players && state.players[0] && state.players[0].boardLimit) ? state.players[0].boardLimit : 5;
      const count = Math.min(limit, Math.max(1, Math.floor(round / 2) + 1));
      const techBases = ['Gear','Chip'];
      for (let i = 0; i < count; i++) {
        let name;
        if (round > 3 && Math.random() < 0.5) {
          // pick a fused tech unit
          const fused = ['Android','AI','Robot'];
          name = fused[Math.floor(Math.random() * fused.length)];
        } else {
          name = techBases[Math.floor(Math.random() * techBases.length)];
        }
        units.push(createUnit(name));
      }
      return units;
    });
    // Fused Lover: tends to play with fused units exclusively after round 2
    strategies.push((round) => {
      const units = [];
      const limit = (state.players && state.players[0] && state.players[0].boardLimit) ? state.players[0].boardLimit : 5;
      const count = Math.min(limit, Math.max(1, Math.floor(round / 2) + 1));
      for (let i = 0; i < count; i++) {
        let name;
        if (round > 2) {
          const fusedNames = Array.from(new Set(Object.values(fusionMap)));
          name = fusedNames[Math.floor(Math.random() * fusedNames.length)];
        } else {
          name = baseUnitNames[Math.floor(Math.random() * baseUnitNames.length)];
        }
        units.push(createUnit(name));
      }
      return units;
    });
    // Balanced: behaves like the original generator
    strategies.push((round) => {
      const units = [];
      const limit = (state.players && state.players[0] && state.players[0].boardLimit) ? state.players[0].boardLimit : 5;
      const count = Math.min(limit, Math.max(1, Math.floor(round / 2) + 1));
      for (let i = 0; i < count; i++) {
        let name;
        if (round > 3 && Math.random() < 0.3) {
          const fusedNames = Array.from(new Set(Object.values(fusionMap)));
          name = fusedNames[Math.floor(Math.random() * fusedNames.length)];
        } else {
          name = baseUnitNames[Math.floor(Math.random() * baseUnitNames.length)];
        }
        units.push(createUnit(name));
      }
      return units;
    });
    // Choose a strategy at random
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    return strategy(state.round);
  }

  // Simulate an auto battle between two boards.  Returns an object
  // containing the surviving units, a battle log, and accumulated
  // healing effects to be applied to the hero after the fight.  This
  // function implements various unit abilities such as startAttackBonus,
  // healHero, aoeDamage, reduceIncomingAttack, burnEffect,
  // gainAttackOnKill, afterBattleHealthBonus, reduceIncomingAttackAll,
  // survivorDamageBonus, etc.  It also respects the hero's battleStart
  // ability.
  function simulateBattle(playerUnits, opponentUnits, playerAbility = null, opponentAbility = null) {
    const log = [];
    let playerHeal = 0;
    let opponentHeal = 0;
    // Deep copy the units so that battle does not modify originals.  Copy
    // all properties to preserve abilities.
    const pUnits = playerUnits.map(u => ({ ...u }));
    const oUnits = opponentUnits.map(u => ({ ...u }));
    // Apply hero battle bonuses to both sides.  If specific abilities
    // are provided they override the global state hero ability.  This
    // enables multiplayer support where each player has their own relic.
    const pAbility = playerAbility || state.heroAbility;
    const oAbility = opponentAbility || state.heroAbility;
    if (pAbility && typeof pAbility.battleStart === 'function') {
      pAbility.battleStart(pUnits);
    }
    if (oAbility && typeof oAbility.battleStart === 'function') {
      oAbility.battleStart(oUnits);
    }
    // === Pre‑battle processing ===
    // Apply startAttackBonus and healHero to both sides.  Also gather
    // reduceIncomingAttackAll (shields) and aoeDamage effects.
    const applyPreBattle = (units, opponentUnits, side) => {
      let totalShield = 0;
      units.forEach(u => {
        // startAttackBonus
        if (u.startAttackBonus) {
          u.attack += u.startAttackBonus;
        }
        // healHero at start
        if (u.healHero) {
          if (side === 'player') playerHeal += u.healHero;
          else opponentHeal += u.healHero;
        }
        // accumulate shield (reduce incoming attack for all allies)
        if (u.reduceIncomingAttackAll) {
          totalShield += u.reduceIncomingAttackAll;
        }
      });
      // Apply shield to all units
      if (totalShield > 0) {
        units.forEach(u => {
          u.reduceIncomingAttack = (u.reduceIncomingAttack || 0) + totalShield;
        });
      }
      // Apply AOE damage to opponents
      units.forEach(u => {
        if (u.aoeDamage) {
          opponentUnits.forEach(v => {
            v.health -= u.aoeDamage;
          });
          if (u.aoeDamage > 0) {
            log.push(`${u.name} deals ${u.aoeDamage} damage to all enemies at the start!`);
          }
        }
      });
    };
    // Pre battle: player units vs opponent and vice versa
    applyPreBattle(pUnits, oUnits, 'player');
    applyPreBattle(oUnits, pUnits, 'opponent');
    // Remove any units killed by AOE damage before battle starts
    function purgeDead(arr, side) {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].health <= 0) {
          log.push(`${arr[i].name} is destroyed before combat.`);
          arr.splice(i, 1);
        }
      }
    }
    purgeDead(pUnits, 'player');
    purgeDead(oUnits, 'opponent');
    // === Battle loop ===
    let roundCounter = 1;
    while (pUnits.length > 0 && oUnits.length > 0) {
      const p = pUnits[0];
      const o = oUnits[0];
      log.push(`Round ${roundCounter}: ${p.name} (${p.attack}/${p.health}) vs ${o.name} (${o.attack}/${o.health})`);
      // They fight until one dies
      while (p.health > 0 && o.health > 0) {
        // Effective damage taking into account reduceIncomingAttack of target
        const pToO = Math.max(0, p.attack - (o.reduceIncomingAttack || 0));
        const oToP = Math.max(0, o.attack - (p.reduceIncomingAttack || 0));
        // Apply simultaneous damage
        p.health -= oToP;
        o.health -= pToO;
        // Burn effect: attacker suffers burn damage when hitting a target with burnEffect
        if (p.burnEffect && oToP > 0) {
          o.health -= p.burnEffect;
        }
        if (o.burnEffect && pToO > 0) {
          p.health -= o.burnEffect;
        }
        if (p.health <= 0 || o.health <= 0) break;
      }
      // Determine outcome and apply kill bonuses
      const pDead = p.health <= 0;
      const oDead = o.health <= 0;
      if (pDead && oDead) {
        log.push(`Both ${p.name} and ${o.name} are defeated!`);
        pUnits.shift();
        oUnits.shift();
      } else if (pDead) {
        log.push(`${p.name} dies; ${o.name} survives with ${Math.max(0, o.health)} HP.`);
        // o killed p: apply gainAttackOnKill if present
        if (o.gainAttackOnKill) {
          o.attack += o.gainAttackOnKill;
        }
        pUnits.shift();
      } else if (oDead) {
        log.push(`${o.name} dies; ${p.name} survives with ${Math.max(0, p.health)} HP.`);
        // p killed o: apply gainAttackOnKill
        if (p.gainAttackOnKill) {
          p.attack += p.gainAttackOnKill;
        }
        oUnits.shift();
      }
      roundCounter++;
    }
    // === Post‑battle processing ===
    // Apply afterBattleHealthBonus to survivors
    const applyAfterBattle = (units, side) => {
      units.forEach(u => {
        if (u.afterBattleHealthBonus) {
          u.health += u.afterBattleHealthBonus;
          u.maxHealth = (u.maxHealth || u.health);
        }
      });
    };
    applyAfterBattle(pUnits, 'player');
    applyAfterBattle(oUnits, 'opponent');
    return { playerSurvivors: pUnits, opponentSurvivors: oUnits, log, playerHeal, opponentHeal };
  }

  /**
   * Compute the amount of hero damage dealt by an array of surviving units.
   * Damage equals the total number of fusions that created each unit
   * (i.e. length of elements minus one) plus any survivorDamageBonus.
   * @param {Array} units The array of surviving unit objects.
   * @returns {number} The total damage dealt by these units.
   */
  function computeDamageFromUnits(units) {
    return units.reduce((total, u) => {
      let dmg = 0;
      const def = unitDefinitions[u.name];
      if (def && def.elements) {
        dmg = Math.max(0, def.elements.length - 1);
      }
      if (u.survivorDamageBonus) {
        dmg += u.survivorDamageBonus;
      }
      return total + dmg;
    }, 0);
  }

  // Execute a battle: generate opponent, simulate fight, apply damage, advance round.
  function doBattle() {
    const player = state.players && state.players.length > 0 ? state.players[0] : null;
    if (!player || player.board.length === 0) {
      addMessage('You have no units to battle with.');
      return;
    }
    playSound('battle');
    // Generate an opponent board and simulate battle
    const opponent = generateOpponent();
    const result = simulateBattle(player.board, opponent, player.heroAbility, null);
    // Compute damage using shared helper
    const pDamage = computeDamageFromUnits(result.playerSurvivors);
    const oDamage = computeDamageFromUnits(result.opponentSurvivors);
    const pHeal = result.playerHeal || 0;
    const oHeal = result.opponentHeal || 0;
    // Display the battle outcome to the player.  The player's board
    // survives separately and will be updated in finishBattle().
    renderBattleScreen([...player.board], opponent, result.log, pDamage, oDamage, pHeal, oHeal);
  }

  /**
   * Render a detailed battle screen so the player can see both boards and the
   * sequence of attacks.  After reviewing the outcome the player can
   * continue to the next round, at which point damage is applied and the
   * game progresses.  The function accepts copies of the player's and
   * opponent's boards, an array of log strings, and the damage values to
   * apply once the battle is acknowledged.
   */
  function renderBattleScreen(playerUnits, opponentUnits, logs, pDamage, oDamage, pHeal = 0, oHeal = 0) {
    const app = document.getElementById('app');
    app.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'battle-section';
    // Header
    const title = document.createElement('h2');
    title.style.textAlign = 'center';
    title.innerText = 'Battle';
    container.appendChild(title);
    // Player row label
    const pLabel = document.createElement('h3');
    pLabel.innerText = 'Your Board';
    container.appendChild(pLabel);
    const pRow = document.createElement('div');
    pRow.className = 'battle-row';
    playerUnits.forEach((unit) => {
      const card = document.createElement('div');
      card.className = 'unit-card';
      card.innerHTML = `
        <img src="${unit.img}" alt="${unit.name}" class="unit-img" onerror="this.src='assets/images/placeholder.png'">
        <div class="name">${unit.name}</div>
        <div class="stats">${unit.attack}/${unit.health}</div>
      `;
      pRow.appendChild(card);
    });
    container.appendChild(pRow);
    // Opponent row label
    const oLabel = document.createElement('h3');
    oLabel.innerText = 'Opponent Board';
    container.appendChild(oLabel);
    const oRow = document.createElement('div');
    oRow.className = 'battle-row';
    opponentUnits.forEach((unit) => {
      const card = document.createElement('div');
      card.className = 'unit-card';
      card.innerHTML = `
        <img src="${unit.img}" alt="${unit.name}" class="unit-img" onerror="this.src='assets/images/placeholder.png'">
        <div class="name">${unit.name}</div>
        <div class="stats">${unit.attack}/${unit.health}</div>
      `;
      oRow.appendChild(card);
    });
    container.appendChild(oRow);
    // Battle log area
    const logContainer = document.createElement('div');
    logContainer.className = 'battle-log';
    logs.forEach((l) => {
      const p = document.createElement('p');
      p.textContent = l;
      logContainer.appendChild(p);
    });
    container.appendChild(logContainer);
    // Control button
    const ctrl = document.createElement('div');
    ctrl.className = 'battle-controls';
    const btn = document.createElement('button');
    btn.className = 'button';
    btn.innerText = 'Continue';
    btn.addEventListener('click', () => {
      playSound('click');
      // Determine which resolution function to call based on game mode
      if (state.numHumans > 1 && state._pendingHumanBattles && state._pendingHumanBattles.length > 0) {
        finishNextHumanBattle();
      } else if (state.playerCount > 1) {
        finishBattleForHumanPair();
      } else {
        finishBattle(pDamage, oDamage, pHeal, oHeal);
      }
    });
    ctrl.appendChild(btn);
    container.appendChild(ctrl);
    app.appendChild(container);
  }

  /**
   * Finalise a battle after the player has reviewed the outcome.  Damage is
   * applied here, health and round counters are updated, and the game
   * continues.  If either hero reaches zero health a game over screen is
   * displayed.
   */
  function finishBattle(pDamage, oDamage, pHeal = 0, oHeal = 0) {
    // This function now only handles the legacy single‑player case.  In
    // multiplayer, finishBattleForHumanPair() is used instead.  The
    // opponent is a generic enemy whose health is tracked by
    // opponentHealth/opponentMaxHealth.  Damage and healing are
    // applied accordingly and the round progresses.
    // Compute hero damage application
    if (pDamage > 0 && oDamage === 0) {
      addMessage(`You win the round and deal ${pDamage} damage to the opponent!`);
      state.opponentHealth = Math.max(0, state.opponentHealth - pDamage);
    } else if (oDamage > 0 && pDamage === 0) {
      addMessage(`You lose the round and take ${oDamage} damage!`);
      state.heroHealth = Math.max(0, state.heroHealth - oDamage);
    } else if (pDamage > 0 && oDamage > 0) {
      addMessage(`Both sides deal damage! You take ${oDamage} and deal ${pDamage}.`);
      state.heroHealth = Math.max(0, state.heroHealth - oDamage);
      state.opponentHealth = Math.max(0, state.opponentHealth - pDamage);
    } else {
      addMessage('The battle ends in a draw; no damage dealt.');
    }
    // Apply healing after damage
    if (pHeal > 0) {
      state.heroHealth = Math.min(state.heroMaxHealth, state.heroHealth + pHeal);
      addMessage(`Your hero heals ${pHeal} health from surviving units.`);
    }
    if (oHeal > 0) {
      state.opponentHealth = Math.min(state.opponentMaxHealth, state.opponentHealth + oHeal);
    }
    // Check for victory/defeat
    if (state.opponentHealth <= 0) {
      addMessage('Victory! You have defeated the opponent!');
      state.gameOver = true;
      renderGameOver(true);
      return;
    }
    if (state.heroHealth <= 0) {
      addMessage('Defeat! Your hero has fallen.');
      state.gameOver = true;
      renderGameOver(false);
      return;
    }
    // Advance to next round
    state.round++;
    // Increase gold for the human (players[0] if players exists)
    const baseGold = Math.min(10, 3 + state.round - 1);
    if (state.players && state.players.length > 0) {
      const p = state.players[0];
      p.gold = baseGold;
      if (p.heroAbility && typeof p.heroAbility.roundStart === 'function') {
        p.heroAbility.roundStart(p);
      }
      refreshShopForPlayer(p);
    }
    renderGameScreen();
  }

  // Render the game over screen with a restart option.
  function renderGameOver(won) {
    const app = document.getElementById('app');
    // Delay to allow last messages to appear
    setTimeout(() => {
      app.innerHTML = '';
      const msg = document.createElement('h2');
      msg.style.textAlign = 'center';
      msg.innerText = won ? 'You Win!' : 'Game Over';
      app.appendChild(msg);
      const sub = document.createElement('p');
      sub.style.textAlign = 'center';
      sub.innerText = won ? 'Congratulations, brave battler!' : 'Better luck next time.';
      app.appendChild(sub);
      const btn = document.createElement('button');
      btn.className = 'button';
      btn.innerText = 'Play Again';
      btn.style.display = 'block';
      btn.style.margin = '20px auto';
      btn.addEventListener('click', renderStartScreen);
      app.appendChild(btn);
    }, 1000);
  }

  // === Card editor ===
  // Open the card editor by prompting for a password. If the password is
  // correct, render the editor panel; otherwise, abort.
  function openEditor() {
    const pwd = prompt('Enter editor password:');
    if (pwd !== null && pwd === '2911') {
      playSound('click');
      renderEditorPanel();
    } else if (pwd !== null) {
      alert('Incorrect password.');
    }
  }

  // Render the editor panel to create new unit cards.
  function renderEditorPanel() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'editor-panel';
    panel.innerHTML = `
      <h3>Create a Custom Unit</h3>
      <label>Name<input type="text" id="edit-name" placeholder="Name"></label>
      <label>Emoji<input type="text" id="edit-emoji" placeholder="Emoji"></label>
      <label>Class<select id="edit-class"><option value="Elemental">Elemental</option><option value="Tech">Tech</option></select></label>
      <label>Attack<input type="number" id="edit-attack" min="1" value="1"></label>
      <label>Health<input type="number" id="edit-health" min="1" value="1"></label>
      <label>Elements (comma separated)<input type="text" id="edit-elements" placeholder="e.g. Fire,Water"></label>
      <h4>Fusion Options (optional)</h4>
      <p style="font-size:12px; color:#666;">Define a custom fusion for this unit. Only units of the same class can fuse together. Leave blank if none.</p>
      <label>Fuses With<input type="text" id="edit-fuse-with" placeholder="Other unit name"></label>
      <label>Fuses Into<input type="text" id="edit-fuse-into" placeholder="Result unit name"></label>
      <div class="editor-actions">
        <button id="editor-cancel" class="button">Cancel</button>
        <button id="editor-save" class="button">Save</button>
      </div>
    `;
    app.appendChild(panel);
    document.getElementById('editor-cancel').addEventListener('click', () => {
      playSound('click');
      renderGameScreen();
    });
    document.getElementById('editor-save').addEventListener('click', () => {
      const name = document.getElementById('edit-name').value.trim();
      const emoji = document.getElementById('edit-emoji').value.trim() || '❓';
      const cls = document.getElementById('edit-class').value;
      const attack = parseInt(document.getElementById('edit-attack').value, 10);
      const health = parseInt(document.getElementById('edit-health').value, 10);
      const elementsStr = document.getElementById('edit-elements').value.trim();
      if (!name) {
        alert('Name is required');
        return;
      }
      if (unitDefinitions[name]) {
        alert('A unit with this name already exists.');
        return;
      }
      const elements = elementsStr ? elementsStr.split(',').map(s => s.trim()).filter(s => s) : [cls];
      // Register the new unit definition locally
      unitDefinitions[name] = { class: cls, attack, health, emoji, elements };
      // Assign an image path based on the unit name.  Spaces are replaced with
      // hyphens to produce a consistent filename.  Users can drop their own
      // image into assets/images to override the placeholder.
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      unitDefinitions[name].img = `assets/images/${slug}.png`;
      baseUnitNames.push(name);
      // Persist custom unit into localStorage
      try {
        const data = localStorage.getItem('customUnits');
        const custom = data ? JSON.parse(data) : {};
        custom[name] = { class: cls, attack, health, emoji, elements };
        localStorage.setItem('customUnits', JSON.stringify(custom));
      } catch (err) {
        console.warn('Failed to persist custom unit:', err);
      }
      // Handle optional fusion definition
      const fuseWith = document.getElementById('edit-fuse-with').value.trim();
      const fuseInto = document.getElementById('edit-fuse-into').value.trim();
      if (fuseWith && fuseInto) {
        // Validate that the other unit exists and classes match
        const otherDef = unitDefinitions[fuseWith];
        if (!otherDef) {
          alert(`The unit named "${fuseWith}" does not exist.`);
        } else if (otherDef.class !== cls) {
          alert('Fusion is only allowed with units of the same class.');
        } else {
          // Create the fused definition if necessary
          createFusionDefinition(fuseInto, name, fuseWith);
          // Register the fusion mapping (both directions)
          fusionMap[name + '+' + fuseWith] = fuseInto;
          fusionMap[fuseWith + '+' + name] = fuseInto;
          customFusions[name + '+' + fuseWith] = fuseInto;
          customFusions[fuseWith + '+' + name] = fuseInto;
          // Persist custom fusions
          try {
            const fdata = localStorage.getItem('customFusions');
            const fcustom = fdata ? JSON.parse(fdata) : {};
            fcustom[name + '+' + fuseWith] = fuseInto;
            fcustom[fuseWith + '+' + name] = fuseInto;
            localStorage.setItem('customFusions', JSON.stringify(fcustom));
          } catch (err) {
            console.warn('Failed to persist custom fusion:', err);
          }
          addMessage(`Fusion rule added: ${name} + ${fuseWith} → ${fuseInto}`);
        }
      }
      addMessage(`Custom unit ${name} added to the pool.`);
      playSound('click');
      renderGameScreen();
    });
  }

  /**
   * Open the mechanic editor by prompting for a password.  If the
   * password is correct, render the editor panel; otherwise abort.
   */
  function openMechanicEditor() {
    const pwd = prompt('Enter mechanic editor password:');
    if (pwd !== null && pwd === 'admin') {
      renderMechanicPanel();
    } else if (pwd !== null) {
      alert('Incorrect password.');
    }
  }

  /**
   * Render the mechanic editor panel.  The panel allows the user to
   * define new custom keywords (mechanics) with descriptions.  These
   * mechanics are stored in localStorage under the key 'customMechanics'.
   * They do not affect gameplay by default but can serve as a glossary
   * for custom rules.  Existing mechanics are listed for reference.
   */
  function renderMechanicPanel() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'editor-panel';
    panel.innerHTML = `
      <h3>Mechanic Editor</h3>
      <p style="font-size:12px;color:#666;">Create or view custom mechanics (keywords) that can be referenced in card descriptions.</p>
      <label>Name<input type="text" id="mech-name" placeholder="Keyword"></label>
      <label>Description<textarea id="mech-desc" placeholder="Description" style="width:100%;height:60px;margin-top:4px;"></textarea></label>
      <div class="editor-actions">
        <button id="mech-cancel" class="button">Cancel</button>
        <button id="mech-save" class="button">Save</button>
      </div>
      <h4>Existing Mechanics</h4>
      <ul id="mech-list" style="max-height:200px;overflow-y:auto;padding-left:20px;font-size:14px;"></ul>
    `;
    app.appendChild(panel);
    // load and list existing mechanics
    const listEl = panel.querySelector('#mech-list');
    try {
      const data = localStorage.getItem('customMechanics');
      if (data) {
        const mechs = JSON.parse(data);
        Object.entries(mechs).forEach(([name, desc]) => {
          const li = document.createElement('li');
          li.textContent = `${name}: ${desc}`;
          listEl.appendChild(li);
        });
      }
    } catch (err) {
      console.warn('Failed to load mechanics', err);
    }
    document.getElementById('mech-cancel').addEventListener('click', () => {
      playSound('click');
      renderGameScreen();
    });
    document.getElementById('mech-save').addEventListener('click', () => {
      const name = document.getElementById('mech-name').value.trim();
      const desc = document.getElementById('mech-desc').value.trim();
      if (!name) {
        alert('Name is required');
        return;
      }
      // persist mechanic
      try {
        const data = localStorage.getItem('customMechanics');
        const mechs = data ? JSON.parse(data) : {};
        mechs[name] = desc;
        localStorage.setItem('customMechanics', JSON.stringify(mechs));
      } catch (err) {
        console.warn('Failed to save mechanic', err);
      }
      addMessage(`Custom mechanic ${name} saved.`);
      playSound('click');
      renderGameScreen();
    });
  }

  /**
   * Prompt for a password and open the consolidated game editor if correct.
   * The game editor allows management of custom mechanics/keywords and
   * explicit fusion rules.  It combines the functionality of the
   * mechanic editor and a dedicated fusion editor into a single UI so
   * that end users have a convenient place to configure game behaviour.
   */
  function openGameEditor() {
    const pwd = prompt('Enter game editor password:');
    if (pwd !== null && pwd === 'admin') {
      playSound('click');
      renderGameEditorPanel();
    } else if (pwd !== null) {
      alert('Incorrect password.');
    }
  }

  /**
   * Render the game editor panel.  This panel provides two sections:
   * one for defining new mechanics/keywords and another for defining
   * custom fusion rules between existing units.  Existing entries are
   * listed for reference.  Saving updates the relevant localStorage
   * keys.  The panel uses datalist inputs for unit names to help the
   * user select from existing definitions.
   */
  function renderGameEditorPanel() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'editor-panel';
    panel.style.maxWidth = '500px';
    panel.innerHTML = `
      <h3>Game Editor</h3>
      <p style="font-size:12px;color:#666;">Create or view custom mechanics (keywords) and custom fusion rules.</p>
      <h4>Add Mechanic / Keyword</h4>
      <label>Name<input type="text" id="game-mech-name" placeholder="Keyword"></label>
      <label>Description<textarea id="game-mech-desc" placeholder="Description" style="width:100%;height:60px;margin-top:4px;"></textarea></label>
      <button id="game-mech-save" class="button" style="margin-top:10px;">Save Mechanic</button>
      <h4 style="margin-top:20px;">Existing Mechanics</h4>
      <ul id="game-mech-list" style="max-height:150px;overflow-y:auto;padding-left:20px;font-size:14px;list-style:disc;"></ul>
      <hr style="margin:20px 0;">
      <h4>Add Fusion Rule</h4>
      <p style="font-size:12px;color:#666;">Specify two unit names and the resulting unit. Only units of the same class can fuse.</p>
      <label>Unit A<input list="unit-list" id="game-fuse-a" placeholder="First unit name"></label>
      <label>Unit B<input list="unit-list" id="game-fuse-b" placeholder="Second unit name"></label>
      <label>Result<input type="text" id="game-fuse-result" placeholder="Result unit name"></label>
      <button id="game-fuse-save" class="button" style="margin-top:10px;">Save Fusion</button>
      <h4 style="margin-top:20px;">Existing Custom Fusions</h4>
      <ul id="game-fuse-list" style="max-height:150px;overflow-y:auto;padding-left:20px;font-size:14px;list-style:disc;"></ul>
      <div class="editor-actions" style="margin-top:20px;">
        <button id="game-editor-cancel" class="button">Back</button>
      </div>
    `;
    // Append datalist for unit names
    const datalist = document.createElement('datalist');
    datalist.id = 'unit-list';
    Object.keys(unitDefinitions).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      datalist.appendChild(opt);
    });
    panel.appendChild(datalist);
    app.appendChild(panel);
    // Populate existing mechanics list
    const mechList = document.getElementById('game-mech-list');
    try {
      const data = localStorage.getItem('customMechanics');
      if (data) {
        const mechs = JSON.parse(data);
        Object.entries(mechs).forEach(([name, desc]) => {
          const li = document.createElement('li');
          li.textContent = `${name}: ${desc}`;
          mechList.appendChild(li);
        });
      }
    } catch (err) {
      console.warn('Failed to load mechanics', err);
    }
    // Populate existing custom fusions list
    const fuseList = document.getElementById('game-fuse-list');
    try {
      // Show unique pairs only (A+B) where key lexicographically is first input's name
      const seen = new Set();
      Object.keys(customFusions).forEach(key => {
        const res = customFusions[key];
        const parts = key.split('+');
        if (parts.length !== 2) return;
        // Use sorted representation to avoid duplicates
        const sorted = parts.slice().sort();
        const pairKey = sorted[0] + '+' + sorted[1];
        if (seen.has(pairKey)) return;
        seen.add(pairKey);
        const li = document.createElement('li');
        li.textContent = `${parts[0]} + ${parts[1]} → ${res}`;
        fuseList.appendChild(li);
      });
    } catch (err) {
      console.warn('Failed to load custom fusions', err);
    }
    // Save mechanic handler
    document.getElementById('game-mech-save').addEventListener('click', () => {
      const name = document.getElementById('game-mech-name').value.trim();
      const desc = document.getElementById('game-mech-desc').value.trim();
      if (!name) {
        alert('Name is required');
        return;
      }
      try {
        const data = localStorage.getItem('customMechanics');
        const mechs = data ? JSON.parse(data) : {};
        mechs[name] = desc;
        localStorage.setItem('customMechanics', JSON.stringify(mechs));
      } catch (err) {
        console.warn('Failed to save mechanic', err);
      }
      addMessage(`Custom mechanic ${name} saved.`);
      // Refresh list
      renderGameEditorPanel();
    });
    // Save fusion handler
    document.getElementById('game-fuse-save').addEventListener('click', () => {
      const a = document.getElementById('game-fuse-a').value.trim();
      const b = document.getElementById('game-fuse-b').value.trim();
      const res = document.getElementById('game-fuse-result').value.trim();
      if (!a || !b || !res) {
        alert('All fields are required');
        return;
      }
      if (!unitDefinitions[a] || !unitDefinitions[b]) {
        alert('Both units must exist');
        return;
      }
      if (unitDefinitions[a].class !== unitDefinitions[b].class) {
        alert('Units must be of the same class to fuse');
        return;
      }
      // Create the fusion definition if needed
      createFusionDefinition(res, a, b);
      // Register mapping both directions
      fusionMap[a + '+' + b] = res;
      fusionMap[b + '+' + a] = res;
      customFusions[a + '+' + b] = res;
      customFusions[b + '+' + a] = res;
      // Persist custom fusions
      try {
        const data = localStorage.getItem('customFusions');
        const fusions = data ? JSON.parse(data) : {};
        fusions[a + '+' + b] = res;
        fusions[b + '+' + a] = res;
        localStorage.setItem('customFusions', JSON.stringify(fusions));
      } catch (err) {
        console.warn('Failed to save custom fusion', err);
      }
      addMessage(`Fusion rule added: ${a} + ${b} → ${res}`);
      // Refresh list
      renderGameEditorPanel();
    });
    // Cancel button
    document.getElementById('game-editor-cancel').addEventListener('click', () => {
      renderGameScreen();
    });
  }

  // Initialize when DOM is ready.  Restore custom units and then present the
  // hero selection screen.  Loading custom units up front ensures that
  // additional cards are available immediately.
  window.addEventListener('DOMContentLoaded', () => {
    initAudioVolume();
    loadCustomUnits();
    loadCustomFusions();
    renderStartScreen();
  });
})();