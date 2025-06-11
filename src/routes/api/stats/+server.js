import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    // Get overall statistics
    const [
      totalDonationsResult,
      totalProjectsResult,
      totalUsersResult,
      completedDonationsResult
    ] = await Promise.all([
      // Total donation amount (completed donations only)
      db.donation.aggregate({
        where: {
          paymentStatus: 'COMPLETED'
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),
      
      // Total projects count
      db.project.count(),
      
      // Total users count (excluding admin)
      db.user.count({
        where: {
          role: {
            not: 'ADMIN'
          }
        }
      }),
      
      // Completed donations for donor count
      db.donation.findMany({
        where: {
          paymentStatus: 'COMPLETED'
        },
        select: {
          donorEmail: true,
          anonymous: true
        }
      })
    ]);
    
    // Calculate unique donors (including anonymous)
    const uniqueDonorEmails = new Set();
    let anonymousDonations = 0;
    
    completedDonationsResult.forEach(donation => {
      if (donation.anonymous) {
        anonymousDonations++;
      } else if (donation.donorEmail) {
        uniqueDonorEmails.add(donation.donorEmail);
      }
    });
    
    // Estimate total donors (unique emails + anonymous donations)
    const totalDonors = uniqueDonorEmails.size + anonymousDonations;
    
    // Calculate estimated beneficiaries (rough estimate based on project types)
    const projectsByCategory = await db.project.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      _sum: {
        currentAmount: true
      }
    });
    
    // Rough estimates of beneficiaries per category per KES 1000
    const beneficiaryMultipliers = {
      'EDUCATION': 0.5,        // 1 student per 2000 KES
      'HEALTHCARE': 2,         // 2 people per 1000 KES
      'ENVIRONMENT': 0.1,      // 1 person per 10000 KES (long-term impact)
      'COMMUNITY_DEVELOPMENT': 1, // 1 person per 1000 KES
      'EMERGENCY_RELIEF': 3,   // 3 people per 1000 KES
      'TECHNOLOGY': 0.3,       // 1 person per 3000 KES
      'ARTS_CULTURE': 0.2,     // 1 person per 5000 KES
      'SPORTS': 0.5            // 1 person per 2000 KES
    };
    
    let estimatedBeneficiaries = 0;
    projectsByCategory.forEach(category => {
      const multiplier = beneficiaryMultipliers[category.category] || 0.5;
      const amount = category._sum.currentAmount || 0;
      estimatedBeneficiaries += Math.floor((amount / 1000) * multiplier);
    });
    
    // Ensure minimum reasonable numbers for display
    const stats = {
      totalDonated: totalDonationsResult._sum.amount || 0,
      totalDonations: totalDonationsResult._count.id || 0,
      totalProjects: totalProjectsResult || 0,
      totalDonors: Math.max(totalDonors, 0),
      totalBeneficiaries: Math.max(estimatedBeneficiaries, 0),
      
      // Additional stats
      averageDonation: totalDonationsResult._count.id > 0 
        ? Math.round((totalDonationsResult._sum.amount || 0) / totalDonationsResult._count.id)
        : 0,
      
      // Category breakdown
      categoryStats: projectsByCategory.map(cat => ({
        category: cat.category,
        projectCount: cat._count.id,
        totalRaised: cat._sum.currentAmount || 0
      }))
    };
    
    return json(stats);
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return json(
      { 
        error: 'Failed to fetch statistics',
        // Return default stats on error
        totalDonated: 0,
        totalDonations: 0,
        totalProjects: 0,
        totalDonors: 0,
        totalBeneficiaries: 0,
        averageDonation: 0,
        categoryStats: []
      },
      { status: 500 }
    );
  }
}
