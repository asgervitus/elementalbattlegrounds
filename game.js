class FusionBattlegrounds {
    constructor() {
        this.gameState = 'loading';
        this.gold = 3;
        this.turn = 1;
        this.health = 40;
        this.maxHealth = 40;
        this.board = [];  // Only board, no hand
        this.shop = [];
        this.selectedElements = []; // For click-to-fuse system
        this.alchemySlots = [null, null, null, null, null]; // 5 alchemy slots
        this.alchemyElements = []; // Track element types for coloring
        this.shopTier = 1;
        this.sellMode = false; // For selling units
        this.currentPage = 'game'; // 'game' or 'alchemy'

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
            'Fire': {
                attack: 3, health: 2, cost: 3, tier: 1, emoji: '🔥',
                passive: 'Ignite: Deals 1 damage to all enemies at start of battle'
            },
            'Water': {
                attack: 2, health: 3, cost: 3, tier: 1, emoji: '💧',
                passive: 'Healing Flow: Heals adjacent allies for 1 HP each turn'
            },
            'Earth': {
                attack: 2, health: 4, cost: 3, tier: 1, emoji: '🌍',
                passive: 'Fortify: Gains +1 health when another Earth element is played'
            },
            'Air': {
                attack: 4, health: 1, cost: 3, tier: 1, emoji: '💨',
                passive: 'Swift Strike: Attacks first in battle, ignoring enemy armor'
            },
            'Gear': {
                attack: 3, health: 3, cost: 3, tier: 1, emoji: '⚙️',
                passive: 'Mechanical Synergy: +1 attack for each Tech element in army'
            },
            'Chip': {
                attack: 4, health: 2, cost: 3, tier: 1, emoji: '💾',
                passive: 'Data Processing: Reveals enemy army composition before battle'
            },

            // Tier 2 - Basic Fusions (All cost 3 gold)
            'Lava': {
                attack: 6, health: 3, cost: 3, tier: 2, emoji: '🌋',
                passive: 'Molten Armor: Reflects 2 damage back to attackers'
            },
            'Steam': {
                attack: 3, health: 4, cost: 3, tier: 2, emoji: '♨️',
                passive: 'Obscuring Mist: Reduces enemy accuracy by 25%'
            },
            'Magma': {
                attack: 5, health: 4, cost: 3, tier: 2, emoji: '🗻',
                passive: 'Eruption: When destroyed, deals 3 damage to random enemy'
            },
            'Smoke': {
                attack: 4, health: 3, cost: 3, tier: 2, emoji: '💨',
                passive: 'Choking Cloud: Reduces enemy attack by 1 for 2 turns'
            },
            'Tide': {
                attack: 4, health: 5, cost: 3, tier: 2, emoji: '🌊',
                passive: 'Tidal Force: Gains +2 attack when army has 5+ elements'
            },
            'Mud': {
                attack: 3, health: 5, cost: 3, tier: 2, emoji: '🟫',
                passive: 'Sticky Trap: Slows enemy attacks, they strike last'
            },
            'Mist': {
                attack: 3, health: 4, cost: 3, tier: 2, emoji: '🌫️',
                passive: 'Phantom Form: 50% chance to avoid physical attacks'
            },
            'Stone': {
                attack: 3, health: 7, cost: 3, tier: 2, emoji: '🪨',
                passive: 'Immovable: Cannot be targeted by single-target abilities'
            },
            'Sandstorm': {
                attack: 5, health: 4, cost: 3, tier: 2, emoji: '🏜️',
                passive: 'Blinding Sands: Reduces all enemy accuracy by 15%'
            },
            'Gale': {
                attack: 6, health: 2, cost: 3, tier: 2, emoji: '🌪️',
                passive: 'Wind Boost: Increases ally speed, they attack first'
            },
            'Android': {
                attack: 5, health: 5, cost: 3, tier: 2, emoji: '🤖',
                passive: 'Self-Repair: Heals 2 HP at the end of each turn'
            },
            'Automaton': {
                attack: 4, health: 6, cost: 3, tier: 2, emoji: '🦾',
                passive: 'Adaptive Learning: Gains +1 attack after each battle survived'
            },
            'AI Core': {
                attack: 7, health: 3, cost: 3, tier: 2, emoji: '🧠',
                passive: 'Tactical Analysis: Reveals optimal fusion combinations'
            },

            // Tier 3 - Advanced Fusions (All cost 3 gold)
            'Foundry': {
                attack: 8, health: 6, cost: 3, tier: 3, emoji: '🏭',
                passive: 'Mass Production: Creates a random Tier 1 element every 3 turns'
            },
            'Geyser': {
                attack: 6, health: 7, cost: 3, tier: 3, emoji: '⛲',
                passive: 'Pressure Burst: Deals double damage every 4th attack'
            },
            'Volcano': {
                attack: 9, health: 5, cost: 3, tier: 3, emoji: '🌋',
                passive: 'Volcanic Ash: Reduces enemy vision, -2 accuracy to all enemies'
            },
            'Pyroclastic Flow': {
                attack: 10, health: 4, cost: 3, tier: 3, emoji: '☄️',
                passive: 'Devastating Rush: Deals splash damage to 2 additional enemies'
            },
            'Steam Engine': {
                attack: 7, health: 7, cost: 3, tier: 3, emoji: '🚂',
                passive: 'Momentum: Gains +1 attack each turn, resets when damaged'
            },
            'Distillery': {
                attack: 5, health: 8, cost: 3, tier: 3, emoji: '🥃',
                passive: 'Purification: Cleanses all debuffs from allies each turn'
            },
            'Hot Spring': {
                attack: 4, health: 9, cost: 3, tier: 3, emoji: '♨️',
                passive: 'Rejuvenation: All allies regenerate 1 HP per turn'
            },
            'Cloud': {
                attack: 6, health: 6, cost: 3, tier: 3, emoji: '☁️',
                passive: 'Lightning Rod: 25% chance to strike random enemy for 4 damage'
            },
            'Forge': {
                attack: 8, health: 7, cost: 3, tier: 3, emoji: '⚒️',
                passive: 'Weapon Crafting: Grants +2 attack to a random ally each turn'
            },
            'Geothermal Plant': {
                attack: 7, health: 8, cost: 3, tier: 3, emoji: '⚡',
                passive: 'Energy Surge: Doubles the effect of all ally passives for 1 turn'
            },
            'Lava Field': {
                attack: 9, health: 6, cost: 3, tier: 3, emoji: '🌋',
                passive: 'Scorched Earth: Enemies take 1 damage when entering battle'
            },
            'Ash Cloud': {
                attack: 6, health: 7, cost: 3, tier: 3, emoji: '🌫️',
                passive: 'Toxic Atmosphere: Poisons all enemies for 2 damage per turn'
            },
            'Plasma Torch': {
                attack: 12, health: 4, cost: 3, tier: 3, emoji: '🔥',
                passive: 'Plasma Burn: Ignores armor and shields, pure damage'
            },
            'Thunderstorm': {
                attack: 8, health: 8, cost: 3, tier: 3, emoji: '⛈️',
                passive: 'Chain Lightning: Each attack has 30% chance to hit 2 more enemies'
            },
            'Electromagnet': {
                attack: 7, health: 9, cost: 3, tier: 3, emoji: '🧲',
                passive: 'Magnetic Field: Pulls enemy projectiles, reducing ranged damage by 50%'
            },
            'Static Storm': {
                attack: 10, health: 6, cost: 3, tier: 3, emoji: '🌩️',
                passive: 'Overcharge: Stuns enemy for 1 turn when dealing critical damage'
            },
            'Steamship': {
                attack: 6, health: 10, cost: 3, tier: 3, emoji: '🚢',
                passive: 'Naval Superiority: +3 attack when fighting near Water elements'
            },
            'Ocean': {
                attack: 5, health: 12, cost: 3, tier: 3, emoji: '🌊',
                passive: 'Tidal Waves: Heals all Water allies for 2 HP when taking damage'
            },
            'Estuary': {
                attack: 7, health: 9, cost: 3, tier: 3, emoji: '🏞️',
                passive: 'Ecosystem: Provides +1 health to all allies permanently'
            },
            'Sea Breeze': {
                attack: 8, health: 7, cost: 3, tier: 3, emoji: '🌬️',
                passive: 'Refreshing Wind: Removes 1 debuff from all allies each turn'
            },
            'Brick Kiln': {
                attack: 6, health: 9, cost: 3, tier: 3, emoji: '🧱',
                passive: 'Hardened Structure: Gains +1 defense for each turn survived'
            },
            'Clay Pottery': {
                attack: 5, health: 10, cost: 3, tier: 3, emoji: '🏺',
                passive: 'Ancient Wisdom: Stores knowledge, grants +1 XP to all allies'
            },
            'Clay': {
                attack: 4, health: 11, cost: 3, tier: 3, emoji: '🟫',
                passive: 'Moldable Form: Can copy the passive of any adjacent ally'
            },
            'Dust Mound': {
                attack: 7, health: 8, cost: 3, tier: 3, emoji: '🏜️',
                passive: 'Erosion: Gradually reduces enemy armor by 1 each turn'
            },
            'Sauna': {
                attack: 6, health: 8, cost: 3, tier: 3, emoji: '🧖',
                passive: 'Relaxation: Removes all stress debuffs and grants +2 morale'
            },
            'Dew': {
                attack: 4, health: 9, cost: 3, tier: 3, emoji: '💧',
                passive: 'Morning Refresh: Restores 1 mana to all allies at dawn'
            },
            'Morning Fog': {
                attack: 5, health: 8, cost: 3, tier: 3, emoji: '🌁',
                passive: 'Concealment: Grants stealth to all allies for first turn'
            },
            'Vapor Cloud': {
                attack: 6, health: 7, cost: 3, tier: 3, emoji: '🌫️',
                passive: 'Gaseous Form: Can pass through enemies to attack backline'
            },
            'Glass': {
                attack: 8, health: 6, cost: 3, tier: 3, emoji: '🔮',
                passive: 'Fragile Power: +4 attack but takes double damage from physical attacks'
            },
            'Marble': {
                attack: 6, health: 10, cost: 3, tier: 3, emoji: '🎱',
                passive: 'Artistic Inspiration: Boosts all ally abilities by 25%'
            },
            'Boulder': {
                attack: 5, health: 12, cost: 3, tier: 3, emoji: '🪨',
                passive: 'Avalanche: When destroyed, deals damage equal to remaining health'
            },
            'Sandstone': {
                attack: 7, health: 9, cost: 3, tier: 3, emoji: '🏖️',
                passive: 'Time Erosion: Ages enemies, reducing their max health by 1 per turn'
            },
            'Ember Ash': {
                attack: 9, health: 5, cost: 3, tier: 3, emoji: '🔥',
                passive: 'Smoldering: Continues burning enemies for 2 turns after death'
            },
            'Silt': {
                attack: 4, health: 10, cost: 3, tier: 3, emoji: '🟫',
                passive: 'Fertile Ground: Spawns a Tier 1 element when reaching 0 health'
            },
            'Sand': {
                attack: 6, health: 8, cost: 3, tier: 3, emoji: '🏖️',
                passive: 'Shifting Sands: Randomly teleports around battlefield, hard to hit'
            },
            'Dust Devil': {
                attack: 8, health: 6, cost: 3, tier: 3, emoji: '🌪️',
                passive: 'Whirlwind: Attacks all enemies in a spinning motion'
            },
            'Fire Whirl': {
                attack: 11, health: 5, cost: 3, tier: 3, emoji: '🌪️🔥',
                passive: 'Burning Vortex: Pulls enemies in and burns them for 3 damage per turn'
            },
            'Sea Spray': {
                attack: 7, health: 7, cost: 3, tier: 3, emoji: '💦',
                passive: 'Salt Corrosion: Reduces enemy weapon effectiveness by 2 each turn'
            },
            'Dust Storm': {
                attack: 9, health: 6, cost: 3, tier: 3, emoji: '🌪️💨',
                passive: 'Blinding Fury: Causes all enemies to miss their next attack'
            },
            'Tornado': {
                attack: 12, health: 4, cost: 3, tier: 3, emoji: '🌪️',
                passive: 'Devastating Winds: Destroys enemy projectiles and barriers'
            },
            'Robot Arm': {
                attack: 8, health: 8, cost: 3, tier: 3, emoji: '🦾',
                passive: 'Precision Strike: Critical hits have 100% accuracy and +5 damage'
            },
            'Drone': {
                attack: 9, health: 6, cost: 3, tier: 3, emoji: '🚁',
                passive: 'Aerial Reconnaissance: Reveals enemy weaknesses, +3 damage to weak spots'
            },
            'Gearbox': {
                attack: 7, health: 9, cost: 3, tier: 3, emoji: '⚙️',
                passive: 'Gear Ratio: Converts speed into power, +1 attack per turn'
            },
            'Smartwatch': {
                attack: 6, health: 8, cost: 3, tier: 3, emoji: '⌚',
                passive: 'Time Management: Grants extra turn every 5 rounds'
            },
            'Mechatronics': {
                attack: 10, health: 7, cost: 3, tier: 3, emoji: '🤖⚙️',
                passive: 'Hybrid Systems: Combines all Tech passives in simplified form'
            },
            'Microprocessor': {
                attack: 11, health: 5, cost: 3, tier: 3, emoji: '💻',
                passive: 'Overclocking: Doubles attack speed but takes 1 damage per turn'
            },

            // Tier 4 - Master Fusions (All cost 3 gold)
            'Inferno': {
                attack: 15, health: 8, cost: 3, tier: 4, emoji: '🔥🌋',
                passive: 'Hellfire: Burns all enemies for 3 damage per turn, spreads on death'
            },
            'Tsunami': {
                attack: 12, health: 12, cost: 3, tier: 4, emoji: '🌊🌪️',
                passive: 'Overwhelming Force: Pushes enemies back, preventing counterattacks'
            },
            'Earthquake': {
                attack: 10, health: 15, cost: 3, tier: 4, emoji: '🌍💥',
                passive: 'Seismic Shock: Stuns all enemies for 1 turn when entering battle'
            },
            'Hurricane': {
                attack: 14, health: 9, cost: 3, tier: 4, emoji: '🌪️⛈️',
                passive: 'Eye of Storm: Immune to all debuffs, grants immunity to allies'
            },
            'Cybernetics': {
                attack: 13, health: 11, cost: 3, tier: 4, emoji: '🤖🧠',
                passive: 'Neural Network: Shares damage taken equally among all Tech allies'
            },
            'Quantum Core': {
                attack: 16, health: 7, cost: 3, tier: 4, emoji: '⚛️💎',
                passive: 'Quantum Entanglement: When attacked, teleports damage to random enemy'
            },
            'Plasma Storm': {
                attack: 18, health: 6, cost: 3, tier: 4, emoji: '⚡🌩️',
                passive: 'Ionic Discharge: Each attack charges up, every 3rd attack hits all enemies'
            },
            'Tidal Wave': {
                attack: 14, health: 10, cost: 3, tier: 4, emoji: '🌊💥',
                passive: 'Crushing Depths: Deals bonus damage equal to enemy missing health'
            },
            'Molten Core': {
                attack: 16, health: 9, cost: 3, tier: 4, emoji: '🌋🔥',
                passive: 'Nuclear Fusion: Explodes when destroyed, dealing 8 damage to all enemies'
            },
            'Lightning Storm': {
                attack: 17, health: 7, cost: 3, tier: 4, emoji: '⚡⛈️',
                passive: 'Thunderous Roar: Intimidates enemies, reducing their attack by 3'
            },
            'Crystal Formation': {
                attack: 11, health: 14, cost: 3, tier: 4, emoji: '💎🔮',
                passive: 'Prismatic Shield: Reflects 50% of magic damage back to caster'
            },
            'Mechanical Beast': {
                attack: 15, health: 10, cost: 3, tier: 4, emoji: '🤖🦾',
                passive: 'Rampage Protocol: Gains +2 attack for each enemy destroyed this battle'
            },

            // Tier 5 - Legendary Fusions (All cost 3 gold)
            'Phoenix': {
                attack: 20, health: 12, cost: 3, tier: 5, emoji: '🔥🦅',
                passive: 'Rebirth: When destroyed, revives with 50% health and +5 attack'
            },
            'Leviathan': {
                attack: 18, health: 15, cost: 3, tier: 5, emoji: '🌊🐉',
                passive: 'Ancient Wisdom: Grants all allies +2 attack and immunity to fear'
            },
            'Titan': {
                attack: 16, health: 18, cost: 3, tier: 5, emoji: '🌍⛰️',
                passive: 'Colossal Presence: Reduces all incoming damage by 3, minimum 1'
            },
            'Tempest Lord': {
                attack: 22, health: 10, cost: 3, tier: 5, emoji: '🌪️👑',
                passive: 'Storm Command: Controls weather, all attacks become lightning (ignore armor)'
            },
            'Cyber Dragon': {
                attack: 19, health: 14, cost: 3, tier: 5, emoji: '🤖🐉',
                passive: 'Digital Evolution: Upgrades a random ally to next tier each turn'
            },
            'Quantum Beast': {
                attack: 24, health: 8, cost: 3, tier: 5, emoji: '⚛️🦾',
                passive: 'Probability Manipulation: 40% chance to negate any attack against allies'
            },
            'Elemental Avatar': {
                attack: 20, health: 15, cost: 3, tier: 5, emoji: '🌟👤',
                passive: 'Elemental Mastery: Gains the passive abilities of all elements in army'
            },
            'Storm King': {
                attack: 23, health: 11, cost: 3, tier: 5, emoji: '⚡👑',
                passive: 'Divine Lightning: Each attack has 50% chance to instantly destroy enemy'
            },

            // Tier 6 - Ultimate Fusions (All cost 3 gold)
            'Primordial Force': {
                attack: 30, health: 20, cost: 3, tier: 6, emoji: '🌌💫',
                passive: 'Creation Genesis: Resurrects all destroyed allies with full health each turn'
            },
            'World Ender': {
                attack: 35, health: 15, cost: 3, tier: 6, emoji: '💀🌍',
                passive: 'Apocalypse: Each attack permanently reduces enemy max health by 2'
            },
            'Genesis Core': {
                attack: 25, health: 25, cost: 3, tier: 6, emoji: '⭐🌟',
                passive: 'Reality Rewrite: Can change any ally into any other element once per turn'
            },
            'Omega Protocol': {
                attack: 40, health: 10, cost: 3, tier: 6, emoji: '🤖👑',
                passive: 'System Override: Takes control of enemy element for 2 turns'
            },
            'Cosmic Entity': {
                attack: 32, health: 18, cost: 3, tier: 6, emoji: '🌌👁️',
                passive: 'Omnipresence: Exists in all dimensions, cannot be targeted or damaged'
            },
            'Reality Shaper': {
                attack: 28, health: 22, cost: 3, tier: 6, emoji: '🔮🌟',
                passive: 'Divine Intervention: Rewrites battle rules, wins automatically after 3 turns'
            }
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


        document.getElementById('extract-btn').addEventListener('click', () => this.extractAlchemyResult());
        document.getElementById('alchemy-btn').addEventListener('click', () => this.openAlchemyPage());
        document.getElementById('close-alchemy-btn').addEventListener('click', () => this.closeAlchemyPage());
        document.getElementById('sell-mode-btn').addEventListener('click', () => this.toggleSellMode());
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

        // Set up board drop zone
        this.setupBoardDropZone();

        // Set up alchemy slots
        this.setupAlchemySlots();
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

    selectElementForFusion(elementId) {
        const element = this.board.find(e => e.id == elementId);
        if (!element) return;

        // Check if element is already selected
        const selectedIndex = this.selectedElements.findIndex(e => e.id == elementId);

        if (selectedIndex !== -1) {
            // Deselect element
            this.selectedElements.splice(selectedIndex, 1);
            this.updateElementSelection();
            this.playSound('click');
            return;
        }

        // Add to selection
        this.selectedElements.push(element);

        // If we have 2 elements selected, attempt fusion
        if (this.selectedElements.length === 2) {
            this.performDirectFusion();
        } else if (this.selectedElements.length > 2) {
            // Keep only the last 2 selected
            this.selectedElements = this.selectedElements.slice(-2);
            this.performDirectFusion();
        }

        this.updateElementSelection();
        this.playSound('click');
    }

    performDirectFusion() {
        if (this.selectedElements.length !== 2) return;

        const element1 = this.selectedElements[0];
        const element2 = this.selectedElements[1];

        // Check if both elements are still on the board
        const boardElement1 = this.board.find(e => e.id == element1.id);
        const boardElement2 = this.board.find(e => e.id == element2.id);

        if (!boardElement1 || !boardElement2) {
            this.selectedElements = [];
            this.updateElementSelection();
            return;
        }

        // Get fusion result
        const recipe1 = `${element1.name} + ${element2.name}`;
        const recipe2 = `${element2.name} + ${element1.name}`;
        const result = this.fusionRecipes[recipe1] || this.fusionRecipes[recipe2];

        if (result && this.baseElements[result]) {
            // Remove the two elements from board
            this.board = this.board.filter(e => e.id !== element1.id && e.id !== element2.id);

            // Create new fused element
            const newElement = this.createElement(result);
            this.board.push(newElement);

            // Clear selection
            this.selectedElements = [];

            this.updateDisplay();
            this.playSound('fusion');
            this.log(`Fused ${element1.name} + ${element2.name} = ${result}!`);
            this.showNotification(`Fusion Success: ${result}!`, 'success');

            // Add fusion particle effect
            this.createFusionParticles();
        } else {
            // Fusion failed
            this.selectedElements = [];
            this.updateElementSelection();
            this.log(`No fusion recipe for ${element1.name} + ${element2.name}`);
            this.showNotification('Fusion failed - no recipe found!', 'error');
        }
    }

    updateElementSelection() {
        // Update visual selection on all board elements
        const boardCards = document.querySelectorAll('#board-elements .element-card');
        boardCards.forEach(card => {
            const elementId = parseInt(card.dataset.elementId);
            const isSelected = this.selectedElements.some(e => e.id === elementId);

            if (isSelected) {
                card.classList.add('selected-for-fusion');
            } else {
                card.classList.remove('selected-for-fusion');
            }
        });
    }

    createFusionParticles() {
        // Create visual particle effect for successful fusion
        const boardSection = document.getElementById('board-elements');
        if (!boardSection) return;

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'fusion-particle';
            particle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: radial-gradient(circle, #4ecdc4, #44a08d);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: fusionBurst 1.5s ease-out forwards;
                animation-delay: ${i * 0.1}s;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            `;

            boardSection.appendChild(particle);

            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1500 + i * 100);
        }
    }

    openAlchemyPage() {
        this.currentPage = 'alchemy';
        document.getElementById('game-interface').classList.add('hidden');
        document.getElementById('alchemy-page').classList.remove('hidden');
        this.updateAlchemyDisplay();
        this.playSound('click');
    }

    closeAlchemyPage() {
        this.currentPage = 'game';
        document.getElementById('alchemy-page').classList.add('hidden');
        document.getElementById('game-interface').classList.remove('hidden');
        this.updateDisplay();
        this.playSound('click');
    }

    toggleSellMode() {
        this.sellMode = !this.sellMode;
        const sellBtn = document.getElementById('sell-mode-btn');
        const instruction = document.getElementById('army-instruction');

        if (this.sellMode) {
            sellBtn.textContent = '❌ Cancel Sell';
            sellBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
            instruction.textContent = 'Click elements to sell them for 2 gold each';
            instruction.classList.add('sell-mode');
        } else {
            sellBtn.textContent = '💰 Sell Mode';
            sellBtn.style.background = '';
            instruction.textContent = 'Click two elements to fuse them together';
            instruction.classList.remove('sell-mode');
        }

        this.updateDisplay();
        this.playSound('click');
    }

    sellElement(elementId) {
        const element = this.board.find(e => e.id == elementId);
        if (element) {
            this.board = this.board.filter(e => e.id != elementId);
            this.gold += 2; // Sell for 2 gold
            this.updateDisplay();
            this.playSound('buy');
            this.log(`Sold ${element.name} for 2 gold`);
            this.showNotification(`Sold ${element.name} for 2 gold`, 'success');
        }
    }

    updateAlchemyDisplay() {
        // Update army display in alchemy page
        const alchemyBoardContainer = document.getElementById('alchemy-board-elements');
        alchemyBoardContainer.innerHTML = '';
        this.board.forEach(element => {
            alchemyBoardContainer.appendChild(this.createElementCard(element, 'alchemy-board'));
        });

        // Update alchemy apparatus
        this.updateAlchemyApparatus();
        this.checkAlchemyReady();
    }
    
    generateShop() {
        this.shop = [];
        // Tier progression: 1-2 turns = tier 1, 3-5 = tier 2, 6-8 = tier 3, 9-12 = tier 4, 13-16 = tier 5, 17+ = tier 6
        this.shopTier = Math.min(6, Math.floor((this.turn - 1) / 2.5) + 1);

        const availableElements = Object.keys(this.baseElements).filter(name =>
            this.baseElements[name].tier <= this.shopTier
        );

        // Generate only 3 shop slots
        for (let i = 0; i < 3; i++) {
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
            this.shop = this.shop.filter(e => e.id != elementId); // Remove from shop, don't replace
            this.updateDisplay();
            this.playSound('buy');
            this.log(`Bought ${element.name} for ${element.cost} gold`);
        }
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
        this.selectedElements = [];
        this.alchemySlots = [null, null, null, null, null];
        this.alchemyElements = [];
        this.sellMode = false;
        this.currentPage = 'game';

    }
    
    createElementCard(element, container) {
        const card = document.createElement('div');
        card.className = `element-card tier-${element.tier}`;
        card.draggable = true;
        card.dataset.elementId = element.id;
        
        const elementData = this.baseElements[element.name];
        const emoji = elementData ? elementData.emoji : '❓';

        const passive = elementData ? elementData.passive : 'No passive ability';
        const passiveTitle = passive.split(':')[0];
        const passiveDescription = passive.split(':')[1] || '';

        card.innerHTML = `
            <div class="element-cost">${element.cost}</div>
            <div class="element-tier">T${element.tier}</div>
            <div class="element-emoji">${emoji}</div>
            <div class="element-name">${element.name}</div>
            <div class="element-stats">
                <div class="element-attack">${element.attack} ATK</div>
                <div class="element-health">${element.health} HP</div>
            </div>
            <div class="element-passive" title="${passive}">
                💫 ${passiveTitle}
            </div>
        `;
        
        if (container === 'shop') {
            card.addEventListener('click', () => this.buyElement(element.id));
        } else if (container === 'board' || container === 'alchemy-board') {
            card.addEventListener('click', () => {
                if (this.sellMode) {
                    this.sellElement(element.id);
                } else {
                    this.selectElementForFusion(element.id);
                }
            });
        }
        
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
            const card = this.createElementCard(element, 'board');
            if (this.sellMode) {
                card.classList.add('sell-mode');
            }
            boardContainer.appendChild(card);
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