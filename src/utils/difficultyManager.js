/**
 * Difficulty Manager
 * Generates multiplication questions based on difficulty level
 */

const DifficultyManager = {
    difficulties: {
        easy: {
            name: 'Easy',
            range: [0, 4],
            questionCount: 3,
            timePerQuestion: 10,
            baseReward: 10,
            description: '0x0 to 4x12, 10s per question'
        },
        medium: {
            name: 'Medium',
            range: [0, 12],
            questionCount: 2,
            timePerQuestion: 5,
            baseReward: 25,
            description: '0x0 to 12x12, 2 Qs, 5s per question'
        }, 
        hard: {
            name: 'Hard',
            range: [0, 12],
            questionCount: 3,
            timePerQuestion: 3,
            baseReward: 50,
            description: '0x0 to 12x12, 3 Qs, 3s per question'
        },
    },
    
    /**
     * Get difficulty settings
     */
    getDifficulty(level) {
        return this.difficulties[level] || this.difficulties.medium;
    },
    
    /**
     * Generate a random multiplication problem
     */
    generateQuestion(difficulty) {
        const settings = this.getDifficulty(difficulty);
        const [min, max] = settings.range;
        
        const a = Phaser.Math.Between(min, max);
        const b = Phaser.Math.Between(min, max);
        const answer = a * b;
        
        return {
            question: `${a} × ${b}`,
            a: a,
            b: b,
            answer: answer,
            difficulty: difficulty,
        };
    },
    
    /**
     * Generate multiple questions
     */
    generateQuestions(difficulty, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push(this.generateQuestion(difficulty));
        }
        return questions;
    },
    
    /**
     * Generate wrong answer options
     */
    generateWrongAnswers(correctAnswer, count = 3) {
        const answers = [correctAnswer];
        const offsets = [correctAnswer - 5, correctAnswer + 3, correctAnswer + 7, correctAnswer - 10];
        
        for (let offset of offsets) {
            if (answers.length >= count + 1) break;
            if (offset > 0 && !answers.includes(offset)) {
                answers.push(offset);
            }
        }
        
        // Shuffle and return first count+1 answers
        return Phaser.Utils.Array.Shuffle(answers).slice(0, count + 1);
    },
    
    /**
     * Calculate reward coins based on performance
     */
    calculateReward(difficulty, correctAnswers, totalQuestions, timeTaken) {
        const settings = this.getDifficulty(difficulty);
        const baseReward = settings.baseReward;
        
        // Accuracy bonus
        const accuracyBonus = (correctAnswers / totalQuestions) * baseReward;
        
        // Speed bonus (up to 50% extra if answered very quickly)
        const expectedTime = settings.timePerQuestion * totalQuestions;
        const speedBonus = Math.max(0, (1 - timeTaken / expectedTime) * baseReward * 0.5);
        
        const totalReward = Math.round(baseReward + accuracyBonus + speedBonus);
        
        return {
            baseReward,
            accuracyBonus: Math.round(accuracyBonus),
            speedBonus: Math.round(speedBonus),
            total: totalReward,
        };
    },
};
