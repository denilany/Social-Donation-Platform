import { json } from '@sveltejs/kit';
import { mpesaService } from '$lib/services/mpesa.js';
import { db } from '$lib/db.js';
import { dev } from '$app/environment';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    // Check if M-Pesa is configured
    if (!mpesaService.isConfigured()) {
      return json(
        { 
          success: false,
          error: 'M-Pesa service is not properly configured' 
        },
        { status: 500 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.amount || !data.phoneNumber || !data.transactionId) {
      return json(
        { 
          success: false,
          error: 'Amount, phone number, and transaction ID are required' 
        },
        { status: 400 }
      );
    }

    // Validate amount
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount < 2) {
      return json(
        {
          success: false,
          error: 'Invalid amount. Minimum amount is KES 2'
        },
        { status: 400 }
      );
    }

    // Format phone number
    let formattedPhone;
    try {
      formattedPhone = mpesaService.formatPhoneNumber(data.phoneNumber);
    } catch (error) {
      return json(
        { 
          success: false,
          error: 'Invalid phone number format. Use format: 0712345678 or 254712345678' 
        },
        { status: 400 }
      );
    }

    // Check if transaction exists
    const existingTransaction = await db.donation.findUnique({
      where: { transactionId: data.transactionId }
    });

    if (!existingTransaction) {
      return json(
        { 
          success: false,
          error: 'Transaction not found' 
        },
        { status: 404 }
      );
    }

    if (existingTransaction.paymentStatus === 'COMPLETED') {
      return json(
        { 
          success: false,
          error: 'Transaction already completed' 
        },
        { status: 400 }
      );
    }

    // Prepare payment data
    const paymentData = {
      amount: amount,
      phoneNumber: formattedPhone,
      accountReference: data.transactionId,
      transactionDesc: data.description || `Donation for ${existingTransaction.project?.title || 'Project'}`
    };

    if (dev) {
      console.log('Initiating STK Push for:', {
        transactionId: data.transactionId,
        amount: amount,
        phoneNumber: formattedPhone
      });
    }

    // Initiate STK Push
    const stkResponse = await mpesaService.initiateSTKPush(paymentData);

    if (stkResponse.success) {
      // Update transaction with M-Pesa details
      await db.donation.update({
        where: { id: existingTransaction.id },
        data: {
          paymentStatus: 'PENDING',
          mpesaCheckoutRequestId: stkResponse.checkoutRequestId,
          mpesaMerchantRequestId: stkResponse.merchantRequestId,
          mpesaResponseCode: stkResponse.responseCode
        }
      });

      return json({
        success: true,
        message: stkResponse.customerMessage || 'STK Push sent successfully',
        checkoutRequestId: stkResponse.checkoutRequestId,
        merchantRequestId: stkResponse.merchantRequestId,
        transactionId: data.transactionId
      });
    } else {
      // Update transaction status to failed
      await db.donation.update({
        where: { id: existingTransaction.id },
        data: {
          paymentStatus: 'FAILED',
          mpesaResponseCode: stkResponse.responseCode
        }
      });

      return json(
        {
          success: false,
          error: stkResponse.error || 'STK Push failed',
          responseCode: stkResponse.responseCode
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('STK Push endpoint error:', error);
    return json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
