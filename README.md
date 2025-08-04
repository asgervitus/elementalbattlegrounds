# Fusion Battlegrounds

A strategic auto-battler game where you collect, fuse, and battle with elemental creatures!

## 🎮 How to Play

### Game Overview
Fusion Battlegrounds is an auto-battler where you build an army of elemental creatures, fuse them into more powerful forms, and battle against increasingly difficult enemies each turn.

### Core Mechanics

1. **Buy Elements**: Use gold to purchase elemental creatures from the tavern
2. **Build Your Army**: Place elements from your hand onto your board (max 7)
3. **Fuse Elements**: Drag two elements to the fusion chamber to create powerful combinations
4. **Battle**: At the end of each turn, your army automatically battles an enemy army
5. **Survive**: Keep your health above 0 to continue progressing through turns

### Element System

#### Tier 1 Elements (Basic)
- **Fire**: 3 ATK, 2 HP, 2 Gold
- **Water**: 2 ATK, 3 HP, 2 Gold  
- **Earth**: 2 ATK, 4 HP, 3 Gold
- **Air**: 4 ATK, 1 HP, 2 Gold

#### Tier 2 Elements (Fused)
- **Steam** (Fire + Water): 3 ATK, 4 HP, 4 Gold
- **Mud** (Earth + Water): 3 ATK, 5 HP, 4 Gold
- **Dust** (Earth + Air): 5 ATK, 3 HP, 4 Gold
- **Lava** (Fire + Earth): 6 ATK, 3 HP, 5 Gold

#### Tier 3 Elements (Advanced)
- **Plant** (Water + Steam): 4 ATK, 6 HP, 6 Gold
- **Metal** (Earth + Lava): 5 ATK, 7 HP, 7 Gold
- **Energy** (Fire + Air): 7 ATK, 4 HP, 6 Gold
- **Stone** (Earth + Earth): 3 ATK, 9 HP, 6 Gold

#### Tier 4 Elements (Powerful)
- **Life** (Water + Plant): 6 ATK, 8 HP, 8 Gold
- **Lightning** (Energy + Air): 10 ATK, 5 HP, 8 Gold
- **Ice** (Water + Air): 5 ATK, 10 HP, 8 Gold

#### Tier 5 Elements (Legendary)
- **Phoenix** (Fire + Life): 14 ATK, 10 HP, 13 Gold
- **Dragon** (Lightning + Fire): 12 ATK, 12 HP, 12 Gold

### Strategy Tips

1. **Early Game**: Focus on basic elements and simple fusions
2. **Economy**: Balance spending gold vs saving for powerful elements
3. **Positioning**: Higher tier elements are generally more powerful
4. **Fusion Planning**: Plan your fusions to create synergistic combinations
5. **Health Management**: Don't sacrifice too much health for economy

## 🚀 Getting Started

### Play Online
1. Navigate to the `augmentbattlegroundstest` folder
2. Open `index.html` in your web browser
3. Click "Start Game" to begin!

### Local Development
1. Clone this repository
2. Navigate to `augmentbattlegroundstest` folder
3. Start a local server: `python3 -m http.server 8000`
4. Open `http://localhost:8000` in your browser

## 🎵 Features

- **Dynamic Audio**: Procedurally generated sound effects and music
- **Particle Effects**: Beautiful background particle system
- **Responsive Design**: Works on desktop and mobile devices
- **Settings**: Toggle sound, music, and animations
- **Battle Log**: Track your game progress and decisions

## 🛠️ Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Audio**: Web Audio API for procedural sound generation
- **Graphics**: Canvas API for particle effects
- **No Dependencies**: Pure vanilla JavaScript implementation

## 🎯 Game Balance

The game is designed to be challenging but fair:
- Enemy difficulty scales with turn number
- Shop tier increases every 3 turns
- Gold income increases with turn progression
- Health damage is calculated based on power difference

## 🤝 Contributing

Feel free to contribute improvements, bug fixes, or new features!

## 📄 License

This project is open source and available under the MIT License.
