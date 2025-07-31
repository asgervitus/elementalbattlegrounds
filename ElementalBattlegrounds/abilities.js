/**
 * Ability System - Elemental Battlegrounds
 * Handles all unit abilities and effects
 */

class AbilitySystem {
  constructor() {
    this.activeEffects = new Map();
    this.deathrattles = [];
    this.battlecries = [];
    this.startOfCombatEffects = [];
    this.endOfCombatEffects = [];
    this.endOfTurnEffects = [];
    this.afterAttackEffects = [];
    this.afterPlayEffects = [];
  }

  // Initialize abilities for a unit
  initializeUnitAbilities(unit, unitDef) {
    if (!unitDef) return;

    // Basic abilities
    if (unitDef.taunt) unit.taunt = true;
    if (unitDef.windfury) unit.windfury = true;
    if (unitDef.stealth) unit.stealth = true;
    if (unitDef.divineShield) unit.divineShield = true;
    if (unitDef.mech) unit.mech = true;
    if (unitDef.armor) unit.armor = 0; // Will gain +1 per round
    if (unitDef.spellImmune) unit.spellImmune = true;
    if (unitDef.missChance) unit.missChance = unitDef.missChance;
    if (unitDef.burnEffect) unit.burnEffect = unitDef.burnEffect;
    if (unitDef.adaptiveDefense) unit.adaptiveDefense = true;
    if (unitDef.laughAtDamage) unit.laughAtDamage = true;

    // Store ability definitions
    unit.abilities = unitDef;
  }

  // Apply start of combat abilities
  applyStartOfCombatAbilities(player, enemy) {
    const effects = [];
    
    player.board.forEach((unit, index) => {
      if (!unit.abilities) return;
      
      const def = unit.abilities;
      
      // Start of combat effects
      if (def.startOfCombat) {
        switch (def.startOfCombat) {
          case 'pushEnemiesBack':
            effects.push(() => this.pushEnemiesBack(enemy));
            break;
          case 'deal3AndFreeze':
            effects.push(() => this.deal3AndFreeze(enemy, index));
            break;
          case 'deal2AndReduceAttack2':
            effects.push(() => this.deal2AndReduceAttack2(enemy));
            break;
          case 'summon2/2Geyser':
            effects.push(() => this.summonToken(player, 'Geyser', 2, 2, index));
            break;
          case 'deal5Split':
            effects.push(() => this.deal5Split(enemy));
            break;
          case 'setHighAttackTo0':
            effects.push(() => this.setHighAttackTo0(enemy));
            break;
          case '+1/+1TwoRandom':
            effects.push(() => this.buffTwoRandom(player, 1, 1));
            break;
          case '+2ArmorAdjacent':
            effects.push(() => this.giveAdjacentArmor(player, index, 2));
            break;
          case 'stealthAll':
            effects.push(() => this.giveStealthToAll(player));
            break;
          case '+1ArmorAdjacent':
            effects.push(() => this.giveAdjacentArmor(player, index, 1));
            break;
          case 'deal1ToAll':
            effects.push(() => this.deal1ToAll(enemy));
            break;
          case 'shuffleEnemyPositions':
            effects.push(() => this.shuffleEnemyPositions(enemy));
            break;
          case 'deal5ToAll':
            effects.push(() => this.deal5ToAll(enemy));
            break;
          case 'deal4AndReduceAttack1':
            effects.push(() => this.deal4AndReduceAttack1(enemy));
            break;
          case 'deal8ToAll':
            effects.push(() => this.deal8ToAll(enemy));
            break;
          case 'deal6Spread':
            effects.push(() => this.deal6Spread(enemy));
            break;
          case 'pullAndStun':
            effects.push(() => this.pullAndStun(enemy));
            break;
            case '+1/+1PerWater':
            effects.push(() => this.buffPerWater(player));
            break;
          case 'summonStormElementals':
            effects.push(() => this.summonStormElementals(player));
            break;
          case 'deal7Cone':
            effects.push(() => this.deal7Cone(enemy, index));
            break;
          case 'slow3For2Turns':
            effects.push(() => this.slow3For2Turns(enemy));
            break;
          case '+2Health+1Attack':
            effects.push(() => this.buffAllAllies(player, 1, 2));
            break;
          case 'deal6ToAll':
            effects.push(() => this.deal6ToAll(enemy));
            break;
          case 'stunAll1Turn':
            effects.push(() => this.stunAll1Turn(enemy));
            break;
          case 'trap1Turn':
            effects.push(() => this.trap1Turn(enemy));
            break;
          case 'blindEnemies':
            effects.push(() => this.blindEnemies(enemy));
            break;
          case 'freezeDamaged':
            effects.push(() => this.freezeDamaged(enemy));
            break;
          case 'randomBuffAllies':
            effects.push(() => this.randomBuffAllies(player));
            break;
          case '+2/+2AllMechs':
            effects.push(() => this.buffAllMechs(player, 2, 2));
            break;
          case 'doubleBattlecries':
            effects.push(() => this.doubleBattlecries(player));
            break;
          case 'miss50Percent':
            effects.push(() => this.miss50Percent(enemy));
            break;
          case 'liftAndDamage3':
            effects.push(() => this.liftAndDamage3(enemy));
            break;
          case 'divideEnemies':
            effects.push(() => this.divideEnemies(enemy));
            break;
          case 'poisonAll':
            effects.push(() => this.poisonAll(enemy));
            break;
          case 'removeTaunt':
            effects.push(() => this.removeTaunt(enemy));
            break;
          case 'deal3RandomAndBurn':
            effects.push(() => this.deal3RandomAndBurn(enemy));
            break;
          case 'deal5Adjacent':
            effects.push(() => this.deal5Adjacent(enemy, index));
            break;
        }
      }

      // Mech synergies
      if (def.mech && def.startOfCombat === '+1/+1OtherMechs') {
        effects.push(() => this.buffOtherMechs(player, index, 1, 1));
      }

      // Tech synergies
      if (def.startOfCombat === 'gain1Gold') {
        effects.push(() => this.gain1Gold(player));
      }

      if (def.startOfCombat === 'discoverTechUnit') {
        effects.push(() => this.discoverTechUnit(player));
      }

      if (def.startOfCombat === 'enemiesLose1Attack') {
        effects.push(() => this.enemiesLose1Attack(enemy));
      }
    });

    // Execute all effects
    effects.forEach(effect => effect());
  }

