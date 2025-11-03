/**
 * Game Data Structure
 * Manages all player progress, coins, and upgrades
 */

const GameData = {
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
        purchased: [], // Array of cosmetic IDs that have been purchased
        equipped: {}, // Currently equipped cosmetics by category
    },
    
    difficulty: 'medium', // easy, medium, hard
    
    settings: {
        answerInputMode: 'buttons', // 'buttons' or 'typing'
    },
    
    statistics: {
        gamesPlayed: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        islandsVisited: 0,
        challengesCompleted: 0,
        challengesFailed: 0,
    },
    
    // Get statistics accuracy
    getAccuracy() {
        const total = this.statistics.correctAnswers + this.statistics.wrongAnswers;
        if (total === 0) return 0;
        return Math.round((this.statistics.correctAnswers / total) * 100);
    },
    
    // Format coins for display
    formatCoins(amount) {
        if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'k';
        }
        return amount.toString();
    },
};

// Initialize default data
function initializeGameData() {
    const savedData = localStorage.getItem('pirateGameData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.assign(GameData, data);
    }
    return GameData;
}
