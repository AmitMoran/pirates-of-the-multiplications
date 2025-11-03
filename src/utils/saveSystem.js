/**
 * Save System
 * Handles saving and loading game progress
 */

const SaveSystem = {
    STORAGE_KEY: 'pirateGameData',
    AUTO_SAVE_INTERVAL: 30000, // Auto-save every 30 seconds
    
    /**
     * Save game data to localStorage
     */
    saveGame(gameData) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(gameData));
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    },
    
    /**
     * Load game data from localStorage
     */
    loadGame() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                console.log('Game loaded successfully');
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    },
    
    /**
     * Get default game data structure
     */
    getDefaultGameData() {
        return {
            player: {
                name: 'Captain',
                coins: 0,
                totalCoinsEarned: 0,
                level: 1,
                experience: 0,
            },
            ship: {
                level: 1,
                health: 100,
                maxHealth: 100,
                speed: 1,
                defense: 1,
            },
            crew: [
                { id: 1, name: 'First Mate', unlocked: true, level: 1 },
                { id: 2, name: 'Sailor Jack', unlocked: false, cost: 50 },
                { id: 3, name: 'Storm Breaker', unlocked: false, cost: 150 },
            ],
            cosmetics: {
                purchased: [],
                equipped: {},
            },
            difficulty: 'medium',
            statistics: {
                gamesPlayed: 0,
                correctAnswers: 0,
                wrongAnswers: 0,
                islandsVisited: 0,
                challengesCompleted: 0,
                challengesFailed: 0,
            },
        };
    },

    /**
     * Clear all saved data (reset game)
     */
    resetGame() {
        try {
            // Remove from localStorage
            localStorage.removeItem(this.STORAGE_KEY);
            
            // Reset the in-memory GameData object to defaults
            if (typeof GameData !== 'undefined') {
                const defaultData = this.getDefaultGameData();
                // Reset each property to default values (create new objects to avoid reference issues)
                GameData.player = { ...defaultData.player };
                GameData.ship = { ...defaultData.ship };
                GameData.crew = defaultData.crew.map(member => ({ ...member }));
                GameData.cosmetics = {
                    purchased: [...defaultData.cosmetics.purchased],
                    equipped: { ...defaultData.cosmetics.equipped }
                };
                GameData.difficulty = defaultData.difficulty;
                GameData.statistics = { ...defaultData.statistics };
            }
            
            console.log('Game data reset');
            return true;
        } catch (error) {
            console.error('Failed to reset game:', error);
            return false;
        }
    },
    
    /**
     * Check if save exists
     */
    hasSaveData() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    },
    
    /**
     * Export save file as JSON
     */
    exportSave() {
        const data = this.loadGame();
        if (data) {
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pirate-game-save-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
        }
    },
    
    /**
     * Import save file from JSON
     */
    importSave(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.saveGame(data);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    },
};

// Start auto-save interval
setInterval(() => {
    if (typeof GameData !== 'undefined') {
        SaveSystem.saveGame(GameData);
    }
}, SaveSystem.AUTO_SAVE_INTERVAL);
