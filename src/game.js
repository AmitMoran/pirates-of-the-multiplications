/**
 * Main Game Configuration
 * Initializes Phaser with all scenes and settings
 */

// Initialize game data and save system
initializeGameData();
const savedData = SaveSystem.loadGame();
if (savedData) {
    Object.assign(GameData, savedData);
}

// Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 820,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [
        MenuScene,
        DifficultySelectScene,
        SailingScene,
        ChallengeScene,
        IslandScene,
        ShopScene,
    ],
    render: {
        pixelArt: false,
        antialias: true,
    },
    scale: {
        mode: Phaser.Scale.CENTER_BOTH,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'parent',
        max: {
            width: 1024,
            height: 1024,
        },
        min: {
            width: 480,
            height: 480,
        },
    },
};

// Create game instance
const game = new Phaser.Game(config);

// Handle window close - save game
window.addEventListener('beforeunload', () => {
    SaveSystem.saveGame(GameData);
});
