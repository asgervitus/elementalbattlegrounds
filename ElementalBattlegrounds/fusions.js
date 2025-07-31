/**
 * Fusion System - Elemental Battlegrounds
 * Handles the new tier-based fusion mechanics
 */

import { NEW_UNIT_DEFINITIONS, FUSION_MAP, BASE_TIER1_UNITS } from './new_unit_system.js';
import { AbilitySystem } from './ability_system.js';

class FusionSystem {
  constructor() {
    this.abilitySystem = new AbilitySystem();
  }

  // Check if two units can fuse
  canFuse(unit1, unit2) {
    if (!unit1 || !unit2) return false;
    
    const unit1Def = NEW_UNIT_DEFINITIONS[unit1.name];
    const unit2Def = NEW_UNIT_DEFINITIONS[unit2.name];
    
    if (!unit1Def || !unit2Def) return false;
    
    // Check if fusion exists in the map
    const fusionKey = `${unit1.name}+${unit2.name}`;
    const reverseFusionKey = `${unit2.name}+${unit1.name}`;
    
    return FUSION_MAP[fusionKey] || FUSION_MAP[reverseFusionKey];
  }

  // Get the result of fusing two units
  getFusionResult(unit1, unit2) {
    if (!this.canFuse(unit1, unit2)) return null;
    
    const fusionKey = `${unit1.name}+${unit2.name}`;
    const reverseFusionKey = `${unit2.name}+${unit1.name}`;
    
    const resultName = FUSION_MAP[fusionKey] || FUSION_MAP[reverseFusionKey];
    return NEW_UNIT_DEFINITIONS[resultName];
  }

  // Perform fusion of two units
  performFusion(unit1, unit2, player) {
    const resultDef = this.getFusionResult(unit1, unit2);
    if (!resultDef) return null;
    
    // Create the fused unit
    const fusedUnit = {
      name: Object.keys(NEW_UNIT_DEFINITIONS).find(key => 
        NEW_UNIT_DEFINITIONS[key] === resultDef
      ),
      attack: resultDef.attack,
      health: resultDef.health,
      maxHealth: resultDef.health,
      emoji: resultDef.emoji,
      tier: resultDef.tier,
      elements: resultDef.elements || [],
      class: resultDef.class
    };
    
    // Initialize abilities
    this.abilitySystem.initializeUnitAbilities(fusedUnit, resultDef);
    
    // Apply battlecry if it exists
    if (resultDef.battlecry) {
      this.abilitySystem.applyBattlecry(fusedUnit, player, player.enemy);
    }
    
    return fusedUnit;
  }

  // Get all possible fusions for a unit
  getPossibleFusions(unit, player) {
    const possibleFusions = [];
    
    player.board.forEach(otherUnit => {
      if (otherUnit !== unit && this.canFuse(unit, otherUnit)) {
        const resultDef = this.getFusionResult(unit, otherUnit);
        if (resultDef) {
          possibleFusions.push({
            unit1: unit,
            unit2: otherUnit,
            result: resultDef
          });
        }
      }
    });
    
    return possibleFusions;
  }

  // Get all possible fusions on the board
  getAllPossibleFusions(player) {
    const allFusions = [];
    const processedPairs = new Set();
    
    player.board.forEach((unit1, index1) => {
      player.board.forEach((unit2, index2) => {
        if (index1 !== index2) {
          const pairKey = `${Math.min(index1, index2)}-${Math.max(index1, index2)}`;
          if (!processedPairs.has(pairKey) && this.canFuse(unit1, unit2)) {
            const resultDef = this.getFusionResult(unit1, unit2);
            if (resultDef) {
              allFusions.push({
                unit1: unit1,
                unit2: unit2,
                index1: index1,
                index2: index2,
                result: resultDef
              });
              processedPairs.add(pairKey);
            }
          }
        }
      });
    });
    
    return allFusions;
  }

