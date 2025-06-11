import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { mpesaService } from '$lib/services/mpesa.js';
import { dev } from '$app/environment';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  try {
    const { transactionId } = params;

    if (!transactionId) {
      return json(
        { 
          success: false,
          error: 'Transaction ID is required' 
        },
        { status: 400 }
      );
    }

    // Find the transaction
    const donation = await db.donation.findUnique({
      where: { transactionId },
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!donation) {
      return json(
        { 
          success: false,
          error: 'Transaction not found' 
        },
        { status: 404 }
      );
    }

    // If payment is already completed or failed, return current status
    if (donation.paymentStatus === 'COMPLETED' || donation.paymentStatus === 'FAILED') {
      return json({
        success: true,
        status: donation.paymentStatus,
        transactionId: donation.transactionId,
        amount: donation.amount,
        currency: donation.currency,
        mpesaReceiptNumber: donation.mpesaReceiptNumber,
        completedAt: donation.completedAt,
        failedAt: donation.failedAt,
        project: donation.project
      });
    }

    // If payment is pending and we have a checkout request ID, query M-Pesa
    if (donation.paymentStatus === 'PENDING' && donation.mpesaCheckoutRequestId) {
      try {
        const queryResult = await mpesaService.querySTKPushStatus(donation.mpesaCheckoutRequestId);
        
        if (dev) {
          console.log('M-Pesa query result:', queryResult);
        }

        if (queryResult.success) {
          const { resultCode, resultDesc } = queryResult;
          
          if (resultCode === '0') {
            // Payment completed - update database
            await db.donation.update({
              where: { id: donation.id },
              data: {
                paymentStatus: 'COMPLETED',
                mpesaResultCode: resultCode,
                mpesaResultDesc: resultDesc,
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

            return json({
              success: true,
              status: 'COMPLETED',
              transactionId: donation.transactionId,
              amount: donation.amount,
              currency: donation.currency,
              completedAt: new Date(),
              project: donation.project
            });

          } else if (resultCode === '1032') {
            // Payment cancelled by user
            await db.donation.update({
              where: { id: donation.id },
              data: {
                paymentStatus: 'CANCELLED',
                mpesaResultCode: resultCode,
                mpesaResultDesc: resultDesc,
                failedAt: new Date()
              }
            });

            return json({
              success: true,
              status: 'CANCELLED',
              transactionId: donation.transactionId,
              message: 'Payment was cancelled by user'
            });

          } else if (resultCode === '1037') {
            // Timeout - user didn't enter PIN
            await db.donation.update({
              where: { id: donation.id },
              data: {
                paymentStatus: 'TIMEOUT',
                mpesaResultCode: resultCode,
                mpesaResultDesc: resultDesc,
                failedAt: new Date()
              }
            });

            return json({
              success: true,
              status: 'TIMEOUT',
              transactionId: donation.transactionId,
              message: 'Payment timed out'
            });

          } else {
            // Other failure codes
            await db.donation.update({
              where: { id: donation.id },
              data: {
                paymentStatus: 'FAILED',
                mpesaResultCode: resultCode,
                mpesaResultDesc: resultDesc,
                failedAt: new Date()
              }
            });

            return json({
              success: true,
              status: 'FAILED',
              transactionId: donation.transactionId,
              message: resultDesc || 'Payment failed'
            });
          }
        } else {
          // Query failed, but payment might still be pending
          return json({
            success: true,
            status: 'PENDING',
            transactionId: donation.transactionId,
            message: 'Payment is still being processed'
          });
        }

      } catch (error) {
        console.error('Error querying M-Pesa status:', error);
        
        // Return current status if query fails
        return json({
          success: true,
          status: donation.paymentStatus,
          transactionId: donation.transactionId,
          message: 'Payment status check failed, but payment may still be processing'
        });
      }
    }

    // Default response for pending payments without checkout request ID
    return json({
      success: true,
      status: donation.paymentStatus,
      transactionId: donation.transactionId,
      amount: donation.amount,
      currency: donation.currency,
      project: donation.project
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
