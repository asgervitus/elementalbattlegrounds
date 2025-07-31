/**
 * Game Logic - Main game flow, player actions, and coordination between modules
 * Elemental Battlegrounds
 */

import { heroes, unitDefinitions } from './constants.js';
import { 
  state, 
  getCurrentPlayer, 
  createPlayer, 
  addPlayer, 
  addMessage, 
  updateBoardLimit,
  clearSelection,
  endTurn as gameStateEndTurn,
  checkGameEnd
} from './gameState.js';
import { 
  createUnit, 
  getUnitCost, 
  refreshShopForPlayer, 
  attemptFusion,
  initializeUnitImages,
  loadCustomUnits,
  loadCustomFusions
} from './unitsManager.js';
import { 
  simulateBattle, 
  generateOpponent, 
  computeDamageFromUnits,
  processBattleResults 
} from './battleSystem.js';
import { initAudioVolume, playSound, startBackgroundMusic } from './audioSystem.js';
import { 
  renderStartScreen, 
  renderGameScreen, 
  renderBattleScreen, 
  renderGameOver, 
  showFusionAnimation,
  renderMessage 
} from './uiRenderer.js';

/**
 * Select a hero and start the game
 */
export function selectHero(heroName) {
  const hero = heroes.find(h => h.name === heroName);
  if (!hero) return;
  
  // Initialize single player game
  state.players = [];
  state.playerCount = 1;
  state.numHumans = 1;
  state.round = 1;
  state.currentPlayerIndex = 0;
  state.isShopPhase = true;
  state.gameOver = false;
  state.messageLog = [];
  state.selectedIndices = [];
  
  // Create the human player
  const player = createPlayer(true, hero);
  addPlayer(player);
  
  // Generate initial shop
  refreshShopForPlayer(player);
  
  // Start background music
  startBackgroundMusic();
  
  addMessage(`${hero.name} selected! Your journey begins.`);
  renderGameScreen();
}

/**
 * Buy a unit from the shop
 */
export function buyUnit(index) {
  const player = getCurrentPlayer();
  if (!player || state.gameOver) return;
  
  const unitName = player.shop[index];
  const cost = getUnitCost(unitName);
  
  if (player.gold < cost) {
    addMessage('Not enough gold!');
    return;
  }
  
  if (player.board.length >= player.boardLimit) {
    addMessage('Board is full!');
    return;
  }
  
  // Purchase the unit
  player.gold -= cost;
  const unit = createUnit(unitName);
  if (unit) {
    player.board.push(unit);
    addMessage(`Bought ${unitName} for ${cost} gold.`);
    playSound('buy');
  }
  
  renderGameScreen();
}

/**
 * Handle clicking on a board slot
 */
export function handleBoardClick(index) {
  const player = getCurrentPlayer();
  if (!player || state.gameOver) return;
  
  if (state.selectedIndices.includes(index)) {
    // Deselect if already selected
    state.selectedIndices = state.selectedIndices.filter(i => i !== index);
  } else if (player.board[index]) {
    // Select the unit if it exists
    state.selectedIndices.push(index);
    
    // If we have two units selected, attempt fusion
    if (state.selectedIndices.length === 2) {
      attemptFusionFromSelection();
    }
  }
  
  renderGameScreen();
}

/**
 * Attempt to fuse two selected units
 */
function attemptFusionFromSelection() {
  const player = getCurrentPlayer();
  const [index1, index2] = state.selectedIndices;
  
  const unit1 = player.board[index1];
  const unit2 = player.board[index2];
  
  if (!unit1 || !unit2) {
    clearSelection();
    return;
  }
  
  const fusionResult = attemptFusion(unit1, unit2);
  
  if (fusionResult) {
    // Create the fused unit
    const fusedUnit = createUnit(fusionResult);
    
    if (fusedUnit) {
      // Remove the two original units and add the fused one
      const newBoard = [];
      for (let i = 0; i < player.board.length; i++) {
        if (i !== index1 && i !== index2) {
          newBoard.push(player.board[i]);
        }
      }
      newBoard.push(fusedUnit);
      player.board = newBoard;
      
      addMessage(`Fused ${unit1.name} + ${unit2.name} = ${fusionResult}!`);
      showFusionAnimation(fusedUnit.emoji);
    }
  } else {
    addMessage(`Cannot fuse ${unit1.name} and ${unit2.name} - they must be the same class.`);
  }
  
  clearSelection();
}

