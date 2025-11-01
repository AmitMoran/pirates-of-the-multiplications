/**
 * Shop Scene
 * Purchase ship upgrades, crew members, and cosmetics
 */

class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }
    
    create() {
        // Background
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Title
        this.add.text(400, 40, '🏪 PIRATE SHOP 🏪', {
            font: 'bold 44px Arial',
            fill: '#FFD700',
            align: 'center',
        }).setOrigin(0.5);
        
        // Coins display
        this.add.text(50, 100, `💰 Coins: ${GameData.player.coins}`, {
            font: 'bold 18px Arial',
            fill: '#FFD700',
        });
        
        // Tabs
        this.createTabs();
        
        // Shop items
        this.displayShipUpgrades();
        
        // Back button
        this.add.text(50, 750, '← BACK', {
            font: 'bold 18px Arial',
            fill: '#ff6600',
        }).setInteractive()
            .on('pointerover', function() { this.setFill('#ffaa00'); })
            .on('pointerout', function() { this.setFill('#ff6600'); })
            .on('pointerdown', () => {
                SaveSystem.saveGame(GameData);
                this.scene.start('MenuScene');
            });
    }
    
    createTabs() {
        const tabs = ['Ships', 'Crew', 'Cosmetics'];
        const tabWidth = 200;
        const tabStartX = 150;
        
        tabs.forEach((tab, index) => {
            const x = tabStartX + (index * (tabWidth + 20));
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            
            graphics.fillStyle(0x8B0000, 0.5);
            graphics.fillRect(x, 150, tabWidth, 50);
            graphics.lineStyle(2, 0xFFFFFF);
            graphics.strokeRect(x, 150, tabWidth, 50);
            graphics.generateTexture('tab_' + tab, tabWidth, 50);
            graphics.destroy();
            
            const tabButton = this.add.sprite(x + tabWidth / 2, 175, 'tab_' + tab)
                .setInteractive()
                .on('pointerdown', () => {
                    if (tab === 'Ships') this.displayShipUpgrades();
                    else if (tab === 'Crew') this.displayCrewMembers();
                    else if (tab === 'Cosmetics') this.displayCosmetics();
                });
            
            this.add.text(x + tabWidth / 2, 175, tab, {
                font: 'bold 16px Arial',
                fill: '#ffffff',
                align: 'center',
            }).setOrigin(0.5);
        });
    }
    
    displayShipUpgrades() {
        this.clearItems();
        
        const upgrades = [
            { name: 'Speed Boost', cost: 50, icon: '⚡', level: GameData.ship.speed },
            { name: 'Hull Reinforcement', cost: 100, icon: '🛡️', level: GameData.ship.level },
            { name: 'Health Upgrade', cost: 75, icon: '❤️', level: GameData.ship.maxHealth / 100 },
        ];
        
        upgrades.forEach((item, index) => {
            const y = 280 + (index * 100);
            this.createShopItem(item.name, item.cost, item.icon, y, 'ship', item);
        });
    }
    
    displayCrewMembers() {
        this.clearItems();
        
        const crewMembers = GameData.crew;
        
        crewMembers.forEach((member, index) => {
            const y = 280 + (index * 100);
            if (member.unlocked) {
                this.add.text(100, y, `${member.name} ✓ (Level ${member.level})`, {
                    font: 'bold 18px Arial',
                    fill: '#00ff00',
                });
            } else {
                this.createShopItem(member.name, member.cost, '👤', y, 'crew', member);
            }
        });
    }
    
    displayCosmetics() {
        this.clearItems();
        
        const cosmetics = [
            { name: 'Golden Sail', cost: 200, icon: '⛵' },
            { name: 'Diamond Skull Flag', cost: 300, icon: '🏴‍☠️' },
            { name: 'Silver Anchor', cost: 150, icon: '⚓' },
        ];
        
        cosmetics.forEach((item, index) => {
            const y = 280 + (index * 100);
            this.createShopItem(item.name, item.cost, item.icon, y, 'cosmetic', item);
        });
    }
    
    createShopItem(name, cost, icon, y, type, data) {
        // Item card
        const cardGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        cardGraphics.fillStyle(0x2a6ea0, 0.5);
        cardGraphics.fillRect(50, y - 30, 600, 80);
        cardGraphics.lineStyle(2, 0xFFFFFF);
        cardGraphics.strokeRect(50, y - 30, 600, 80);
        cardGraphics.generateTexture('item_card_' + name, 600, 80);
        cardGraphics.destroy();
        
        this.add.sprite(350, y + 10, 'item_card_' + name);
        
        // Icon and name
        this.add.text(100, y - 10, icon, { font: '32px Arial' }).setOrigin(0.5);
        this.add.text(180, y - 10, name, {
            font: 'bold 18px Arial',
            fill: '#ffffff',
        }).setOrigin(0, 0.5);
        
        // Cost and button
        this.add.text(620, y - 10, `${cost} 💰`, {
            font: 'bold 16px Arial',
            fill: '#FFD700',
        }).setOrigin(1, 0.5);
        
        // Buy button
        const buyButton = this.add.text(650, y + 20, 'BUY', {
            font: 'bold 14px Arial',
            fill: '#ffffff',
            backgroundColor: '#00AA00',
            padding: { x: 10, y: 5 },
        }).setOrigin(0, 0.5)
            .setInteractive()
            .on('pointerover', function() { this.setBackgroundColor('#00FF00'); })
            .on('pointerout', function() { this.setBackgroundColor('#00AA00'); })
            .on('pointerdown', () => {
                if (GameData.player.coins >= cost) {
                    GameData.player.coins -= cost;
                    this.purchaseItem(type, data);
                    SaveSystem.saveGame(GameData);
                    // Refresh shop
                    this.scene.restart();
                } else {
                    this.add.text(400, 400, 'Not enough coins! 💸', {
                        font: '24px Arial',
                        fill: '#ff0000',
                        backgroundColor: '#000000',
                    }).setOrigin(0.5)
                        .setPadding(10);
                }
            });
    }
    
    purchaseItem(type, data) {
        if (type === 'ship') {
            if (data.name === 'Speed Boost') {
                GameData.ship.speed += 0.5;
            } else if (data.name === 'Hull Reinforcement') {
                GameData.ship.level++;
            } else if (data.name === 'Health Upgrade') {
                GameData.ship.maxHealth += 100;
                GameData.ship.health = GameData.ship.maxHealth;
            }
        } else if (type === 'crew') {
            const crewMember = GameData.crew.find(c => c.name === data.name);
            if (crewMember) {
                crewMember.unlocked = true;
            }
        }
    }
    
    clearItems() {
        // Remove existing shop items
        this.children.list.forEach(child => {
            if (child.y > 200) {
                child.destroy();
            }
        });
    }
}