  // Apply end of combat abilities
  applyEndOfCombatAbilities(player, enemy) {
    player.board.forEach((unit, index) => {
      if (!unit.abilities) return;
      
      const def = unit.abilities;
      
      if (def.endOfCombat) {
        switch (def.endOfCombat) {
          case '+2Armor':
            if (unit.health > 0) this.giveArmor(player, 2);
            break;
          case 'enemiesLose3Attack':
            this.enemiesLoseAttack(enemy, 3);
            break;
          case 'summon2/2Brick':
            this.summonToken(player, 'Brick', 2, 2, index);
            break;
          case 'deal3ToAll':
            this.deal3ToAll(enemy);
            break;
          case 'deal2ToAll':
            this.deal2ToAll(enemy);
            break;
          case 'healAdjacent5':
            this.healAdjacent(player, index, 5);
            break;
          case 'healAll5':
            this.healAll(player, 5);
            break;
          case 'healAll4':
            this.healAll(player, 4);
            break;
          case 'erodeArmor4':
            this.erodeArmor(enemy, 4);
            break;
          case 'poisonDamage3':
            this.poisonDamage(enemy, 3);
            break;
          case 'freezeDamaged':
            this.freezeDamaged(enemy);
            break;
          case 'learnEnemyAbility':
            this.learnEnemyAbility(player, enemy);
            break;
        }
      }
    });
  }

  // Apply end of turn abilities
  applyEndOfTurnAbilities(player) {
    player.board.forEach((unit, index) => {
      if (!unit.abilities) return;
      
      const def = unit.abilities;
      
      if (def.endOfTurn) {
        switch (def.endOfTurn) {
          case 'heal2':
            this.healUnit(unit, 2);
            break;
          case 'deal1ToAllEnemies':
            this.deal1ToAllEnemies(player.enemy);
            break;
          case '+1/+1OtherMechs':
            this.buffOtherMechs(player, index, 1, 1);
            break;
          case 'summon2/2SteamSprite':
            this.summonToken(player, 'Steam Sprite', 2, 2, index);
            break;
          case 'dehydrate2':
            this.dehydrateEnemies(player.enemy, 2);
            break;
          case 'spawnTwo1/1Droids':
            this.spawnTwoDroids(player, index);
            break;
          case 'heal3':
            this.healHero(player, 3);
            break;
          case 'heal4':
            this.healHero(player, 4);
            break;
        }
      }

      // Armor gain per round
      if (def.armor) {
        unit.armor = (unit.armor || 0) + 1;
      }
    });
  }

