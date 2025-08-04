class FusionBattlegrounds {
    constructor() {
        this.gameState = 'loading';
        this.gold = 3;
        this.turn = 1;
        this.health = 40;
        this.maxHealth = 40;
        this.hand = [];
        this.board = [];
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
            'Fire': { attack: 3, health: 2, cost: 2, tier: 1 },
            'Water': { attack: 2, health: 3, cost: 2, tier: 1 },
            'Earth': { attack: 2, health: 4, cost: 3, tier: 1 },
            'Air': { attack: 4, health: 1, cost: 2, tier: 1 },
            'Steam': { attack: 3, health: 4, cost: 4, tier: 2 },
            'Mud': { attack: 3, health: 5, cost: 4, tier: 2 },
            'Dust': { attack: 5, health: 3, cost: 4, tier: 2 },
            'Lava': { attack: 6, health: 3, cost: 5, tier: 2 },
            'Plant': { attack: 4, health: 6, cost: 6, tier: 3 },
            'Metal': { attack: 5, health: 7, cost: 7, tier: 3 },
            'Energy': { attack: 7, health: 4, cost: 6, tier: 3 },
            'Stone': { attack: 3, health: 9, cost: 6, tier: 3 },
            'Life': { attack: 6, health: 8, cost: 8, tier: 4 },
            'Lightning': { attack: 10, health: 5, cost: 8, tier: 4 },
            'Ice': { attack: 5, health: 10, cost: 8, tier: 4 },
            'Dragon': { attack: 12, health: 12, cost: 12, tier: 5 },
            'Phoenix': { attack: 14, health: 10, cost: 13, tier: 5 }
        };
        
        this.fusionRecipes = {
            'Fire + Water': 'Steam',
            'Water + Fire': 'Steam',
            'Earth + Water': 'Mud',
            'Water + Earth': 'Mud',
            'Earth + Air': 'Dust',
            'Air + Earth': 'Dust',
            'Fire + Earth': 'Lava',
            'Earth + Fire': 'Lava',
            'Water + Earth': 'Plant',
            'Earth + Fire': 'Metal',
            'Fire + Air': 'Energy',
            'Air + Fire': 'Energy',
            'Earth + Earth': 'Stone',
            'Water + Plant': 'Life',
            'Plant + Water': 'Life',
            'Energy + Air': 'Lightning',
            'Air + Energy': 'Lightning',
            'Water + Air': 'Ice',
            'Air + Water': 'Ice',
            'Fire + Life': 'Phoenix',
            'Life + Fire': 'Phoenix',
            'Lightning + Fire': 'Dragon',
            'Fire + Lightning': 'Dragon'
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
        
        document.querySelectorAll('.fusion-slot').forEach(slot => {
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
    
    generateShop() {
        this.shop = [];
        this.shopTier = Math.min(5, Math.floor((this.turn - 1) / 3) + 1);
        
        const availableElements = Object.keys(this.baseElements).filter(name => 
            this.baseElements[name].tier <= this.shopTier
        );
        
        for (let i = 0; i < 5; i++) {
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
        if (element && this.gold >= element.cost && this.hand.length < 10) {
            this.gold -= element.cost;
            this.hand.push(element);
            this.shop = this.shop.filter(e => e.id != elementId);
            this.updateDisplay();
            this.playSound('buy');
            this.log(`Bought ${element.name} for ${element.cost} gold`);
        }
    }
    
    playElement(elementId) {
        const element = this.hand.find(e => e.id == elementId);
        if (element && this.board.length < 7) {
            this.board.push(element);
            this.hand = this.hand.filter(e => e.id != elementId);
            this.updateDisplay();
            this.playSound('click');
            this.log(`Played ${element.name} to board`);
        }
    }
    
    addToFusionSlot(elementId, slot) {
        const slotIndex = slot.id === 'fusion-slot-1' ? 0 : 1;
        let element = this.hand.find(e => e.id == elementId) || this.board.find(e => e.id == elementId);
        
        if (element && !this.fusionSlots[slotIndex]) {
            this.fusionSlots[slotIndex] = element;
            this.hand = this.hand.filter(e => e.id != elementId);
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
            const preview = document.getElementById('fusion-preview');
            
            if (result) {
                preview.innerHTML = `<i class="fas fa-star"></i><span>${result}</span>`;
                preview.classList.add('known');
            } else {
                preview.innerHTML = `<i class="fas fa-question"></i><span>Unknown</span>`;
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
            this.hand.push(newElement);
            this.playSound('fusion');
            this.log(`Fused ${this.fusionSlots[0].name} + ${this.fusionSlots[1].name} = ${result}!`);
            this.showNotification(`Created ${result}!`, 'success');
        } else {
            this.hand.push(this.fusionSlots[0], this.fusionSlots[1]);
            this.log(`No fusion recipe for ${recipe}`);
            this.showNotification('Fusion failed!', 'error');
        }
        
        this.fusionSlots = [null, null];
        this.updateDisplay();
        this.checkFusionReady();
    }
    
    clearFusion() {
        if (this.fusionSlots[0]) this.hand.push(this.fusionSlots[0]);
        if (this.fusionSlots[1]) this.hand.push(this.fusionSlots[1]);
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
        
        const playerPower = this.board.reduce((sum, el) => sum + el.attack + el.health, 0);
        const enemyPower = this.turn * 8 + Math.floor(Math.random() * 10);
        
        document.getElementById('battle-player-power').textContent = playerPower;
        document.getElementById('battle-enemy-power').textContent = enemyPower;
        
        setTimeout(() => {
            const battleResult = document.getElementById('battle-result');
            
            if (playerPower >= enemyPower) {
                battleResult.textContent = 'Victory! You won the battle!';
                battleResult.className = 'battle-result victory';
                this.playSound('victory');
            } else {
                const damage = Math.ceil((enemyPower - playerPower) / 3);
                this.health -= damage;
                battleResult.textContent = `Defeat! You took ${damage} damage.`;
                battleResult.className = 'battle-result defeat';
                this.playSound('defeat');
                
                if (this.health <= 0) {
                    battleResult.textContent += ' Game Over!';
                    this.gameState = 'gameOver';
                }
            }
            
            document.getElementById('continue-btn').classList.remove('hidden');
        }, 2000);
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
        this.hand = [];
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
        
        card.innerHTML = `
            <div class="element-cost">${element.cost}</div>
            <div class="element-tier">${element.tier}</div>
            <div class="element-name">${element.name}</div>
            <div class="element-stats">
                <div class="element-attack">${element.attack} ATK</div>
                <div class="element-health">${element.health} HP</div>
            </div>
        `;
        
        if (container === 'shop') {
            card.addEventListener('click', () => this.buyElement(element.id));
        } else if (container === 'hand') {
            card.addEventListener('click', () => this.playElement(element.id));
        }
        
        return card;
    }
    
    updateDisplay() {
        document.getElementById('gold').textContent = this.gold;
        document.getElementById('turn').textContent = this.turn;
        document.getElementById('health').textContent = this.health;
        document.getElementById('shop-tier').textContent = this.shopTier;
        document.getElementById('hand-count').textContent = this.hand.length;
        document.getElementById('board-count').textContent = this.board.length;
        
        const healthPercentage = (this.health / this.maxHealth) * 100;
        document.getElementById('health-fill').style.width = `${healthPercentage}%`;
        
        const boardPower = this.board.reduce((sum, el) => sum + el.attack + el.health, 0);
        document.getElementById('board-power').textContent = boardPower;
        
        const shopContainer = document.getElementById('shop-elements');
        shopContainer.innerHTML = '';
        this.shop.forEach(element => {
            shopContainer.appendChild(this.createElementCard(element, 'shop'));
        });
        
        const handContainer = document.getElementById('hand-elements');
        handContainer.innerHTML = '';
        this.hand.forEach(element => {
            handContainer.appendChild(this.createElementCard(element, 'hand'));
        });
        
        const boardContainer = document.getElementById('board-elements');
        boardContainer.innerHTML = '';
        this.board.forEach(element => {
            boardContainer.appendChild(this.createElementCard(element, 'board'));
        });
        
        document.querySelectorAll('.fusion-slot').forEach((slot, index) => {
            if (this.fusionSlots[index]) {
                slot.innerHTML = '';
                slot.appendChild(this.createElementCard(this.fusionSlots[index], 'fusion'));
                slot.classList.add('filled');
            } else {
                slot.innerHTML = `<div class="slot-content"><i class="fas fa-plus"></i><span>Drop Element ${index + 1}</span></div>`;
                slot.classList.remove('filled');
            }
        });
    }
}