/**
 * Start the battle phase
 */
export function startBattlePhase() {
  if (state.playerCount > 1) {
    // Multiplayer battle logic would go here
    addMessage('Multiplayer battles not yet implemented in refactored version');
  } else {
    doBattle();
  }
}

/**
 * Execute a battle against AI opponent
 */
export function doBattle() {
  const player = getCurrentPlayer();
  if (!player || player.board.length === 0) {
    addMessage('You have no units to battle with.');
    return;
  }
  
  playSound('battle');
  
  // Generate an opponent board and simulate battle
  const opponent = generateOpponent(state.round);
  const result = simulateBattle(player.board, opponent, player.heroAbility, null);
  
  // Compute damage
  const pDamage = computeDamageFromUnits(result.playerSurvivors);
  const oDamage = computeDamageFromUnits(result.opponentSurvivors);
  const pHeal = result.playerHeal || 0;
  const oHeal = result.opponentHeal || 0;
  
  // Display the battle outcome
  renderBattleScreen([...player.board], opponent, result.log, pDamage, oDamage, pHeal, oHeal);
}

/**
 * Finish the battle and apply results
 */
export function finishBattle(pDamage, oDamage, pHeal = 0, oHeal = 0) {
  const player = getCurrentPlayer();
  
  // Apply damage to player
  player.heroHealth -= pDamage;
  if (player.heroHealth < 0) player.heroHealth = 0;
  
  // Apply healing to player
  if (pHeal > 0) {
    player.heroHealth = Math.min(player.heroMaxHealth, player.heroHealth + pHeal);
  }
  
  // Apply damage to opponent (in single player, this is just tracking)
  state.opponentHealth -= oDamage;
  if (state.opponentHealth < 0) state.opponentHealth = 0;
  
  // Check for game end
  if (player.heroHealth <= 0) {
    renderGameOver(false);
    return;
  }
  
  if (state.opponentHealth <= 0) {
    renderGameOver(true);
    return;
  }
  
  // Continue to next round
  finishRound();
}

/**
 * Finish the current round and advance the game
 */
function finishRound() {
  const player = getCurrentPlayer();
  
  // Advance round
  state.round++;
  
  // Apply hero round start abilities
  if (player.heroAbility && player.heroAbility.roundStart) {
    player.heroAbility.roundStart(player);
  }
  
  // Give gold for new round
  player.gold += 3;
  
  // Refresh shop
  refreshShopForPlayer(player);
  
  addMessage(`Round ${state.round} begins! You gain 3 gold.`);
  
  // Reset to shop phase
  state.isShopPhase = true;
  
  renderGameScreen();
}

/**
 * End the current player's turn
 */
export function endTurn() {
  gameStateEndTurn();
  
  if (state.isShopPhase) {
    // Still in shop phase, next player's turn
    addMessage(`Player ${state.currentPlayerIndex + 1}'s turn.`);
  } else {
    // All players done, start battle phase
    startBattlePhase();
  }
}

/**
 * Initialize the game
 */
export function initializeGame() {
  // Initialize audio
  initAudioVolume();
  
  // Initialize unit images
  initializeUnitImages();
  
  // Load custom content
  loadCustomUnits();
  loadCustomFusions();
  
  // Render start screen
  renderStartScreen();
}

// Export all the functions that need to be accessible globally
export const gameActions = {
  selectHero,
  buyUnit,
  handleBoardClick,
  startBattlePhase,
  doBattle,
  finishBattle,
  endTurn
};