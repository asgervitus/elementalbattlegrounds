const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

class FusionBattlegroundsServer {
    constructor() {
        this.rooms = new Map();
        this.players = new Map();
        this.matchmaking = [];
        
        this.setupServer();
    }
    
    setupServer() {
        // Create HTTP server for serving static files
        this.httpServer = http.createServer((req, res) => {
            this.serveStaticFile(req, res);
        });
        
        // Create WebSocket server
        this.wss = new WebSocket.Server({ 
            server: this.httpServer,
            path: '/ws'
        });
        
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
        
        const PORT = process.env.PORT || 3000;
        this.httpServer.listen(PORT, () => {
            console.log(`🎮 Fusion Battlegrounds Server running on port ${PORT}`);
            console.log(`🌐 WebSocket endpoint: ws://localhost:${PORT}/ws`);
        });
    }
    
    serveStaticFile(req, res) {
        let filePath = req.url === '/' ? '/index.html' : req.url;
        filePath = path.join(__dirname, filePath);
        
        const extname = path.extname(filePath);
        let contentType = 'text/html';
        
        switch (extname) {
            case '.js': contentType = 'text/javascript'; break;
            case '.css': contentType = 'text/css'; break;
            case '.json': contentType = 'application/json'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': contentType = 'image/jpg'; break;
        }
        
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
    
    handleConnection(ws, req) {
        const playerId = this.generatePlayerId();
        
        const player = {
            id: playerId,
            ws: ws,
            name: null,
            roomId: null,
            gameState: null,
            isReady: false
        };
        
        this.players.set(playerId, player);
        
        console.log(`👤 Player ${playerId} connected`);
        
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.handleMessage(playerId, message);
            } catch (error) {
                console.error('Invalid message format:', error);
            }
        });
        
        ws.on('close', () => {
            this.handleDisconnection(playerId);
        });
        
        // Send welcome message
        this.sendToPlayer(playerId, 'connected', { playerId });
    }
    
    handleMessage(playerId, message) {
        const player = this.players.get(playerId);
        if (!player) return;
        
        switch (message.type) {
            case 'setPlayerName':
                this.handleSetPlayerName(playerId, message.data);
                break;
            case 'quickMatch':
                this.handleQuickMatch(playerId);
                break;
            case 'createRoom':
                this.handleCreateRoom(playerId, message.data);
                break;
            case 'joinRoom':
                this.handleJoinRoom(playerId, message.data);
                break;
            case 'leaveRoom':
                this.handleLeaveRoom(playerId);
                break;
            case 'gameState':
                this.handleGameState(playerId, message.data);
                break;
            case 'action':
                this.handlePlayerAction(playerId, message.data);
                break;
            case 'battleReady':
                this.handleBattleReady(playerId, message.data);
                break;
        }
    }
    
    handleSetPlayerName(playerId, data) {
        const player = this.players.get(playerId);
        player.name = data.name;
        
        this.sendToPlayer(playerId, 'nameSet', { success: true });
    }
    
    handleQuickMatch(playerId) {
        // Add to matchmaking queue
        this.matchmaking.push(playerId);
        
        // Try to match with another player
        if (this.matchmaking.length >= 2) {
            const player1Id = this.matchmaking.shift();
            const player2Id = this.matchmaking.shift();
            
            this.createMatch(player1Id, player2Id);
        } else {
            this.sendToPlayer(playerId, 'matchmaking', { status: 'searching' });
        }
    }
    
    handleCreateRoom(playerId, data) {
        const roomId = this.generateRoomCode();
        const room = {
            id: roomId,
            hostId: playerId,
            players: [playerId],
            settings: data.settings || {},
            state: 'waiting'
        };
        
        this.rooms.set(roomId, room);
        
        const player = this.players.get(playerId);
        player.roomId = roomId;
        
        this.sendToPlayer(playerId, 'roomCreated', { roomId, isHost: true });
    }
    
    handleJoinRoom(playerId, data) {
        const room = this.rooms.get(data.roomId);
        
        if (!room) {
            this.sendToPlayer(playerId, 'joinRoomFailed', { error: 'Room not found' });
            return;
        }
        
        if (room.players.length >= 2) {
            this.sendToPlayer(playerId, 'joinRoomFailed', { error: 'Room is full' });
            return;
        }
        
        room.players.push(playerId);
        
        const player = this.players.get(playerId);
        player.roomId = data.roomId;
        
        this.sendToPlayer(playerId, 'roomJoined', { roomId: data.roomId, isHost: false });
        
        // Notify other players in room
        this.broadcastToRoom(data.roomId, 'playerJoined', {
            playerId: playerId,
            playerName: player.name
        }, playerId);
        
        // If room is full, both players can start
        if (room.players.length === 2) {
            this.broadcastToRoom(data.roomId, 'roomReady', {});
        }
    }
    
    handleLeaveRoom(playerId) {
        const player = this.players.get(playerId);
        if (!player || !player.roomId) return;
        
        const room = this.rooms.get(player.roomId);
        if (room) {
            room.players = room.players.filter(id => id !== playerId);
            
            if (room.players.length === 0) {
                this.rooms.delete(player.roomId);
            } else {
                this.broadcastToRoom(player.roomId, 'playerLeft', {
                    playerId: playerId,
                    playerName: player.name
                });
            }
        }
        
        player.roomId = null;
    }
    
    handleGameState(playerId, gameState) {
        const player = this.players.get(playerId);
        player.gameState = gameState;
        
        // Broadcast to opponent in room
        if (player.roomId) {
            this.broadcastToRoom(player.roomId, 'opponentGameState', gameState, playerId);
        }
    }
    
    handlePlayerAction(playerId, action) {
        const player = this.players.get(playerId);
        
        // Broadcast action to opponent
        if (player.roomId) {
            this.broadcastToRoom(player.roomId, 'opponentAction', action, playerId);
        }
    }
    
    handleBattleReady(playerId, battleData) {
        const player = this.players.get(playerId);
        player.isReady = true;
        player.battleArmy = battleData.army;
        
        if (player.roomId) {
            const room = this.rooms.get(player.roomId);
            const allReady = room.players.every(id => this.players.get(id).isReady);
            
            if (allReady) {
                this.startRoomBattle(player.roomId);
            }
        }
    }
    
    startRoomBattle(roomId) {
        const room = this.rooms.get(roomId);
        const [player1Id, player2Id] = room.players;
        
        const player1 = this.players.get(player1Id);
        const player2 = this.players.get(player2Id);
        
        // Send each player their opponent's army
        this.sendToPlayer(player1Id, 'battleStart', {
            opponentArmy: player2.battleArmy,
            opponentName: player2.name
        });
        
        this.sendToPlayer(player2Id, 'battleStart', {
            opponentArmy: player1.battleArmy,
            opponentName: player1.name
        });
        
        // Reset ready states
        player1.isReady = false;
        player2.isReady = false;
    }
    
    createMatch(player1Id, player2Id) {
        const roomId = this.generateRoomCode();
        const room = {
            id: roomId,
            hostId: player1Id,
            players: [player1Id, player2Id],
            settings: { ranked: true, turnTimer: 90 },
            state: 'matched'
        };
        
        this.rooms.set(roomId, room);
        
        const player1 = this.players.get(player1Id);
        const player2 = this.players.get(player2Id);
        
        player1.roomId = roomId;
        player2.roomId = roomId;
        
        this.sendToPlayer(player1Id, 'matchFound', {
            roomId: roomId,
            opponent: { name: player2.name },
            isHost: true
        });
        
        this.sendToPlayer(player2Id, 'matchFound', {
            roomId: roomId,
            opponent: { name: player1.name },
            isHost: false
        });
    }
    
    handleDisconnection(playerId) {
        console.log(`👤 Player ${playerId} disconnected`);
        
        const player = this.players.get(playerId);
        if (player && player.roomId) {
            this.handleLeaveRoom(playerId);
        }
        
        // Remove from matchmaking queue
        this.matchmaking = this.matchmaking.filter(id => id !== playerId);
        
        this.players.delete(playerId);
    }
    
    sendToPlayer(playerId, type, data) {
        const player = this.players.get(playerId);
        if (player && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify({
                type: type,
                data: data,
                timestamp: Date.now()
            }));
        }
    }
    
    broadcastToRoom(roomId, type, data, excludePlayerId = null) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        room.players.forEach(playerId => {
            if (playerId !== excludePlayerId) {
                this.sendToPlayer(playerId, type, data);
            }
        });
    }
    
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// Start the server
const server = new FusionBattlegroundsServer();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});
