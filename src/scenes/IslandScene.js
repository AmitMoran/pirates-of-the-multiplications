/**
 * Island Scene
 * Themed candy islands with sea background
 */

class IslandScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IslandScene' });
    }
    
    init(data) {
        this.enemiesDefeated = data.enemiesDefeated;
        this.difficulty = data.difficulty;
        this.islandNumber = (data.islandNumber || 1) % 5; // Cycle through 5 themes
    }
    
    create() {
        // Create beautiful gradient background - sky at top, ocean at bottom
        const screenHeight = this.game.config.height;
        
        // Sky gradient effect using rectangles
        const skyGradient = this.add.rectangle(0, 0, 800, screenHeight * 0.3, 0x87CEEB);
        skyGradient.setOrigin(0, 0);
        skyGradient.setDepth(-3);
        
        // Darker sky for depth
        const skyDarker = this.add.rectangle(0, screenHeight * 0.3, 800, screenHeight * 0.6, 0x4a90e2);
        skyDarker.setOrigin(0, 0);
        skyDarker.setDepth(-3);
        
        // Load island image as background
        this.createIslandImageBackground();
        
        // Create ocean waves at the bottom
        //this.createOceanBackground();
        
        // Create island and themed candy animal based on island number
        this.createThemesIsland();
        
        // Title
        const islandThemes = [
            { name: 'GUMMY BEAR 🐻', animal: 'bear' },
            { name: 'LOLLIPOP LION 🦁', animal: 'lion' },
            { name: 'CANDY CRAB 🦀', animal: 'crab' },
            { name: 'CHOCOLATE ELEPHANT 🐘', animal: 'elephant' },
            { name: 'CARAMEL BUTTERFLY 🦋', animal: 'butterfly' }
        ];
        
        const theme = islandThemes[this.islandNumber];
        
        const titleText = this.add.text(400, 80, `🏝️ ${theme.name} ISLAND 🏝️`, {
            font: 'bold 48px Arial',
            fill: '#FFD700',
            align: 'center',
            stroke: '#8B4513',
            strokeThickness: 3,
        }).setOrigin(0.5);
        titleText.setDepth(20);
        
        // Add subtle shadow to title
        const titleShadow = this.add.text(402, 82, `🏝️ ${theme.name} ISLAND 🏝️`, {
            font: 'bold 48px Arial',
            fill: '#000000',
            align: 'center',
            alpha: 0.3,
        }).setOrigin(0.5).setDepth(19);
        
        // Message
        this.add.text(400, 140, 'You\'ve successfully reached the island!', {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(20);
        
        // Calculate treasure rewards
        const baseCoins = 100 * (this.enemiesDefeated || 1);
        const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[this.difficulty] || 1;
        const treasureCoins = Math.round(baseCoins * difficultyMultiplier);
        
        // Display treasure
        this.add.text(400, 220, '💰 TREASURE COLLECTED 💰', {
            font: 'bold 32px Arial',
            fill: '#FFD700',
            align: 'center',
            stroke: '#8B4513',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(20);
        
        const coinText = this.add.text(400, 280, `+${treasureCoins} Coins!`, {
            font: 'bold 40px Arial',
            fill: '#00ff00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(20);
        
        // Add coin collection animation
        this.tweens.add({
            targets: coinText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
        
        // Chest animation
        this.createTreasureChest(400, 680);
        
        // Statistics
        this.add.text(400, 520, `Enemies Defeated: ${this.enemiesDefeated} | Total Coins: ${GameData.player.coins + treasureCoins}`, {
            font: '16px Arial',
            fill: '#cccccc',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5).setDepth(20);
        
        // Add coins to player
        GameData.player.coins += treasureCoins;
        GameData.statistics.islandsVisited++;
        SaveSystem.saveGame(GameData);
        
        // Continue button with hover effect
        const continueButton = this.add.text(400, 650, 'Click to Continue', {
            font: 'bold 20px Arial',
            fill: '#ffffff',
            align: 'center',
            backgroundColor: '#8B4513',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(20)
            .setInteractive()
            .on('pointerdown', () => {
                // Pass the island number to menu for next sail
                this.scene.start('MenuScene', { lastIslandNumber: (this.islandNumber + 1) % 5 });
            })
            .on('pointerover', () => {
                continueButton.setScale(1.1);
                continueButton.setStyle({ fill: '#FFD700' });
            })
            .on('pointerout', () => {
                continueButton.setScale(1);
                continueButton.setStyle({ fill: '#ffffff' });
            });
    }
    
    createOceanBackground() {
        // Ocean waves
        this.add.rectangle(0, 600, 800, 200, 0x2d7fa0).setOrigin(0);
        
        // Decorative waves
        for (let i = 0; i < 4; i++) {
            const wave = this.add.rectangle(
                i * 200,
                630 + (i % 2) * 20,
                200,
                8,
                0x1a5a7f,
                0.6
            );
            this.tweens.add({
                targets: wave,
                y: wave.y + 15,
                duration: Phaser.Math.Between(2000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inout',
            });
        }
        
        // Wave foamy texture
        for (let i = 0; i < 8; i++) {
            this.add.circle(
                Phaser.Math.Between(0, 800),
                Phaser.Math.Between(620, 660),
                Phaser.Math.Between(2, 4),
                0xffffff,
                0.4
            );
        }
    }
    
    createIslandImageBackground() {
        // NEW IMPLEMENTATION: Use island image from IMAGE_ASSETS as background
        if (IMAGE_ASSETS && IMAGE_ASSETS.island) {
            try {
                console.log('🟢 [IslandScene.createIslandImageBackground] Loading island image from base64...');
                
                // Create an image element and load it
                const img = new Image();
                img.onload = () => {
                    console.log('🟢 [IslandScene.createIslandImageBackground] Island image loaded! Width:', img.width, 'Height:', img.height);
                    
                    // Create a canvas and draw the image to it
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    // Add the canvas as a texture to Phaser
                    this.textures.addCanvas('island-bg', canvas);
                    console.log('✅ [IslandScene.createIslandImageBackground] Island texture added');
                    
                    // Get screen dimensions
                    const screenHeight = this.game.config.height;
                    const screenWidth = this.game.config.width;
                    
                    // Create island background image centered on screen
                    const islandBg = this.add.sprite(screenWidth / 2, screenHeight / 2, 'island-bg');
                    
                    // Scale to fit the screen while maintaining aspect ratio
                    const scaleX = screenWidth / img.width;
                    const scaleY = screenHeight / img.height;
                    islandBg.setScale(Math.max(scaleX, scaleY)); // Use maximum to cover entire screen
                    islandBg.setDepth(-1); // Behind everything except background color
                };
                
                img.onerror = () => {
                    console.error('❌ [IslandScene.createIslandImageBackground] Failed to load island image');
                };
                
                img.src = IMAGE_ASSETS.island;
                
            } catch (error) {
                console.error('❌ [IslandScene.createIslandImageBackground] Error loading island image:', error);
            }
        } else {
            console.warn('⚠️ [IslandScene.createIslandImageBackground] IMAGE_ASSETS.island not found');
        }
    }
    
    createThemesIsland() {
        const islandThemes = [
            { name: 'GUMMY BEAR', emoji: '🐻' },
            { name: 'LOLLIPOP LION', emoji: '🦁' },
            { name: 'CANDY CRAB', emoji: '🦀' },
            { name: 'CHOCOLATE ELEPHANT', emoji: '🐘' },
            { name: 'CARAMEL BUTTERFLY', emoji: '🦋' }
        ];
        
        const theme = islandThemes[this.islandNumber];
        
        // Display themed emoji on the island
        this.add.text(400, 380, theme.emoji, {
            font: '120px Arial',
            align: 'center',
        }).setOrigin(0.5).setDepth(10);
    }
    
    drawGummyBear(x, y) {
        // DEPRECATED: Using emoji instead
    }
    
    drawLion(x, y) {
        // DEPRECATED: Using emoji instead
    }
    
    drawCrab(x, y) {
        // DEPRECATED: Using emoji instead
    }
    
    drawElephant(x, y) {
        // DEPRECATED: Using emoji instead
    }
    
    drawButterfly(x, y) {
        // DEPRECATED: Using emoji instead
    }
    
    createTreasureChest(x, y) {
        // Chest body
        this.add.rectangle(x, y, 100, 60, 0x8B4513)
            .setStrokeStyle(3, 0xFFD700);
        
        // Chest lid
        const lid = this.add.arc(x, y - 30, 50, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(180), false, 0xA0522D)
            .setStrokeStyle(3, 0xFFD700);
        
        // Gold inside
        this.add.text(x, y, '💎 💎 💎', {
            font: '32px Arial',
            align: 'center',
        }).setOrigin(0.5);
        
        // Pulse animation
        this.tweens.add({
            targets: lid,
            y: lid.y - 20,
            duration: 600,
            yoyo: true,
            repeat: -1,
        });
    }
}