  // Apply after attack abilities
  applyAfterAttackAbilities(unit, player, enemy) {
    if (!unit.abilities) return;
    
    const def = unit.abilities;
    
    if (def.afterAttack) {
      switch (def.afterAttack) {
        case 'heal2':
          this.healHero(player, 2);
          break;
      }
    }

    if (def.afterAttackSurvive && unit.health > 0) {
      switch (def.afterAttackSurvive) {
        case '+1Attack':
          unit.attack += 1;
          break;
      }
    }
  }

  // Apply after play abilities
  applyAfterPlayAbilities(unit, player) {
    if (!unit.abilities) return;
    
    const def = unit.abilities;
    
    if (def.afterPlayFireWater) {
      switch (def.afterPlayFireWater) {
        case '+1/+1':
          unit.attack += 1;
          unit.health += 1;
          break;
      }
    }

    if (def.afterPlayTech) {
      switch (def.afterPlayTech) {
        case 'refresh':
          // Refresh shop logic would go here
          break;
      }
    }

    if (def.afterPlayMech) {
      switch (def.afterPlayMech) {
        case '+2Attack':
          unit.attack += 2;
          break;
      }
    }
  }

  // Apply deathrattle abilities
  applyDeathrattle(unit, player, enemy) {
    if (!unit.abilities) return;
    
    const def = unit.abilities;
    
    if (def.deathrattle) {
      switch (def.deathrattle) {
        case 'deal3ToTwoRandom':
          this.deal3ToTwoRandom(enemy);
          break;
        case '+2ArmorAdjacent':
          this.giveAdjacentArmor(player, player.board.indexOf(unit), 2);
          break;
        case 'summon3/5Golem':
          this.summonToken(player, 'Golem', 3, 5, player.board.indexOf(unit));
          break;
        case 'deal4ToAll':
          this.deal4ToAll(enemy);
          break;
        case 'returnToHand':
          this.returnToHand(player, unit);
          break;
        case 'deal8Random':
          this.deal8Random(enemy);
          break;
        case 'summonTwo1/1DustMites':
          this.summonTwoTokens(player, 'Dust Mite', 1, 1, player.board.indexOf(unit));
          break;
        case '+3Armor':
          this.giveArmor(player, 3);
          break;
        case 'deal5Random':
          this.deal5Random(enemy);
          break;
        case 'deal4Random':
          this.deal4Random(enemy);
          break;
        case 'refund2Gold':
          this.refundGold(player, 2);
          break;
        case 'drawCard':
          this.drawCard(player);
          break;
        case 'deal3Split':
          this.deal3Split(enemy);
          break;
        case 'deal3Adjacent':
          this.deal3Adjacent(enemy, player.board.indexOf(unit));
          break;
        case 'deal5ToAll':
          this.deal5ToAll(enemy);
          break;
        case 'poisonAll':
          this.poisonAll(enemy);
          break;
      }
    }
  }

  // Apply battlecry abilities
  applyBattlecry(unit, player, enemy) {
    if (!unit.abilities) return;
    
    const def = unit.abilities;
    
    if (def.battlecry) {
      switch (def.battlecry) {
        case 'heal5':
          this.healHero(player, 5);
          break;
        case 'healAll5':
          this.healAll(player, 5);
          break;
        case 'deal10Random':
          this.deal10Random(enemy);
          break;
      }
    }
  }

  // Helper methods for specific abilities
  pushEnemiesBack(enemy) {
    // Implementation for pushing enemies back
    console.log('Pushing enemies back');
  }

  deal3AndFreeze(enemy, index) {
    // Deal 3 damage and freeze adjacent enemies
    console.log('Dealing 3 damage and freezing adjacent enemies');
  }

