/**
 * Sailing Scene
 * Main ocean exploration scene with enemies and navigation
 */

class SailingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SailingScene' });
    }
    
    init(data) {    
        this.enemiesDefeated = 0;
        this.distanceTraveled = 0;
        this.maxDistance = 500;
        this.gameActive = true;
        this.shipX = 50;
        
        this.time.removeAllEvents();
        this.tweens.killAll();
    }
    
    preload() {
        console.log('🟢 [SailingScene] preload() called');
    }
    
    create() {
        console.log('🟢 [SailingScene] create() called');
        
        if (IMAGE_ASSETS && IMAGE_ASSETS.shipImage) {
            try {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    this.textures.addCanvas('ship', canvas);
                    this.createShip();
                    this.initializeGameAfterShipLoaded();
                };
                
                img.onerror = () => {
                    this.createProgrammaticShip();
                    this.initializeGameAfterShipLoaded();
                };
                
                img.src = IMAGE_ASSETS.shipImage;
            } catch (error) {
                this.createProgrammaticShip();
            }
        } else {
            this.createProgrammaticShip();
            this.initializeGameAfterShipLoaded();
        }
        
        this.physics.world.setBounds(0, 0, 2000, 800);
        
        // Add sky gradient FIRST (before ocean so it shows behind)
        this.createSkyGradient();
        
        // Add ocean background - positioned to leave sky space at top
        this.createOceanBackground();
        
        this.difficultyText = this.add.text(20, 20, `Difficulty: ${GameData.difficulty.toUpperCase()}`, {
            font: 'bold 16px Arial',
            fill: '#FFD700',
        });
        this.difficultyText.setScrollFactor(0);
        
        this.createProgressBar();
        
        this.instructionsText = this.add.text(400, 750, '🎲 Enemies approaching! Click an enemy to battle!', {
            font: '16px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setName('instructions');
        this.instructionsText.setScrollFactor(0);
        
        this.gameStartTime = this.time.now;
        this.elapsedTimeText = this.add.text(750, 750, 'Time: 0:00', {
            font: 'bold 14px Arial',
            fill: '#FFD700',
        }).setOrigin(0.5);
        this.elapsedTimeText.setScrollFactor(0);
        
        this.createHomeButton();
    }
    
    initializeGameAfterShipLoaded() {
        console.log('🟢 [SailingScene.initializeGameAfterShipLoaded] Initializing game after ship loaded');
        this.cameras.main.startFollow(this.ship);
        this.cameras.main.setBounds(0, 0, 2000, 800);
        this.cameras.main.centerOn(this.ship.x, this.ship.y);
        this.enemySpawnTimer = 0;
        this.enemies = [];
        this.currentEnemy = null;
        this.spawnRandomEnemy();
        console.log('🟢 [SailingScene.initializeGameAfterShipLoaded] Game initialized!');
    }
    
    createHomeButton() {
        const homeButton = this.add.rectangle(750, 20, 100, 40, 0x8B0000).setStrokeStyle(2, 0xFFFFFF);
        homeButton.setScrollFactor(0);
        homeButton.setInteractive();
        
        const homeText = this.add.text(750, 20, '🏠 HOME', {
            font: 'bold 14px Arial',
            fill: '#FFD700',
        }).setOrigin(0.5);
        homeText.setScrollFactor(0);
        
        homeButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        homeButton.on('pointerover', () => {
            homeButton.setFillStyle(0xB80000);
        });
        
        homeButton.on('pointerout', () => {
            homeButton.setFillStyle(0x8B0000);
        });
    }
    
    createSkyGradient() {
        const gradientCanvas = document.createElement('canvas');
        gradientCanvas.width = this.game.config.width;
        gradientCanvas.height = this.game.config.height;
        const gradientCtx = gradientCanvas.getContext('2d');
        
        const gradient = gradientCtx.createLinearGradient(0, 0, 0, this.game.config.height);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, '#4CA1A3');
        gradientCtx.fillStyle = gradient;
        gradientCtx.fillRect(0, 0, this.game.config.width, this.game.config.height);
        
        this.textures.addCanvas('skyGradient', gradientCanvas);
        
        const screenWidth = this.game.config.width;
        const screenHeight = this.game.config.height;
        const skySprite = this.add.sprite(screenWidth / 2, screenHeight / 8, 'skyGradient');
        skySprite.setOrigin(0.5, 0.5);
        skySprite.setDepth(-3);
        skySprite.setScrollFactor(0);
        
        console.log('✅ [SailingScene] Sky gradient created and displayed');
    }
    
    createOceanBackground() {
        if (IMAGE_ASSETS && IMAGE_ASSETS.water2) {
            try {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    this.textures.addCanvas('ocean', canvas);
                    
                    const screenHeight = this.game.config.height;
                    
                    // Ocean fills 65% of screen, leaving 35% for sky at top
                    const oceanHeightPercent = 0.65;
                    const oceanHeight = screenHeight * oceanHeightPercent;
                    const scaleY = oceanHeight / img.height;
                    
                    // Position ocean so it fills the bottom 65% of screen
                    const oceanYPos = screenHeight * 0.825; // 35% + (65%/2) = 67.5%
                    
                    const oceanBackground = this.add.tileSprite(
                        1000, oceanYPos,
                        2000, oceanHeight,
                        'ocean'
                    );
                    oceanBackground.setScale(1, scaleY);
                    oceanBackground.setOrigin(0.5, 0.5);
                    oceanBackground.setDepth(-1);
                    oceanBackground.setScrollFactor(1);
                    this.oceanBackground = oceanBackground;
                    
                    this.tweens.add({
                        targets: oceanBackground,
                        y: oceanBackground.y + 5,
                        duration: 3000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.inOut'
                    });
                    
                    this.createWaterParticles();
                };
                
                img.onerror = () => {
                    this.createOceanBackgroundFallback();
                };
                
                img.src = IMAGE_ASSETS.water2;
            } catch (error) {
                this.createOceanBackgroundFallback();
            }
        } else {
            this.createOceanBackgroundFallback();
        }
    }
    
    createWaterParticles() {
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(100, 1900),
                Phaser.Math.Between(200, 600),
                Phaser.Math.Between(2, 4),
                0xffffff,
                0.2
            );
            particle.setDepth(-1);
            
            this.tweens.add({
                targets: particle,
                y: particle.y - 30,
                alpha: 0.1,
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut'
            });
        }
    }
    
    createOceanBackgroundFallback() {
        for (let i = 0; i < 5; i++) {
            const wave = this.add.rectangle(
                Phaser.Math.Between(0, 800),
                Phaser.Math.Between(50, 700),
                Phaser.Math.Between(30, 80),
                4,
                0x2a7fa0,
                0.3
            );
            this.tweens.add({
                targets: wave,
                y: wave.y + 30,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
            });
        }
    }
    
    createShip() {
        const texture = this.textures.get('ship');
        
        this.ship = this.add.image(this.shipX, 400, 'ship');
        this.ship.setScale(0.15);
        this.ship.setDepth(8);
        
        const shadow = this.add.ellipse(this.shipX, 450, 100, 20, 0x000000, 0.2);
        shadow.setDepth(7);
        
        this.tweens.add({
            targets: shadow,
            x: this.ship.x,
            y: 450,
            duration: 800,
            ease: 'Quad.inOut'
        });
        
        this.tweens.add({
            targets: this.ship,
            y: 410,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
    }
    
    createProgrammaticShip() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        graphics.fillStyle(0xA0826D, 1);
        graphics.fillRect(20, 120, 360, 80);
        graphics.lineStyle(2, 0x654321);
        graphics.strokeRect(20, 120, 360, 80);
        
        graphics.fillStyle(0xA0826D, 1);
        graphics.beginPath();
        graphics.moveTo(380, 120);
        graphics.lineTo(420, 140);
        graphics.lineTo(420, 200);
        graphics.lineTo(380, 200);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        
        graphics.fillStyle(0x8B6F47, 1);
        graphics.fillRect(15, 200, 410, 20);
        
        graphics.fillStyle(0x4A4A4A, 1);
        graphics.fillCircle(60, 155, 6);
        graphics.fillCircle(130, 155, 6);
        graphics.fillCircle(200, 155, 6);
        graphics.fillCircle(270, 155, 6);
        
        graphics.fillStyle(0xA0826D, 1);
        graphics.fillRect(30, 100, 60, 30);
        graphics.lineStyle(2, 0x654321);
        graphics.strokeRect(30, 100, 60, 30);
        
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillCircle(50, 110, 4);
        
        graphics.lineStyle(2, 0x654321);
        graphics.strokeRect(25, 105, 8, 20);
        graphics.strokeRect(380, 105, 8, 20);
        
        graphics.lineStyle(4, 0x654321);
        graphics.beginPath();
        graphics.moveTo(360, 120);
        graphics.lineTo(360, 40);
        graphics.stroke();
        
        graphics.lineStyle(5, 0x6B4423);
        graphics.beginPath();
        graphics.moveTo(200, 120);
        graphics.lineTo(200, 20);
        graphics.stroke();
        
        graphics.lineStyle(4, 0x654321);
        graphics.beginPath();
        graphics.moveTo(80, 120);
        graphics.lineTo(80, 50);
        graphics.stroke();
        
        graphics.fillStyle(0xA0826D, 1);
        graphics.fillRect(75, 50, 10, 8);
        graphics.fillRect(195, 20, 10, 8);
        graphics.fillRect(355, 40, 10, 8);
        
        graphics.fillStyle(0x2A2A2A, 0.85);
        graphics.beginPath();
        graphics.moveTo(85, 60);
        graphics.lineTo(85, 110);
        graphics.lineTo(140, 90);
        graphics.closePath();
        graphics.fillPath();
        
        graphics.beginPath();
        graphics.moveTo(195, 30);
        graphics.lineTo(195, 110);
        graphics.lineTo(280, 70);
        graphics.closePath();
        graphics.fillPath();
        
        graphics.beginPath();
        graphics.moveTo(360, 50);
        graphics.lineTo(360, 110);
        graphics.lineTo(400, 80);
        graphics.closePath();
        graphics.fillPath();
        
        graphics.fillStyle(0xCCCCCC, 1);
        graphics.fillCircle(105, 75, 5);
        graphics.fillCircle(100, 72, 2);
        graphics.fillCircle(110, 72, 2);
        graphics.lineStyle(1, 0xCCCCCC);
        graphics.beginPath();
        graphics.moveTo(100, 80);
        graphics.lineTo(110, 80);
        graphics.stroke();
        
        graphics.fillCircle(230, 60, 6);
        graphics.fillCircle(223, 56, 2);
        graphics.fillCircle(237, 56, 2);
        graphics.lineStyle(1, 0xCCCCCC);
        graphics.beginPath();
        graphics.moveTo(223, 66);
        graphics.lineTo(237, 66);
        graphics.stroke();
        
        graphics.lineStyle(1, 0xDDDDDD);
        graphics.beginPath();
        graphics.moveTo(140, 90);
        graphics.lineTo(195, 50);
        graphics.stroke();
        
        graphics.beginPath();
        graphics.moveTo(280, 70);
        graphics.lineTo(360, 60);
        graphics.stroke();
        
        graphics.lineStyle(2, 0x654321);
        graphics.beginPath();
        graphics.moveTo(210, 18);
        graphics.lineTo(210, 8);
        graphics.stroke();
        
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(210, 8, 35, 25);
        
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(225, 15, 4);
        graphics.fillCircle(220, 12, 1.5);
        graphics.fillCircle(230, 12, 1.5);
        graphics.fillRect(222, 18, 6, 2);
        
        graphics.beginPath();
        graphics.moveTo(220, 22);
        graphics.lineTo(230, 22);
        graphics.stroke();
        
        graphics.generateTexture('ship', 450, 230);
        graphics.destroy();
        
        this.createShip();
    }
    
    createProgressBar() {
        const barX = 50;
        const barY = 100;
        const barWidth = 700;
        const barHeight = 30;
        
        const background = this.add.rectangle(barX + barWidth / 2, barY, barWidth, barHeight, 0x2a2a2a)
            .setStrokeStyle(3, 0xFFD700);
        background.setScrollFactor(0);
        
        this.progressBar = this.add.rectangle(barX + 2, barY, 2, barHeight - 4, 0x00ff00)
            .setOrigin(0, 0.5);
        this.progressBar.setScrollFactor(0);
        
        const shipIcon = this.add.text(barX - 10, barY, '🚢', {
            font: 'bold 20px Arial',
            fill: '#ffffff',
        }).setOrigin(1, 0.5);
        shipIcon.setScrollFactor(0);
        
        const islandIcon = this.add.text(barX + barWidth + 10, barY, '🏝️', {
            font: 'bold 20px Arial',
            fill: '#FFD700',
        }).setOrigin(0, 0.5);
        islandIcon.setScrollFactor(0);
    }
    
    spawnRandomEnemy() {
        if (!this.gameActive) return;
        
        const enemyTypes = [
            { name: '🦈', color: 0xff5533, difficulty: 0.8 },
            { name: '🚤', color: 0x8B0000, difficulty: 1 },
            { name: '🦞', color: 0x0066ff, difficulty: 1.2 },
            { name: '🌪️', color: 0x999999, difficulty: 1.1 },
            { name: '🐙', color: 0x8B008B, difficulty: 0.9 },
        ];
        
        const enemy = Phaser.Utils.Array.GetRandom(enemyTypes);
        const baseX = (this.enemiesDefeated === 0) ? 300 : (150 + this.distanceTraveled + (this.enemiesDefeated * 150));
        const enemyX = Math.min(baseX, 1900);
        const y = Phaser.Math.Between(150, 650);
        
        const enemyGlow = this.add.circle(enemyX, y, 50, enemy.color, 0.15);
        enemyGlow.setDepth(9);
        
        this.currentEnemy = this.add.circle(enemyX, y, 30, enemy.color, 0.2);
        this.currentEnemy.setDepth(10);
        this.currentEnemy.setStrokeStyle(3, enemy.color, 1);
        
        const enemyShadow = this.add.ellipse(enemyX, y + 40, 60, 15, 0x000000, 0.25);
        enemyShadow.setDepth(8);
        
        this.enemyLabel = this.add.text(enemyX, y, enemy.name, {
            font: 'bold 72px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setDepth(11);
        
        this.currentEnemy.setInteractive();
        
        this.currentEnemy.on('pointerdown', () => {
            this.battleEnemy(enemy);
        });
        
        this.tweens.add({
            targets: enemyGlow,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
        
        this.tweens.add({
            targets: this.currentEnemy,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
        
        this.currentEnemy.enemy = enemy;
        this.currentEnemy.enemyX = enemyX;
        this.currentEnemy.enemyGlow = enemyGlow;
        this.currentEnemy.enemyShadow = enemyShadow;
    }
    
    battleEnemy(enemy) {
        this.gameActive = false;
        
        const flash = this.add.rectangle(400, 400, 800, 800, 0xFFFFFF, 0.3);
        flash.setScrollFactor(0);
        
        const targetX = this.currentEnemy.x;
        const targetY = this.currentEnemy.y;
        
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.1,
            duration: 800,
            ease: 'Quad.inOut'
        });
        
        this.tweens.add({
            targets: this.ship,
            x: targetX,
            y: targetY,
            duration: 800,
            ease: 'Quad.inOut',
            onComplete: () => {
                if (this.currentEnemy.enemyGlow) this.currentEnemy.enemyGlow.destroy();
                if (this.currentEnemy.enemyShadow) this.currentEnemy.enemyShadow.destroy();
                
                this.currentEnemy.destroy();
                if (this.enemyLabel) this.enemyLabel.destroy();
                
                this.tweens.add({
                    targets: this.cameras.main,
                    zoom: 1,
                    duration: 500
                });
                
                this.scene.launch('ChallengeScene', {
                    enemy: enemy.name,
                    difficulty: GameData.difficulty,
                });
                
                flash.destroy();
            }
        });
    }
    
    handleBattleComplete(success) {
        if (success) {
            this.enemiesDefeated++;
            this.distanceTraveled = Math.min(this.maxDistance, 
                this.distanceTraveled + (250 / (DifficultyManager.getDifficulty(GameData.difficulty).questionCount)));
            
            this.updateProgressBar();
            
            if (this.distanceTraveled >= this.maxDistance) {
                this.reachIsland();
            } else {
                this.gameActive = true;
                this.spawnRandomEnemy();
            }
        } else {
            this.showDefeatMessage();
        }
        
        this.scene.stop('ChallengeScene');
    }
    
    showDefeatMessage() {
        const defeatText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 
            'DEFEATED! ⚰️\nYou lost this battle!\nKeep sailing...', {
            font: 'bold 24px Arial',
            fill: '#ff0000',
            align: 'center',
            backgroundColor: '#000000',
        }).setOrigin(0.5);
        defeatText.setPadding(20);
        defeatText.setScrollFactor(0);
        
        this.tweens.add({
            targets: defeatText,
            alpha: 0,
            delay: 2000,
            duration: 1000,
            onComplete: () => {
                defeatText.destroy();
                this.gameActive = true;
                this.spawnRandomEnemy();
            }
        });
    }
    
    updateProgressBar() {
        const progress = (this.distanceTraveled / this.maxDistance) * 700;
        this.progressBar.setDisplayOrigin(0, 0);
        this.tweens.add({
            targets: this.progressBar,
            x: 50 + progress,
            duration: 500,
        });
    }
    
    reachIsland() {
        this.gameActive = false;
        
        if (!this.islandVisual) {
            this.createIslandBackground();
        }
        
        this.tweens.add({
            targets: this.ship,
            x: 1800,
            y: 400,
            duration: 2000,
            ease: 'Quad.inOut',
            onComplete: () => {
                this.scene.start('IslandScene', {
                    enemiesDefeated: this.enemiesDefeated,
                    difficulty: GameData.difficulty,
                    islandNumber: GameData.statistics.islandsVisited,
                });
            }
        });
    }
    
    createIslandBackground() {
        if (IMAGE_ASSETS && IMAGE_ASSETS.island) {
            try {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    this.textures.addCanvas('island', canvas);
                    
                    const screenHeight = this.game.config.height;
                    const screenWidth = this.game.config.width;
                    
                    this.islandVisual = this.add.sprite(1800, screenHeight / 2, 'island');
                    
                    const scaleX = screenWidth / img.width * 0.6;
                    const scaleY = screenHeight / img.height;
                    const finalScale = Math.min(scaleX, scaleY, 0.8);
                    this.islandVisual.setScale(finalScale);
                    this.islandVisual.setDepth(6);
                    
                    const islandGlow = this.add.circle(1800, screenHeight / 2, 300, 0xFFFF00, 0.05);
                    islandGlow.setDepth(5);
                    
                    this.tweens.add({
                        targets: this.islandVisual,
                        y: screenHeight / 2 + 10,
                        duration: 3000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.inOut'
                    });
                    
                    this.tweens.add({
                        targets: islandGlow,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        alpha: 0.08,
                        duration: 2000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.inOut'
                    });
                };
                
                img.onerror = () => {
                    this.islandVisual = this.add.text(1800, 400, '🏝️ ISLAND 🏝️', {
                        font: 'bold 40px Arial',
                        fill: '#FFD700',
                    }).setOrigin(0.5).setDepth(5);
                };
                
                img.src = IMAGE_ASSETS.island;
            } catch (error) {
                this.islandVisual = this.add.text(1800, 400, '🏝️ ISLAND 🏝️', {
                    font: 'bold 40px Arial',
                    fill: '#FFD700',
                }).setOrigin(0.5).setDepth(5);
            }
        } else {
            this.islandVisual = this.add.text(1800, 400, '🏝️ ISLAND 🏝️', {
                font: 'bold 40px Arial',
                fill: '#FFD700',
            }).setOrigin(0.5).setDepth(5);
        }
    }

    update() {
        if (this.currentEnemy && this.gameActive) {
            const shipToEnemyDistance = Math.abs(this.ship.x - this.currentEnemy.x);
            
            if (true || shipToEnemyDistance < 150) {
                this.currentEnemy.setAlpha(1);
                this.enemyLabel.setAlpha(1);
                this.currentEnemy.setScale(1.1);
            } else {
                this.currentEnemy.setAlpha(0.6);
                this.enemyLabel.setAlpha(0.6);
                this.currentEnemy.setScale(1);
            }
        }
        
        if (this.elapsedTimeText && this.gameActive) {
            const elapsedSeconds = Math.floor((this.time.now - this.gameStartTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            this.elapsedTimeText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
    }
} 
