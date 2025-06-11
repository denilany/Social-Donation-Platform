/**
 * Generate a unique receipt number
 * @returns {string} Receipt number in format RC{timestamp}{random}
 */
export function generateReceiptNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `RC${timestamp}${random}`;
}

/**
 * Generate a unique transaction ID
 * @returns {string} Transaction ID in format TX{timestamp}{random}
 */
export function generateTransactionId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `TX${timestamp}${random}`;
}

/**
 * Validate receipt number format
 * @param {string} receiptNumber - The receipt number to validate
 * @returns {boolean} True if valid format
 */
export function validateReceiptNumber(receiptNumber) {
  if (!receiptNumber || typeof receiptNumber !== 'string') return false;
  
  // Receipt numbers should start with RC followed by alphanumeric characters
  const pattern = /^RC[A-Z0-9]+$/;
  return pattern.test(receiptNumber);
}
