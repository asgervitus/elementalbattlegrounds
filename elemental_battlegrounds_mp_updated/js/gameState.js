/**
 * Game State Management - Central game state and player management
 * Elemental Battlegrounds
 */

import { GAME_CONFIG } from './constants.js';

/**
 * Central game state.  Multiplayer is implemented by storing an array
 * of players.  Each entry represents a human or AI participant and
 * contains their relic choice, hero health, board, shop, available gold
 * and board limit.  The `currentPlayerIndex` tracks whose board is
 * currently visible during the shop phase.  The `isShopPhase` flag
 * toggles between purchasing and battling.
 */
export const state = {
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
  selectedIndices: [],
  // Number of human players participating.  Set during start screen.
  numHumans: 1,
  // Array of relics selected by human players before the game starts.
  selectedRelics: [],
  // Legacy single‑player values.  When only one player participates,
  // these fields are used to track hero and opponent health.  In
  // multiplayer these values are unused.
  heroHealth: GAME_CONFIG.INITIAL_HERO_HEALTH,
  heroMaxHealth: GAME_CONFIG.INITIAL_HERO_HEALTH,
  opponentHealth: GAME_CONFIG.INITIAL_HERO_HEALTH,
  opponentMaxHealth: GAME_CONFIG.INITIAL_HERO_HEALTH
};

/**
 * Get the currently active player
 */
export function getCurrentPlayer() {
  return state.players[state.currentPlayerIndex] || state.players[0];
}

/**
 * Initialize game state for a new game
 */
export function initializeGame(numPlayers = 1, numHumans = 1) {
  state.players = [];
  state.playerCount = numPlayers;
  state.numHumans = numHumans;
  state.round = 1;
  state.currentPlayerIndex = 0;
  state.isShopPhase = true;
  state.gameOver = false;
  state.messageLog = [];
  state.selectedIndices = [];
  state.selectedRelics = [];
}

/**
 * Create a new player object
 */
export function createPlayer(isHuman = true, heroData = null) {
  const player = {
    isHuman,
    heroName: heroData?.name || 'Unknown Hero',
    heroEmoji: heroData?.emoji || '❓',
    heroAbility: heroData?.ability || null,
    heroHealth: GAME_CONFIG.INITIAL_HERO_HEALTH,
    heroMaxHealth: GAME_CONFIG.INITIAL_HERO_HEALTH,
    gold: GAME_CONFIG.INITIAL_GOLD,
    board: [],
    shop: [],
    boardLimit: GAME_CONFIG.INITIAL_BOARD_LIMIT
  };
  
  return player;
}

/**
 * Add a player to the game
 */
export function addPlayer(player) {
  state.players.push(player);
}

/**
 * Switch to the next player (for multiplayer)
 */
export function nextPlayer() {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;
}

/**
 * Add a message to the game log
 */
export function addMessage(text) {
  state.messageLog.push(text);
  // Keep only the last 10 messages to prevent memory bloat
  if (state.messageLog.length > 10) {
    state.messageLog.shift();
  }
}

/**
 * Update board limit for a player based on Processor units
 */
export function updateBoardLimit(player) {
  if (!player) return;
  
  let bonus = 0;
  player.board.forEach(unit => {
    if (unit && unit.boardLimitBonus) {
      bonus += unit.boardLimitBonus;
    }
  });
  player.boardLimit = GAME_CONFIG.INITIAL_BOARD_LIMIT + bonus;
}

/**
 * Check if the game should end (only one player remaining with health > 0)
 */
export function checkGameEnd() {
  const alivePlayers = state.players.filter(p => p.heroHealth > 0);
  if (alivePlayers.length <= 1) {
    state.gameOver = true;
    return true;
  }
  return false;
}

/**
 * Get all alive players
 */
export function getAlivePlayers() {
  return state.players.filter(p => p.heroHealth > 0);
}

/**
 * Reset selected indices
 */
export function clearSelection() {
  state.selectedIndices = [];
}

/**
 * End the current turn and advance the game state
 */
export function endTurn() {
  if (state.numHumans > 1) {
    // Find next human player
    let nextIndex = (state.currentPlayerIndex + 1) % state.playerCount;
    let foundHuman = false;
    
    // Look for the next human player
    for (let i = 0; i < state.playerCount; i++) {
      const player = state.players[nextIndex];
      if (player.isHuman && player.heroHealth > 0) {
        state.currentPlayerIndex = nextIndex;
        foundHuman = true;
        break;
      }
      nextIndex = (nextIndex + 1) % state.playerCount;
    }
    
    // If no more human players, start battle phase
    if (!foundHuman) {
      state.isShopPhase = false;
    }
  } else {
    // Single player or all humans done - start battle
    state.isShopPhase = false;
  }
}