/**
 * Format date with proper locale
 * @param {Date|string} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'en-KE')
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'en-KE') {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  } catch (error) {
    console.error('Date formatting error:', error);
    return new Date(date).toLocaleDateString();
  }
}

/**
 * Format date and time with proper locale
 * @param {Date|string} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'en-KE')
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date, locale = 'en-KE') {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return new Date(date).toLocaleString();
  }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - The date to compare
 * @returns {string} Relative time string
 */
export function timeAgo(date) {
  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  } catch (error) {
    console.error('Time ago calculation error:', error);
    return 'Unknown';
  }
}

/**
 * Check if a date is in the past
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if date is in the past
 */
export function isPastDate(date) {
  return new Date(date) < new Date();
}

/**
 * Get days remaining until a date
 * @param {Date|string} date - The target date
 * @returns {number} Days remaining (negative if past)
 */
export function daysRemaining(date) {
  const now = new Date();
  const target = new Date(date);
  const diffInMs = target - now;
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}
