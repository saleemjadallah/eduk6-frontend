/**
 * Calculate level from total XP
 * Formula: level = floor(sqrt(totalXP / 50)) + 1
 * This creates a curve where early levels are fast, later levels slower
 */
export function calculateLevel(totalXP) {
    return Math.floor(Math.sqrt(totalXP / 50)) + 1;
}

/**
 * Calculate XP required for a specific level
 * Inverse of level formula: XP needed = 50 * (level - 1)^2
 */
export function calculateXPForLevel(level) {
    return 50 * Math.pow(level - 1, 2);
}

/**
 * Calculate XP needed to reach next level from current XP
 */
export function calculateXPToNextLevel(currentXP, currentLevel) {
    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
    const xpForCurrentLevel = calculateXPForLevel(currentLevel);
    return xpForNextLevel - xpForCurrentLevel - (currentXP - xpForCurrentLevel);
}

/**
 * Get level progress percentage (0-100)
 */
export function getLevelProgress(currentXP, currentLevel) {
    const xpForCurrentLevel = calculateXPForLevel(currentLevel);
    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
    const xpIntoCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;

    if (xpNeededForLevel === 0) return 100;
    return Math.min(100, (xpIntoCurrentLevel / xpNeededForLevel) * 100);
}

/**
 * Get total XP needed from start to reach a level
 */
export function getTotalXPForLevel(level) {
    return calculateXPForLevel(level);
}

/**
 * Example progression table:
 * Level 1: 0 XP (start)
 * Level 2: 50 XP
 * Level 3: 200 XP
 * Level 4: 450 XP
 * Level 5: 800 XP
 * Level 10: 4050 XP
 * Level 20: 18050 XP
 * Level 30: 42050 XP
 */
