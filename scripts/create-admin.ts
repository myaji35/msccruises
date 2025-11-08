import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@msccruises.com' },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@msccruises.com');
      console.log('Password: admin123');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@msccruises.com',
        name: 'Administrator',
        password: hashedPassword,
        userType: 'admin',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@msccruises.com');
    console.log('Password: admin123');
    console.log('User Type: admin');
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