  summonToken(player, tokenName, attack, health, position) {
    // Summon a token unit
    const token = {
      name: tokenName,
      attack: attack,
      health: health,
      emoji: '🪙',
      tier: 1
    };
    
    if (position < player.board.length) {
      player.board.splice(position, 0, token);
    } else {
      player.board.push(token);
    }
  }

  buffTwoRandom(player, attackBonus, healthBonus) {
    // Buff two random allies
    const aliveUnits = player.board.filter(unit => unit.health > 0);
    if (aliveUnits.length >= 2) {
      const shuffled = [...aliveUnits].sort(() => 0.5 - Math.random());
      shuffled.slice(0, 2).forEach(unit => {
        unit.attack += attackBonus;
        unit.health += healthBonus;
      });
    }
  }

  giveAdjacentArmor(player, index, armorAmount) {
    // Give armor to adjacent allies
    const adjacent = [index - 1, index + 1].filter(i => i >= 0 && i < player.board.length);
    adjacent.forEach(i => {
      if (player.board[i] && player.board[i].health > 0) {
        player.board[i].armor = (player.board[i].armor || 0) + armorAmount;
      }
    });
  }

  giveStealthToAll(player) {
    // Give stealth to all friendly units
    player.board.forEach(unit => {
      if (unit.health > 0) {
        unit.stealth = true;
      }
    });
  }

