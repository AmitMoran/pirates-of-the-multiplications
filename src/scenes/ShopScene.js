/**
 * Shop Scene
 * Purchase ship cosmetics - all upgrades are visual only
 */

class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }
    
    create() {
        // Initialize cosmetics if not exists
        if (!GameData.cosmetics) {
            GameData.cosmetics = {
                purchased: [],
                equipped: {}
            };
        }
        
        // Stunning gradient background
        this.createGradientBackground();
        
        // Title with glow effect
        this.createTitle();
        
        // Coins display with animation
        this.createCoinsDisplay();
        
        // Create the visual pirate ship
        this.createShip();
        
        // Cosmetics shop (only cosmetics now, no functional upgrades)
        this.createCosmeticsShop();
        
        // Back button
        this.createBackButton();
        
        // Add floating particles for ambiance
        this.createAmbientParticles();
    }
    
    createGradientBackground() {
        const gradientCanvas = document.createElement('canvas');
        gradientCanvas.width = 820;
        gradientCanvas.height = 800;
        const ctx = gradientCanvas.getContext('2d');
        
        // Create radial gradient for dramatic effect
        const gradient = ctx.createRadialGradient(410, 400, 50, 410, 400, 500);
        gradient.addColorStop(0, '#2c1810');
        gradient.addColorStop(0.3, '#1a1a2e');
        gradient.addColorStop(0.6, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 820, 800);
        
        this.textures.addCanvas('shopBackground', gradientCanvas);
        this.add.sprite(410, 400, 'shopBackground').setDepth(-10);
    }
    
    createTitle() {
        const title = this.add.text(410, 40, '🏴‍☠️ PIRATE SHOP 🏴‍☠️', {
            font: 'bold 48px Arial',
            fill: '#FFD700',
            stroke: '#8B0000',
            strokeThickness: 4,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000',
                blur: 5,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        title.setDepth(100); // Ensure title is above everything
        
        // Pulsing animation
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createCoinsDisplay() {
        const coinBg = this.add.rectangle(100, 100, 200, 50, 0x000000, 0.7);
        coinBg.setStrokeStyle(2, 0xFFD700);
        coinBg.setDepth(50);
        
        this.coinText = this.add.text(100, 100, `💰 ${GameData.player.coins}`, {
            font: 'bold 24px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        this.coinText.setDepth(51);
        
        // Sparkle effect on coins
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                this.coinText.setScale(1.2);
                this.tweens.add({
                    targets: this.coinText,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300
                });
            },
            repeat: -1
        });
    }
    
    createShip() {
        // Ship container at left side
        const shipX = 150;
        const shipY = 450;
        
        // Ship base (hull)
        this.drawShipBase(shipX, shipY);
        
        // Ship glow effect
        const glow = this.add.rectangle(shipX, shipY, 200, 150, 0xFFD700, 0);
        glow.setStrokeStyle(3, 0xFFD700, 0.3);
        glow.setDepth(9);
        
        this.tweens.add({
            targets: glow,
            alpha: 0.6,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Ship label
        const shipLabel = this.add.text(shipX, shipY + 100, 'YOUR SHIP', {
            font: 'bold 18px Arial',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 3,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3
            }
        }).setOrigin(0.5);
        shipLabel.setDepth(11); // Above ship container
    }
    
    drawShipBase(shipX, shipY) {
        // Destroy old ship graphics if they exist
        if (this.shipContainer) {
            this.shipContainer.destroy(true);
        }
        
        // Create container for ship parts
        this.shipContainer = this.add.container(shipX, shipY);
        this.shipContainer.setDepth(10);
        
        // Hull (main body) - brown
        const hull = this.add.graphics();
        hull.fillStyle(0x8B4513, 1);
        hull.fillRoundedRect(-80, -5, 160, 45, 12);
        hull.lineStyle(3, 0x654321, 1);
        hull.strokeRoundedRect(-80, -5, 160, 45, 12);
        this.shipContainer.add(hull);
        
        // Mast
        const mast = this.add.graphics();
        mast.fillStyle(0x654321, 1);
        mast.fillRect(-8, -60, 16, 70);
        this.shipContainer.add(mast);
        
        // Sail (golden if purchased, otherwise white)
        const sailColor = this.hasCosmetic('goldenSail') ? 0xFFD700 : 0xFFFFFF;
        const sail = this.add.graphics();
        sail.fillStyle(sailColor, 1);
        sail.beginPath();
        sail.moveTo(-50, -50);
        sail.lineTo(50, -50);
        sail.lineTo(0, -90);
        sail.closePath();
        sail.fillPath();
        sail.lineStyle(2, 0xCCCCCC, 1);
        sail.strokePath();
        this.shipContainer.add(sail);
        
        // Sail emblem if purchased
        if (this.hasCosmetic('sailEmblem')) {
            const emblem = this.add.graphics();
            emblem.fillStyle(0xFFD700, 1);
            // Draw star
            emblem.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const px = Math.cos(angle) * 8;
                const py = Math.sin(angle) * 8 - 15;
                if (i === 0) emblem.moveTo(px, py);
                else emblem.lineTo(px, py);
            }
            emblem.closePath();
            emblem.fillPath();
            this.shipContainer.add(emblem);
        }
        
        // Flag (diamond silver if purchased, otherwise white)
        const flagColor = this.hasCosmetic('diamondFlag') ? 0xC0C0C0 : 0xFFFFFF;
        const flag = this.add.graphics();
        flag.fillStyle(flagColor, 1);
        flag.fillRect(8, -60, 30, 18);
        flag.lineStyle(1, 0x000000, 1);
        flag.strokeRect(8, -60, 30, 18);
        
        // Skull on flag
        flag.fillStyle(0x000000, 1);
        flag.fillCircle(23, -51, 6);
        
        // Skull crossbones for diamond flag
        if (this.hasCosmetic('diamondFlag')) {
            flag.lineStyle(2, 0x000000, 1);
            flag.beginPath();
            flag.moveTo(15, -58);
            flag.lineTo(31, -54);
            flag.moveTo(31, -58);
            flag.lineTo(15, -54);
            flag.strokePath();
        }
        this.shipContainer.add(flag);
        
        // Cannons (if purchased)
        if (this.hasCosmetic('cannon')) {
            const cannons = this.add.graphics();
            cannons.fillStyle(0x654321, 1);
            cannons.fillRect(-70, 5, 12, 8);
            cannons.fillRect(58, 5, 12, 8);
            // Cannon barrels
            cannons.fillStyle(0x8B4513, 1);
            cannons.fillRect(-72, 3, 16, 4);
            cannons.fillRect(56, 3, 16, 4);
            this.shipContainer.add(cannons);
        }
        
        // Treasure chest (if purchased)
        if (this.hasCosmetic('treasureChest')) {
            const chest = this.add.graphics();
            chest.fillStyle(0xFFD700, 1);
            chest.fillRect(-20, 20, 40, 25);
            chest.lineStyle(2, 0x8B4513, 1);
            chest.strokeRect(-20, 20, 40, 25);
            // Lock
            chest.fillStyle(0x8B4513, 1);
            chest.fillRect(-3, 28, 6, 8);
            this.shipContainer.add(chest);
        }
        
        // Anchor (if purchased)
        if (this.hasCosmetic('silverAnchor')) {
            const anchor = this.add.graphics();
            anchor.fillStyle(0xC0C0C0, 1);
            // Anchor shank
            anchor.fillRect(70, 20, 10, 30);
            // Anchor arms
            anchor.beginPath();
            anchor.moveTo(75, 50);
            anchor.lineTo(65, 60);
            anchor.lineTo(85, 60);
            anchor.closePath();
            anchor.fillPath();
            this.shipContainer.add(anchor);
        }
        
        // Portholes with golden lanterns if purchased
        const portholeColor = this.hasCosmetic('lantern') ? 0xFFD700 : 0x654321;
        const portholes = this.add.graphics();
        portholes.fillStyle(portholeColor, 1);
        portholes.fillCircle(-35, 8, 6);
        portholes.fillCircle(35, 8, 6);
        this.shipContainer.add(portholes);
        
        // Glow effect for lanterns
        if (this.hasCosmetic('lantern')) {
            const glow1 = this.add.graphics();
            glow1.fillStyle(0xFFD700, 0.5);
            glow1.fillCircle(-35, 8, 10);
            this.shipContainer.add(glow1);
            const glow2 = this.add.graphics();
            glow2.fillStyle(0xFFD700, 0.5);
            glow2.fillCircle(35, 8, 10);
            this.shipContainer.add(glow2);
        }
        
        // Parrot (if purchased) - on mast
        if (this.hasCosmetic('parrot')) {
            const parrot = this.add.graphics();
            // Body
            parrot.fillStyle(0xFF0000, 1);
            parrot.fillCircle(-15, -45, 8);
            // Beak
            parrot.fillStyle(0xFFA500, 1);
            parrot.beginPath();
            parrot.moveTo(-23, -45);
            parrot.lineTo(-28, -43);
            parrot.lineTo(-28, -47);
            parrot.closePath();
            parrot.fillPath();
            // Wing
            parrot.fillStyle(0x008000, 1);
            parrot.fillEllipse(-20, -40, 10, 6);
            this.shipContainer.add(parrot);
        }
        
        // Gentle floating animation
        this.tweens.add({
            targets: this.shipContainer,
            y: this.shipContainer.y - 8,
            duration: 3500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    hasCosmetic(id) {
        return GameData.cosmetics && GameData.cosmetics.purchased.includes(id);
    }
    
    createCosmeticsShop() {
        // Shop panel background
        const shopPanel = this.add.rectangle(580, 400, 440, 650, 0x1a1a2e, 0.8);
        shopPanel.setStrokeStyle(3, 0xFFD700);
        shopPanel.setOrigin(0.5);
        shopPanel.setDepth(1);
        
        // Separator line - separate graphics object, drawn below title only
        const separatorLine = this.add.graphics();
        separatorLine.clear(); // Clear any previous drawings
        separatorLine.lineStyle(1, 0xFFD700, 1);
        separatorLine.lineBetween(380, 155, 780, 155);
        separatorLine.setDepth(1.5); // Above panel, below container
        
        // Shop title
        const titleText = this.add.text(580, 130, 'COSMETICS', {
            font: 'bold 28px Arial',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        titleText.setDepth(100);
        
        // Define all cosmetic items
        this.cosmeticItems = [
            { id: 'goldenSail', name: 'Golden Sail', cost: 150, icon: '⛵', category: 'sail', color: 0xFFD700, description: 'Gleaming gold sails' },
            { id: 'diamondFlag', name: 'Diamond Skull Flag', cost: 200, icon: '🏴‍☠️', category: 'flag', color: 0xC0C0C0, description: 'Precious-diamond-flag' },
            { id: 'silverAnchor', name: 'Silver Anchor', cost: 100, icon: '⚓', category: 'anchor', color: 0xC0C0C0, description: 'Shiny silver anchor' },
            { id: 'cannon', name: 'Decorative Cannons', cost: 180, icon: '💣', category: 'cannon', color: 0x8B4513, description: 'Bronze cannons on deck' },
            { id: 'treasureChest', name: 'Treasure Chest', cost: 250, icon: '📦', category: 'chest', color: 0xFFD700, description: 'Golden treasure chest' },
            { id: 'parrot', name: 'Parrot Companion', cost: 120, icon: '🦜', category: 'parrot', color: 0xFF0000, description: 'Colorful ship parrot' },
            { id: 'lantern', name: 'Golden Lanterns', cost: 90, icon: '🪔', category: 'lantern', color: 0xFFD700, description: 'Glowing golden lanterns' },
            { id: 'sailEmblem', name: 'Sail Emblem', cost: 140, icon: '⭐', category: 'emblem', color: 0xFFD700, description: 'Star emblem on sails' },
        ];
        
        // Display cosmetics
        this.displayCosmetics();
    }
    
    displayCosmetics() {
        // Clear previous items
        if (this.cosmeticContainer) {
            this.cosmeticContainer.destroy(true);
        }
        
        this.cosmeticContainer = this.add.container(580, 250);
        this.cosmeticContainer.setDepth(50); // High depth to ensure it renders above all graphics
        
        this.cosmeticItems.forEach((item, index) => {
            const y = index * 75;
            this.createCosmeticItem(item, y);
        });
    }
    
    createCosmeticItem(item, y) {
        const isPurchased = this.hasCosmetic(item.id);
        
        // Item card with gradient - lighter background for purchased items
        const cardGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        const bgColor = isPurchased ? 0x1a3a0f : 0x2a2a4a;
        cardGraphics.fillStyle(bgColor, 0.85);
        cardGraphics.fillRoundedRect(-200, y - 30, 400, 65, 8);
        // Draw border - full rounded rect first, then cover the bottom border
        const borderColor = isPurchased ? 0x00AA00 : 0xFFD700;
        cardGraphics.lineStyle(2, borderColor, 1);
        cardGraphics.strokeRoundedRect(-200, y - 30, 400, 65, 8);
        // Cover the bottom border by drawing background color over it
        cardGraphics.fillStyle(bgColor, 0.85);
        cardGraphics.fillRect(-202, y + 32, 404, 6);
        
        cardGraphics.generateTexture('cosmetic_card_' + item.id, 400, 65);
        cardGraphics.destroy();
        
        const card = this.add.sprite(0, y, 'cosmetic_card_' + item.id);
        card.setDepth(1); // Background card at depth 1 within container
        this.cosmeticContainer.add(card);
        
        // Icon with color overlay - add after card so it renders on top
        const iconText = this.add.text(-170, y, item.icon, {
            font: '32px Arial',
        }).setOrigin(0.5);
        iconText.setDepth(20); // Text above card
        this.cosmeticContainer.add(iconText);
        
        // Add glow to icon if purchased
        if (isPurchased) {
            this.tweens.add({
                targets: iconText,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Item name - with stroke for better visibility - add after card
        const nameText = this.add.text(-120, y - 10, item.name, {
            font: 'bold 18px Arial',
            fill: isPurchased ? '#00FF00' : '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5);
        nameText.setDepth(20); // Text above card
        this.cosmeticContainer.add(nameText);
        
        // Description - with stroke for better visibility - add after card
        const descText = this.add.text(-120, y + 10, item.description, {
            font: '13px Arial',
            fill: isPurchased ? '#AAFFAA' : '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 1.5
        }).setOrigin(0, 0.5);
        descText.setDepth(20); // Text above card
        this.cosmeticContainer.add(descText);
        
        // Cost or purchased status
        if (isPurchased) {
            const checkText = this.add.text(160, y, '✓ OWNED', {
                font: 'bold 14px Arial',
                fill: '#00FF00',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(1, 0.5);
            checkText.setDepth(20); // Text above card
            this.cosmeticContainer.add(checkText);
        } else {
            const costText = this.add.text(160, y, `${item.cost} 💰`, {
                font: 'bold 16px Arial',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(1, 0.5);
            costText.setDepth(20); // Text above card
            this.cosmeticContainer.add(costText);
            
            // Buy button - add before text so button is below
            const buyBtn = this.add.rectangle(180, y, 60, 35, 0x00AA00);
            buyBtn.setStrokeStyle(2, 0xFFFFFF);
            buyBtn.setInteractive({ useHandCursor: true });
            buyBtn.setDepth(15); // Button above card but below text
            this.cosmeticContainer.add(buyBtn);
            
            const buyText = this.add.text(180, y, 'BUY', {
                font: 'bold 12px Arial',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5);
            buyText.setDepth(20); // Text above button
            this.cosmeticContainer.add(buyText);
            
            buyBtn.on('pointerover', () => {
                buyBtn.setFillStyle(0x00FF00);
                buyBtn.setScale(1.1);
            });
            
            buyBtn.on('pointerout', () => {
                buyBtn.setFillStyle(0x00AA00);
                buyBtn.setScale(1);
            });
            
            buyBtn.on('pointerdown', () => {
                if (GameData.player.coins >= item.cost) {
                    this.purchaseCosmetic(item);
                } else {
                    this.showInsufficientCoins();
                }
            });
        }
    }
    
    purchaseCosmetic(item) {
        // Deduct coins
        GameData.player.coins -= item.cost;
        
        // Add to purchased cosmetics
        if (!GameData.cosmetics.purchased.includes(item.id)) {
            GameData.cosmetics.purchased.push(item.id);
        }
        
        // Equip automatically
        GameData.cosmetics.equipped[item.category] = item.id;
        
        // Save game
        SaveSystem.saveGame(GameData);
        
        // Visual feedback
        this.showPurchaseEffect(item);
        
        // Refresh display
        this.time.delayedCall(800, () => {
            this.scene.restart();
        });
    }
    
    showPurchaseEffect(item) {
        // Create particle texture if it doesn't exist
        if (!this.textures.exists('particle_' + item.id)) {
            const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
            particleGraphics.fillStyle(item.color || 0xFFD700);
            particleGraphics.fillCircle(4, 4, 4);
            particleGraphics.generateTexture('particle_' + item.id, 8, 8);
            particleGraphics.destroy();
        }
        
        // Particle explosion effect
        const particles = this.add.particles(580, 250, 'particle_' + item.id, {
            speed: { min: 100, max: 250 },
            scale: { start: 1.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            quantity: 40,
            tint: item.color || 0xFFD700
        });
        particles.setDepth(200); // Highest depth - on top of everything
        
        this.time.delayedCall(600, () => {
            particles.destroy();
        });
        
        // Success message
        const successText = this.add.text(410, 400, '✨ PURCHASED! ✨', {
            font: 'bold 36px Arial',
            fill: '#00FF00',
            stroke: '#000',
            strokeThickness: 4,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000',
                blur: 5
            }
        }).setOrigin(0.5);
        successText.setDepth(201); // Even higher - on top of particles
        
        this.tweens.add({
            targets: successText,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 800,
            onComplete: () => successText.destroy()
        });
        
        // Update coin display
        this.coinText.setText(`💰 ${GameData.player.coins}`);
        this.coinText.setScale(1.3);
        this.tweens.add({
            targets: this.coinText,
            scaleX: 1,
            scaleY: 1,
            duration: 300
        });
        
        // Flash ship to show update
        if (this.shipContainer) {
            this.tweens.add({
                targets: this.shipContainer,
                alpha: 0.5,
                duration: 200,
                yoyo: true,
                repeat: 1
            });
        }
    }
    
    showInsufficientCoins() {
        const errorText = this.add.text(410, 400, '❌ Not enough coins! ❌', {
            font: 'bold 28px Arial',
            fill: '#FF0000',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        errorText.setDepth(201); // On top of everything
        
        this.tweens.add({
            targets: errorText,
            alpha: 0,
            y: errorText.y - 50,
            duration: 1500,
            onComplete: () => errorText.destroy()
        });
        
        // Shake coin display
        this.tweens.add({
            targets: this.coinText,
            x: this.coinText.x - 10,
            duration: 100,
            yoyo: true,
            repeat: 4
        });
    }
    
    createBackButton() {
        const backBtn = this.add.rectangle(100, 750, 140, 40, 0x8B0000);
        backBtn.setStrokeStyle(2, 0xFFD700);
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.setDepth(100);
        
        const backText = this.add.text(100, 750, '← BACK', {
            font: 'bold 18px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        backText.setDepth(101);
        
        backBtn.on('pointerover', () => {
            backBtn.setFillStyle(0xB80000);
            backBtn.setScale(1.1);
        });
        
        backBtn.on('pointerout', () => {
            backBtn.setFillStyle(0x8B0000);
            backBtn.setScale(1);
        });
        
        backBtn.on('pointerdown', () => {
            SaveSystem.saveGame(GameData);
            this.scene.start('MenuScene');
        });
    }
    
    createAmbientParticles() {
        // Create star texture if it doesn't exist
        if (!this.textures.exists('star')) {
            const starGraphics = this.make.graphics({ x: 0, y: 0, add: false });
            starGraphics.fillStyle(0xFFFFFF);
            starGraphics.fillCircle(4, 4, 4);
            starGraphics.generateTexture('star', 8, 8);
            starGraphics.destroy();
        }
        
        // Create star particles for ambiance
        const stars = this.add.particles(0, 0, 'star', {
            x: { min: 0, max: 820 },
            y: { min: 0, max: 800 },
            speedY: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            lifespan: 5000,
            frequency: 500,
            tint: 0xFFD700,
            alpha: 0.6
        });
        
        stars.setDepth(-5);
    }
}
