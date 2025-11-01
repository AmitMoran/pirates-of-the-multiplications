/**
 * Difficulty Select Scene
 * Let player choose difficulty for this journey
 */

class DifficultySelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DifficultySelectScene' });
    }
    
    create() {
        // Create beautiful gradient background
        const screenHeight = this.game.config.height;
        const screenWidth = this.game.config.width;
        
        // Sky gradient at top
        const bgTop = this.add.rectangle(screenWidth / 2, 0, screenWidth, screenHeight * 0.4, 0x1a5f7f);
        bgTop.setOrigin(0.5, 0);
        bgTop.setDepth(-2);
        
        // Ocean gradient at bottom
        const bgBottom = this.add.rectangle(screenWidth / 2, screenHeight * 0.4, screenWidth, screenHeight * 0.6, 0x0d2438);
        bgBottom.setOrigin(0.5, 0);
        bgBottom.setDepth(-2);
        
        // Title with shadow effect
        const titleShadow = this.add.text(402, 62, 'Select Your Challenge Level', {
            font: 'bold 40px Arial',
            fill: '#000000',
            align: 'center',
            alpha: 0.4,
        }).setOrigin(0.5).setDepth(1);
        
        this.add.text(400, 60, 'Select Your Challenge Level', {
            font: 'bold 40px Arial',
            fill: '#f4a460',
            align: 'center',
            stroke: '#8B4513',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(2);
        
        const difficulties = ['easy', 'medium', 'hard'];
        const yPositions = [250, 450, 650];
        
        difficulties.forEach((difficulty, index) => {
            const settings = DifficultyManager.getDifficulty(difficulty);
            const y = yPositions[index];
            
            // Difficulty card
            this.createDifficultyCard(400, y, difficulty, settings);
        });
        
        // Back button with enhanced styling
        const backButton = this.add.text(50, 750, '← BACK', {
            font: 'bold 18px Arial',
            fill: '#ff6600',
            align: 'center',
            backgroundColor: '#1a1a1a',
            padding: { x: 10, y: 5 },
            stroke: '#000000',
            strokeThickness: 1,
        }).setInteractive()
            .setDepth(10)
            .on('pointerover', function() { 
                this.setFill('#ffaa00');
                this.setScale(1.1);
            })
            .on('pointerout', function() { 
                this.setFill('#ff6600');
                this.setScale(1);
            })
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            });
    }
    
    createDifficultyCard(x, y, difficultyKey, settings) {
        // Card background
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        const width = 500;
        const height = 140;
        
        // Color based on difficulty
        const colors = {
            easy: 0x00AA00,
            medium: 0xFF9900,
            hard: 0xFF3333,
        };
        
        // Create shadow
        const shadowGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        shadowGraphics.fillStyle(0x000000, 0.4);
        shadowGraphics.fillRect(0, 0, width, height);
        shadowGraphics.generateTexture('difficulty_shadow_' + difficultyKey, width, height);
        shadowGraphics.destroy();
        
        const shadow = this.add.sprite(x + 3, y + 3, 'difficulty_shadow_' + difficultyKey);
        shadow.setDepth(8);
        
        // Create glow effect
        const glowGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        glowGraphics.lineStyle(2, colors[difficultyKey], 0.3);
        glowGraphics.strokeRect(0, 0, width, height);
        glowGraphics.generateTexture('difficulty_glow_' + difficultyKey, width, height);
        glowGraphics.destroy();
        
        const glow = this.add.sprite(x, y, 'difficulty_glow_' + difficultyKey);
        glow.setDepth(8);
        glow.setAlpha(0);
        
        // Main card
        graphics.fillStyle(colors[difficultyKey], 0.4);
        graphics.fillRect(0, 0, width, height);
        graphics.lineStyle(3, colors[difficultyKey]);
        graphics.strokeRect(0, 0, width, height);
        
        graphics.generateTexture('difficulty_card_' + difficultyKey, width, height);
        graphics.destroy();
        
        // Card sprite
        const card = this.add.sprite(x, y, 'difficulty_card_' + difficultyKey)
            .setInteractive()
            .setDepth(9)
            .on('pointerover', () => {
                card.setScale(1.08);
                card.setTint(0xFFFFFF);
                shadow.setScale(1.08);
                glow.setAlpha(1);
                
                this.tweens.add({
                    targets: glow,
                    alpha: 0.5,
                    duration: 500,
                    yoyo: true,
                    repeat: 1
                });
            })
            .on('pointerout', () => {
                card.setScale(1);
                card.clearTint();
                shadow.setScale(1);
                glow.setAlpha(0);
            })
            .on('pointerdown', () => {
                // Reset the game before setting new difficulty
                //SaveSystem.resetGame();
                GameData.difficulty = difficultyKey;
                this.scene.start('SailingScene');
            });
        
        // Difficulty name
        this.add.text(x - 180, y - 40, settings.name.toUpperCase(), {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 2,
        }).setDepth(10);
        
        // Description
        this.add.text(x - 180, y + 5, `${settings.description}`, {
            font: '14px Arial',
            fill: '#cccccc',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 1,
        }).setDepth(10);
        
        // Reward info
        this.add.text(x + 50, y - 25, `⏱️ ${settings.timePerQuestion}s/Q`, {
            font: 'bold 14px Arial',
            fill: '#FFD700',
            align: 'right',
            stroke: '#000000',
            strokeThickness: 1,
        }).setDepth(10);
        
        this.add.text(x + 50, y + 15, `💰 ${settings.baseReward} coins`, {
            font: 'bold 14px Arial',
            fill: '#FFD700',
            align: 'right',
            stroke: '#000000',
            strokeThickness: 1,
        }).setDepth(10);
    }
}
