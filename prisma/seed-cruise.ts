import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding cruise data...');

  // Create test cruise
  const cruise = await prisma.cruise.upsert({
    where: { id: 'test-cruise-caribbean-001' },
    update: {},
    create: {
      id: 'test-cruise-caribbean-001',
      name: 'Caribbean Paradise 7-Night Cruise',
      shipName: 'MSC Seaside',
      description: `Experience the ultimate Caribbean adventure aboard the stunning MSC Seaside.

This 7-night cruise takes you through the most beautiful islands in the Caribbean, featuring crystal-clear waters, pristine beaches, and vibrant local culture.

Onboard, you'll enjoy world-class dining, Broadway-style entertainment, luxurious spa facilities, and activities for all ages. The MSC Seaside features innovative design with the industry's longest zip line at sea, interactive water park, and stunning ocean views from every angle.

Perfect for families, couples, or solo travelers seeking an unforgettable vacation experience.`,
      departurePort: 'Miami, Florida',
      destinations: JSON.stringify([
        'Nassau, Bahamas',
        'Cozumel, Mexico',
        'Grand Cayman, Cayman Islands',
        'Jamaica'
      ]),
      durationDays: 8,
      startingPrice: 1299,
      currency: 'USD',
      status: 'active',
      featured: true,
    },
  });

  console.log('✅ Cruise created:', cruise.name);

  // Add media
  await prisma.cruiseMedia.createMany({
    data: [
      {
        cruiseId: cruise.id,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584200186925-87fa8f93be9b?w=1200',
        filename: 'cruise-ship-exterior.jpg',
        isPrimary: true,
        order: 0,
        alt: 'MSC Seaside exterior view',
        caption: 'The stunning MSC Seaside',
      },
      {
        cruiseId: cruise.id,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200',
        filename: 'cruise-pool.jpg',
        isPrimary: false,
        order: 1,
        alt: 'Pool deck',
        caption: 'Relax by the pool',
      },
      {
        cruiseId: cruise.id,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
        filename: 'caribbean-beach.jpg',
        isPrimary: false,
        order: 2,
        alt: 'Caribbean beach',
        caption: 'Paradise awaits',
      },
    ],
  });

  console.log('✅ Media added');

  // Add cruise itinerary
  await prisma.cruiseItinerary.createMany({
    data: [
      {
        cruiseId: cruise.id,
        day: 1,
        portType: 'departure',
        port: 'Miami',
        portCode: 'MIA',
        country: 'USA',
        latitude: 25.7617,
        longitude: -80.1918,
        departure: '17:00',
        activities: JSON.stringify(['Embarkation', 'Safety Drill', 'Welcome Dinner']),
        description: 'Board the magnificent MSC Seaside and begin your Caribbean adventure. Enjoy a welcome dinner and explore the ship.',
        order: 0,
      },
      {
        cruiseId: cruise.id,
        day: 2,
        portType: 'port_of_call',
        port: 'Nassau',
        portCode: 'NAS',
        country: 'Bahamas',
        latitude: 25.0443,
        longitude: -77.3504,
        arrival: '08:00',
        departure: '17:00',
        durationHours: 9,
        activities: JSON.stringify(['Beach Visit', 'Atlantis Resort', 'Shopping', 'Water Sports']),
        description: 'Explore the capital of the Bahamas with its stunning beaches, vibrant markets, and crystal-clear waters.',
        order: 1,
      },
      {
        cruiseId: cruise.id,
        day: 3,
        portType: 'port_of_call',
        port: 'Cozumel',
        portCode: 'CZM',
        country: 'Mexico',
        latitude: 20.5083,
        longitude: -86.9458,
        arrival: '09:00',
        departure: '18:00',
        durationHours: 9,
        activities: JSON.stringify(['Snorkeling', 'Mayan Ruins', 'Beach Club', 'Tequila Tasting']),
        description: 'Discover ancient Mayan ruins and world-class snorkeling in this Mexican paradise.',
        order: 2,
      },
      {
        cruiseId: cruise.id,
        day: 4,
        portType: 'port_of_call',
        port: 'George Town',
        portCode: 'GCM',
        country: 'Cayman Islands',
        latitude: 19.2866,
        longitude: -81.3744,
        arrival: '07:00',
        departure: '16:00',
        durationHours: 9,
        activities: JSON.stringify(['Seven Mile Beach', 'Stingray City', 'Duty-Free Shopping']),
        description: 'Visit the famous Seven Mile Beach and swim with stingrays in their natural habitat.',
        order: 3,
      },
      {
        cruiseId: cruise.id,
        day: 5,
        portType: 'port_of_call',
        port: 'Ocho Rios',
        portCode: 'OCJ',
        country: 'Jamaica',
        latitude: 18.4048,
        longitude: -77.1026,
        arrival: '08:00',
        departure: '17:00',
        durationHours: 9,
        activities: JSON.stringify(['Dunn\'s River Falls', 'Bamboo Rafting', 'Jerk Chicken', 'Beach Time']),
        description: 'Experience Jamaica\'s natural beauty at Dunn\'s River Falls and taste authentic jerk cuisine.',
        order: 4,
      },
      {
        cruiseId: cruise.id,
        day: 6,
        portType: 'port_of_call',
        port: 'At Sea',
        portCode: null,
        country: null,
        latitude: null,
        longitude: null,
        arrival: null,
        departure: null,
        durationHours: 24,
        activities: JSON.stringify(['Pool Day', 'Spa', 'Shows', 'Casino', 'Fine Dining']),
        description: 'Enjoy a full day at sea with all the ship\'s amenities at your disposal.',
        order: 5,
      },
      {
        cruiseId: cruise.id,
        day: 7,
        portType: 'port_of_call',
        port: 'At Sea',
        portCode: null,
        country: null,
        latitude: null,
        longitude: null,
        arrival: null,
        departure: null,
        durationHours: 24,
        activities: JSON.stringify(['Farewell Dinner', 'Last Minute Shopping', 'Entertainment']),
        description: 'Final day at sea. Enjoy your last moments aboard before returning to Miami.',
        order: 6,
      },
      {
        cruiseId: cruise.id,
        day: 8,
        portType: 'arrival',
        port: 'Miami',
        portCode: 'MIA',
        country: 'USA',
        latitude: 25.7617,
        longitude: -80.1918,
        arrival: '07:00',
        activities: JSON.stringify(['Disembarkation']),
        description: 'Return to Miami with unforgettable memories of your Caribbean adventure.',
        order: 7,
      },
    ],
  });

  console.log('✅ Itinerary added (8 days)');

  // Add flight itinerary
  await prisma.flightItinerary.createMany({
    data: [
      {
        cruiseId: cruise.id,
        segmentType: 'outbound',
        flightNumber: 'KE123',
        airline: 'Korean Air',
        airlineCode: 'KE',
        departureAirport: 'Incheon International Airport',
        departureCode: 'ICN',
        departureCity: 'Seoul',
        departureCountry: 'South Korea',
        departureTime: '14:30',
        departureDate: new Date('2025-12-15'),
        departureTerminal: 'Terminal 2',
        arrivalAirport: 'Miami International Airport',
        arrivalCode: 'MIA',
        arrivalCity: 'Miami',
        arrivalCountry: 'USA',
        arrivalTime: '18:45',
        arrivalDate: new Date('2025-12-15'),
        arrivalTerminal: 'Terminal D',
        duration: 915,
        aircraft: 'Boeing 777-300ER',
        cabinClass: 'economy',
        stops: 0,
        mealService: true,
        baggageAllowance: '23kg x 2',
        order: 0,
      },
      {
        cruiseId: cruise.id,
        segmentType: 'return',
        flightNumber: 'KE124',
        airline: 'Korean Air',
        airlineCode: 'KE',
        departureAirport: 'Miami International Airport',
        departureCode: 'MIA',
        departureCity: 'Miami',
        departureCountry: 'USA',
        departureTime: '21:30',
        departureDate: new Date('2025-12-23'),
        departureTerminal: 'Terminal D',
        arrivalAirport: 'Incheon International Airport',
        arrivalCode: 'ICN',
        arrivalCity: 'Seoul',
        arrivalCountry: 'South Korea',
        arrivalTime: '05:15',
        arrivalDate: new Date('2025-12-25'),
        arrivalTerminal: 'Terminal 2',
        duration: 945,
        aircraft: 'Boeing 777-300ER',
        cabinClass: 'economy',
        stops: 0,
        mealService: true,
        baggageAllowance: '23kg x 2',
        order: 1,
      },
    ],
  });

  console.log('✅ Flight itinerary added');

  console.log('\n📊 Summary:');
  console.log('========================================');
  console.log('✅ 1개의 테스트 크루즈 생성');
  console.log('  - Name: Caribbean Paradise 7-Night Cruise');
  console.log('  - Ship: MSC Seaside');
  console.log('  - Duration: 8 days');
  console.log('  - Price: $1,299');
  console.log('  - Status: Active & Featured');
  console.log('\n✅ 3개의 이미지 추가');
  console.log('✅ 8일 항로 추가 (Miami → Nassau → Cozumel → Cayman → Jamaica → Miami)');
  console.log('✅ 왕복 항공편 추가 (ICN ↔ MIA)');
  console.log('========================================');
  console.log('\n🔗 Test URLs:');
  console.log(`http://localhost:3000/cruises/${cruise.id}`);
  console.log(`http://localhost:3000/booking/${cruise.id}`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
