/**
 * Format currency amount with proper locale and currency symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'KES')
 * @param {string} locale - The locale for formatting (default: 'en-KE')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'KES', locale = 'en-KE') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Format number with thousands separators
 * @param {number} number - The number to format
 * @param {string} locale - The locale for formatting (default: 'en-KE')
 * @returns {string} Formatted number string
 */
export function formatNumber(number, locale = 'en-KE') {
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    console.error('Number formatting error:', error);
    return number.toLocaleString();
  }
}
