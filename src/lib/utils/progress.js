/**
 * Calculate progress percentage
 * @param {number} current - Current amount
 * @param {number} goal - Goal amount
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgress(current, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min((current / goal) * 100, 100);
}

/**
 * Calculate remaining amount to reach goal
 * @param {number} current - Current amount
 * @param {number} goal - Goal amount
 * @returns {number} Remaining amount
 */
export function calculateRemaining(current, goal) {
  return Math.max(goal - current, 0);
}

/**
 * Check if goal is reached
 * @param {number} current - Current amount
 * @param {number} goal - Goal amount
 * @returns {boolean} True if goal is reached
 */
export function isGoalReached(current, goal) {
  return current >= goal;
}

/**
 * Get progress status text
 * @param {number} current - Current amount
 * @param {number} goal - Goal amount
 * @returns {string} Progress status
 */
export function getProgressStatus(current, goal) {
  const progress = calculateProgress(current, goal);
  
  if (progress >= 100) return 'Goal Reached';
  if (progress >= 75) return 'Almost There';
  if (progress >= 50) return 'Halfway';
  if (progress >= 25) return 'Good Start';
  return 'Just Started';
}

/**
 * Get progress color class based on percentage
 * @param {number} progress - Progress percentage
 * @returns {string} CSS color class
 */
export function getProgressColor(progress) {
  if (progress >= 100) return 'text-green-600';
  if (progress >= 75) return 'text-emerald-600';
  if (progress >= 50) return 'text-yellow-600';
  if (progress >= 25) return 'text-orange-600';
  return 'text-red-600';
}
