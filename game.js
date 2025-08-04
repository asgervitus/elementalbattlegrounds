class FusionBattlegrounds {
    constructor() {
        this.gameState = 'loading';
        this.gold = 3;
        this.turn = 1;
        this.health = 40;
        this.maxHealth = 40;
        this.board = [];  // Only board, no hand
        this.shop = [];
        this.fusionSlots = [null, null];
        this.shopTier = 1;

        this.initializeElements();
        this.initializeEventListeners();
        this.showLoadingScreen();
    }
    
    showLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
            this.gameState = 'menu';
        }, 2000);
    }
    
    initializeElements() {
        this.baseElements = {
            // Tier 1 - Basic Elements (All cost 3 gold)
            'Fire': { attack: 3, health: 2, cost: 3, tier: 1, emoji: '🔥' },
            'Water': { attack: 2, health: 3, cost: 3, tier: 1, emoji: '💧' },
            'Earth': { attack: 2, health: 4, cost: 3, tier: 1, emoji: '🌍' },
            'Air': { attack: 4, health: 1, cost: 3, tier: 1, emoji: '💨' },
            'Gear': { attack: 3, health: 3, cost: 3, tier: 1, emoji: '⚙️' },
            'Chip': { attack: 4, health: 2, cost: 3, tier: 1, emoji: '💾' },

            // Tier 2 - Basic Fusions (All cost 3 gold)
            'Lava': { attack: 6, health: 3, cost: 3, tier: 2, emoji: '🌋' },
            'Steam': { attack: 3, health: 4, cost: 3, tier: 2, emoji: '♨️' },
            'Magma': { attack: 5, health: 4, cost: 3, tier: 2, emoji: '🗻' },
            'Smoke': { attack: 4, health: 3, cost: 3, tier: 2, emoji: '💨' },
            'Tide': { attack: 4, health: 5, cost: 3, tier: 2, emoji: '🌊' },
            'Mud': { attack: 3, health: 5, cost: 3, tier: 2, emoji: '🟫' },
            'Mist': { attack: 3, health: 4, cost: 3, tier: 2, emoji: '🌫️' },
            'Stone': { attack: 3, health: 7, cost: 3, tier: 2, emoji: '🪨' },
            'Sandstorm': { attack: 5, health: 4, cost: 3, tier: 2, emoji: '🏜️' },
            'Gale': { attack: 6, health: 2, cost: 3, tier: 2, emoji: '🌪️' },
            'Android': { attack: 5, health: 5, cost: 3, tier: 2, emoji: '🤖' },
            'Automaton': { attack: 4, health: 6, cost: 3, tier: 2, emoji: '🦾' },
            'AI Core': { attack: 7, health: 3, cost: 3, tier: 2, emoji: '🧠' },

            // Tier 3 - Advanced Fusions (All cost 3 gold)
            'Foundry': { attack: 8, health: 6, cost: 3, tier: 3, emoji: '🏭' },
            'Geyser': { attack: 6, health: 7, cost: 3, tier: 3, emoji: '⛲' },
            'Volcano': { attack: 9, health: 5, cost: 3, tier: 3, emoji: '🌋' },
            'Pyroclastic Flow': { attack: 10, health: 4, cost: 3, tier: 3, emoji: '☄️' },
            'Steam Engine': { attack: 7, health: 7, cost: 3, tier: 3, emoji: '🚂' },
            'Distillery': { attack: 5, health: 8, cost: 3, tier: 3, emoji: '🥃' },
            'Hot Spring': { attack: 4, health: 9, cost: 3, tier: 3, emoji: '♨️' },
            'Cloud': { attack: 6, health: 6, cost: 3, tier: 3, emoji: '☁️' },
            'Forge': { attack: 8, health: 7, cost: 3, tier: 3, emoji: '⚒️' },
            'Geothermal Plant': { attack: 7, health: 8, cost: 3, tier: 3, emoji: '⚡' },
            'Lava Field': { attack: 9, health: 6, cost: 3, tier: 3, emoji: '🌋' },
            'Ash Cloud': { attack: 6, health: 7, cost: 3, tier: 3, emoji: '🌫️' },
            'Plasma Torch': { attack: 12, health: 4, cost: 3, tier: 3, emoji: '🔥' },
            'Thunderstorm': { attack: 8, health: 8, cost: 3, tier: 3, emoji: '⛈️' },
            'Electromagnet': { attack: 7, health: 9, cost: 3, tier: 3, emoji: '🧲' },
            'Static Storm': { attack: 10, health: 6, cost: 3, tier: 3, emoji: '🌩️' },
            'Steamship': { attack: 6, health: 10, cost: 3, tier: 3, emoji: '🚢' },
            'Ocean': { attack: 5, health: 12, cost: 3, tier: 3, emoji: '🌊' },
            'Estuary': { attack: 7, health: 9, cost: 3, tier: 3, emoji: '🏞️' },
            'Sea Breeze': { attack: 8, health: 7, cost: 3, tier: 3, emoji: '🌬️' },
            'Brick Kiln': { attack: 6, health: 9, cost: 7, tier: 3, emoji: '🧱' },
            'Clay Pottery': { attack: 5, health: 10, cost: 6, tier: 3, emoji: '🏺' },
            'Clay': { attack: 4, health: 11, cost: 6, tier: 3, emoji: '🟫' },
            'Dust Mound': { attack: 7, health: 8, cost: 7, tier: 3, emoji: '🏜️' },
            'Sauna': { attack: 6, health: 8, cost: 7, tier: 3, emoji: '🧖' },
            'Dew': { attack: 4, health: 9, cost: 6, tier: 3, emoji: '💧' },
            'Morning Fog': { attack: 5, health: 8, cost: 6, tier: 3, emoji: '🌁' },
            'Vapor Cloud': { attack: 6, health: 7, cost: 6, tier: 3, emoji: '🌫️' },
            'Glass': { attack: 8, health: 6, cost: 7, tier: 3, emoji: '🔮' },
            'Marble': { attack: 6, health: 10, cost: 7, tier: 3, emoji: '🎱' },
            'Boulder': { attack: 5, health: 12, cost: 7, tier: 3, emoji: '🪨' },
            'Sandstone': { attack: 7, health: 9, cost: 7, tier: 3, emoji: '🏖️' },
            'Ember Ash': { attack: 9, health: 5, cost: 7, tier: 3, emoji: '🔥' },
            'Silt': { attack: 4, health: 10, cost: 6, tier: 3, emoji: '🟫' },
            'Sand': { attack: 6, health: 8, cost: 6, tier: 3, emoji: '🏖️' },
            'Dust Devil': { attack: 8, health: 6, cost: 7, tier: 3, emoji: '🌪️' },
            'Fire Whirl': { attack: 11, health: 5, cost: 8, tier: 3, emoji: '🌪️🔥' },
            'Sea Spray': { attack: 7, health: 7, cost: 7, tier: 3, emoji: '💦' },
            'Dust Storm': { attack: 9, health: 6, cost: 8, tier: 3, emoji: '🌪️💨' },
            'Tornado': { attack: 12, health: 4, cost: 8, tier: 3, emoji: '🌪️' },
            'Robot Arm': { attack: 8, health: 8, cost: 8, tier: 3, emoji: '🦾' },
            'Drone': { attack: 9, health: 6, cost: 8, tier: 3, emoji: '🚁' },
            'Gearbox': { attack: 7, health: 9, cost: 8, tier: 3, emoji: '⚙️' },
            'Smartwatch': { attack: 6, health: 8, cost: 7, tier: 3, emoji: '⌚' },
            'Mechatronics': { attack: 10, health: 7, cost: 9, tier: 3, emoji: '🤖⚙️' },
            'Microprocessor': { attack: 11, health: 5, cost: 8, tier: 3, emoji: '💻' },

            // Tier 4 - Master Fusions (All cost 3 gold)
            'Inferno': { attack: 15, health: 8, cost: 3, tier: 4, emoji: '🔥🌋' },
            'Tsunami': { attack: 12, health: 12, cost: 3, tier: 4, emoji: '🌊🌪️' },
            'Earthquake': { attack: 10, health: 15, cost: 3, tier: 4, emoji: '🌍💥' },
            'Hurricane': { attack: 14, health: 9, cost: 3, tier: 4, emoji: '🌪️⛈️' },
            'Cybernetics': { attack: 13, health: 11, cost: 3, tier: 4, emoji: '🤖🧠' },
            'Quantum Core': { attack: 16, health: 7, cost: 3, tier: 4, emoji: '⚛️💎' },
            'Plasma Storm': { attack: 18, health: 6, cost: 3, tier: 4, emoji: '⚡🌩️' },
            'Tidal Wave': { attack: 14, health: 10, cost: 3, tier: 4, emoji: '🌊💥' },
            'Molten Core': { attack: 16, health: 9, cost: 3, tier: 4, emoji: '🌋🔥' },
            'Lightning Storm': { attack: 17, health: 7, cost: 3, tier: 4, emoji: '⚡⛈️' },
            'Crystal Formation': { attack: 11, health: 14, cost: 3, tier: 4, emoji: '💎🔮' },
            'Mechanical Beast': { attack: 15, health: 10, cost: 3, tier: 4, emoji: '🤖🦾' },

            // Tier 5 - Legendary Fusions (All cost 3 gold)
            'Phoenix': { attack: 20, health: 12, cost: 3, tier: 5, emoji: '🔥🦅' },
            'Leviathan': { attack: 18, health: 15, cost: 3, tier: 5, emoji: '🌊🐉' },
            'Titan': { attack: 16, health: 18, cost: 3, tier: 5, emoji: '🌍⛰️' },
            'Tempest Lord': { attack: 22, health: 10, cost: 3, tier: 5, emoji: '🌪️👑' },
            'Cyber Dragon': { attack: 19, health: 14, cost: 3, tier: 5, emoji: '🤖🐉' },
            'Quantum Beast': { attack: 24, health: 8, cost: 3, tier: 5, emoji: '⚛️🦾' },
            'Elemental Avatar': { attack: 20, health: 15, cost: 3, tier: 5, emoji: '🌟👤' },
            'Storm King': { attack: 23, health: 11, cost: 3, tier: 5, emoji: '⚡👑' },

            // Tier 6 - Ultimate Fusions (All cost 3 gold)
            'Primordial Force': { attack: 30, health: 20, cost: 3, tier: 6, emoji: '🌌💫' },
            'World Ender': { attack: 35, health: 15, cost: 3, tier: 6, emoji: '💀🌍' },
            'Genesis Core': { attack: 25, health: 25, cost: 3, tier: 6, emoji: '⭐🌟' },
            'Omega Protocol': { attack: 40, health: 10, cost: 3, tier: 6, emoji: '🤖👑' },
            'Cosmic Entity': { attack: 32, health: 18, cost: 3, tier: 6, emoji: '🌌👁️' },
            'Reality Shaper': { attack: 28, health: 22, cost: 3, tier: 6, emoji: '🔮🌟' }
        };
        
        this.fusionRecipes = {
            // Tier 1 + Tier 1 = Tier 2
            'Fire + Fire': 'Lava',
            'Fire + Water': 'Steam',
            'Water + Fire': 'Steam',
            'Fire + Earth': 'Magma',
            'Earth + Fire': 'Magma',
            'Fire + Air': 'Smoke',
            'Air + Fire': 'Smoke',
            'Fire + Gear': 'Forge',
            'Gear + Fire': 'Forge',
            'Fire + Chip': 'Plasma Torch',
            'Chip + Fire': 'Plasma Torch',

            'Water + Water': 'Tide',
            'Water + Earth': 'Mud',
            'Earth + Water': 'Mud',
            'Water + Air': 'Mist',
            'Air + Water': 'Mist',
            'Water + Gear': 'Steam Engine',
            'Gear + Water': 'Steam Engine',
            'Water + Chip': 'Distillery',
            'Chip + Water': 'Distillery',

            'Earth + Earth': 'Stone',
            'Earth + Air': 'Sandstorm',
            'Air + Earth': 'Sandstorm',
            'Earth + Gear': 'Boulder',
            'Gear + Earth': 'Boulder',
            'Earth + Chip': 'Clay',
            'Chip + Earth': 'Clay',

            'Air + Air': 'Gale',
            'Air + Gear': 'Drone',
            'Gear + Air': 'Drone',
            'Air + Chip': 'Static Storm',
            'Chip + Air': 'Static Storm',

            'Gear + Gear': 'Android',
            'Gear + Chip': 'Automaton',
            'Chip + Gear': 'Automaton',
            'Chip + Chip': 'AI Core',

            // Tier 2 + Tier 1 = Tier 3
            'Lava + Fire': 'Foundry',
            'Fire + Lava': 'Foundry',
            'Lava + Water': 'Geyser',
            'Water + Lava': 'Geyser',
            'Lava + Earth': 'Volcano',
            'Earth + Lava': 'Volcano',
            'Lava + Air': 'Pyroclastic Flow',
            'Air + Lava': 'Pyroclastic Flow',
            'Lava + Gear': 'Lava Field',
            'Gear + Lava': 'Lava Field',
            'Lava + Chip': 'Geothermal Plant',
            'Chip + Lava': 'Geothermal Plant',

            'Steam + Fire': 'Steam Engine',
            'Fire + Steam': 'Steam Engine',
            'Steam + Water': 'Distillery',
            'Water + Steam': 'Distillery',
            'Steam + Earth': 'Hot Spring',
            'Earth + Steam': 'Hot Spring',
            'Steam + Air': 'Cloud',
            'Air + Steam': 'Cloud',
            'Steam + Gear': 'Steamship',
            'Gear + Steam': 'Steamship',
            'Steam + Chip': 'Sauna',
            'Chip + Steam': 'Sauna',

            'Magma + Fire': 'Forge',
            'Fire + Magma': 'Forge',
            'Magma + Water': 'Geothermal Plant',
            'Water + Magma': 'Geothermal Plant',
            'Magma + Earth': 'Lava Field',
            'Earth + Magma': 'Lava Field',
            'Magma + Air': 'Ash Cloud',
            'Air + Magma': 'Ash Cloud',
            'Magma + Gear': 'Foundry',
            'Gear + Magma': 'Foundry',
            'Magma + Chip': 'Glass',
            'Chip + Magma': 'Glass',

            'Smoke + Fire': 'Ember Ash',
            'Fire + Smoke': 'Ember Ash',
            'Smoke + Water': 'Vapor Cloud',
            'Water + Smoke': 'Vapor Cloud',
            'Smoke + Earth': 'Dust Mound',
            'Earth + Smoke': 'Dust Mound',
            'Smoke + Air': 'Ash Cloud',
            'Air + Smoke': 'Ash Cloud',
            'Smoke + Gear': 'Steam Engine',
            'Gear + Smoke': 'Steam Engine',
            'Smoke + Chip': 'Microprocessor',
            'Chip + Smoke': 'Microprocessor',

            'Tide + Fire': 'Steamship',
            'Fire + Tide': 'Steamship',
            'Tide + Water': 'Ocean',
            'Water + Tide': 'Ocean',
            'Tide + Earth': 'Estuary',
            'Earth + Tide': 'Estuary',
            'Tide + Air': 'Sea Breeze',
            'Air + Tide': 'Sea Breeze',
            'Tide + Gear': 'Sea Spray',
            'Gear + Tide': 'Sea Spray',
            'Tide + Chip': 'Thunderstorm',
            'Chip + Tide': 'Thunderstorm',

            'Mud + Fire': 'Brick Kiln',
            'Fire + Mud': 'Brick Kiln',
            'Mud + Water': 'Clay Pottery',
            'Water + Mud': 'Clay Pottery',
            'Mud + Earth': 'Clay',
            'Earth + Mud': 'Clay',
            'Mud + Air': 'Dust Mound',
            'Air + Mud': 'Dust Mound',
            'Mud + Gear': 'Silt',
            'Gear + Mud': 'Silt',
            'Mud + Chip': 'Sand',
            'Chip + Mud': 'Sand',

            // Continue with remaining Tier 2 + Tier 1 combinations
            'Mist + Fire': 'Sauna',
            'Fire + Mist': 'Sauna',
            'Mist + Water': 'Dew',
            'Water + Mist': 'Dew',
            'Mist + Earth': 'Morning Fog',
            'Earth + Mist': 'Morning Fog',
            'Mist + Air': 'Vapor Cloud',
            'Air + Mist': 'Vapor Cloud',

            'Stone + Fire': 'Glass',
            'Fire + Stone': 'Glass',
            'Stone + Water': 'Marble',
            'Water + Stone': 'Marble',
            'Stone + Earth': 'Boulder',
            'Earth + Stone': 'Boulder',
            'Stone + Air': 'Sandstone',
            'Air + Stone': 'Sandstone',

            'Sandstorm + Fire': 'Fire Whirl',
            'Fire + Sandstorm': 'Fire Whirl',
            'Sandstorm + Water': 'Dust Storm',
            'Water + Sandstorm': 'Dust Storm',
            'Sandstorm + Earth': 'Dust Devil',
            'Earth + Sandstorm': 'Dust Devil',
            'Sandstorm + Air': 'Tornado',
            'Air + Sandstorm': 'Tornado',

            'Gale + Fire': 'Fire Whirl',
            'Fire + Gale': 'Fire Whirl',
            'Gale + Water': 'Sea Spray',
            'Water + Gale': 'Sea Spray',
            'Gale + Earth': 'Dust Storm',
            'Earth + Gale': 'Dust Storm',
            'Gale + Air': 'Tornado',
            'Air + Gale': 'Tornado',

            'Android + Gear': 'Robot Arm',
            'Gear + Android': 'Robot Arm',
            'Android + Chip': 'Drone',
            'Chip + Android': 'Drone',

            'Automaton + Gear': 'Gearbox',
            'Gear + Automaton': 'Gearbox',
            'Automaton + Chip': 'Smartwatch',
            'Chip + Automaton': 'Smartwatch',

            'AI Core + Gear': 'Mechatronics',
            'Gear + AI Core': 'Mechatronics',
            'AI Core + Chip': 'Microprocessor',
            'Chip + AI Core': 'Microprocessor',

            // Tier 2 + Tier 2 = Tier 4 (Skip Tier 3 for more powerful combinations)
            'Lava + Steam': 'Inferno',
            'Steam + Lava': 'Inferno',
            'Lava + Magma': 'Molten Core',
            'Magma + Lava': 'Molten Core',
            'Tide + Gale': 'Hurricane',
            'Gale + Tide': 'Hurricane',
            'Stone + Sandstorm': 'Earthquake',
            'Sandstorm + Stone': 'Earthquake',
            'Android + AI Core': 'Cybernetics',
            'AI Core + Android': 'Cybernetics',
            'Automaton + AI Core': 'Quantum Core',
            'AI Core + Automaton': 'Quantum Core',

            // Tier 3 + Tier 3 = Tier 5
            'Volcano + Thunderstorm': 'Phoenix',
            'Thunderstorm + Volcano': 'Phoenix',
            'Ocean + Tornado': 'Leviathan',
            'Tornado + Ocean': 'Leviathan',
            'Boulder + Earthquake': 'Titan',
            'Earthquake + Boulder': 'Titan',
            'Plasma Torch + Static Storm': 'Tempest Lord',
            'Static Storm + Plasma Torch': 'Tempest Lord',
            'Mechatronics + Microprocessor': 'Cyber Dragon',
            'Microprocessor + Mechatronics': 'Cyber Dragon',
            'Forge + Geothermal Plant': 'Quantum Beast',
            'Geothermal Plant + Forge': 'Quantum Beast',

            // Tier 4 + Tier 4 = Tier 5
            'Inferno + Hurricane': 'Elemental Avatar',
            'Hurricane + Inferno': 'Elemental Avatar',
            'Molten Core + Lightning Storm': 'Storm King',
            'Lightning Storm + Molten Core': 'Storm King',

            // Tier 5 + Tier 5 = Tier 6 (Ultimate Fusions)
            'Phoenix + Leviathan': 'Primordial Force',
            'Leviathan + Phoenix': 'Primordial Force',
            'Titan + Tempest Lord': 'World Ender',
            'Tempest Lord + Titan': 'World Ender',
            'Cyber Dragon + Quantum Beast': 'Genesis Core',
            'Quantum Beast + Cyber Dragon': 'Genesis Core',
            'Elemental Avatar + Storm King': 'Omega Protocol',
            'Storm King + Elemental Avatar': 'Omega Protocol',

            // Special Tier 6 combinations
            'Primordial Force + World Ender': 'Cosmic Entity',
            'World Ender + Primordial Force': 'Cosmic Entity',
            'Genesis Core + Omega Protocol': 'Reality Shaper',
            'Omega Protocol + Genesis Core': 'Reality Shaper'
        };
    }
    
    initializeEventListeners() {
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('tutorial-btn').addEventListener('click', () => this.showTutorial());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('refresh-btn').addEventListener('click', () => this.refreshShop());
        document.getElementById('end-turn-btn').addEventListener('click', () => this.endTurn());
        document.getElementById('fuse-btn').addEventListener('click', () => this.fuseElements());
        document.getElementById('clear-fusion-btn').addEventListener('click', () => this.clearFusion());
        document.getElementById('clear-log-btn').addEventListener('click', () => this.clearLog());
        document.getElementById('close-tutorial').addEventListener('click', () => this.hideTutorial());
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettings());
        document.getElementById('continue-btn').addEventListener('click', () => this.continueToBattle());
        
        this.setupDragAndDrop();
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-interface').classList.remove('hidden');

        // Setup drag and drop after interface is visible
        this.setupFusionSlots();

        this.startNewTurn();
        this.playSound('click');
        this.showNotification('Game Started!', 'success');
    }
    
    showTutorial() {
        document.getElementById('tutorial-modal').classList.remove('hidden');
        this.playSound('click');
    }
    
    hideTutorial() {
        document.getElementById('tutorial-modal').classList.add('hidden');
        this.playSound('click');
    }
    
    showSettings() {
        document.getElementById('settings-modal').classList.remove('hidden');
        this.playSound('click');
    }
    
    hideSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
        this.playSound('click');
    }
    
    setupDragAndDrop() {
        // Set up global drag events
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('element-card')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.elementId);
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('element-card')) {
                e.target.classList.remove('dragging');
            }
        });

        // Set up fusion slot drop zones
        this.setupFusionSlots();

        // Set up board drop zone
        this.setupBoardDropZone();
    }

    setupFusionSlots() {
        const fusionSlots = document.querySelectorAll('.fusion-slot');
        fusionSlots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const elementId = e.dataTransfer.getData('text/plain');
                this.addToFusionSlot(elementId, slot);
            });
        });
    }

    setupBoardDropZone() {
        const boardZone = document.getElementById('board-elements');
        if (boardZone) {
            boardZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                boardZone.classList.add('drag-over');
            });

            boardZone.addEventListener('dragleave', () => {
                boardZone.classList.remove('drag-over');
            });

            boardZone.addEventListener('drop', (e) => {
                e.preventDefault();
                boardZone.classList.remove('drag-over');
                const elementId = e.dataTransfer.getData('text/plain');
                this.moveToBoard(elementId);
            });
        }
    }

    moveToBoard(elementId) {
        // This handles dragging from shop to board
        const element = this.shop.find(e => e.id == elementId);
        if (element && this.gold >= element.cost && this.board.length < 7) {
            this.buyElement(elementId);
        }
    }
    
    generateShop() {
        this.shop = [];
        // Tier progression: 1-2 turns = tier 1, 3-5 = tier 2, 6-8 = tier 3, 9-12 = tier 4, 13-16 = tier 5, 17+ = tier 6
        this.shopTier = Math.min(6, Math.floor((this.turn - 1) / 2.5) + 1);

        const availableElements = Object.keys(this.baseElements).filter(name =>
            this.baseElements[name].tier <= this.shopTier
        );

        // Generate 6 shop slots for more variety
        for (let i = 0; i < 6; i++) {
            const randomElement = availableElements[Math.floor(Math.random() * availableElements.length)];
            this.shop.push(this.createElement(randomElement));
        }
    }
    
    createElement(name) {
        const baseStats = this.baseElements[name];
        return {
            id: Date.now() + Math.random(),
            name: name,
            attack: baseStats.attack,
            health: baseStats.health,
            cost: baseStats.cost,
            tier: baseStats.tier
        };
    }
    
    refreshShop() {
        if (this.gold >= 1) {
            this.gold--;
            this.generateShop();
            this.updateDisplay();
            this.playSound('click');
        }
    }
    
    buyElement(elementId) {
        const element = this.shop.find(e => e.id == elementId);
        if (element && this.gold >= element.cost && this.board.length < 7) {
            this.gold -= element.cost;
            this.board.push(element); // Add directly to board
            this.shop = this.shop.filter(e => e.id != elementId);
            this.updateDisplay();
            this.playSound('buy');
            this.log(`Bought ${element.name} for ${element.cost} gold`);
        }
    }
    
    addToFusionSlot(elementId, slot) {
        const slotIndex = slot.id === 'fusion-slot-1' ? 0 : 1;
        let element = this.board.find(e => e.id == elementId);

        if (element && !this.fusionSlots[slotIndex]) {
            this.fusionSlots[slotIndex] = element;
            this.board = this.board.filter(e => e.id != elementId);
            this.updateDisplay();
            this.checkFusionReady();
        }
    }
    
    checkFusionReady() {
        const fuseBtn = document.getElementById('fuse-btn');
        fuseBtn.disabled = !this.fusionSlots[0] || !this.fusionSlots[1];
        
        if (this.fusionSlots[0] && this.fusionSlots[1]) {
            const recipe = `${this.fusionSlots[0].name} + ${this.fusionSlots[1].name}`;
            const result = this.fusionRecipes[recipe];
            const preview = document.getElementById('fusion-result');

            if (result) {
                const resultData = this.baseElements[result];
                const emoji = resultData ? resultData.emoji : '⭐';
                preview.innerHTML = `<div class="result-emoji">${emoji}</div><div class="result-name">${result}</div>`;
                preview.classList.add('known');
            } else {
                preview.innerHTML = `<div class="result-placeholder">❓</div>`;
                preview.classList.remove('known');
            }
        }
    }
    
    fuseElements() {
        if (!this.fusionSlots[0] || !this.fusionSlots[1]) return;
        
        const recipe = `${this.fusionSlots[0].name} + ${this.fusionSlots[1].name}`;
        const result = this.fusionRecipes[recipe];
        
        if (result && this.baseElements[result]) {
            const newElement = this.createElement(result);
            this.board.push(newElement); // Add result to board
            this.playSound('fusion');
            this.log(`Fused ${this.fusionSlots[0].name} + ${this.fusionSlots[1].name} = ${result}!`);
            this.showNotification(`Created ${result}!`, 'success');
        } else {
            this.board.push(this.fusionSlots[0], this.fusionSlots[1]); // Return to board
            this.log(`No fusion recipe for ${recipe}`);
            this.showNotification('Fusion failed!', 'error');
        }
        
        this.fusionSlots = [null, null];
        this.updateDisplay();
        this.checkFusionReady();
    }
    
    clearFusion() {
        if (this.fusionSlots[0]) this.board.push(this.fusionSlots[0]);
        if (this.fusionSlots[1]) this.board.push(this.fusionSlots[1]);
        this.fusionSlots = [null, null];
        this.updateDisplay();
        this.checkFusionReady();
        this.playSound('click');
    }
    
    clearLog() {
        document.getElementById('log-content').innerHTML = '';
        this.playSound('click');
    }
    
    startNewTurn() {
        this.gold = Math.min(10, this.turn + 2);
        this.generateShop();
        this.updateDisplay();
        this.log(`Turn ${this.turn} started! You have ${this.gold} gold.`);
    }
    
    endTurn() {
        this.showBattleScreen();
    }
    
    showBattleScreen() {
        document.getElementById('game-interface').classList.add('hidden');
        document.getElementById('battle-screen').classList.remove('hidden');

        // Generate enemy army
        const enemyArmy = this.generateEnemyArmy();
        const playerPower = this.board.reduce((sum, el) => sum + el.attack + el.health, 0);
        const enemyPower = enemyArmy.reduce((sum, el) => sum + el.attack + el.health, 0);

        // Display armies
        this.displayBattleArmies(enemyArmy);

        document.getElementById('battle-player-power').textContent = playerPower;
        document.getElementById('battle-enemy-power').textContent = enemyPower;

        this.log(`Battle started! Your power: ${playerPower} vs Enemy power: ${enemyPower}`);

        setTimeout(() => {
            const battleResult = document.getElementById('battle-result');

            if (playerPower >= enemyPower) {
                battleResult.textContent = 'Victory! You won the battle!';
                battleResult.className = 'battle-result victory';
                this.playSound('victory');
                this.log('Victory! You survived this turn.');
            } else {
                const damage = Math.ceil((enemyPower - playerPower) / 3);
                this.health = Math.max(0, this.health - damage);
                battleResult.textContent = `Defeat! You took ${damage} damage.`;
                battleResult.className = 'battle-result defeat';
                this.playSound('defeat');
                this.log(`Defeat! You took ${damage} damage. Health: ${this.health}`);

                if (this.health <= 0) {
                    battleResult.textContent += ' Game Over!';
                    this.gameState = 'gameOver';
                    this.log('Game Over! Your health reached 0.');
                }
            }

            document.getElementById('continue-btn').classList.remove('hidden');
        }, 2000);
    }

    generateEnemyArmy() {
        const enemyArmy = [];
        const enemyCount = Math.min(7, Math.floor(this.turn / 2) + 2);
        const maxTier = Math.min(5, Math.floor(this.turn / 3) + 1);

        const availableElements = Object.keys(this.baseElements).filter(name =>
            this.baseElements[name].tier <= maxTier
        );

        for (let i = 0; i < enemyCount; i++) {
            const randomElement = availableElements[Math.floor(Math.random() * availableElements.length)];
            enemyArmy.push(this.createElement(randomElement));
        }

        return enemyArmy;
    }

    displayBattleArmies(enemyArmy) {
        // Display player army
        const playerBattleBoard = document.getElementById('battle-player-board');
        playerBattleBoard.innerHTML = '';
        this.board.forEach(element => {
            playerBattleBoard.appendChild(this.createElementCard(element, 'battle'));
        });

        // Display enemy army
        const enemyBattleBoard = document.getElementById('battle-enemy-board');
        enemyBattleBoard.innerHTML = '';
        enemyArmy.forEach(element => {
            enemyBattleBoard.appendChild(this.createElementCard(element, 'battle'));
        });
    }
    
    continueToBattle() {
        document.getElementById('battle-screen').classList.add('hidden');
        
        if (this.gameState === 'gameOver') {
            document.getElementById('main-menu').classList.remove('hidden');
            this.resetGame();
        } else {
            document.getElementById('game-interface').classList.remove('hidden');
            this.turn++;
            this.startNewTurn();
        }
        
        this.playSound('click');
    }
    
    resetGame() {
        this.gameState = 'menu';
        this.gold = 3;
        this.turn = 1;
        this.health = 40;
        this.board = [];
        this.shop = [];
        this.fusionSlots = [null, null];
        this.clearLog();
    }
    
    createElementCard(element, container) {
        const card = document.createElement('div');
        card.className = `element-card tier-${element.tier}`;
        card.draggable = true;
        card.dataset.elementId = element.id;
        
        const elementData = this.baseElements[element.name];
        const emoji = elementData ? elementData.emoji : '❓';

        card.innerHTML = `
            <div class="element-cost">${element.cost}</div>
            <div class="element-tier">T${element.tier}</div>
            <div class="element-emoji">${emoji}</div>
            <div class="element-name">${element.name}</div>
            <div class="element-stats">
                <div class="element-attack">${element.attack} ATK</div>
                <div class="element-health">${element.health} HP</div>
            </div>
        `;
        
        if (container === 'shop') {
            card.addEventListener('click', () => this.buyElement(element.id));
        }
        // Remove hand-specific logic since we only have board now
        
        return card;
    }

    // Add missing methods
    playSound(soundName) {
        if (window.audioManager) {
            window.audioManager.playSound(soundName);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('notifications');
        container.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    log(message) {
        const logContent = document.getElementById('log-content');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `<span class="log-time">[Turn ${this.turn}]</span> ${message}`;
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    updateDisplay() {
        document.getElementById('gold').textContent = this.gold;
        document.getElementById('turn').textContent = this.turn;
        document.getElementById('health').textContent = this.health;
        document.getElementById('shop-tier').textContent = this.shopTier;
        document.getElementById('board-count').textContent = this.board.length;
        
        const healthPercentage = Math.max(0, (this.health / this.maxHealth) * 100);
        const healthFill = document.getElementById('health-fill');
        if (healthFill) {
            healthFill.style.width = `${healthPercentage}%`;

            // Change color based on health
            if (healthPercentage > 60) {
                healthFill.style.background = '#4caf50';
            } else if (healthPercentage > 30) {
                healthFill.style.background = '#ff9800';
            } else {
                healthFill.style.background = '#f44336';
            }
        }
        
        const boardPower = this.board.reduce((sum, el) => sum + el.attack + el.health, 0);
        document.getElementById('board-power').textContent = boardPower;
        
        const shopContainer = document.getElementById('shop-elements');
        shopContainer.innerHTML = '';
        this.shop.forEach(element => {
            shopContainer.appendChild(this.createElementCard(element, 'shop'));
        });

        const boardContainer = document.getElementById('board-elements');
        boardContainer.innerHTML = '';
        this.board.forEach(element => {
            boardContainer.appendChild(this.createElementCard(element, 'board'));
        });
        
        document.querySelectorAll('.fusion-slot').forEach((slot, index) => {
            if (this.fusionSlots[index]) {
                const element = this.fusionSlots[index];
                const elementData = this.baseElements[element.name];
                const emoji = elementData ? elementData.emoji : '❓';
                slot.innerHTML = `<div class="slot-emoji">${emoji}</div>`;
                slot.classList.add('filled');
            } else {
                slot.innerHTML = `<div class="slot-placeholder">Drop Element</div>`;
                slot.classList.remove('filled');
            }
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system first
    if (!window.particleSystem) {
        window.particleSystem = new ParticleSystem();
    }

    // Initialize audio manager
    if (!window.audioManager) {
        window.audioManager = new AudioManager();
    }

    // Initialize the game
    window.game = new FusionBattlegrounds();

    // Set up settings toggles
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
        if (window.audioManager) {
            window.audioManager.setSoundEnabled(e.target.checked);
        }
    });

    document.getElementById('music-toggle').addEventListener('change', (e) => {
        if (window.audioManager) {
            window.audioManager.setMusicEnabled(e.target.checked);
        }
    });

    document.getElementById('animations-toggle').addEventListener('change', (e) => {
        document.body.classList.toggle('no-animations', !e.target.checked);
    });
});