/**
 * Menu Scene
 * Main menu with options to start game, view stats, and shop
 */

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        // Background
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Title
        this.add.text(400, 80, '⚓ Pirates of the Multiplications ⚓', {
            font: 'bold 48px Arial',
            fill: '#f4a460',
            align: 'center',
        }).setOrigin(0.5);
        
        // Pirate ship ASCII art
        this.add.text(400, 160, '🏴‍☠️', {
            font: '80px Arial',
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(400, 240, 'Learn Multiplications While Sailing the Seas!', {
            font: 'italic 20px Arial',
            fill: '#ddd',
            align: 'center',
        }).setOrigin(0.5);
        
        // Coins display
        this.add.text(50, 30, `💰 Coins: ${GameData.player.coins}`, {
            font: 'bold 16px Arial',
            fill: '#FFD700',
        });
        
        // Level display
        this.add.text(720, 30, `Level: ${GameData.player.level}`, {
            font: 'bold 16px Arial',
            fill: '#00ff00',
        });
        
        // Main buttons
        const buttonWidth = 300;
        const buttonHeight = 60;
        const buttonY = [380, 480, 580, 680];
        
        // New Game Button
        this.createButton(400, buttonY[0], buttonWidth, buttonHeight, 'NEW GAME', () => {
            this.scene.start('DifficultySelectScene');
        }, '#00AA00');
        
        // Continue Game Button (if save exists)
        if (SaveSystem.hasSaveData()) {
            this.createButton(400, buttonY[1], buttonWidth, buttonHeight, 'CONTINUE', () => {
                this.scene.start('SailingScene');
            }, '#0088FF');
            
            // Shop Button
            this.createButton(400, buttonY[2], buttonWidth, buttonHeight, 'SHOP', () => {
                this.scene.start('ShopScene');
            }, '#FF6600');
            
            // Settings Button
            this.createButton(400, buttonY[3], buttonWidth, buttonHeight, 'SETTINGS', () => {
                this.scene.start('SettingsScene');
            }, '#9966CC');
        } else {
            // Shop Button (shifted up if no continue)
            this.createButton(400, buttonY[1], buttonWidth, buttonHeight, 'SHOP', () => {
                this.scene.start('ShopScene');
            }, '#FF6600');
            
            // Settings Button
            this.createButton(400, buttonY[2], buttonWidth, buttonHeight, 'SETTINGS', () => {
                this.scene.start('SettingsScene');
            }, '#9966CC');
        }
        
        // Statistics display
        const stats = GameData.statistics;
        const accuracy = GameData.getAccuracy();
        
        this.add.text(400, 700, `Games Played: ${stats.gamesPlayed} | Accuracy: ${accuracy}% | Islands: ${stats.islandsVisited}`, {
            font: '14px Arial',
            fill: '#aaa',
            align: 'center',
        }).setOrigin(0.5);
        
        // Instructions
        this.add.text(400, 750, 'Answer multiplication questions to defeat enemies and reach islands!', {
            font: 'italic 12px Arial',
            fill: '#888',
            align: 'center',
        }).setOrigin(0.5);
    }
    
    createButton(x, y, width, height, text, callback, color) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Button background
        graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.8);
        graphics.fillRect(x - width / 2, y - height / 2, width, height);
        graphics.lineStyle(2, 0xFFFFFF);
        graphics.strokeRect(x - width / 2, y - height / 2, width, height);
        
        graphics.generateTexture('button_' + text, width, height);
        graphics.destroy();
        
        // Create button sprite
        const button = this.add.sprite(x, y, 'button_' + text)
            .setInteractive()
            .on('pointerover', () => {
                button.setScale(1.1);
            })
            .on('pointerout', () => {
                button.setScale(1);
            })
            .on('pointerdown', callback);
        
        // Button text
        this.add.text(x, y, text, {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setDepth(10);
    }
    
    update() {
        // Update coins display
        this.children.list.forEach(child => {
            if (child.text && child.text.includes('Coins:')) {
                child.setText(`💰 Coins: ${GameData.player.coins}`);
            }
        });
    }
}