  deal1ToAll(enemy) {
    // Deal 1 damage to all enemies
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health -= 1;
      }
    });
  }

  shuffleEnemyPositions(enemy) {
    // Shuffle enemy positions
    for (let i = enemy.board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [enemy.board[i], enemy.board[j]] = [enemy.board[j], enemy.board[i]];
    }
  }

  deal5ToAll(enemy) {
    // Deal 5 damage to all enemies
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health -= 5;
      }
    });
  }

  deal4AndReduceAttack1(enemy) {
    // Deal 4 damage and reduce attack by 1
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health -= 4;
        unit.attack = Math.max(0, unit.attack - 1);
      }
    });
  }

  deal8ToAll(enemy) {
    // Deal 8 damage to all enemies
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health -= 8;
      }
    });
  }

  deal6Spread(enemy) {
    // Deal 6 damage spread among enemies
    const aliveEnemies = enemy.board.filter(unit => unit.health > 0);
    if (aliveEnemies.length > 0) {
      for (let i = 0; i < 6; i++) {
        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        target.health -= 1;
        if (target.health <= 0) {
          aliveEnemies.splice(aliveEnemies.indexOf(target), 1);
        }
      }
    }
  }

  pullAndStun(enemy) {
    // Pull enemy units forward and stun them
    console.log('Pulling and stunning enemies');
  }

  buffPerWater(player) {
    // Buff all units for each Water unit
    const waterUnits = player.board.filter(unit => 
      unit.abilities && unit.abilities.elements && 
      unit.abilities.elements.includes('Water')
    ).length;
    
    player.board.forEach(unit => {
      if (unit.health > 0) {
        unit.attack += waterUnits;
        unit.health += waterUnits;
      }
    });
  }

  summonStormElementals(player) {
    // Summon storm elementals for each empty slot
    const emptySlots = 7 - player.board.length;
    for (let i = 0; i < emptySlots; i++) {
      this.summonToken(player, 'Storm Elemental', 1, 1, player.board.length);
    }
  }

  deal7Cone(enemy, index) {
    // Deal 7 damage in a cone
    console.log('Dealing 7 damage in cone');
  }

  slow3For2Turns(enemy) {
    // Slow enemies by 3 for 2 turns
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.slow = 3;
        unit.slowTurns = 2;
      }
    });
  }

  buffAllAllies(player, attackBonus, healthBonus) {
    // Buff all allies
    player.board.forEach(unit => {
      if (unit.health > 0) {
        unit.attack += attackBonus;
        unit.health += healthBonus;
      }
    });
  }

  stunAll1Turn(enemy) {
    // Stun all enemies for 1 turn
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.stunned = true;
        unit.stunTurns = 1;
      }
    });
  }

  trap1Turn(enemy) {
    // Trap enemies for 1 turn
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.trapped = true;
        unit.trapTurns = 1;
      }
    });
  }

  blindEnemies(enemy) {
    // Blind enemies (-4 accuracy)
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.accuracy = Math.max(0, (unit.accuracy || 100) - 40);
      }
    });
  }

  freezeDamaged(enemy) {
    // Freeze all damaged enemies
    enemy.board.forEach(unit => {
      if (unit.health > 0 && unit.health < unit.maxHealth) {
        unit.frozen = true;
      }
    });
  }

  randomBuffAllies(player) {
    // Randomly buff allies
    player.board.forEach(unit => {
      if (unit.health > 0) {
        const buffs = [
          () => { unit.attack += 2; },
          () => { unit.health += 2; },
          () => { unit.attack += 1; unit.health += 1; },
          () => { unit.armor = (unit.armor || 0) + 2; }
        ];
        const randomBuff = buffs[Math.floor(Math.random() * buffs.length)];
        randomBuff();
      }
    });
  }

  buffAllMechs(player, attackBonus, healthBonus) {
    // Buff all mechs
    player.board.forEach(unit => {
      if (unit.health > 0 && unit.mech) {
        unit.attack += attackBonus;
        unit.health += healthBonus;
      }
    });
  }

  doubleBattlecries(player) {
    // Double battlecries
    console.log('Doubling battlecries');
  }

  miss50Percent(enemy) {
    // Enemies miss 50% of the time
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.missChance = 0.5;
      }
    });
  }

  liftAndDamage3(enemy) {
    // Lift enemies and deal 3 damage
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health -= 3;
      }
    });
  }

  divideEnemies(enemy) {
    // Divide enemies, reducing health by 3
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health = Math.max(1, unit.health - 3);
      }
    });
  }

  poisonAll(enemy) {
    // Poison all enemies
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.poisoned = true;
      }
    });
  }

  removeTaunt(enemy) {
    // Remove taunt from enemies
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.taunt = false;
      }
    });
  }

  deal3RandomAndBurn(enemy) {
    // Deal 3 damage to random enemy and apply burn
    const aliveEnemies = enemy.board.filter(unit => unit.health > 0);
    if (aliveEnemies.length > 0) {
      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      target.health -= 3;
      target.burning = true;
    }
  }

  deal5Adjacent(enemy, index) {
    // Deal 5 damage to adjacent enemies
    const adjacent = [index - 1, index + 1].filter(i => i >= 0 && i < enemy.board.length);
    adjacent.forEach(i => {
      if (enemy.board[i] && enemy.board[i].health > 0) {
        enemy.board[i].health -= 5;
      }
    });
  }

  poisonDamage(enemy, damage) {
    // Poisoned enemies take damage per turn
    enemy.board.forEach(unit => {
      if (unit.health > 0 && unit.poisoned) {
        unit.health -= damage;
      }
    });
  }

  learnEnemyAbility(player, enemy) {
    // Learn an enemy ability
    console.log('Learning enemy ability');
  }

  healUnit(unit, amount) {
    // Heal a unit
    unit.health = Math.min(unit.maxHealth || unit.health, unit.health + amount);
  }

  deal1ToAllEnemies(enemy) {
    // Deal 1 damage to all enemies
    this.deal1ToAll(enemy);
  }

  buffOtherMechs(player, excludeIndex, attackBonus, healthBonus) {
    // Buff other mechs
    player.board.forEach((unit, index) => {
      if (index !== excludeIndex && unit.health > 0 && unit.mech) {
        unit.attack += attackBonus;
        unit.health += healthBonus;
      }
    });
  }

  summonTwoTokens(player, tokenName, attack, health, position) {
    // Summon two tokens
    this.summonToken(player, tokenName, attack, health, position);
    this.summonToken(player, tokenName, attack, health, position + 1);
  }

  spawnTwoDroids(player, position) {
    // Spawn two 1/1 droids
    this.summonTwoTokens(player, 'Droid', 1, 1, position);
  }

  dehydrateEnemies(enemy, amount) {
    // Dehydrate enemies
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health -= amount;
      }
    });
  }

  healHero(player, amount) {
    // Heal the hero
    player.health = Math.min(player.maxHealth || 30, player.health + amount);
  }

  deal3ToTwoRandom(enemy) {
    // Deal 3 damage to two random enemies
    const aliveEnemies = enemy.board.filter(unit => unit.health > 0);
    if (aliveEnemies.length >= 2) {
      const shuffled = [...aliveEnemies].sort(() => 0.5 - Math.random());
      shuffled.slice(0, 2).forEach(unit => {
        unit.health -= 3;
      });
    }
  }

  deal4ToAll(enemy) {
    // Deal 4 damage to all enemies
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health -= 4;
      }
    });
  }

  returnToHand(player, unit) {
    // Return unit to hand
    console.log('Returning unit to hand');
  }

  deal8Random(enemy) {
    // Deal 8 damage to random enemy
    const aliveEnemies = enemy.board.filter(unit => unit.health > 0);
    if (aliveEnemies.length > 0) {
      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      target.health -= 8;
    }
  }

  deal5Random(enemy) {
    // Deal 5 damage to random enemy
    const aliveEnemies = enemy.board.filter(unit => unit.health > 0);
    if (aliveEnemies.length > 0) {
      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      target.health -= 5;
    }
  }

  deal4Random(enemy) {
    // Deal 4 damage to random enemy
    const aliveEnemies = enemy.board.filter(unit => unit.health > 0);
    if (aliveEnemies.length > 0) {
      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      target.health -= 4;
    }
  }

  refundGold(player, amount) {
    // Refund gold
    player.gold += amount;
  }

  drawCard(player) {
    // Draw a card
    console.log('Drawing a card');
  }

  deal3Split(enemy) {
    // Deal 3 damage split among enemies
    const aliveEnemies = enemy.board.filter(unit => unit.health > 0);
    if (aliveEnemies.length > 0) {
      for (let i = 0; i < 3; i++) {
        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        target.health -= 1;
        if (target.health <= 0) {
          aliveEnemies.splice(aliveEnemies.indexOf(target), 1);
        }
      }
    }
  }

  deal3Adjacent(enemy, position) {
    // Deal 3 damage to adjacent enemies
    const adjacent = [position - 1, position + 1].filter(i => i >= 0 && i < enemy.board.length);
    adjacent.forEach(i => {
      if (enemy.board[i] && enemy.board[i].health > 0) {
        enemy.board[i].health -= 3;
      }
    });
  }

  deal10Random(enemy) {
    // Deal 10 damage to random enemy
    const aliveEnemies = enemy.board.filter(unit => unit.health > 0);
    if (aliveEnemies.length > 0) {
      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      target.health -= 10;
    }
  }

  healAll(player, amount) {
    // Heal all allies
    player.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health = Math.min(unit.maxHealth || unit.health, unit.health + amount);
      }
    });
  }

  healAdjacent(player, position, amount) {
    // Heal adjacent allies
    const adjacent = [position - 1, position + 1].filter(i => i >= 0 && i < player.board.length);
    adjacent.forEach(i => {
      if (player.board[i] && player.board[i].health > 0) {
        player.board[i].health = Math.min(
          player.board[i].maxHealth || player.board[i].health, 
          player.board[i].health + amount
        );
      }
    });
  }

  erodeArmor(enemy, amount) {
    // Erode enemy armor
    enemy.board.forEach(unit => {
      if (unit.health > 0 && unit.armor) {
        unit.armor = Math.max(0, unit.armor - amount);
      }
    });
  }

  giveArmor(player, amount) {
    // Give armor to player
    player.armor = (player.armor || 0) + amount;
  }

  enemiesLoseAttack(enemy, amount) {
    // Enemies lose attack
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.attack = Math.max(0, unit.attack - amount);
      }
    });
  }

  enemiesLose1Attack(enemy) {
    // Enemies lose 1 attack
    this.enemiesLoseAttack(enemy, 1);
  }

  gain1Gold(player) {
    // Gain 1 gold
    player.gold += 1;
  }

  discoverTechUnit(player) {
    // Discover a random tech unit
    console.log('Discovering tech unit');
  }

  deal2ToAll(enemy) {
    // Deal 2 damage to all enemies
    enemy.board.forEach(unit => {
      if (unit.health > 0) {
        unit.health -= 2;
      }
    });
  }
}

// Export the ability system
export { AbilitySystem }; 