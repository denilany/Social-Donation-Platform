import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { generateReceiptNumber, generateTransactionId } from '$lib/utils/receipt.js';
import { validateDonationAmount, validatePhoneNumber, normalizePhoneNumber } from '$lib/utils/validation.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.projectId || !data.amount) {
      return json(
        { error: 'Project ID and amount are required' },
        { status: 400 }
      );
    }
    
    // Validate amount
    const amountValidation = validateDonationAmount(data.amount);
    if (!amountValidation.isValid) {
      return json(
        { error: amountValidation.error },
        { status: 400 }
      );
    }
    
    // Validate phone number if provided
    if (data.donorPhone) {
      if (!validatePhoneNumber(data.donorPhone)) {
        return json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        );
      }
    }
    
    // Check if project exists
    const project = await db.project.findUnique({
      where: { id: data.projectId }
    });
    
    if (!project) {
      return json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if project is active
    if (project.status !== 'ACTIVE' && project.status !== 'URGENT') {
      return json(
        { error: 'Project is not accepting donations' },
        { status: 400 }
      );
    }
    
    // Generate transaction details
    const transactionId = generateTransactionId();
    const receiptNumber = generateReceiptNumber();
    
    // Create donation record
    const donation = await db.donation.create({
      data: {
        amount: parseFloat(data.amount),
        currency: data.currency || 'KES',
        donorName: data.donorName || null,
        donorEmail: data.donorEmail || null,
        message: data.message || null,
        anonymous: data.anonymous !== false, // Default to true
        paymentStatus: 'PENDING',
        paymentMethod: data.paymentMethod || 'MPESA',
        transactionId,
        receiptNumber,
        projectId: data.projectId,
        donorId: data.donorId || null
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            goalAmount: true,
            currentAmount: true
          }
        }
      }
    });
    
    // Return donation record for M-Pesa processing
    // The frontend will call the M-Pesa STK Push endpoint separately
    return json({
      success: true,
      donation: donation,
      message: 'Donation record created successfully. Proceed with payment.',
      transactionId,
      receiptNumber,
      requiresPayment: true
    });
    
  } catch (error) {
    console.error('Error processing donation:', error);
    return json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}



/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    const projectId = url.searchParams.get('projectId');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    const where = {
      paymentStatus: 'COMPLETED',
      ...(projectId && { projectId })
    };
    
    const donations = await db.donation.findMany({
      where,
      select: {
        id: true,
        amount: true,
        currency: true,
        donorName: true,
        message: true,
        anonymous: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
    
    // Filter out donor names for anonymous donations
    const sanitizedDonations = donations.map((donation) => ({
      ...donation,
      donorName: donation.anonymous ? 'Anonymous' : donation.donorName
    }));
    
    return json({
      donations: sanitizedDonations,
      total: await db.donation.count({ where }),
      hasMore: (offset + limit) < await db.donation.count({ where })
    });
    
  } catch (error) {
    console.error('Error fetching donations:', error);
    return json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
