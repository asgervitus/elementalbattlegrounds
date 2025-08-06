# 🌐 Fusion Battlegrounds - Multiplayer Setup

## Overview
Fusion Battlegrounds now supports real-time PVP multiplayer battles! Players can compete against each other in strategic element fusion battles.

## Features

### 🎮 Game Modes
- **Quick Match**: Automatic matchmaking with random opponents
- **Private Rooms**: Create or join rooms with friends using room codes
- **Ranked Matches**: Competitive play with ELO rating system
- **Spectator Mode**: Watch other players' battles (coming soon)

### ⚡ Real-time Features
- **Live Game State Sync**: See opponent's actions in real-time
- **Turn Timers**: Configurable time limits for turns
- **Action Broadcasting**: All moves are shared with opponent
- **Battle Synchronization**: Simultaneous army reveals and battles

### 🛡️ Passive Abilities in PVP
Every element's intricate passive ability works in multiplayer:
- **Fire**: Ignite - Deals damage to opponent's army at battle start
- **Phoenix**: Rebirth - Revives during PVP battles
- **Reality Shaper**: Divine Intervention - Can win matches automatically
- **100+ unique passives** create incredible strategic depth

## Quick Start

### For Players (GitHub Pages)
1. Visit: https://asgervitus.github.io/elementalbattlegrounds/
2. Click "🌐 Play Online"
3. Enter your battle name
4. Choose Quick Match or create/join a room
5. Build your army and battle opponents!

### For Developers (Local Server)

#### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

#### Setup
```bash
# Install dependencies
npm install

# Start the server
npm start

# For development with auto-restart
npm run dev
```

#### Server Configuration
- **Default Port**: 3000
- **WebSocket Endpoint**: `/ws`
- **Static Files**: Served from root directory
- **Environment**: Set `PORT` environment variable for custom port

## Architecture

### Client-Side (multiplayer.js)
- **MultiplayerManager**: Handles all multiplayer functionality
- **WebSocket Client**: Real-time communication with server
- **Game State Sync**: Synchronizes player actions and state
- **UI Management**: Multiplayer modals and overlays

### Server-Side (server.js)
- **WebSocket Server**: Handles real-time connections
- **Room Management**: Creates and manages game rooms
- **Matchmaking**: Automatic opponent matching
- **State Synchronization**: Ensures consistent game state

### Protocol
```javascript
// Message Format
{
  type: 'messageType',
  data: { /* message data */ },
  roomId: 'ROOM123',
  playerId: 'player_123',
  timestamp: 1234567890
}
```

## Deployment

### Heroku Deployment
```bash
# Create Heroku app
heroku create fusion-battlegrounds-server

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Game Flow

### 1. Connection Phase
- Player enters name and connects to server
- Server assigns unique player ID
- Connection status displayed with visual indicators

### 2. Matchmaking Phase
- **Quick Match**: Automatic pairing with available players
- **Private Rooms**: 6-character room codes for friend matches
- **Room Settings**: Turn timers, ranked/unranked options

### 3. Preparation Phase
- Both players build their armies simultaneously
- Real-time updates show opponent's progress
- Turn timer counts down preparation time
- Players can see opponent's army size and gold

### 4. Battle Phase
- Armies are revealed simultaneously
- Passive abilities are calculated and applied
- Battle resolution with real opponent armies
- Winner determined by total power + passive effects

### 5. Post-Battle
- Results shared between players
- Rankings updated (if ranked match)
- Option to rematch or return to matchmaking

## Technical Details

### WebSocket Events
- `setPlayerName`: Set player display name
- `quickMatch`: Join matchmaking queue
- `createRoom`: Create private room with settings
- `joinRoom`: Join existing room by code
- `gameState`: Sync current game state
- `action`: Broadcast player actions
- `battleReady`: Signal ready for battle

### Security Features
- **Input Validation**: All messages validated server-side
- **Rate Limiting**: Prevents spam and abuse
- **Room Codes**: 6-character alphanumeric codes
- **Player Isolation**: Players can only affect their own game state

### Performance Optimizations
- **Efficient State Sync**: Only changed data is transmitted
- **Connection Pooling**: Reuse connections when possible
- **Graceful Degradation**: Falls back to demo mode if server unavailable
- **Memory Management**: Automatic cleanup of disconnected players

## Future Enhancements
- **Spectator Mode**: Watch live matches
- **Tournament System**: Bracket-style competitions
- **Replay System**: Save and review past battles
- **Chat System**: In-game communication
- **Leaderboards**: Global and seasonal rankings
- **Custom Game Modes**: Draft mode, sealed deck, etc.

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check if server is running on port 3000
2. **Room Not Found**: Verify room code is correct and room still exists
3. **Match Timeout**: Ensure both players are actively playing
4. **Sync Issues**: Refresh page if game state becomes inconsistent

### Debug Mode
Add `?debug=true` to URL for additional logging and debug information.

## Contributing
The multiplayer system is designed to be extensible. Key areas for contribution:
- Additional game modes
- Enhanced passive ability interactions
- Spectator features
- Mobile optimization
- Server scaling improvements

---

**Ready to battle online? The elements await your command!** ⚔️🔥💧🌍💨
