/**
 * Battle System - Battle simulation, damage calculation, and battle flow
 * Elemental Battlegrounds
 */

import { unitDefinitions } from './constants.js';
import { generateShop, getRandomUnitName, createUnit } from './unitsManager.js';

/**
 * Simulate a battle between two unit arrays.
 * Returns an object containing the surviving units, a battle log, and accumulated
 * healing effects to be applied to the hero after the fight. This function implements
 * various unit abilities such as startAttackBonus, healHero, aoeDamage, 
 * reduceIncomingAttack, burnEffect, gainAttackOnKill, afterBattleHealthBonus, 
 * reduceIncomingAttackAll, survivorDamageBonus, etc.
 */
export function simulateBattle(playerUnits, opponentUnits, playerAbility = null, opponentAbility = null) {
  const log = [];
  let playerHeal = 0;
  let opponentHeal = 0;
  
  // Deep copy the units so that battle does not modify originals
  const pUnits = playerUnits.map(u => ({ ...u }));
  const oUnits = opponentUnits.map(u => ({ ...u }));
  
  // Apply hero battle bonuses to both sides
  if (playerAbility && typeof playerAbility.battleStart === 'function') {
    playerAbility.battleStart(pUnits);
  }
  if (opponentAbility && typeof opponentAbility.battleStart === 'function') {
    opponentAbility.battleStart(oUnits);
  }
  
  // === Pre‑battle processing ===
  // Apply startAttackBonus and healHero to both sides. Also gather
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
 */
export function computeDamageFromUnits(units) {
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

/**
 * Generate an opponent board for the current round.
 * The strength scales with the round number.
 */
export function generateOpponent() {
  const round = arguments[0] || 1; // Accept round parameter or default to 1
  const opponent = [];
  
  // Scale opponent strength with round
  const baseUnits = Math.min(3 + Math.floor(round / 2), 6);
  const fusedUnits = Math.floor(round / 3);
  
  // Add base units
  for (let i = 0; i < baseUnits; i++) {
    const unitName = getRandomUnitName();
    const unit = createUnit(unitName);
    if (unit) {
      opponent.push(unit);
    }
  }
  
  // Add some fused units for higher rounds
  for (let i = 0; i < fusedUnits; i++) {
    const unitName = getRandomUnitName();
    const unit = createUnit(unitName);
    if (unit) {
      // Boost stats to simulate fusion
      unit.attack += round;
      unit.health += round;
      unit.maxHealth = unit.health;
      unit.name += ' Elite';
      opponent.push(unit);
    }
  }
  
  return opponent;
}

/**
 * Apply hero ability round start effects
 */
export function applyRoundStartAbilities(heroAbility, state) {
  if (heroAbility && typeof heroAbility.roundStart === 'function') {
    heroAbility.roundStart(state);
  }
}

/**
 * Process battle results and update game state
 */
export function processBattleResults(battleResult, playerState, opponentState = null) {
  const { playerSurvivors, opponentSurvivors, playerHeal, opponentHeal } = battleResult;
  
  // Update player board with survivors
  playerState.board = playerSurvivors;
  
  // Apply healing
  if (playerHeal > 0) {
    playerState.heroHealth = Math.min(
      playerState.heroMaxHealth, 
      playerState.heroHealth + playerHeal
    );
  }
  
  // Calculate damage to apply
  const playerDamage = computeDamageFromUnits(opponentSurvivors);
  const opponentDamage = computeDamageFromUnits(playerSurvivors);
  
  return {
    playerDamage,
    opponentDamage,
    playerHeal,
    opponentHeal
  };
}