  // Get shop units based on tier
  getShopUnits(tier) {
    const availableUnits = [];
    
    // Add base tier 1 units
    if (tier >= 1) {
      BASE_TIER1_UNITS.forEach(unitName => {
        const unitDef = NEW_UNIT_DEFINITIONS[unitName];
        if (unitDef && unitDef.tier === 1) {
          availableUnits.push(unitName);
        }
      });
    }
    
    // Add tier 2 units if tier >= 2
    if (tier >= 2) {
      Object.keys(NEW_UNIT_DEFINITIONS).forEach(unitName => {
        const unitDef = NEW_UNIT_DEFINITIONS[unitName];
        if (unitDef && unitDef.tier === 2) {
          availableUnits.push(unitName);
        }
      });
    }
    
    // Add tier 3 units if tier >= 3
    if (tier >= 3) {
      Object.keys(NEW_UNIT_DEFINITIONS).forEach(unitName => {
        const unitDef = NEW_UNIT_DEFINITIONS[unitName];
        if (unitDef && unitDef.tier === 3) {
          availableUnits.push(unitName);
        }
      });
    }
    
    // Add tier 4 units if tier >= 4 (very rare)
    if (tier >= 4) {
      Object.keys(NEW_UNIT_DEFINITIONS).forEach(unitName => {
        const unitDef = NEW_UNIT_DEFINITIONS[unitName];
        if (unitDef && unitDef.tier === 4) {
          availableUnits.push(unitName);
        }
      });
    }
    
    return availableUnits;
  }

  // Generate shop with new units
  generateShop(player, shopSize = 3) {
    const availableUnits = this.getShopUnits(player.tier || 1);
    const shop = [];
    
    for (let i = 0; i < shopSize; i++) {
      const randomUnitName = availableUnits[Math.floor(Math.random() * availableUnits.length)];
      const unitDef = NEW_UNIT_DEFINITIONS[randomUnitName];
      
      if (unitDef) {
        const shopUnit = {
          name: randomUnitName,
          attack: unitDef.attack,
          health: unitDef.health,
          maxHealth: unitDef.health,
          emoji: unitDef.emoji,
          tier: unitDef.tier,
          elements: unitDef.elements || [],
          class: unitDef.class,
          cost: this.getUnitCost(unitDef.tier)
        };
        
        // Initialize abilities
        this.abilitySystem.initializeUnitAbilities(shopUnit, unitDef);
        
        shop.push(shopUnit);
      }
    }
    
    return shop;
  }

  // Get unit cost based on tier
  getUnitCost(tier) {
    return Math.max(1, tier);
  }

  // Create a unit from name
  createUnit(unitName) {
    const unitDef = NEW_UNIT_DEFINITIONS[unitName];
    if (!unitDef) return null;
    
    const unit = {
      name: unitName,
      attack: unitDef.attack,
      health: unitDef.health,
      maxHealth: unitDef.health,
      emoji: unitDef.emoji,
      tier: unitDef.tier,
      elements: unitDef.elements || [],
      class: unitDef.class
    };
    
    // Initialize abilities
    this.abilitySystem.initializeUnitAbilities(unit, unitDef);
    
    return unit;
  }

  // Get unit description for display
  getUnitDescription(unit) {
    if (!unit.abilities) return '';
    
    const def = unit.abilities;
    let description = '';
    
    // Basic abilities
    if (def.taunt) description += 'Taunt. ';
    if (def.windfury) description += 'Windfury. ';
    if (def.stealth) description += 'Stealth. ';
    if (def.divineShield) description += 'Divine Shield. ';
    if (def.mech) description += 'Mech. ';
    if (def.spellImmune) description += 'Spell Immune. ';
    
    // Complex abilities
    if (def.startOfCombat) {
      description += `Start of Combat: ${this.getAbilityDescription(def.startOfCombat)}. `;
    }
    
    if (def.endOfCombat) {
      description += `End of Combat: ${this.getAbilityDescription(def.endOfCombat)}. `;
    }
    
    if (def.endOfTurn) {
      description += `End of Turn: ${this.getAbilityDescription(def.endOfTurn)}. `;
    }
    
    if (def.afterAttack) {
      description += `After Attack: ${this.getAbilityDescription(def.afterAttack)}. `;
    }
    
    if (def.afterAttackSurvive) {
      description += `After Attack (if survives): ${this.getAbilityDescription(def.afterAttackSurvive)}. `;
    }
    
    if (def.deathrattle) {
      description += `Deathrattle: ${this.getAbilityDescription(def.deathrattle)}. `;
    }
    
    if (def.battlecry) {
      description += `Battlecry: ${this.getAbilityDescription(def.battlecry)}. `;
    }
    
    if (def.afterPlayFireWater) {
      description += `After playing Fire/Water: ${this.getAbilityDescription(def.afterPlayFireWater)}. `;
    }
    
    if (def.afterPlayTech) {
      description += `After playing Tech: ${this.getAbilityDescription(def.afterPlayTech)}. `;
    }
    
    if (def.afterPlayMech) {
      description += `After playing Mech: ${this.getAbilityDescription(def.afterPlayMech)}. `;
    }
    
    if (def.afterSurviveTurn) {
      description += `After surviving a turn: ${this.getAbilityDescription(def.afterSurviveTurn)}. `;
    }
    
    // Passive abilities
    if (def.armor) description += 'Gains +1 Armor per round. ';
    if (def.missChance) description += `${Math.round(def.missChance * 100)}% chance to miss. `;
    if (def.burnEffect) description += `Burns for ${def.burnEffect} damage. `;
    if (def.adaptiveDefense) description += 'Adaptive defense. ';
    if (def.laughAtDamage) description += 'Laughs in the face of damage. ';
    if (def.passive) description += `Passive: ${this.getAbilityDescription(def.passive)}. `;
    
    return description.trim();
  }

