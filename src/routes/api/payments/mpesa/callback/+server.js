import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { dev } from '$app/environment';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const callbackData = await request.json();
    
    if (dev) {
      console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));
    }

    // Extract callback data
    const stkCallback = callbackData.Body?.stkCallback;
    
    if (!stkCallback) {
      console.error('Invalid callback format - missing stkCallback');
      return json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;

    // Find the transaction using CheckoutRequestID
    const donation = await db.donation.findFirst({
      where: {
        mpesaCheckoutRequestId: CheckoutRequestID
      },
      include: {
        project: true
      }
    });

    if (!donation) {
      console.error('Transaction not found for CheckoutRequestID:', CheckoutRequestID);
      return json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    // Process the callback based on result code
    if (ResultCode === 0) {
      // Payment successful
      let mpesaReceiptNumber = null;
      let phoneNumber = null;
      let amount = null;
      let transactionDate = null;

      // Extract metadata if available
      if (CallbackMetadata && CallbackMetadata.Item) {
        const metadata = CallbackMetadata.Item;
        
        for (const item of metadata) {
          switch (item.Name) {
            case 'MpesaReceiptNumber':
              mpesaReceiptNumber = item.Value;
              break;
            case 'PhoneNumber':
              phoneNumber = item.Value;
              break;
            case 'Amount':
              amount = item.Value;
              break;
            case 'TransactionDate':
              transactionDate = item.Value;
              break;
          }
        }
      }

      // Update donation record
      await db.donation.update({
        where: { id: donation.id },
        data: {
          paymentStatus: 'COMPLETED',
          mpesaReceiptNumber: mpesaReceiptNumber,
          mpesaTransactionDate: transactionDate ? new Date(transactionDate.toString()) : new Date(),
          completedAt: new Date()
        }
      });

      // Update project current amount
      if (donation.project) {
        await db.project.update({
          where: { id: donation.project.id },
          data: {
            currentAmount: {
              increment: donation.amount
            }
          }
        });
      }

      if (dev) {
        console.log('Payment completed successfully:', {
          transactionId: donation.transactionId,
          mpesaReceiptNumber,
          amount: donation.amount
        });
      }

    } else {
      // Payment failed or cancelled
      await db.donation.update({
        where: { id: donation.id },
        data: {
          paymentStatus: 'FAILED',
          mpesaResultCode: ResultCode,
          mpesaResultDesc: ResultDesc,
          failedAt: new Date()
        }
      });

      if (dev) {
        console.log('Payment failed:', {
          transactionId: donation.transactionId,
          resultCode: ResultCode,
          resultDesc: ResultDesc
        });
      }
    }

    // Always return success to M-Pesa to acknowledge receipt
    return json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });

  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    
    // Still return success to M-Pesa to avoid retries
    return json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  // Handle timeout callback (optional)
  return json({
    ResultCode: 0,
    ResultDesc: 'Success'
  });
}
