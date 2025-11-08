import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@msccruises.com' }
    });

    console.log('Admin user:', JSON.stringify(admin, null, 2));

    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, userType: true }
    });

    console.log('\nAll users:', JSON.stringify(allUsers, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
