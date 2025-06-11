import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, request }) {
  try {
    // TODO: Add authentication check for admin role
    // For now, we'll proceed without authentication
    
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const projectId = url.searchParams.get('projectId');
    const search = url.searchParams.get('search');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (status) {
      where.paymentStatus = status;
    }
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: 'insensitive' } },
        { donorEmail: { contains: search, mode: 'insensitive' } },
        { transactionId: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { mpesaReceiptNumber: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }
    
    // Get donations with full details
    const donations = await db.donation.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true
          }
        },
        donor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit,
      skip: offset
    });
    
    // Get total count for pagination
    const total = await db.donation.count({ where });
    
    // Get summary statistics
    const stats = await getDonationStats(where);
    
    return json({
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1
      },
      stats
    });
    
  } catch (error) {
    console.error('Error fetching admin donations:', error);
    return json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

async function getDonationStats(where = {}) {
  try {
    // Total donations by status
    const statusStats = await db.donation.groupBy({
      by: ['paymentStatus'],
      where,
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });
    
    // Recent donations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDonations = await db.donation.aggregate({
      where: {
        ...where,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });
    
    // Top projects by donation amount
    const topProjects = await db.project.findMany({
      select: {
        id: true,
        title: true,
        currentAmount: true,
        goalAmount: true,
        _count: {
          select: {
            donations: {
              where: {
                paymentStatus: 'COMPLETED'
              }
            }
          }
        }
      },
      orderBy: {
        currentAmount: 'desc'
      },
      take: 5
    });
    
    // Payment method distribution
    const paymentMethods = await db.donation.groupBy({
      by: ['paymentMethod'],
      where: {
        ...where,
        paymentStatus: 'COMPLETED'
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });
    
    return {
      statusStats,
      recentDonations,
      topProjects,
      paymentMethods
    };
    
  } catch (error) {
    console.error('Error calculating donation stats:', error);
    return {
      statusStats: [],
      recentDonations: { _count: { id: 0 }, _sum: { amount: 0 } },
      topProjects: [],
      paymentMethods: []
    };
  }
}
