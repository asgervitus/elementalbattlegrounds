/**
 * Units Management - Unit creation, fusion, and related operations
 * Elemental Battlegrounds
 */

import { unitDefinitions, fusionMap, baseUnitNames, GAME_CONFIG } from './constants.js';

/**
 * Custom fusion rules defined by the user through the card editor.  This
 * object maps keys of the form "NameA+NameB" to the resulting unit name.
 * It is loaded from and persisted to localStorage under the key
 * 'customFusions'.  Unlike static fusionMap, customFusions may grow
 * dynamically at runtime.  When a fusion is not present in either
 * fusionMap or customFusions, the engine will automatically create a
 * default fused unit combining the stats of the two components.
 */
export const customFusions = {};

/**
 * Attach an image path to every predefined unit.  Images live in
 * `assets/images` and are named after the unit in lowercase.  Should the
 * image fail to load the game falls back to a generic placeholder.
 */
export function initializeUnitImages() {
  Object.keys(unitDefinitions).forEach((name) => {
    const key = name.toLowerCase();
    unitDefinitions[name].img = `assets/images/${key}.png`;
  });
}

/**
 * Load any custom units persisted in localStorage.  Custom units are
 * stored under the 'customUnits' key.  Each entry augments
 * `unitDefinitions` and `baseUnitNames` so that new cards can appear in
 * subsequent games.  Custom units also get a default image path, but you
 * can replace the corresponding file in assets/images to customise the
 * artwork.
 */
export function loadCustomUnits() {
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

/**
 * Load custom fusions persisted in localStorage.  Each entry is added
 * into customFusions and also into fusionMap for quick lookup.  The
 * function guards against malformed data.  After loading fusions, new
 * fusion results are also defined as units if they do not already
 * exist.  Custom fusions are stored as keys of the form 'A+B'.
 */
export function loadCustomFusions() {
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
      // from the first component.  Emojis are concatenated.
      if (!unitDefinitions[resultName] && parts.length === 2) {
        createFusionDefinition(resultName, parts[0], parts[1]);
      }
    });
  } catch (err) {
    console.warn('Failed to load custom fusions:', err);
  }
}

/**
 * Create a fusion definition for a new unit based on two component units.
 * This is used when custom fusions reference units that don't exist yet.
 * The resulting unit inherits stats from both components.
 */
export function createFusionDefinition(resultName, unitA, unitB) {
  const defA = unitDefinitions[unitA];
  const defB = unitDefinitions[unitB];
  
  if (!defA || !defB) {
    console.warn(`Cannot create fusion definition for ${resultName}: missing component units`);
    return;
  }
  
  // Determine class (prefer Elemental if mixed)
  let unitClass = defA.class;
  if (defA.class !== defB.class && defA.class === 'Tech') {
    unitClass = defB.class;
  }
  
  // Combine stats
  const attack = defA.attack + defB.attack;
  const health = defA.health + defB.health;
  const emoji = defA.emoji + defB.emoji;
  const elements = [...(defA.elements || []), ...(defB.elements || [])];
  
  // Create the new unit definition
  unitDefinitions[resultName] = {
    class: unitClass,
    attack,
    health,
    emoji,
    elements,
    img: `assets/images/${resultName.toLowerCase().replace(/\s+/g, '-')}.png`
  };
  
  // Add to base unit names if not already present
  if (!baseUnitNames.includes(resultName)) {
    baseUnitNames.push(resultName);
  }
}

/**
 * Create a new unit instance from a unit definition
 */
export function createUnit(name) {
  const def = unitDefinitions[name];
  if (!def) {
    console.warn(`Unit definition not found: ${name}`);
    return null;
  }
  
  // Create unit instance with current stats
  const unit = {
    name,
    attack: def.attack,
    health: def.health,
    maxHealth: def.health,
    emoji: def.emoji,
    class: def.class,
    elements: [...(def.elements || [])],
    img: def.img
  };
  
  // Copy over any special abilities
  Object.keys(def).forEach(key => {
    if (!['attack', 'health', 'emoji', 'class', 'elements', 'img'].includes(key)) {
      unit[key] = def[key];
    }
  });
  
  return unit;
}

/**
 * Get the cost of a unit (currently flat rate for all units)
 */
export function getUnitCost(name) {
  return GAME_CONFIG.UNIT_BASE_COST;
}

/**
 * Attempt to fuse two units together
 * Returns the name of the fused unit if successful, null otherwise
 */
export function attemptFusion(unit1, unit2) {
  if (!unit1 || !unit2) return null;
  
  // Units must be of the same class to fuse
  if (unit1.class !== unit2.class) return null;
  
  const fusionKey = `${unit1.name}+${unit2.name}`;
  const reverseFusionKey = `${unit2.name}+${unit1.name}`;
  
  // Check if there's a predefined fusion
  let resultName = fusionMap[fusionKey] || fusionMap[reverseFusionKey];
  
  if (resultName) {
    return resultName;
  }
  
  // If no predefined fusion, create a default fusion
  resultName = `${unit1.name}-${unit2.name} Fusion`;
  
  // Create the fusion definition if it doesn't exist
  if (!unitDefinitions[resultName]) {
    createFusionDefinition(resultName, unit1.name, unit2.name);
  }
  
  return resultName;
}

/**
 * Get a random unit name from the base units (for shop generation)
 */
export function getRandomUnitName() {
  return baseUnitNames[Math.floor(Math.random() * baseUnitNames.length)];
}

/**
 * Generate shop inventory for a player
 */
export function generateShop() {
  const shop = [];
  for (let i = 0; i < GAME_CONFIG.SHOP_SIZE; i++) {
    shop.push(getRandomUnitName());
  }
  return shop;
}

/**
 * Refresh shop for a specific player
 */
export function refreshShopForPlayer(player) {
  player.shop = generateShop();
}

/**
 * Apply unit special abilities at battle start
 */
export function applyBattleStartAbilities(units, heroState = null) {
  units.forEach(unit => {
    // Apply start attack bonus
    if (unit.startAttackBonus) {
      unit.attack += unit.startAttackBonus;
    }
    
    // Heal hero
    if (unit.healHero && heroState) {
      heroState.heroHealth = Math.min(
        heroState.heroMaxHealth, 
        heroState.heroHealth + unit.healHero
      );
    }
    
    // Apply AOE damage (handled in battle logic)
    // Other abilities can be added here
  });
}

/**
 * Apply unit special abilities after battle
 */
export function applyAfterBattleAbilities(units) {
  units.forEach(unit => {
    // Apply after battle health bonus
    if (unit.afterBattleHealthBonus && unit.health > 0) {
      unit.health += unit.afterBattleHealthBonus;
      unit.maxHealth += unit.afterBattleHealthBonus;
    }
  });
}