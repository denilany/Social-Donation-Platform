/**
 * Payment service for handling M-Pesa and other payment methods
 */
export class PaymentService {
  constructor() {
    this.baseUrl = '/api/payments';
  }

  /**
   * Initiate M-Pesa STK Push payment
   * @param {Object} donationData - Donation data including amount, phone, etc.
   * @returns {Promise<Object>} Payment response
   */
  async initiateMpesaPayment(donationData) {
    try {
      const response = await fetch(`${this.baseUrl}/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(donationData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('M-Pesa payment initiation error:', error);
      throw new Error(error.message || 'Failed to initiate payment');
    }
  }

  /**
   * Check payment status
   * @param {string} transactionId - Transaction ID to check
   * @returns {Promise<Object>} Payment status response
   */
  async checkPaymentStatus(transactionId) {
    try {
      const response = await fetch(`${this.baseUrl}/status/${transactionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error(error.message || 'Failed to check payment status');
    }
  }

  /**
   * Retry a failed payment
   * @param {string} donationId - Donation ID to retry
   * @returns {Promise<Object>} Retry response
   */
  async retryPayment(donationId) {
    try {
      const response = await fetch(`${this.baseUrl}/retry/${donationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Payment retry error:', error);
      throw new Error(error.message || 'Failed to retry payment');
    }
  }

  /**
   * Cancel a pending payment
   * @param {string} transactionId - Transaction ID to cancel
   * @returns {Promise<Object>} Cancel response
   */
  async cancelPayment(transactionId) {
    try {
      const response = await fetch(`${this.baseUrl}/cancel/${transactionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Payment cancellation error:', error);
      throw new Error(error.message || 'Failed to cancel payment');
    }
  }

  /**
   * Get payment methods available
   * @returns {Promise<Array>} Available payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.baseUrl}/methods`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data.methods || [];
    } catch (error) {
      console.error('Get payment methods error:', error);
      // Return default methods if API fails
      return [
        { id: 'mpesa', name: 'M-Pesa', enabled: true },
        { id: 'card', name: 'Credit/Debit Card', enabled: false }
      ];
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
