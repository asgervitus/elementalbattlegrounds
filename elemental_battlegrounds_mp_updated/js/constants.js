/**
 * Game Constants - Unit Definitions, Fusion Maps, and Other Game Data
 * Elemental Battlegrounds
 */

// === Unit definitions ===
// Each unit has a class (Elemental or Tech), base attack, base health,
// display emoji, and a list of constituent elements for fusion/abilities.
export const unitDefinitions = {
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

// Fusion mapping: combining two units yields a more powerful unit.
// Both orders (A+B and B+A) are included for convenience.
export const fusionMap = {
  'Fire+Fire': 'Lava', 'Water+Water': 'Ice', 'Earth+Earth': 'Rock', 'Air+Air': 'Storm',
  'Fire+Water': 'Steam', 'Water+Fire': 'Steam',
  'Water+Earth': 'Mud', 'Earth+Water': 'Mud',
  'Earth+Air': 'Dust', 'Air+Earth': 'Dust',
  'Air+Fire': 'Energy', 'Fire+Air': 'Energy',
  'Gear+Gear': 'Android', 'Chip+Chip': 'AI',
  'Gear+Chip': 'Robot', 'Chip+Gear': 'Robot'
};

// === Relic definitions ===
// The old hero/sigil system has been replaced by global "relics" that apply
// universal effects to all units. Each relic has a name, emoji,
// description, and ability hooks. These hooks operate on the entire
// board rather than specific classes so that every card can benefit.
export const heroes = [
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

// List of base unit names available at the start of the game
// This gets extended by custom units loaded from localStorage
export let baseUnitNames = [
  'Fire', 'Water', 'Earth', 'Air', 'Gear', 'Chip', 'Lightning', 'Sand', 'Mist', 'Ash',
  'Drone', 'Nanobot', 'Turret', 'Processor', 'Flora', 'Quake', 'Zephyr', 'Frost',
  'Firewall', 'Cyborg', 'Quantum', 'DroneSwarm'
];

// Game configuration constants
export const GAME_CONFIG = {
  INITIAL_GOLD: 3,
  SHOP_SIZE: 5,
  INITIAL_BOARD_LIMIT: 5,
  INITIAL_HERO_HEALTH: 20,
  REROLL_COST: 1,
  UNIT_BASE_COST: 3
};