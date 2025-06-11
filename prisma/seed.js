import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a sample user first
  const user = await prisma.user.upsert({
    where: { email: 'admin@donateke.org' },
    update: {},
    create: {
      email: 'admin@donateke.org',
      name: 'Admin User',
      role: 'ADMIN'
    }
  });

  console.log('✅ Created user:', user.name);

  // Create sample projects
  const projects = [
    {
      title: 'Clean Water for Rural Schools',
      description: 'Providing clean and safe drinking water to rural schools in Kenya. This project aims to install water purification systems and build wells to ensure students have access to clean water throughout the school day. The initiative will benefit over 500 students across 5 schools in remote areas where access to clean water is limited. We will work with local communities to ensure sustainable maintenance of the water systems.',
      shortDesc: 'Clean water access for 500+ students in rural schools',
      category: 'EDUCATION',
      status: 'ACTIVE',
      goalAmount: 50000,
      currentAmount: 0,
      featured: true,
      location: 'Nakuru County',
      imageUrl: 'https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=800&h=600&fit=crop',
      creatorId: user.id
    },
    {
      title: 'Emergency Medical Supplies',
      description: 'Urgent need for medical supplies including bandages, antibiotics, and basic medical equipment for local health centers serving remote communities. These supplies will help treat common ailments and provide emergency care for accidents and injuries. The health centers serve over 2,000 people in areas where the nearest hospital is more than 50km away.',
      shortDesc: 'Critical medical supplies for remote health centers',
      category: 'HEALTHCARE',
      status: 'URGENT',
      goalAmount: 25000,
      currentAmount: 0,
      featured: true,
      location: 'Turkana County',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
      creatorId: user.id
    },
    {
      title: 'Tree Planting Initiative',
      description: 'Environmental conservation project to plant 10,000 trees in deforested areas around Mount Kenya. Help us restore the natural habitat and combat climate change while providing sustainable livelihoods for local communities. The project includes indigenous tree species that will help restore the ecosystem and provide long-term environmental benefits.',
      shortDesc: 'Plant 10,000 trees to restore natural habitat',
      category: 'ENVIRONMENT',
      status: 'ACTIVE',
      goalAmount: 15000,
      currentAmount: 0,
      featured: false,
      location: 'Mount Kenya Region',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      creatorId: user.id
    },
    {
      title: 'Community Library Project',
      description: 'Building a modern community library with books, computers, and internet access to provide educational resources for children and adults in underserved areas. The library will serve as a learning hub offering literacy programs, computer training, and study spaces for students. We aim to bridge the digital divide and promote lifelong learning in the community.',
      shortDesc: 'Modern library with books and digital resources',
      category: 'EDUCATION',
      status: 'ACTIVE',
      goalAmount: 75000,
      currentAmount: 0,
      featured: false,
      location: 'Kisumu County',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      creatorId: user.id
    },
    {
      title: 'Food Security Program',
      description: 'Providing food assistance and agricultural training to families affected by drought in northern Kenya. The program includes distribution of drought-resistant seeds, farming tools, and nutrition education to help families become self-sufficient. We will train 200 families in sustainable farming techniques and provide ongoing support for the first growing season.',
      shortDesc: 'Food assistance and agricultural training for 200 families',
      category: 'EMERGENCY_RELIEF',
      status: 'URGENT',
      goalAmount: 40000,
      currentAmount: 0,
      featured: true,
      location: 'Marsabit County',
      imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop',
      creatorId: user.id
    },
    {
      title: 'Youth Tech Training Center',
      description: 'Establishing a technology training center to teach coding, digital literacy, and entrepreneurship skills to young people in urban slums. The center will offer free courses in web development, mobile app development, and digital marketing. Our goal is to equip 300+ youth with marketable tech skills and help them start their own businesses or find employment in the growing tech sector.',
      shortDesc: 'Tech skills training for 300+ youth',
      category: 'TECHNOLOGY',
      status: 'ACTIVE',
      goalAmount: 60000,
      currentAmount: 0,
      featured: false,
      location: 'Nairobi',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      creatorId: user.id
    },
    {
      title: 'Women Empowerment Workshop',
      description: 'Organizing workshops and training sessions to empower women in rural communities with business skills, financial literacy, and leadership training. The program will help women start small businesses, manage finances effectively, and take leadership roles in their communities. We aim to train 150 women over 6 months.',
      shortDesc: 'Business and leadership training for rural women',
      category: 'COMMUNITY_DEVELOPMENT',
      status: 'ACTIVE',
      goalAmount: 30000,
      currentAmount: 0,
      featured: false,
      location: 'Machakos County',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop',
      creatorId: user.id
    },
    {
      title: 'School Sports Equipment',
      description: 'Providing sports equipment and facilities for primary schools to promote physical fitness and talent development among children. The project will supply footballs, volleyballs, athletics equipment, and help construct basic sports facilities. Sports activities will help keep children engaged and develop their physical and social skills.',
      shortDesc: 'Sports equipment for 10 primary schools',
      category: 'SPORTS',
      status: 'ACTIVE',
      goalAmount: 20000,
      currentAmount: 0,
      featured: false,
      location: 'Meru County',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      creatorId: user.id
    }
  ];

  console.log('📝 Creating projects...');

  for (const projectData of projects) {
    const existingProject = await prisma.project.findFirst({
      where: { title: projectData.title }
    });

    if (!existingProject) {
      const project = await prisma.project.create({
        data: projectData
      });
      console.log(`✅ Created project: ${project.title}`);
    } else {
      console.log(`⏭️  Project already exists: ${projectData.title}`);
    }
  }

  // Create sample donations for testing
  console.log('💰 Creating sample donations...');

  const sampleDonations = [
    {
      amount: 500,
      donorName: 'John Doe',
      donorEmail: 'john@example.com',
      message: 'Great cause! Happy to help.',
      anonymous: false,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'MPESA',
      projectId: projects[0].title, // Clean Water project
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      amount: 1000,
      donorName: null,
      donorEmail: null,
      message: null,
      anonymous: true,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'MPESA',
      projectId: projects[1].title, // Emergency Medical Supplies
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      amount: 250,
      donorName: 'Mary Smith',
      donorEmail: 'mary@example.com',
      message: 'Every tree counts!',
      anonymous: false,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'MPESA',
      projectId: projects[2].title, // Tree Planting
      completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    {
      amount: 100,
      donorName: 'Peter Wilson',
      donorEmail: 'peter@example.com',
      message: null,
      anonymous: false,
      paymentStatus: 'PENDING',
      paymentMethod: 'MPESA',
      projectId: projects[0].title, // Clean Water project
      completedAt: null
    },
    {
      amount: 750,
      donorName: null,
      donorEmail: null,
      message: 'Supporting education for all',
      anonymous: true,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'MPESA',
      projectId: projects[3].title, // Community Library
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  ];

  for (const donationData of sampleDonations) {
    // Find the project by title
    const project = await prisma.project.findFirst({
      where: { title: donationData.projectId }
    });

    if (project) {
      const donation = await prisma.donation.create({
        data: {
          ...donationData,
          projectId: project.id,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          receiptNumber: `RCP${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          createdAt: donationData.completedAt || new Date()
        }
      });

      // Update project current amount for completed donations
      if (donationData.paymentStatus === 'COMPLETED') {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            currentAmount: {
              increment: donationData.amount
            }
          }
        });
      }

      console.log(`✅ Created donation: ${formatCurrency(donation.amount)} for ${project.title}`);
    }
  }

  console.log('🎉 Database seeded successfully!');
  console.log(`📊 Total projects in database: ${await prisma.project.count()}`);
  console.log(`💰 Total donations in database: ${await prisma.donation.count()}`);
}

function formatCurrency(amount) {
  return `KES ${amount.toLocaleString()}`;
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
