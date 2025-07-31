/**
 * Main Entry Point - Elemental Battlegrounds
 * This file initializes the game and exposes global functions for HTML event handlers
 */

import { initializeGame, gameActions } from './gameLogic.js';
import { uiHandlers } from './uiRenderer.js';
import { unitDefinitions } from './constants.js';

// Socket.io connection (keeping this global as in original)
const socket = io();

// Make functions globally available for HTML onclick handlers
// This is necessary because HTML onclick attributes need global function access
window.selectHero = gameActions.selectHero;
window.buyUnit = gameActions.buyUnit;
window.handleBoardClick = gameActions.handleBoardClick;
window.startBattlePhase = gameActions.startBattlePhase;
window.doBattle = gameActions.doBattle;
window.finishBattle = gameActions.finishBattle;
window.endTurn = gameActions.endTurn;

// UI functions
window.renderStartScreen = uiHandlers.renderStartScreen;
window.renderGameScreen = uiHandlers.renderGameScreen;
window.renderBattleScreen = uiHandlers.renderBattleScreen;
window.renderGameOver = uiHandlers.renderGameOver;
window.showFusionAnimation = uiHandlers.showFusionAnimation;

// Make unit definitions available globally (used in UI rendering)
window.unitDefinitions = unitDefinitions;

// Editor functions (simplified stubs for now - full implementation would be in separate module)
window.openEditor = () => {
  console.log('Card editor not yet implemented in refactored version');
};

window.openGameEditor = () => {
  console.log('Game editor not yet implemented in refactored version');
};

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  initializeGame();
});