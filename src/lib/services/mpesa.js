import axios from 'axios';
import { dev } from '$app/environment';

/**
 * M-Pesa API Service
 * Handles authentication, STK Push, and payment status checking
 */
export class MpesaService {
  constructor() {
    this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.timeoutUrl = process.env.MPESA_TIMEOUT_URL;
    
    // API URLs
    this.baseUrl = this.environment === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke';
    
    this.authUrl = `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
    this.stkPushUrl = `${this.baseUrl}/mpesa/stkpush/v1/processrequest`;
    this.queryUrl = `${this.baseUrl}/mpesa/stkpushquery/v1/query`;
    
    // Cache for access token
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Generate timestamp in the format required by M-Pesa
   * @returns {string} Timestamp in YYYYMMDDHHMMSS format
   */
  generateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Generate password for STK Push
   * @param {string} timestamp - Timestamp in YYYYMMDDHHMMSS format
   * @returns {string} Base64 encoded password
   */
  generatePassword(timestamp) {
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  /**
   * Get OAuth access token
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    try {
      // Check if we have a valid cached token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(this.authUrl, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        // Set expiry to 50 minutes (tokens expire in 1 hour)
        this.tokenExpiry = Date.now() + (50 * 60 * 1000);
        
        if (dev) {
          console.log('M-Pesa access token obtained successfully');
        }
        
        return this.accessToken;
      } else {
        throw new Error('Failed to get access token from M-Pesa');
      }
    } catch (error) {
      console.error('M-Pesa authentication error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa API');
    }
  }

  /**
   * Initiate STK Push payment
   * @param {Object} paymentData - Payment details
   * @param {number} paymentData.amount - Amount to charge
   * @param {string} paymentData.phoneNumber - Customer phone number (254XXXXXXXXX format)
   * @param {string} paymentData.accountReference - Account reference
   * @param {string} paymentData.transactionDesc - Transaction description
   * @returns {Promise<Object>} STK Push response
   */
  async initiateSTKPush(paymentData) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(paymentData.amount), // Ensure integer
        PartyA: paymentData.phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: paymentData.phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: paymentData.accountReference,
        TransactionDesc: paymentData.transactionDesc
      };

      if (dev) {
        console.log('STK Push request:', {
          ...requestBody,
          Password: '[HIDDEN]'
        });
      }

      const response = await axios.post(this.stkPushUrl, requestBody, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (dev) {
        console.log('STK Push response:', response.data);
      }

      return {
        success: response.data.ResponseCode === '0',
        data: response.data,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };
    } catch (error) {
      console.error('STK Push error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message || 'STK Push failed',
        responseCode: error.response?.data?.ResponseCode || 'ERROR'
      };
    }
  }

  /**
   * Query STK Push payment status
   * @param {string} checkoutRequestId - Checkout request ID from STK Push
   * @returns {Promise<Object>} Payment status
   */
  async querySTKPushStatus(checkoutRequestId) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(this.queryUrl, requestBody, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (dev) {
        console.log('STK Push query response:', response.data);
      }

      return {
        success: response.data.ResponseCode === '0',
        data: response.data,
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc
      };
    } catch (error) {
      console.error('STK Push query error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message || 'Query failed'
      };
    }
  }

  /**
   * Format phone number to M-Pesa format (254XXXXXXXXX)
   * @param {string} phoneNumber - Phone number in various formats
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    
    throw new Error('Invalid phone number format');
  }

  /**
   * Validate M-Pesa configuration
   * @returns {boolean} True if configuration is valid
   */
  isConfigured() {
    return !!(
      this.consumerKey &&
      this.consumerSecret &&
      this.shortcode &&
      this.passkey &&
      this.callbackUrl
    );
  }
}

// Export singleton instance
export const mpesaService = new MpesaService();
