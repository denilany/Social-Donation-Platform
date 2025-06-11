import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    // TODO: Add authentication check for admin role
    
    const timeframe = url.searchParams.get('timeframe') || '30'; // days
    const days = parseInt(timeframe);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get overall statistics
    const overallStats = await getOverallStats();
    
    // Get time-based statistics
    const timeStats = await getTimeBasedStats(startDate);
    
    // Get recent activity
    const recentActivity = await getRecentActivity();
    
    // Get donation trends
    const donationTrends = await getDonationTrends(days);
    
    // Get project performance
    const projectPerformance = await getProjectPerformance();
    
    return json({
      overallStats,
      timeStats,
      recentActivity,
      donationTrends,
      projectPerformance,
      timeframe: days
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function getOverallStats() {
  try {
    // Total donations
    const totalDonations = await db.donation.aggregate({
      _count: { id: true },
      _sum: { amount: true }
    });
    
    // Completed donations
    const completedDonations = await db.donation.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _count: { id: true },
      _sum: { amount: true }
    });
    
    // Pending donations
    const pendingDonations = await db.donation.count({
      where: { paymentStatus: 'PENDING' }
    });
    
    // Failed donations
    const failedDonations = await db.donation.count({
      where: { paymentStatus: 'FAILED' }
    });
    
    // Total projects
    const totalProjects = await db.project.count();
    
    // Active projects
    const activeProjects = await db.project.count({
      where: { status: 'ACTIVE' }
    });
    
    // Total users
    const totalUsers = await db.user.count();
    
    // Success rate
    const successRate = totalDonations._count.id > 0 
      ? (completedDonations._count.id / totalDonations._count.id) * 100 
      : 0;
    
    return {
      totalDonations: totalDonations._count.id || 0,
      totalAmount: completedDonations._sum.amount || 0,
      completedDonations: completedDonations._count.id || 0,
      pendingDonations,
      failedDonations,
      totalProjects,
      activeProjects,
      totalUsers,
      successRate: Math.round(successRate * 100) / 100,
      averageDonation: completedDonations._count.id > 0 
        ? Math.round((completedDonations._sum.amount / completedDonations._count.id) * 100) / 100 
        : 0
    };
    
  } catch (error) {
    console.error('Error getting overall stats:', error);
    return {};
  }
}

async function getTimeBasedStats(startDate) {
  try {
    const donations = await db.donation.aggregate({
      where: {
        createdAt: { gte: startDate }
      },
      _count: { id: true },
      _sum: { amount: true }
    });
    
    const completedDonations = await db.donation.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      _count: { id: true },
      _sum: { amount: true }
    });
    
    return {
      totalDonations: donations._count.id || 0,
      totalAmount: completedDonations._sum.amount || 0,
      completedDonations: completedDonations._count.id || 0
    };
    
  } catch (error) {
    console.error('Error getting time-based stats:', error);
    return {};
  }
}

async function getRecentActivity() {
  try {
    const recentDonations = await db.donation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    const recentProjects = await db.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true
      }
    });
    
    return {
      recentDonations,
      recentProjects
    };
    
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return { recentDonations: [], recentProjects: [] };
  }
}

async function getDonationTrends(days) {
  try {
    const trends = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayStats = await db.donation.aggregate({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          },
          paymentStatus: 'COMPLETED'
        },
        _count: { id: true },
        _sum: { amount: true }
      });
      
      trends.push({
        date: date.toISOString().split('T')[0],
        count: dayStats._count.id || 0,
        amount: dayStats._sum.amount || 0
      });
    }
    
    return trends;
    
  } catch (error) {
    console.error('Error getting donation trends:', error);
    return [];
  }
}

async function getProjectPerformance() {
  try {
    const projects = await db.project.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        goalAmount: true,
        currentAmount: true,
        createdAt: true,
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
      take: 10
    });
    
    return projects.map(project => ({
      ...project,
      donationCount: project._count.donations,
      progressPercentage: project.goalAmount > 0 
        ? Math.round((project.currentAmount / project.goalAmount) * 100) 
        : 0
    }));
    
  } catch (error) {
    console.error('Error getting project performance:', error);
    return [];
  }
}
