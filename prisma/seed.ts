import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const customerPassword = await bcrypt.hash("password123", 10);
  const partnerPassword = await bcrypt.hash("password123", 10);

  // Create customer user
  const customer = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      email: "customer@test.com",
      password: customerPassword,
      name: "김고객",
      phone: "010-1234-5678",
      userType: "customer",
      emailVerified: new Date(),
    },
  });

  console.log("✓ Created customer user:", customer.email);

  // Create Voyagers Club for customer
  await prisma.voyagersClub.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId: customer.id,
      membershipNumber: `MSC${Date.now()}001`,
      tier: "silver",
      points: 12500,
    },
  });

  console.log("✓ Created Voyagers Club membership");

  // Create sample bookings for customer
  await prisma.booking.create({
    data: {
      userId: customer.id,
      bookingNumber: `MSC2025001234`,
      cruiseId: "MSC123456",
      cruiseName: "Caribbean Adventure",
      shipName: "MSC Seaside",
      departureDate: new Date("2025-12-15"),
      returnDate: new Date("2025-12-22"),
      departurePort: "Miami, FL",
      cabinCategory: "balcony",
      cabinNumber: "B-1234",
      totalPrice: 4598,
      currency: "USD",
      status: "confirmed",
      paymentStatus: "paid",
      isPackage: true,
      outboundFlight: "KE081",
      returnFlight: "KE082",
      packageDiscount: 350,
      passengers: {
        create: [
          {
            firstName: "김",
            lastName: "고객",
            dateOfBirth: new Date("1985-03-15"),
            nationality: "KR",
            isPrimary: true,
          },
        ],
      },
    },
  });

  console.log("✓ Created sample booking for customer");

  // Create partner user
  const partner = await prisma.user.upsert({
    where: { email: "partner@test.com" },
    update: {},
    create: {
      email: "partner@test.com",
      password: partnerPassword,
      name: "홍대리",
      phone: "02-1234-5678",
      userType: "partner",
      emailVerified: new Date(),
    },
  });

  console.log("✓ Created partner user:", partner.email);

  // Create Partner Info
  await prisma.partnerInfo.upsert({
    where: { userId: partner.id },
    update: {},
    create: {
      userId: partner.id,
      companyName: "서울크루즈여행사",
      businessNumber: "123-45-67890",
      representativeName: "홍길동",
      address: "서울시 강남구 테헤란로 123",
      commissionRate: 0.1,
      subpageUrl: "/partners/seoul-cruise",
      status: "active",
      approvedAt: new Date(),
    },
  });

  console.log("✓ Created partner info");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📝 Test accounts:");
  console.log("Customer: customer@test.com / password123");
  console.log("Partner: partner@test.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
