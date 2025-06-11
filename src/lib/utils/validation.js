/**
 * Validate email address format
 * @param {string} email - The email to validate
 * @returns {boolean} True if email is valid
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate Kenyan phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check for valid Kenyan phone number patterns
  const patterns = [
    /^254[17]\d{8}$/, // +254 format
    /^0[17]\d{8}$/,   // 0 format
    /^[17]\d{8}$/     // Without country code
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Normalize Kenyan phone number to international format
 * @param {string} phone - The phone number to normalize
 * @returns {string} Normalized phone number
 */
export function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to international format
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+254${cleaned.slice(1)}`;
  } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
    return `+254${cleaned}`;
  }
  
  return phone; // Return original if can't normalize
}

/**
 * Validate donation amount
 * @param {number|string} amount - The amount to validate
 * @param {number} minAmount - Minimum allowed amount (default: 2)
 * @param {number} maxAmount - Maximum allowed amount (default: 1000000)
 * @returns {object} Validation result with isValid and error message
 */
export function validateDonationAmount(amount, minAmount = 2, maxAmount = 1000000) {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid amount' };
  }
  
  if (numAmount < minAmount) {
    return { isValid: false, error: `Minimum donation is KES ${minAmount}` };
  }
  
  if (numAmount > maxAmount) {
    return { isValid: false, error: `Maximum donation is KES ${maxAmount.toLocaleString()}` };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate required field
 * @param {any} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} Validation result with isValid and error message
 */
export function validateRequired(value, fieldName = 'Field') {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate string length
 * @param {string} value - The string to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} Validation result with isValid and error message
 */
export function validateLength(value, minLength, maxLength, fieldName = 'Field') {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string` };
  }
  
  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be no more than ${maxLength} characters` };
  }
  
  return { isValid: true, error: null };
}