  // Get ability description
  getAbilityDescription(ability) {
    switch (ability) {
      case 'pushEnemiesBack': return 'Push all enemies to the back';
      case 'deal3AndFreeze': return 'Deal 3 damage and freeze adjacent enemies';
      case 'deal2AndReduceAttack2': return 'Deal 2 damage and reduce enemy Attack by 2';
      case 'summon2/2Geyser': return 'Summon a 2/2 Geyser token';
      case 'deal5Split': return 'Deal 5 damage split among enemies';
      case 'setHighAttackTo0': return 'Set high Attack enemies to 0';
      case '+1/+1TwoRandom': return 'Give two random allies +1/+1';
      case '+2ArmorAdjacent': return 'Give adjacent allies +2 Armor';
      case 'stealthAll': return 'Give all allies Stealth';
      case '+1ArmorAdjacent': return 'Give adjacent allies +1 Armor';
      case 'deal1ToAll': return 'Deal 1 damage to all enemies';
      case 'shuffleEnemyPositions': return 'Shuffle enemy positions';
      case 'deal5ToAll': return 'Deal 5 damage to all enemies';
      case 'deal4AndReduceAttack1': return 'Deal 4 damage and reduce Attack by 1';
      case 'deal8ToAll': return 'Deal 8 damage to all enemies';
      case 'deal6Spread': return 'Deal 6 damage spread among enemies';
      case 'pullAndStun': return 'Pull enemies forward and stun them';
      case '+1/+1PerWater': return 'Give +1/+1 for each Water unit';
      case 'summonStormElementals': return 'Summon Storm Elementals for empty slots';
      case 'deal7Cone': return 'Deal 7 damage in a cone';
      case 'slow3For2Turns': return 'Slow enemies by 3 for 2 turns';
      case '+2Health+1Attack': return 'Give allies +2 Health and +1 Attack';
      case 'deal6ToAll': return 'Deal 6 damage to all enemies';
      case 'stunAll1Turn': return 'Stun all enemies for 1 turn';
      case 'trap1Turn': return 'Trap enemies for 1 turn';
      case 'blindEnemies': return 'Blind enemies (-4 accuracy)';
      case 'freezeDamaged': return 'Freeze all damaged enemies';
      case 'randomBuffAllies': return 'Randomly buff allies';
      case '+2/+2AllMechs': return 'Give all Mechs +2/+2';
      case 'doubleBattlecries': return 'Double all battlecries';
      case 'miss50Percent': return 'Enemies miss 50% of the time';
      case 'liftAndDamage3': return 'Lift enemies and deal 3 damage';
      case 'divideEnemies': return 'Divide enemies, reduce Health by 3';
      case 'poisonAll': return 'Poison all enemies';
      case 'removeTaunt': return 'Remove Taunt from enemies';
      case 'deal3RandomAndBurn': return 'Deal 3 damage to random enemy and burn';
      case 'deal5Adjacent': return 'Deal 5 damage to adjacent enemies';
      case 'heal2': return 'Heal 2 Health';
      case 'deal1ToAllEnemies': return 'Deal 1 damage to all enemies';
      case '+1/+1OtherMechs': return 'Give other Mechs +1/+1';
      case 'summon2/2SteamSprite': return 'Summon a 2/2 Steam Sprite';
      case 'dehydrate2': return 'Dehydrate enemies (-2 Health)';
      case 'spawnTwo1/1Droids': return 'Spawn two 1/1 Droids';
      case 'heal3': return 'Heal 3 Health';
      case 'heal4': return 'Heal 4 Health';
      case '+1Attack': return 'Gain +1 Attack';
      case '+1/+1': return 'Gain +1/+1';
      case 'refresh': return 'Refresh this unit';
      case '+2Attack': return 'Gain +2 Attack';
      case 'deal3ToTwoRandom': return 'Deal 3 damage to two random enemies';
      case '+2ArmorAdjacent': return 'Give adjacent allies +2 Armor';
      case 'summon3/5Golem': return 'Summon a 3/5 Golem with Taunt';
      case 'deal4ToAll': return 'Deal 4 damage to all enemies';
      case 'returnToHand': return 'Return this to your hand';
      case 'deal8Random': return 'Deal 8 damage to random enemy';
      case 'summonTwo1/1DustMites': return 'Summon two 1/1 Dust Mites';
      case '+3Armor': return 'Gain +3 Armor';
      case 'deal5Random': return 'Deal 5 damage to random enemy';
      case 'deal4Random': return 'Deal 4 damage to random enemy';
      case 'refund2Gold': return 'Refund 2 Gold';
      case 'drawCard': return 'Draw a card';
      case 'deal3Split': return 'Deal 3 damage split among enemies';
      case 'deal3Adjacent': return 'Deal 3 damage to adjacent enemies';
      case 'deal5ToAll': return 'Deal 5 damage to all enemies';
      case 'poisonAll': return 'Poison all enemies';
      case 'heal5': return 'Heal 5 Health';
      case 'healAll5': return 'Heal all allies for 5';
      case 'deal10Random': return 'Deal 10 damage to random enemy';
      case 'healAdjacent5': return 'Heal adjacent allies for 5';
      case 'healAll4': return 'Heal all allies for 4';
      case 'erodeArmor4': return 'Erode enemy Armor by 4';
      case 'poisonDamage3': return 'Poisoned enemies take 3 damage';
      case 'learnEnemyAbility': return 'Learn an enemy ability';
      case 'enemiesLose3Attack': return 'Enemies lose 3 Attack';
      case 'summon2/2Brick': return 'Summon a 2/2 Brick Token';
      case 'deal2ToAll': return 'Deal 2 damage to all enemies';
      case 'gain1Gold': return 'Gain 1 Gold';
      case 'discoverTechUnit': return 'Discover a random Tech unit';
      case 'enemiesLose1Attack': return 'Enemies lose 1 Attack';
      case 'damageOnMove': return 'Enemies take 2 damage when they move';
      case 'reduceRanged50': return 'Reduces ranged damage by 50%';
      case 'protectBackline': return 'Enemies cannot target your backline';
      case 'reducePhysical3': return 'Reduces physical damage by 3';
      case 'weakenWater3': return 'Weakens Water units (-3 Attack)';
      case 'copyRandomAbilities': return 'Copies allied abilities at random';
      default: return ability;
    }
  }

  // Get fusion preview for UI
  getFusionPreview(unit1, unit2) {
    const resultDef = this.getFusionResult(unit1, unit2);
    if (!resultDef) return null;
    
    return {
      name: Object.keys(NEW_UNIT_DEFINITIONS).find(key => 
        NEW_UNIT_DEFINITIONS[key] === resultDef
      ),
      attack: resultDef.attack,
      health: resultDef.health,
      emoji: resultDef.emoji,
      tier: resultDef.tier,
      description: this.getUnitDescription({ abilities: resultDef }),
      cost: this.getUnitCost(resultDef.tier)
    };
  }
}

// Export the fusion system
export { FusionSystem }; 