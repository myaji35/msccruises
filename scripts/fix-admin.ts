import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Update the existing admin user
    const admin = await prisma.user.update({
      where: { email: 'admin@msccruises.com' },
      data: {
        name: 'Administrator',
        password: hashedPassword,
        userType: 'admin',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Admin user updated successfully!');
    console.log('Email: admin@msccruises.com');
    console.log('Password: admin123');
    console.log('User Type:', admin.userType);
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();
