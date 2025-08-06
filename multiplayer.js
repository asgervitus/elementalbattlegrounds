class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.roomId = null;
        this.playerId = null;
        this.playerName = null;
        this.opponent = null;
        this.isHost = false;
        this.gameMode = 'singleplayer'; // 'singleplayer', 'multiplayer'
        this.connectionState = 'disconnected'; // 'disconnected', 'connecting', 'connected'
        this.matchState = 'waiting'; // 'waiting', 'preparation', 'battle', 'finished'
        
        this.initializeMultiplayer();
    }
    
    initializeMultiplayer() {
        // Add multiplayer UI elements
        this.addMultiplayerUI();
        this.setupEventListeners();
    }
    
    addMultiplayerUI() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.addMultiplayerUI());
            return;
        }

        // Add multiplayer button to main menu
        const mainMenu = document.querySelector('.menu-buttons');
        if (mainMenu && !document.getElementById('multiplayer-btn')) {
            const multiplayerBtn = document.createElement('button');
            multiplayerBtn.id = 'multiplayer-btn';
            multiplayerBtn.className = 'menu-btn';
            multiplayerBtn.innerHTML = '<i class="fas fa-globe"></i> 🌐 Play Online';
            mainMenu.insertBefore(multiplayerBtn, mainMenu.children[1]);
        }
        
        // Add multiplayer modal
        if (!document.getElementById('multiplayer-modal')) {
            const modal = document.createElement('div');
            modal.id = 'multiplayer-modal';
            modal.className = 'modal hidden';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🌐 Online Multiplayer</h2>
                        <button id="close-multiplayer" class="close-btn">✕</button>
                    </div>
                    <div class="multiplayer-content">
                        <div id="connection-status" class="connection-status">
                            <div class="status-indicator disconnected"></div>
                            <span>Disconnected</span>
                        </div>
                        
                        <div id="player-setup" class="player-setup">
                            <h3>Enter Your Name</h3>
                            <input type="text" id="player-name-input" placeholder="Your battle name..." maxlength="20">
                            <button id="connect-btn" class="primary-btn">Connect to Server</button>
                        </div>
                        
                        <div id="matchmaking" class="matchmaking hidden">
                            <h3>Choose Game Mode</h3>
                            <div class="game-modes">
                                <button id="quick-match-btn" class="mode-btn">
                                    ⚡ Quick Match
                                    <span>Find random opponent</span>
                                </button>
                                <button id="create-room-btn" class="mode-btn">
                                    🏠 Create Room
                                    <span>Play with friends</span>
                                </button>
                                <button id="join-room-btn" class="mode-btn">
                                    🚪 Join Room
                                    <span>Enter room code</span>
                                </button>
                            </div>
                        </div>
                        
                        <div id="room-creation" class="room-section hidden">
                            <h3>Create Private Room</h3>
                            <div class="room-settings">
                                <label>
                                    <input type="checkbox" id="ranked-match"> Ranked Match
                                </label>
                                <label>
                                    Turn Timer: <select id="turn-timer">
                                        <option value="60">60 seconds</option>
                                        <option value="90" selected>90 seconds</option>
                                        <option value="120">2 minutes</option>
                                        <option value="0">No timer</option>
                                    </select>
                                </label>
                            </div>
                            <button id="create-room-confirm" class="primary-btn">Create Room</button>
                        </div>
                        
                        <div id="room-joining" class="room-section hidden">
                            <h3>Join Private Room</h3>
                            <input type="text" id="room-code-input" placeholder="Enter room code..." maxlength="8">
                            <button id="join-room-confirm" class="primary-btn">Join Room</button>
                        </div>
                        
                        <div id="waiting-room" class="waiting-room hidden">
                            <h3>Waiting Room</h3>
                            <div class="room-info">
                                <div>Room Code: <span id="room-code-display"></span></div>
                                <div>Players: <span id="player-count">1</span>/2</div>
                            </div>
                            <div class="players-list">
                                <div class="player-slot">
                                    <div class="player-avatar">👤</div>
                                    <div class="player-info">
                                        <div class="player-name" id="player1-name">You</div>
                                        <div class="player-status ready">Ready</div>
                                    </div>
                                </div>
                                <div class="player-slot">
                                    <div class="player-avatar">❓</div>
                                    <div class="player-info">
                                        <div class="player-name">Waiting for opponent...</div>
                                        <div class="player-status waiting">Waiting</div>
                                    </div>
                                </div>
                            </div>
                            <button id="start-match-btn" class="primary-btn" disabled>Start Match</button>
                            <button id="leave-room-btn" class="secondary-btn">Leave Room</button>
                        </div>
                        
                        <div id="match-status" class="match-status hidden">
                            <h3>Match in Progress</h3>
                            <div class="match-info">
                                <div class="opponent-info">
                                    <div class="opponent-avatar">👤</div>
                                    <div class="opponent-name" id="opponent-name">Opponent</div>
                                    <div class="opponent-status" id="opponent-status">Preparing...</div>
                                </div>
                                <div class="turn-timer">
                                    <div class="timer-circle">
                                        <span id="timer-display">90</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }
    
    setupEventListeners() {
        // Multiplayer button
        document.getElementById('multiplayer-btn')?.addEventListener('click', () => {
            this.showMultiplayerModal();
        });
        
        // Close modal
        document.getElementById('close-multiplayer')?.addEventListener('click', () => {
            this.hideMultiplayerModal();
        });
        
        // Connection
        document.getElementById('connect-btn')?.addEventListener('click', () => {
            this.connectToServer();
        });
        
        // Game modes
        document.getElementById('quick-match-btn')?.addEventListener('click', () => {
            this.startQuickMatch();
        });
        
        document.getElementById('create-room-btn')?.addEventListener('click', () => {
            this.showCreateRoom();
        });
        
        document.getElementById('join-room-btn')?.addEventListener('click', () => {
            this.showJoinRoom();
        });
        
        // Room management
        document.getElementById('create-room-confirm')?.addEventListener('click', () => {
            this.createRoom();
        });
        
        document.getElementById('join-room-confirm')?.addEventListener('click', () => {
            this.joinRoom();
        });
        
        document.getElementById('start-match-btn')?.addEventListener('click', () => {
            this.startMatch();
        });
        
        document.getElementById('leave-room-btn')?.addEventListener('click', () => {
            this.leaveRoom();
        });
    }
    
    showMultiplayerModal() {
        document.getElementById('multiplayer-modal').classList.remove('hidden');
        this.game.playSound('click');
    }
    
    hideMultiplayerModal() {
        document.getElementById('multiplayer-modal').classList.add('hidden');
        this.game.playSound('click');
    }
    
    connectToServer() {
        const nameInput = document.getElementById('player-name-input');
        const playerName = nameInput.value.trim();
        
        if (!playerName) {
            this.game.showNotification('Please enter your name!', 'error');
            return;
        }
        
        this.playerName = playerName;
        this.connectionState = 'connecting';
        this.updateConnectionStatus();
        
        // Connect to WebSocket server (we'll implement this)
        this.initializeWebSocket();
    }
    
    initializeWebSocket() {
        this.connectionState = 'connecting';
        this.updateConnectionStatus();

        try {
            // Try to connect to local server first, fallback to demo mode
            const wsUrl = window.location.protocol === 'https:'
                ? 'wss://your-server.herokuapp.com/ws'  // Production server
                : 'ws://localhost:3000/ws';              // Local development

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                this.connectionState = 'connected';
                this.updateConnectionStatus();
                this.showMatchmaking();
                this.game.showNotification('Connected to server!', 'success');

                // Set player name
                this.sendMessage('setPlayerName', { name: this.playerName });
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleServerMessage(message);
                } catch (error) {
                    console.error('Error parsing server message:', error);
                }
            };

            this.socket.onclose = () => {
                this.connectionState = 'disconnected';
                this.updateConnectionStatus();
                this.game.showNotification('Disconnected from server', 'error');
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.connectionState = 'disconnected';
                this.updateConnectionStatus();

                // Fallback to demo mode
                this.startDemoMode();
            };

        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.startDemoMode();
        }
    }

    startDemoMode() {
        // Demo mode for when server is not available
        setTimeout(() => {
            this.connectionState = 'connected';
            this.updateConnectionStatus();
            this.showMatchmaking();
            this.game.showNotification('Demo mode - simulated multiplayer', 'info');
        }, 1000);
    }

    handleServerMessage(message) {
        switch (message.type) {
            case 'connected':
                this.playerId = message.data.playerId;
                break;
            case 'matchFound':
                this.handleMatchFound(message.data);
                break;
            case 'roomCreated':
                this.handleRoomCreated(message.data);
                break;
            case 'roomJoined':
                this.handleRoomJoined(message.data);
                break;
            case 'playerJoined':
                this.handlePlayerJoined(message.data);
                break;
            case 'playerLeft':
                this.handlePlayerLeft(message.data);
                break;
            case 'battleStart':
                this.handleBattleStart(message.data);
                break;
            case 'opponentGameState':
                this.handleOpponentGameState(message.data);
                break;
            case 'opponentAction':
                this.handleOpponentAction(message.data);
                break;
        }
    }

    handleMatchFound(data) {
        this.roomId = data.roomId;
        this.opponent = data.opponent;
        this.isHost = data.isHost;

        this.foundMatch(data.opponent.name);
    }

    handleRoomCreated(data) {
        this.roomId = data.roomId;
        this.isHost = data.isHost;
        this.showWaitingRoom();
    }

    handleRoomJoined(data) {
        this.roomId = data.roomId;
        this.isHost = data.isHost;
        this.showWaitingRoom();
    }

    handleBattleStart(data) {
        this.game.startPvPBattle(data.opponentArmy, data.opponentName);
    }
    
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('span');
        
        indicator.className = `status-indicator ${this.connectionState}`;
        
        switch (this.connectionState) {
            case 'disconnected':
                text.textContent = 'Disconnected';
                break;
            case 'connecting':
                text.textContent = 'Connecting...';
                break;
            case 'connected':
                text.textContent = 'Connected';
                break;
        }
    }
    
    showMatchmaking() {
        document.getElementById('player-setup').classList.add('hidden');
        document.getElementById('matchmaking').classList.remove('hidden');
    }
    
    startQuickMatch() {
        this.game.showNotification('Searching for opponent...', 'info');
        // Simulate matchmaking
        setTimeout(() => {
            this.foundMatch('RandomPlayer123');
        }, 2000);
    }
    
    showCreateRoom() {
        document.getElementById('matchmaking').classList.add('hidden');
        document.getElementById('room-creation').classList.remove('hidden');
    }
    
    showJoinRoom() {
        document.getElementById('matchmaking').classList.add('hidden');
        document.getElementById('room-joining').classList.remove('hidden');
    }
    
    createRoom() {
        const isRanked = document.getElementById('ranked-match').checked;
        const turnTimer = document.getElementById('turn-timer').value;
        
        // Generate room code
        this.roomId = this.generateRoomCode();
        this.isHost = true;
        
        this.showWaitingRoom();
        this.game.showNotification(`Room created: ${this.roomId}`, 'success');
    }
    
    joinRoom() {
        const roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
        
        if (!roomCode) {
            this.game.showNotification('Please enter a room code!', 'error');
            return;
        }
        
        this.roomId = roomCode;
        this.isHost = false;
        
        // Simulate joining room
        setTimeout(() => {
            this.showWaitingRoom();
            this.foundMatch('RoomHost456');
        }, 1000);
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    showWaitingRoom() {
        document.getElementById('room-creation').classList.add('hidden');
        document.getElementById('room-joining').classList.add('hidden');
        document.getElementById('waiting-room').classList.remove('hidden');
        
        if (this.roomId) {
            document.getElementById('room-code-display').textContent = this.roomId;
        }
    }
    
    foundMatch(opponentName) {
        this.opponent = { name: opponentName };
        
        // Update waiting room
        const player2Slot = document.querySelector('.player-slot:last-child');
        player2Slot.querySelector('.player-avatar').textContent = '👤';
        player2Slot.querySelector('.player-name').textContent = opponentName;
        player2Slot.querySelector('.player-status').textContent = 'Ready';
        player2Slot.querySelector('.player-status').className = 'player-status ready';
        
        document.getElementById('player-count').textContent = '2';
        document.getElementById('start-match-btn').disabled = false;
        
        this.game.showNotification(`Opponent found: ${opponentName}!`, 'success');
    }
    
    startMatch() {
        this.matchState = 'preparation';
        this.gameMode = 'multiplayer';
        
        // Hide multiplayer modal and start game
        this.hideMultiplayerModal();
        this.game.startMultiplayerGame();
        
        // Show match status
        this.showMatchStatus();
    }
    
    showMatchStatus() {
        // Add match status overlay to game interface
        if (!document.getElementById('match-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'match-overlay';
            overlay.className = 'match-overlay';
            overlay.innerHTML = `
                <div class="match-info">
                    <div class="opponent-info">
                        <div class="opponent-avatar">👤</div>
                        <div class="opponent-details">
                            <div class="opponent-name">${this.opponent.name}</div>
                            <div class="opponent-status">Preparing...</div>
                        </div>
                    </div>
                    <div class="match-timer">
                        <div class="timer-circle">
                            <span id="match-timer-display">90</span>
                        </div>
                    </div>
                    <div class="match-phase">
                        <span id="match-phase-text">Preparation Phase</span>
                    </div>
                </div>
            `;
            document.getElementById('game-interface').appendChild(overlay);
        }
    }
    
    leaveRoom() {
        this.roomId = null;
        this.opponent = null;
        this.isHost = false;
        this.matchState = 'waiting';
        this.gameMode = 'singleplayer';
        
        // Reset UI
        document.getElementById('waiting-room').classList.add('hidden');
        document.getElementById('matchmaking').classList.remove('hidden');
        
        this.game.showNotification('Left room', 'info');
    }
    
    // Game state synchronization methods
    syncGameState() {
        if (this.gameMode !== 'multiplayer' || !this.socket) return;
        
        const gameState = {
            playerId: this.playerId,
            board: this.game.board,
            gold: this.game.gold,
            turn: this.game.turn,
            health: this.game.health,
            shop: this.game.shop,
            alchemySlots: this.game.alchemySlots,
            selectedElements: this.game.selectedElements,
            sellMode: this.game.sellMode,
            currentPage: this.game.currentPage
        };
        
        this.sendMessage('gameState', gameState);
    }
    
    sendMessage(type, data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: type,
                data: data,
                roomId: this.roomId,
                playerId: this.playerId,
                timestamp: Date.now()
            }));
        }
    }
    
    handleMessage(message) {
        const { type, data, playerId } = message;
        
        // Ignore messages from self
        if (playerId === this.playerId) return;
        
        switch (type) {
            case 'gameState':
                this.handleOpponentGameState(data);
                break;
            case 'action':
                this.handleOpponentAction(data);
                break;
            case 'battleReady':
                this.handleBattleReady(data);
                break;
            case 'playerJoined':
                this.handlePlayerJoined(data);
                break;
            case 'playerLeft':
                this.handlePlayerLeft(data);
                break;
        }
    }
    
    handleOpponentGameState(opponentState) {
        // Update opponent status in UI
        const opponentStatus = document.getElementById('opponent-status');
        if (opponentStatus) {
            opponentStatus.textContent = `Army: ${opponentState.board.length}/7 | Gold: ${opponentState.gold}`;
        }
    }
    
    handleOpponentAction(action) {
        // Handle specific opponent actions
        switch (action.type) {
            case 'buyElement':
                this.game.log(`${this.opponent.name} bought ${action.elementName}`);
                break;
            case 'fuseElements':
                this.game.log(`${this.opponent.name} fused ${action.element1} + ${action.element2} = ${action.result}`);
                break;
            case 'sellElement':
                this.game.log(`${this.opponent.name} sold ${action.elementName}`);
                break;
            case 'endTurn':
                this.game.log(`${this.opponent.name} ended their turn`);
                break;
        }
    }
    
    handleBattleReady(data) {
        // Both players are ready for battle
        this.matchState = 'battle';
        this.startPvPBattle(data.opponentArmy);
    }
    
    startPvPBattle(opponentArmy) {
        // Start PvP battle with real opponent army
        this.game.startPvPBattle(opponentArmy, this.opponent.name);
    }
    
    // Action broadcasting methods
    broadcastAction(actionType, actionData) {
        if (this.gameMode !== 'multiplayer') return;
        
        this.sendMessage('action', {
            type: actionType,
            ...actionData,
            playerName: this.playerName
        });
    }
    
    broadcastBuyElement(elementName) {
        this.broadcastAction('buyElement', { elementName });
    }
    
    broadcastFuseElements(element1, element2, result) {
        this.broadcastAction('fuseElements', { element1, element2, result });
    }
    
    broadcastSellElement(elementName) {
        this.broadcastAction('sellElement', { elementName });
    }
    
    broadcastEndTurn() {
        this.broadcastAction('endTurn', {});
    }
    
    // Utility methods
    isMultiplayer() {
        return this.gameMode === 'multiplayer';
    }
    
    isConnected() {
        return this.connectionState === 'connected';
    }
    
    getOpponentName() {
        return this.opponent ? this.opponent.name : 'Opponent';
    }
}
