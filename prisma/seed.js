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

  // Projects will be created by admin users through the admin interface
  console.log('📝 Projects will be created through admin interface...');

  // Sample donations will be created when projects exist
  console.log('💰 Donations will be created when projects are available...');

  console.log('🎉 Database seeded successfully!');
  console.log('📊 Admin user created. Projects can be created through the admin interface.');
  console.log(`📊 Total projects in database: ${await prisma.project.count()}`);
  console.log(`💰 Total donations in database: ${await prisma.donation.count()}`);
}



main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
