/**
 * Challenge Scene
 * Displays multiplication questions with timer and answer options
 */

class ChallengeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChallengeScene' });
    }
    
    init(data) {
        this.enemyName = data.enemy; // Now it's just a string
        this.difficulty = data.difficulty;
        
        // Get answer input mode from settings (default to 'buttons' if not set)
        this.answerInputMode = GameData.settings?.answerInputMode || 'buttons';
        
        // Reset all timers and tweens to ensure clean state
        this.time.removeAllEvents();
        this.tweens.killAll();
        
        this.questions = DifficultyManager.generateQuestions(
            this.difficulty,
            DifficultyManager.getDifficulty(this.difficulty).questionCount
        );
        
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
    }
    
    create() {
        // Create dramatic battle background with gradient
        const screenHeight = this.game.config.height;
        const screenWidth = this.game.config.width;
        
        // Dark background
        this.cameras.main.setBackgroundColor('#0a0a0a');
        
        // Battle arena gradient effect
        const bgTop = this.add.rectangle(screenWidth / 2, 0, screenWidth, screenHeight * 0.4, 0x1a1a2e);
        bgTop.setOrigin(0.5, 0);
        bgTop.setDepth(-2);
        
        const bgMiddle = this.add.rectangle(screenWidth / 2, screenHeight * 0.4, screenWidth, screenHeight * 0.4, 0x2a2a3e);
        bgMiddle.setOrigin(0.5, 0);
        bgMiddle.setDepth(-2);
        
        const bgBottom = this.add.rectangle(screenWidth / 2, screenHeight * 0.8, screenWidth, screenHeight * 0.2, 0x1a1a2e);
        bgBottom.setOrigin(0.5, 0);
        bgBottom.setDepth(-2);
        
        // Enable input for the scene
        this.input.enabled = true;
        
        // Initialize timer values (will be properly set in displayQuestion)
        const settings = DifficultyManager.getDifficulty(this.difficulty);
        this.questionTimeout = settings.timePerQuestion * 1000;
        
        // Title with enemy name
        const titleText = this.add.text(400, 40, `⚔️ Battle: ${this.enemyName} ⚔️`, {
            font: 'bold 36px Arial',
            fill: '#ff0000',
            align: 'center',
            stroke: '#FFD700',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(10);
        
        // Progress
        this.progressText = this.add.text(50, 90, `Question ${this.currentQuestionIndex + 1}/${this.questions.length}`, {
            font: 'bold 18px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1,
        }).setDepth(10);
        
        // Timer - display the correct initial time
        const initialSeconds = Math.ceil(this.questionTimeout / 1000);
        this.timerText = this.add.text(750, 90, `⏱️ ${initialSeconds}s`, {
            font: 'bold 18px Arial',
            fill: '#00ff00',
            align: 'right',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(1, 0).setDepth(10);
        
        // Enemy health/progress visual
        this.createEnemyVisual();
        
        // Display question
        this.displayQuestion();
    }
    
    createEnemyVisual() {
        const enemyX = 400;
        const enemyY = 200;
        
        // Enemy glow halo
        const enemyGlow = this.add.circle(enemyX, enemyY, 70, 0xFF0000, 0.1);
        enemyGlow.setDepth(3);
        
        // Enemy visual - simple circle (use generic red color)
        const enemyCircle = this.add.circle(enemyX, enemyY, 50, 0xFF0000, 0.3);
        enemyCircle.setStrokeStyle(3, 0xFF0000, 1);
        enemyCircle.setDepth(4);
        
        // Enemy name/label
        this.add.text(enemyX, enemyY, this.enemyName, {
            font: 'bold 75px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setDepth(5);
        
        // Add animated glow pulse
        this.tweens.add({
            targets: enemyGlow,
            scaleX: 1.7,
            scaleY: 1.7,
            alpha: 0.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
        
        // Health bar background (dark)
        const healthBarBg = this.add.rectangle(enemyX, enemyY + 90, 200, 15, 0x1a1a1a)
            .setStrokeStyle(2, 0xFFFFFF).setDepth(4);
        
        // Enemy health bar fill (red)
        const healthPercent = (this.currentQuestionIndex / this.questions.length);
        this.enemyHealthBar = this.add.rectangle(
            enemyX - 100, 
            enemyY + 90, 
            healthPercent * 200, 
            11, 
            0xff0000
        ).setOrigin(0, 0.5).setDepth(5);
        
        // Health bar glow
        this.tweens.add({
            targets: this.enemyHealthBar,
            alpha: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    displayQuestion() {
        // Reset button references
        this.answerButtons = {};
        
        // Reset input value for typing mode
        if (this.answerInputMode === 'typing') {
            this.currentInputValue = '';
            // Remove keyboard listener
            this.input.keyboard.off('keydown', this.handleTypingInput, this);
        }
        
        // AGGRESSIVE CLEANUP - Remove ALL question-related elements
        const childrenToRemove = [];
        
        this.children.list.forEach(child => {
            if (!child) return;
            
            // Always remove by name if matched
            if (child.name) {
                if (child.name.includes('question') || 
                    child.name.includes('answer') || 
                    child.name.includes('feedback') ||
                    child.name.includes('flash') ||
                    child.name.includes('correct_answer') ||
                    child.name.includes('answer_input') ||
                    child.name.includes('submit_button')) {
                    childrenToRemove.push(child);
                    return;
                }
            }
            
            // Remove all objects in question/button areas by Y position
            // Y: 280-580 is the question and answer area
            if (child.y >= 280 && child.y <= 580) {
                // Protect specific UI elements by checking text content
                if (child.type === 'Text' && child.text) {
                    if (child.text.includes('Question') || 
                        child.text.includes('Battle:') || 
                        child.text.includes('⏱️')) {
                        return; // Protect this text
                    }
                }
                
                // Get the constructor name to better identify object types
                const constructorName = child.constructor.name;
                
                // Remove specific types in the question area
                if (constructorName === 'Text' ||      // Text elements
                    constructorName === 'Sprite' ||    // Button sprites
                    constructorName === 'Graphics' ||  // Graphics
                    constructorName === 'Image' ||     // Images
                    constructorName === 'Rectangle' || // Rectangles
                    constructorName === 'Circle' ||    // Circles
                    constructorName === 'Ellipse' ||   // Ellipses
                    constructorName === 'Line' ||      // Lines
                    constructorName === 'Curve') {     // Curves
                    childrenToRemove.push(child);
                }
            }
        });
        
        // Destroy all collected children
        childrenToRemove.forEach(child => {
            if (child && child.active) {
                child.destroy();
            }
        });
        
        const question = this.questions[this.currentQuestionIndex];
        
        // NEW QUESTION FLASH - Visual indication
        const flashRect = this.add.rectangle(400, 400, 800, 600, 0xFFFF00, 0.2);
        flashRect.setName('flash_indicator');
        this.tweens.add({
            targets: flashRect,
            alpha: 0,
            duration: 400,
            ease: 'Quad.out',
            onComplete: () => {
                flashRect.destroy();
            }
        });
        
        // Question text - big and bold
        this.add.text(400, 350, question.question, {
            font: 'bold 72px Arial',
            fill: '#FFD700',
            align: 'center',
        }).setOrigin(0.5).setName('question_text');
        
        // Update progress text
        this.progressText.setText(`Question ${this.currentQuestionIndex + 1}/${this.questions.length}`);
        
        this.currentQuestion = question;
        
        // Create input UI based on settings
        if (this.answerInputMode === 'typing') {
            this.createTypingInput();
        } else {
            // Answer options (buttons mode)
            const answers = DifficultyManager.generateWrongAnswers(question.answer);
            const buttonWidth = 150;
            const buttonHeight = 80;
            const startX = 150;
            const startY = 500;
            
            // Store button references for easy access
            this.answerButtons = {};
            
            answers.forEach((answer, index) => {
                const x = startX + (index * (buttonWidth + 50));
                const y = startY;
                
                // Create answer button and store reference
                const buttonData = this.createAnswerButton(x, y, buttonWidth, buttonHeight, answer, answer === question.answer);
                this.answerButtons[answer] = buttonData;
            });
        }
        
        // Enable input for this question
        this.input.enabled = true;
        
        // Re-enable keyboard input for typing mode - always remove first to prevent duplicates
        if (this.answerInputMode === 'typing' && this.input.keyboard) {
            this.input.keyboard.off('keydown', this.handleTypingInput, this);
            this.input.keyboard.on('keydown', this.handleTypingInput, this);
            this.updateInputDisplay();
        }
        
        // Reset timer for this question
        this.questionStartTime = this.time.now;
        
        // Remove old timer event if it exists
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
        
        // Remove old display update timer if exists
        if (this.displayTimerEvent) {
            this.displayTimerEvent.remove();
            this.displayTimerEvent = null;
        }
        
        // Update timer display immediately to show correct initial time
        this.updateTimerDisplay();
        
        // Set new timer event for this specific question
        this.timerEvent = this.time.delayedCall(this.questionTimeout, () => {
            this.answerQuestion(false, true); // Time up = wrong answer, timedOut flag
        });
        
        // Create a repeating timer to update the display (every 500ms)
        this.displayTimerEvent = this.time.addEvent({
            delay: 500,
            callback: () => {
                this.updateTimerDisplay();
            },
            loop: true
        });
    }
    
    createTypingInput() {
        const inputY = 500;
        const inputWidth = 300;
        const inputHeight = 80;
        
        // Input field background
        const inputBg = this.add.rectangle(400, inputY, inputWidth, inputHeight, 0x2a6ea0, 0.8);
        inputBg.setStrokeStyle(3, 0xFFFFFF);
        inputBg.setName('answer_input_bg');
        
        // Input field text display
        this.answerInputText = this.add.text(400, inputY, '', {
            font: 'bold 48px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setName('answer_input_text');
        
        // Prompt text
        this.add.text(400, inputY - 60, 'Type your answer:', {
            font: 'bold 24px Arial',
            fill: '#FFD700',
            align: 'center',
        }).setOrigin(0.5).setName('answer_input_prompt');
        
        // Submit button
        const submitButtonBg = this.add.rectangle(400, inputY + 100, 200, 60, 0x00AA00, 0.8);
        submitButtonBg.setStrokeStyle(2, 0xFFFFFF);
        submitButtonBg.setInteractive().setName('submit_button');
        submitButtonBg.on('pointerover', () => {
            submitButtonBg.setScale(1.05);
            submitButtonBg.setTint(0x00ff00);
        });
        submitButtonBg.on('pointerout', () => {
            submitButtonBg.setScale(1);
            submitButtonBg.clearTint();
        });
        submitButtonBg.on('pointerdown', () => {
            this.submitTypedAnswer();
        });
        
        const submitText = this.add.text(400, inputY + 100, 'SUBMIT', {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setName('submit_button_text');
        
        // Store current input value
        this.currentInputValue = '';
        
        // Enable keyboard input - always remove first to prevent duplicates
        this.input.keyboard.off('keydown', this.handleTypingInput, this);
        this.input.keyboard.on('keydown', this.handleTypingInput, this);
        
        // Focus on input field
        this.input.keyboard.clearCaptures();
    }
    
    handleTypingInput(event) {
        // Ignore input if answering is disabled
        if (!this.input.enabled) return;
        
        // Prevent default to avoid duplicate handling
        event.preventDefault();
        event.stopPropagation();
        
        // Handle backspace
        if (event.key === 'Backspace') {
            this.currentInputValue = this.currentInputValue.slice(0, -1);
            this.updateInputDisplay();
            return;
        }
        
        // Handle Enter key to submit
        if (event.key === 'Enter') {
            this.submitTypedAnswer();
            return;
        }
        
        // Handle numeric input (0-9)
        // Check both regular number keys and numpad
        let numberPressed = null;
        
        if (event.key >= '0' && event.key <= '9') {
            numberPressed = event.key;
        } else if (event.keyCode >= 96 && event.keyCode <= 105) {
            // Number pad
            numberPressed = (event.keyCode - 96).toString();
        }
        
        if (numberPressed !== null) {
            // Limit input length to prevent overflow
            if (this.currentInputValue.length < 6) {
                this.currentInputValue += numberPressed;
                this.updateInputDisplay();
            }
            return;
        }
    }
    
    updateInputDisplay() {
        if (this.answerInputText) {
            this.answerInputText.setText(this.currentInputValue || '');
        }
    }
    
    submitTypedAnswer() {
        if (!this.input.enabled) return;
        
        // If no input, treat as wrong answer (or could skip submission)
        if (!this.currentInputValue || this.currentInputValue.trim() === '') {
            return;
        }
        
        const typedAnswer = parseInt(this.currentInputValue);
        const isCorrect = typedAnswer === this.currentQuestion.answer;
        
        // Disable keyboard input
        this.input.keyboard.off('keydown', this.handleTypingInput, this);
        
        this.answerQuestion(isCorrect, false);
    }
    
    createAnswerButton(x, y, width, height, answer, isCorrect) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        graphics.fillStyle(0x2a6ea0, 0.7);
        graphics.fillRect(x - width / 2, y - height / 2, width, height);
        graphics.lineStyle(2, 0xFFFFFF);
        graphics.strokeRect(x - width / 2, y - height / 2, width, height);
        
        graphics.generateTexture('answer_button_' + answer, width, height);
        graphics.destroy();
        
        const button = this.add.sprite(x, y, 'answer_button_' + answer)
            .setInteractive()
            .setName('answer_button_' + answer)
            .on('pointerover', function() {
                this.setScale(1.1);
                this.setTint(0xffff00);
            })
            .on('pointerout', function() {
                this.setScale(1);
                this.clearTint();
            })
            .on('pointerdown', () => {
                this.answerQuestion(isCorrect, false); // Not timed out
            });
        
        const buttonText = this.add.text(x, y, answer.toString(), {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setName('answer_text_' + answer);
        
        // Return references for easy access
        return {
            button: button,
            text: buttonText,
            x: x,
            y: y,
            answer: answer
        };
    }
    
    answerQuestion(isCorrect, timedOut = false) {
        // Disable inputs and stop all timers
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
        if (this.displayTimerEvent) {
            this.displayTimerEvent.remove();
            this.displayTimerEvent = null;
        }
        this.input.enabled = false;
        
        // Disable keyboard input if typing mode
        if (this.answerInputMode === 'typing') {
            this.input.keyboard.off('keydown', this.handleTypingInput, this);
        }
        
        let feedbackMessage = '';
        let feedbackColor = 0x00ff00;
        
        if (isCorrect) {
            this.correctAnswers++;
            feedbackMessage = '✅ CORRECT!';
            feedbackColor = 0x00ff00;
            
            // Update enemy health
            const healthPercent = (this.currentQuestionIndex + 1) / this.questions.length;
            this.tweens.add({
                targets: this.enemyHealthBar,
                width: healthPercent * 200,
                duration: 300,
            });
            
            // Update statistics
            GameData.statistics.correctAnswers++;
        } else {
            feedbackMessage = timedOut 
                ? `⏰ TIME'S UP!`
                : `❌ WRONG!`;
            feedbackColor = 0xff0000;
            GameData.statistics.wrongAnswers++;
            
            // Highlight the correct answer button visually
            this.highlightCorrectAnswer();
            
            // Display correct answer prominently
            this.showCorrectAnswer();
        }
        
        // Show feedback
        this.showFeedback(feedbackMessage, feedbackColor);
        
        // Check if this is the last question
        const isLastQuestion = this.currentQuestionIndex >= this.questions.length - 1;
        
        // Move to next question or end battle
        this.time.delayedCall(2000, () => {
            this.currentQuestionIndex++;
            
            if (isLastQuestion) {
                // Battle complete - last question answered
                const success = this.correctAnswers > (this.questions.length / 2);
                this.endBattle(success);
            } else {
                // Next question - display it with fresh timer
                this.displayQuestion();
                this.input.enabled = true;
                
                // Re-enable keyboard input for typing mode - always remove first to prevent duplicates
                if (this.answerInputMode === 'typing' && this.input.keyboard) {
                    this.input.keyboard.off('keydown', this.handleTypingInput, this);
                    this.input.keyboard.on('keydown', this.handleTypingInput, this);
                }
            }
        });
    }
    
    highlightCorrectAnswer() {
        const correctAnswer = this.currentQuestion.answer;
        
        // For typing mode, just show the correct answer (already handled in showCorrectAnswer)
        if (this.answerInputMode === 'typing') {
            return;
        }
        
        // Use stored button references if available
        if (this.answerButtons && this.answerButtons[correctAnswer]) {
            const buttonData = this.answerButtons[correctAnswer];
            const button = buttonData.button;
            const text = buttonData.text;
            
            // Highlight the button with green tint
            button.setTint(0x00ff00);
            
            // Add pulsing glow effect behind button
            const glowCircle = this.add.circle(button.x, button.y, 100, 0x00ff00, 0.4);
            glowCircle.setDepth(button.depth - 1);
            glowCircle.setName('correct_answer_glow');
            
            // Animate glow pulse
            this.tweens.add({
                targets: glowCircle,
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: 0.2,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut'
            });
            
            // Scale up the button
            this.tweens.add({
                targets: button,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 400,
                ease: 'Back.out'
            });
            
            // Make text larger, brighter, and green
            text.setStyle({
                font: 'bold 48px Arial',
                fill: '#00ff00',
                stroke: '#ffffff',
                strokeThickness: 4
            });
            
            // Add checkmark next to correct answer
            const checkmark = this.add.text(text.x - 85, text.y, '✅', {
                font: 'bold 48px Arial',
            }).setOrigin(0.5).setDepth(100).setName('correct_answer_checkmark');
            
            // Animate checkmark with bounce
            checkmark.setScale(0);
            this.tweens.add({
                targets: checkmark,
                scale: 1.2,
                duration: 500,
                ease: 'Back.out',
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    checkmark.setScale(1);
                }
            });
            
            return;
        }
        
        // Fallback: search through children if references not available
        this.children.list.forEach(child => {
            if (!child) return;
            
            const constructorName = child.constructor.name;
            
            // Find button sprite for correct answer
            if (child.name === 'answer_button_' + correctAnswer && constructorName === 'Sprite') {
                child.setTint(0x00ff00);
                
                const glowCircle = this.add.circle(child.x, child.y, 100, 0x00ff00, 0.4);
                glowCircle.setDepth(child.depth - 1);
                glowCircle.setName('correct_answer_glow');
                
                this.tweens.add({
                    targets: glowCircle,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    alpha: 0.2,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.inOut'
                });
                
                this.tweens.add({
                    targets: child,
                    scaleX: 1.3,
                    scaleY: 1.3,
                    duration: 400,
                    ease: 'Back.out'
                });
            }
            
            // Find text for correct answer
            if (child.name === 'answer_text_' + correctAnswer && constructorName === 'Text') {
                child.setStyle({
                    font: 'bold 48px Arial',
                    fill: '#00ff00',
                    stroke: '#ffffff',
                    strokeThickness: 4
                });
                
                const checkmark = this.add.text(child.x - 85, child.y, '✅', {
                    font: 'bold 48px Arial',
                }).setOrigin(0.5).setDepth(100).setName('correct_answer_checkmark');
                
                checkmark.setScale(0);
                this.tweens.add({
                    targets: checkmark,
                    scale: 1.2,
                    duration: 500,
                    ease: 'Back.out',
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        checkmark.setScale(1);
                    }
                });
            }
        });
    }
    
    showCorrectAnswer() {
        const correctAnswer = this.currentQuestion.answer;
        
        // Create a prominent display of the correct answer below the question
        const answerBg = this.add.rectangle(400, 430, 400, 80, 0x000000, 0.85);
        answerBg.setStrokeStyle(4, 0x00ff00);
        answerBg.setDepth(50);
        answerBg.setName('correct_answer_display');
        
        const answerText = this.add.text(400, 410, 'Correct Answer:', {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setDepth(51).setName('correct_answer_label');
        
        const answerValue = this.add.text(400, 450, correctAnswer.toString(), {
            font: 'bold 56px Arial',
            fill: '#00ff00',
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(51).setName('correct_answer_value');
        
        // Pulse animation
        this.tweens.add({
            targets: answerBg,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 400,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.inOut'
        });
    }
    
    showFeedback(message, color) {
        // Show feedback message below the correct answer display
        const feedbackY = 540;
        
        // Create a feedback display
        const feedbackBg = this.add.rectangle(400, feedbackY, 500, 70, 0x000000, 0.8);
        feedbackBg.setStrokeStyle(3, color);
        feedbackBg.setDepth(99);
        feedbackBg.setName('feedback_bg');
        
        const feedback = this.add.text(400, feedbackY, message, {
            font: 'bold 32px Arial',
            fill: color,
            align: 'center',
        }).setOrigin(0.5)
            .setPadding(15)
            .setDepth(100)
            .setName('feedback');
        
        // Keep visible for 2 seconds, then fade
        this.tweens.add({
            targets: [feedback, feedbackBg],
            alpha: 0,
            duration: 500,
            delay: 2000,
            ease: 'Quad.in',
            onComplete: () => {
                feedback.destroy();
                feedbackBg.destroy();
            }
        });
    }
    
    endBattle(success) {
        // Disable input immediately
        this.input.enabled = false;
        
        // Remove all timers
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
        if (this.displayTimerEvent) {
            this.displayTimerEvent.remove();
            this.displayTimerEvent = null;
        }
        
        const resultText = success ? 'VICTORY! ⚔️' : 'DEFEAT! ⚰️';
        const color = success ? '#00ff00' : '#ff0000';
        
        // Reward calculation
        const timeTaken = (Date.now() - this.startTime) / 1000;
        const reward = DifficultyManager.calculateReward(
            this.difficulty,
            this.correctAnswers,
            this.questions.length,
            timeTaken
        );
        
        if (success) {
            GameData.player.coins += reward.total;
            GameData.statistics.challengesCompleted++;
        } else {
            GameData.statistics.challengesFailed++;
        }
        
        SaveSystem.saveGame(GameData);
        
        // DRAMATIC EFFECT: Create fade to black overlay
        const fadeOverlay = this.add.rectangle(400, 400, 800, 800, 0x000000, 0);
        fadeOverlay.setDepth(200);
        
        // Fade to black over 600ms
        this.tweens.add({
            targets: fadeOverlay,
            alpha: 0.95,
            duration: 600,
            ease: 'Power2.in'
        });
        
        // Clear all scene objects during fade (delay slightly for effect)
        this.time.delayedCall(300, () => {
            // Remove all children except the overlay
            const childrenToRemove = [];
            this.children.list.forEach(child => {
                if (child !== fadeOverlay && child.active) {
                    childrenToRemove.push(child);
                }
            });
            childrenToRemove.forEach(child => {
                if (child && child.active) {
                    child.destroy();
                }
            });
        });
        
        // Show result screen after fade completes
        this.time.delayedCall(800, () => {
            // Create new result container with dramatic entrance
            
            // Result text - scales in from small
            const resultTitle = this.add.text(400, 250, resultText, {
                font: 'bold 80px Arial',
                fill: color,
                align: 'center',
                stroke: '#ffffff',
                strokeThickness: 3,
            }).setOrigin(0.5)
                .setDepth(201)
                .setScale(0)
                .setShadow(0, 0, '#000000', 10, true);
            
            // Animate result text scaling in
            this.tweens.add({
                targets: resultTitle,
                scale: 1,
                duration: 400,
                ease: 'Back.out'
            });
            
            // Correct answers display - fades in
            const answersText = this.add.text(400, 360, `Correct Answers: ${this.correctAnswers}/${this.questions.length}`, {
                font: 'bold 28px Arial',
                fill: '#ffffff',
                align: 'center',
            }).setOrigin(0.5)
                .setDepth(201)
                .setAlpha(0);
            
            this.tweens.add({
                targets: answersText,
                alpha: 1,
                duration: 500,
                delay: 200,
                ease: 'Linear'
            });
            
            // Victory/defeat specific display
            if (success) {
                // Victory stats
                const coinsText = this.add.text(400, 430, `💰 Coins Earned: ${reward.total}`, {
                    font: 'bold 28px Arial',
                    fill: '#FFD700',
                    align: 'center',
                    stroke: '#AA8800',
                    strokeThickness: 2,
                }).setOrigin(0.5)
                    .setDepth(201)
                    .setAlpha(0);
                
                this.tweens.add({
                    targets: coinsText,
                    alpha: 1,
                    duration: 500,
                    delay: 400,
                    ease: 'Linear'
                });
                
                // Coin pickup animation
                this.time.delayedCall(500, () => {
                    for (let i = 0; i < 5; i++) {
                        const coin = this.add.text(
                            400 + (Math.random() - 0.5) * 100,
                            430 + (Math.random() - 0.5) * 50,
                            '💰',
                            {
                                font: '40px Arial'
                            }
                        ).setDepth(201)
                            .setAlpha(1);
                        
                        this.tweens.add({
                            targets: coin,
                            y: 430 - 150,
                            alpha: 0,
                            duration: 800,
                            ease: 'Power2.in'
                        });
                    }
                });
            } else {
                // Defeat message
                const defeatMsg = this.add.text(400, 430, 'Better luck next time! 🗡️', {
                    font: 'bold 24px Arial',
                    fill: '#ff9999',
                    align: 'center',
                }).setOrigin(0.5)
                    .setDepth(201)
                    .setAlpha(0);
                
                this.tweens.add({
                    targets: defeatMsg,
                    alpha: 1,
                    duration: 500,
                    delay: 400,
                    ease: 'Linear'
                });
            }
            
            // Fade out overlay to reveal result
            this.tweens.add({
                targets: fadeOverlay,
                alpha: 0.3,
                duration: 400,
                ease: 'Linear'
            });
        });
        
        // Return to sailing scene after dramatic display
        this.time.delayedCall(3500, () => {
            this.scene.get('SailingScene').handleBattleComplete(success);
        });
    }
    
    restart() {
        this.input.enabled = true;
        this.scene.restart();
    }
    
    update() {
        // Timer display is now handled by updateTimerDisplay() method
        // which uses the actual question timeout timer
    }

    updateTimerDisplay() {
        if (this.questionStartTime === undefined) return;
        
        // Calculate remaining time from question start
        const elapsed = Math.max(0, this.time.now - this.questionStartTime);
        const timeRemaining = Math.max(0, this.questionTimeout - elapsed);
        const secondsLeft = Math.ceil(timeRemaining / 1000);
        this.timerText.setText(`⏱️ ${secondsLeft}s`);
        
        // Change color if time is running out
        if (secondsLeft <= 3) {
            this.timerText.setFill('#ff0000');
        } else {
            this.timerText.setFill('#00ff00');
        }
    }
}
