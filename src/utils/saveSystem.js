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
     * Clear all saved data (reset game)
     */
    resetGame() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
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
