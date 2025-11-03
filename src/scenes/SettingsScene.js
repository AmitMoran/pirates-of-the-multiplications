/**
 * Settings Scene
 * Allows players to configure game settings
 */

class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }
    
    create() {
        // Background
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Title
        this.add.text(400, 60, '⚙️ SETTINGS ⚙️', {
            font: 'bold 48px Arial',
            fill: '#f4a460',
            align: 'center',
        }).setOrigin(0.5);
        
        // Initialize settings if they don't exist
        if (!GameData.settings) {
            GameData.settings = {
                answerInputMode: 'buttons',
            };
        }
        
        // Answer Input Mode Setting
        const inputModeY = 200;
        this.add.text(400, inputModeY, 'Answer Input Mode', {
            font: 'bold 28px Arial',
            fill: '#FFD700',
            align: 'center',
        }).setOrigin(0.5);
        
        this.add.text(400, inputModeY + 40, 'Choose how you want to answer questions:', {
            font: '18px Arial',
            fill: '#ddd',
            align: 'center',
        }).setOrigin(0.5);
        
        // Current mode display
        const currentMode = GameData.settings.answerInputMode || 'buttons';
        this.currentModeText = this.add.text(400, inputModeY + 80, `Current: ${currentMode === 'buttons' ? 'Buttons' : 'Typing'}`, {
            font: 'bold 24px Arial',
            fill: '#00ff00',
            align: 'center',
        }).setOrigin(0.5);
        
        // Buttons mode button - store references
        const buttonsButtonY = inputModeY + 140;
        this.modeButtons = {};
        this.modeButtons.buttons = this.createModeButton(300, buttonsButtonY, 'BUTTONS', 'buttons', currentMode === 'buttons');
        this.modeButtons.typing = this.createModeButton(500, buttonsButtonY, 'TYPING', 'typing', currentMode === 'typing');
        
        // Description texts
        this.add.text(300, buttonsButtonY + 60, 'Select from\nmultiple choices', {
            font: '16px Arial',
            fill: '#aaa',
            align: 'center',
        }).setOrigin(0.5);
        
        this.add.text(500, buttonsButtonY + 60, 'Type your\nanswer directly', {
            font: '16px Arial',
            fill: '#aaa',
            align: 'center',
        }).setOrigin(0.5);
        
        // Back button
        const backButtonY = 650;
        this.createButton(400, backButtonY, 300, 60, 'BACK TO MENU', () => {
            SaveSystem.saveGame(GameData);
            this.scene.start('MenuScene');
        }, '#666666');
        
        // Instructions
        this.add.text(400, 720, 'Changes are saved automatically', {
            font: 'italic 14px Arial',
            fill: '#888',
            align: 'center',
        }).setOrigin(0.5);
    }
    
    createModeButton(x, y, text, mode, isSelected) {
        const buttonWidth = 150;
        const buttonHeight = 60;
        const color = isSelected ? '#00AA00' : '#666666';
        const hoverColor = isSelected ? '#00ff00' : '#888888';
        
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.8);
        graphics.fillRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight);
        graphics.lineStyle(2, 0xFFFFFF);
        graphics.strokeRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight);
        
        // Highlight if selected
        if (isSelected) {
            graphics.lineStyle(4, 0xFFD700);
            graphics.strokeRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight);
        }
        
        graphics.generateTexture('mode_button_' + mode + (isSelected ? '_sel' : ''), buttonWidth, buttonHeight);
        graphics.destroy();
        
        const button = this.add.sprite(x, y, 'mode_button_' + mode + (isSelected ? '_sel' : ''))
            .setInteractive()
            .on('pointerover', () => {
                button.setScale(1.05);
                button.setTint(Phaser.Display.Color.HexStringToColor(hoverColor).color);
            })
            .on('pointerout', () => {
                button.setScale(1);
                button.clearTint();
            })
            .on('pointerdown', () => {
                this.selectInputMode(mode);
            });
        
        const buttonText = this.add.text(x, y, text, {
            font: 'bold 18px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setDepth(10);
        
        return { button: button, text: buttonText, mode: mode, x: x, y: y };
    }
    
    selectInputMode(mode) {
        GameData.settings.answerInputMode = mode;
        SaveSystem.saveGame(GameData);
        
        // Update current mode display
        this.currentModeText.setText(`Current: ${mode === 'buttons' ? 'Buttons' : 'Typing'}`);
        
        // Update button visuals
        if (this.modeButtons) {
            Object.keys(this.modeButtons).forEach(key => {
                const buttonData = this.modeButtons[key];
                const isSelected = key === mode;
                
                // Destroy old button and text
                buttonData.button.destroy();
                buttonData.text.destroy();
                
                // Recreate with new selection state
                this.modeButtons[key] = this.createModeButton(
                    buttonData.x, 
                    buttonData.y, 
                    key === 'buttons' ? 'BUTTONS' : 'TYPING', 
                    key, 
                    isSelected
                );
            });
        }
        
        // Visual feedback
        const feedback = this.add.text(400, 450, '✓ Setting saved!', {
            font: 'bold 20px Arial',
            fill: '#00ff00',
            align: 'center',
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: feedback,
            alpha: 0,
            duration: 1000,
            delay: 1000,
            onComplete: () => {
                feedback.destroy();
            }
        });
    }
    
    createButton(x, y, width, height, text, callback, color) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.8);
        graphics.fillRect(x - width / 2, y - height / 2, width, height);
        graphics.lineStyle(2, 0xFFFFFF);
        graphics.strokeRect(x - width / 2, y - height / 2, width, height);
        
        graphics.generateTexture('button_' + text, width, height);
        graphics.destroy();
        
        const button = this.add.sprite(x, y, 'button_' + text)
            .setInteractive()
            .on('pointerover', () => {
                button.setScale(1.1);
            })
            .on('pointerout', () => {
                button.setScale(1);
            })
            .on('pointerdown', callback);
        
        this.add.text(x, y, text, {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setDepth(10);
    }
}

