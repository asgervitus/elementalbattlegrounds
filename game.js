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
        this.alchemySlots = [null, null, null, null, null]; // 5 alchemy slots
        this.alchemyElements = []; // Track element types for coloring
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
        
        // Generate complete fusion matrix - every element can fuse with every other element
        this.fusionRecipes = {};
        this.generateCompleteFusionMatrix();

    }

    generateCompleteFusionMatrix() {
        const elements = Object.keys(this.baseElements);

        // Create fusion recipes for every possible combination
        for (let i = 0; i < elements.length; i++) {
            for (let j = i; j < elements.length; j++) {
                const element1 = elements[i];
                const element2 = elements[j];

                const result = this.determineFusionResult(element1, element2);

                // Add both combinations (A + B and B + A)
                this.fusionRecipes[`${element1} + ${element2}`] = result;
                if (element1 !== element2) {
                    this.fusionRecipes[`${element2} + ${element1}`] = result;
                }
            }
        }
    }

    determineFusionResult(element1, element2) {
        const data1 = this.baseElements[element1];
        const data2 = this.baseElements[element2];

        // If same element, create enhanced version
        if (element1 === element2) {
            return this.getSameElementFusion(element1);
        }

        // Determine result based on tier combination
        const tier1 = data1.tier;
        const tier2 = data2.tier;
        const maxTier = Math.max(tier1, tier2);
        const minTier = Math.min(tier1, tier2);

        // Get fusion result based on element types and tiers
        return this.getElementFusion(element1, element2, tier1, tier2, maxTier, minTier);
    }

    getSameElementFusion(element) {
        const sameElementFusions = {
            // Tier 1 same-element fusions
            'Fire': 'Lava',
            'Water': 'Tide',
            'Earth': 'Stone',
            'Air': 'Gale',
            'Gear': 'Android',
            'Chip': 'AI Core',

            // Tier 2 same-element fusions
            'Lava': 'Molten Core',
            'Steam': 'Cloud',
            'Magma': 'Volcano',
            'Smoke': 'Ash Cloud',
            'Tide': 'Ocean',
            'Mud': 'Clay',
            'Mist': 'Morning Fog',
            'Stone': 'Boulder',
            'Sandstorm': 'Dust Storm',
            'Gale': 'Tornado',
            'Android': 'Cybernetics',
            'Automaton': 'Mechatronics',
            'AI Core': 'Quantum Core',

            // Higher tier same-element fusions
            'Foundry': 'Inferno',
            'Ocean': 'Leviathan',
            'Tornado': 'Tempest Lord',
            'Cybernetics': 'Cyber Dragon',
            'Phoenix': 'Primordial Force',
            'Leviathan': 'World Ender',
            'Titan': 'Genesis Core',
            'Cyber Dragon': 'Omega Protocol',
            'Primordial Force': 'Cosmic Entity',
            'World Ender': 'Reality Shaper'
        };

        return sameElementFusions[element] || this.getGenericUpgrade(element);
    }

    getElementFusion(element1, element2, tier1, tier2, maxTier, minTier) {
        // Predefined fusion combinations for specific pairs
        const specificFusions = {
            'Fire + Water': 'Steam',
            'Fire + Earth': 'Magma',
            'Fire + Air': 'Smoke',
            'Fire + Gear': 'Forge',
            'Fire + Chip': 'Plasma Torch',
            'Water + Earth': 'Mud',
            'Water + Air': 'Mist',
            'Water + Gear': 'Steam Engine',
            'Water + Chip': 'Distillery',
            'Earth + Air': 'Sandstorm',
            'Earth + Gear': 'Boulder',
            'Earth + Chip': 'Clay',
            'Air + Gear': 'Drone',
            'Air + Chip': 'Static Storm',
            'Gear + Chip': 'Automaton',

            // Tier 2 combinations
            'Lava + Steam': 'Inferno',
            'Lava + Magma': 'Molten Core',
            'Steam + Magma': 'Geothermal Plant',
            'Steam + Smoke': 'Vapor Cloud',
            'Magma + Smoke': 'Ash Cloud',
            'Tide + Gale': 'Hurricane',
            'Mud + Mist': 'Morning Fog',
            'Stone + Sandstorm': 'Earthquake',
            'Android + AI Core': 'Cybernetics',
            'Automaton + AI Core': 'Quantum Core',

            // Cross-tier combinations
            'Lava + Fire': 'Foundry',
            'Steam + Water': 'Distillery',
            'Magma + Earth': 'Lava Field',
            'Smoke + Air': 'Ash Cloud',
            'Tide + Water': 'Ocean',
            'Mud + Earth': 'Clay',
            'Mist + Air': 'Vapor Cloud',
            'Stone + Earth': 'Boulder',
            'Gale + Air': 'Tornado',
            'Android + Gear': 'Robot Arm',
            'AI Core + Chip': 'Microprocessor'
        };

        // Check for specific fusion first
        const key1 = `${element1} + ${element2}`;
        const key2 = `${element2} + ${element1}`;

        if (specificFusions[key1]) return specificFusions[key1];
        if (specificFusions[key2]) return specificFusions[key2];

        // Generate fusion based on tier logic
        return this.generateTierBasedFusion(element1, element2, tier1, tier2, maxTier, minTier);
    }

    generateTierBasedFusion(element1, element2, tier1, tier2, maxTier, minTier) {
        // Get all elements of target tier
        const targetTier = Math.min(6, maxTier + 1); // Next tier up, max tier 6
        const targetElements = Object.keys(this.baseElements).filter(name =>
            this.baseElements[name].tier === targetTier
        );

        if (targetElements.length === 0) {
            // If no elements in target tier, return highest tier element
            const highestTierElements = Object.keys(this.baseElements).filter(name =>
                this.baseElements[name].tier === 6
            );
            return highestTierElements[Math.floor(Math.random() * highestTierElements.length)];
        }

        // Select result based on element characteristics
        return this.selectBestFusionResult(element1, element2, targetElements);
    }

    selectBestFusionResult(element1, element2, targetElements) {
        // Categorize elements by type for better fusion logic
        const elementTypes = {
            fire: ['Fire', 'Lava', 'Magma', 'Smoke', 'Foundry', 'Forge', 'Ember Ash', 'Fire Whirl', 'Inferno', 'Molten Core', 'Plasma Torch', 'Phoenix'],
            water: ['Water', 'Steam', 'Tide', 'Mud', 'Mist', 'Geyser', 'Steam Engine', 'Distillery', 'Hot Spring', 'Cloud', 'Steamship', 'Ocean', 'Estuary', 'Sea Breeze', 'Dew', 'Vapor Cloud', 'Sea Spray', 'Leviathan'],
            earth: ['Earth', 'Stone', 'Sandstorm', 'Volcano', 'Lava Field', 'Brick Kiln', 'Clay Pottery', 'Clay', 'Dust Mound', 'Glass', 'Marble', 'Boulder', 'Sandstone', 'Silt', 'Sand', 'Earthquake', 'Titan'],
            air: ['Air', 'Gale', 'Pyroclastic Flow', 'Ash Cloud', 'Morning Fog', 'Dust Devil', 'Tornado', 'Hurricane', 'Tempest Lord'],
            tech: ['Gear', 'Chip', 'Android', 'Automaton', 'AI Core', 'Robot Arm', 'Drone', 'Gearbox', 'Smartwatch', 'Mechatronics', 'Microprocessor', 'Cybernetics', 'Quantum Core', 'Mechanical Beast', 'Cyber Dragon', 'Quantum Beast', 'Omega Protocol'],
            energy: ['Plasma Torch', 'Thunderstorm', 'Electromagnet', 'Static Storm', 'Lightning Storm', 'Storm King'],
            ultimate: ['Primordial Force', 'World Ender', 'Genesis Core', 'Cosmic Entity', 'Reality Shaper', 'Elemental Avatar']
        };

        // Find types of input elements
        const type1 = this.getElementType(element1, elementTypes);
        const type2 = this.getElementType(element2, elementTypes);

        // Filter target elements by compatible types
        let compatibleElements = targetElements.filter(element => {
            const elementType = this.getElementType(element, elementTypes);
            return elementType === type1 || elementType === type2 || elementType === 'ultimate';
        });

        if (compatibleElements.length === 0) {
            compatibleElements = targetElements;
        }

        // Return a random compatible element
        return compatibleElements[Math.floor(Math.random() * compatibleElements.length)];
    }

    getElementType(element, elementTypes) {
        for (const [type, elements] of Object.entries(elementTypes)) {
            if (elements.includes(element)) {
                return type;
            }
        }
        return 'neutral';
    }

    getGenericUpgrade(element) {
        const data = this.baseElements[element];
        const nextTier = Math.min(6, data.tier + 1);

        const nextTierElements = Object.keys(this.baseElements).filter(name =>
            this.baseElements[name].tier === nextTier
        );

        if (nextTierElements.length > 0) {
            return nextTierElements[Math.floor(Math.random() * nextTierElements.length)];
        }

        return element; // Return same element if no upgrade available
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
        document.getElementById('extract-btn').addEventListener('click', () => this.extractAlchemyResult());
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

        // Set up alchemy slots
        this.setupAlchemySlots();
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

    setupAlchemySlots() {
        const alchemySlots = document.querySelectorAll('.alchemy-slot');
        alchemySlots.forEach((slot, index) => {
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
                this.addToAlchemySlot(elementId, index);
            });
        });
    }

    addToAlchemySlot(elementId, slotIndex) {
        const element = this.board.find(e => e.id == elementId);

        if (element && !this.alchemySlots[slotIndex]) {
            // Create a drained version of the element
            const drainedElement = {
                ...element,
                attack: 0,
                health: 0,
                isDrained: true
            };

            this.alchemySlots[slotIndex] = drainedElement;
            this.alchemyElements.push(element.name);

            // Remove from board
            this.board = this.board.filter(e => e.id != elementId);

            this.updateDisplay();
            this.updateAlchemyApparatus();
            this.checkAlchemyReady();
            this.playSound('click');
            this.log(`Added ${element.name} to alchemy lab (stats drained)`);
        }
    }

    updateAlchemyApparatus() {
        const filledSlots = this.alchemySlots.filter(slot => slot !== null).length;
        const flaskLiquid = document.getElementById('flask-liquid');
        const alchemyCount = document.getElementById('alchemy-count');
        const progressFill = document.getElementById('alchemy-progress');

        if (flaskLiquid && alchemyCount) {
            // Update counter with animation
            alchemyCount.textContent = filledSlots;

            // Update progress bar
            if (progressFill) {
                const progressPercent = (filledSlots / 5) * 100;
                progressFill.style.width = `${progressPercent}%`;
            }

            // Update liquid level (20% per element)
            const liquidHeight = (filledSlots / 5) * 100;
            flaskLiquid.style.height = `${liquidHeight}%`;

            // Update liquid color based on elements
            const liquidColor = this.getAlchemyColor();
            flaskLiquid.style.background = liquidColor;

            // Add visual feedback for progress
            if (filledSlots > 0) {
                flaskLiquid.style.boxShadow = `
                    0 0 ${10 + filledSlots * 4}px rgba(155, 89, 182, ${0.3 + filledSlots * 0.1}),
                    inset 0 2px 10px rgba(255, 255, 255, 0.2)
                `;
            }

            // Trigger apparatus glow when full
            const apparatus = document.querySelector('.alchemy-apparatus');
            if (apparatus) {
                if (filledSlots === 5) {
                    apparatus.classList.add('apparatus-ready');
                } else {
                    apparatus.classList.remove('apparatus-ready');
                }
            }
        }
    }

    getAlchemyColor() {
        if (this.alchemyElements.length === 0) {
            return 'linear-gradient(45deg, #4ecdc4, #44a08d)';
        }

        // Color based on dominant element types
        const elementTypes = {
            fire: ['Fire', 'Lava', 'Magma', 'Smoke', 'Foundry', 'Forge', 'Ember Ash', 'Fire Whirl', 'Inferno', 'Molten Core', 'Plasma Torch', 'Phoenix'],
            water: ['Water', 'Steam', 'Tide', 'Mud', 'Mist', 'Geyser', 'Steam Engine', 'Distillery', 'Hot Spring', 'Cloud', 'Steamship', 'Ocean', 'Leviathan'],
            earth: ['Earth', 'Stone', 'Sandstorm', 'Volcano', 'Boulder', 'Clay', 'Glass', 'Marble', 'Sand', 'Earthquake', 'Titan'],
            air: ['Air', 'Gale', 'Tornado', 'Hurricane', 'Tempest Lord'],
            tech: ['Gear', 'Chip', 'Android', 'Automaton', 'AI Core', 'Drone', 'Cybernetics', 'Cyber Dragon', 'Omega Protocol'],
            energy: ['Lightning Storm', 'Static Storm', 'Thunderstorm', 'Storm King']
        };

        const typeCounts = { fire: 0, water: 0, earth: 0, air: 0, tech: 0, energy: 0 };

        this.alchemyElements.forEach(elementName => {
            for (const [type, elements] of Object.entries(elementTypes)) {
                if (elements.includes(elementName)) {
                    typeCounts[type]++;
                    break;
                }
            }
        });

        const dominantType = Object.keys(typeCounts).reduce((a, b) =>
            typeCounts[a] > typeCounts[b] ? a : b
        );

        const colors = {
            fire: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            water: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
            earth: 'linear-gradient(45deg, #8b4513, #a0522d)',
            air: 'linear-gradient(45deg, #87ceeb, #4682b4)',
            tech: 'linear-gradient(45deg, #9b59b6, #8e44ad)',
            energy: 'linear-gradient(45deg, #ffd700, #ffed4e)'
        };

        return colors[dominantType] || 'linear-gradient(45deg, #4ecdc4, #44a08d)';
    }

    checkAlchemyReady() {
        const filledSlots = this.alchemySlots.filter(slot => slot !== null).length;
        const extractBtn = document.getElementById('extract-btn');

        if (extractBtn) {
            extractBtn.disabled = filledSlots < 5;
        }
    }

    extractAlchemyResult() {
        if (this.alchemySlots.filter(slot => slot !== null).length < 5) {
            return;
        }

        // Add extraction animation
        this.playExtractionAnimation();

        // Determine tier 5 result based on input elements
        const result = this.determineAlchemyResult();
        const newElement = this.createElement(result);

        // Add to board with special effect
        setTimeout(() => {
            this.board.push(newElement);

            // Clear alchemy slots
            this.alchemySlots = [null, null, null, null, null];
            this.alchemyElements = [];

            this.updateDisplay();
            this.updateAlchemyApparatus();
            this.checkAlchemyReady();
            this.playSound('fusion');
            this.log(`🧬 Alchemy extraction complete! Created legendary ${result}!`);
            this.showNotification(`🧬 Legendary Created: ${result}!`, 'success');

            // Add special particle effect
            this.createAlchemyParticles();
        }, 1500);
    }

    playExtractionAnimation() {
        const extractBtn = document.getElementById('extract-btn');
        const apparatus = document.querySelector('.alchemy-apparatus');

        if (extractBtn) {
            extractBtn.disabled = true;
            extractBtn.textContent = '🧬 EXTRACTING...';
            extractBtn.style.animation = 'extracting 1.5s ease-in-out';
        }

        if (apparatus) {
            apparatus.style.animation = 'extraction 1.5s ease-in-out';
        }

        // Reset after animation
        setTimeout(() => {
            if (extractBtn) {
                extractBtn.textContent = '🧬 EXTRACT ESSENCE';
                extractBtn.style.animation = '';
            }
            if (apparatus) {
                apparatus.style.animation = '';
            }
        }, 1500);
    }

    createAlchemyParticles() {
        // Create visual particle burst effect
        const apparatus = document.querySelector('.alchemy-apparatus');
        if (!apparatus) return;

        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'alchemy-particle';
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: radial-gradient(circle, #9b59b6, #e1bee7);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: particleBurst 2s ease-out forwards;
                animation-delay: ${i * 0.1}s;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            `;

            apparatus.appendChild(particle);

            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000 + i * 100);
        }
    }

    determineAlchemyResult() {
        // Get all tier 5 elements
        const tier5Elements = Object.keys(this.baseElements).filter(name =>
            this.baseElements[name].tier === 5
        );

        if (tier5Elements.length === 0) {
            return 'Phoenix'; // Fallback
        }

        // Use the same type-based logic as fusion
        return this.selectBestFusionResult('', '', tier5Elements);
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
        // Clear drained elements from alchemy
        this.clearDrainedElements();

        this.showBattleScreen();
    }

    clearDrainedElements() {
        // Remove any drained elements that are still on the board
        this.board = this.board.filter(element => !element.isDrained);

        // Clear alchemy slots
        this.alchemySlots = [null, null, null, null, null];
        this.alchemyElements = [];

        this.updateDisplay();
        this.updateAlchemyApparatus();
        this.checkAlchemyReady();

        if (this.alchemyElements.length > 0) {
            this.log('Alchemy elements cleared at turn end');
        }
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
        this.alchemySlots = [null, null, null, null, null];
        this.alchemyElements = [];
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

        // Update alchemy slots
        document.querySelectorAll('.alchemy-slot').forEach((slot, index) => {
            if (this.alchemySlots[index]) {
                const element = this.alchemySlots[index];
                const elementData = this.baseElements[element.name];
                const emoji = elementData ? elementData.emoji : '❓';
                slot.innerHTML = `<div class="slot-emoji">${emoji}</div>`;
                slot.classList.add('filled');
            } else {
                slot.innerHTML = `<div class="slot-number">${index + 1}</div>`;
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