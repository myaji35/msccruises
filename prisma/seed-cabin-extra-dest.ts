import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding cabin categories, extras, and destinations...");

  // 1. Cabin Categories
  const cabinCategories = [
    {
      code: "inside",
      name: "내부 객실 (Inside)",
      nameEn: "Inside Cabin",
      description: "편안한 내부 객실, 가성비 최고의 선택",
      features: JSON.stringify([
        "창문 없음",
        "트윈 베드 또는 더블 베드",
        "개인 욕실 및 샤워 시설",
        "TV 및 냉장고",
        "충분한 수납공간",
      ]),
      priceMultiplier: 1.0,
      order: 1,
    },
    {
      code: "oceanview",
      name: "오션뷰 (Oceanview)",
      nameEn: "Oceanview Cabin",
      description: "창문을 통해 바다를 조망할 수 있는 객실",
      features: JSON.stringify([
        "바다 전망 창문",
        "트윈 베드 또는 더블 베드",
        "개인 욕실 및 샤워 시설",
        "TV, 냉장고, 금고",
        "넓은 수납공간",
      ]),
      priceMultiplier: 1.3,
      order: 2,
    },
    {
      code: "balcony",
      name: "발코니 (Balcony)",
      nameEn: "Balcony Cabin",
      description: "전용 발코니에서 즐기는 프라이빗한 바다 전망",
      features: JSON.stringify([
        "전용 발코니",
        "바다 전망 슬라이딩 도어",
        "더블 베드 또는 트윈 베드",
        "욕조가 있는 욕실",
        "TV, 냉장고, 금고, 소파",
      ]),
      priceMultiplier: 1.6,
      order: 3,
    },
    {
      code: "suite",
      name: "스위트 (Suite)",
      nameEn: "Suite",
      description: "최상급 럭셔리 스위트, 프리미엄 서비스 제공",
      features: JSON.stringify([
        "넓은 전용 발코니",
        "분리된 침실과 거실",
        "킹 사이즈 베드",
        "욕조 및 독립 샤워 시설",
        "VIP 라운지 이용 가능",
        "우선 승선 및 하선",
        "24시간 컨시어지 서비스",
      ]),
      priceMultiplier: 2.5,
      order: 4,
    },
  ];

  for (const category of cabinCategories) {
    await prisma.cabinCategory.upsert({
      where: { code: category.code },
      update: category,
      create: category,
    });
    console.log(`✅ Created/Updated cabin category: ${category.name}`);
  }

  // 2. Cruise Extras
  const cruiseExtras = [
    {
      code: "dining-specialty",
      name: "특식 다이닝 패키지",
      nameEn: "Specialty Dining Package",
      description: "미슐랭 스타 셰프의 특별 요리를 즐기세요",
      price: 150,
      category: "dining",
      features: JSON.stringify([
        "미슐랭 스타 셰프 요리",
        "5회 특식 다이닝 이용권",
        "이탈리안, 프렌치, 스테이크하우스",
      ]),
      maxPerBooking: 10,
      order: 1,
    },
    {
      code: "beverage-package",
      name: "무제한 음료 패키지",
      nameEn: "Unlimited Beverage Package",
      description: "크루즈 내 모든 음료를 무제한으로 즐기세요",
      price: 89,
      category: "beverage",
      features: JSON.stringify([
        "알코올 음료 포함",
        "프리미엄 칵테일",
        "생맥주 및 와인",
        "신선한 주스 및 음료",
      ]),
      maxPerBooking: 10,
      order: 2,
    },
    {
      code: "wifi-premium",
      name: "프리미엄 와이파이",
      nameEn: "Premium WiFi",
      description: "크루즈 전 기간 고속 인터넷 이용 (1인 1디바이스)",
      price: 29,
      category: "wifi",
      features: JSON.stringify([
        "고속 인터넷",
        "스트리밍 가능",
        "1인 1디바이스",
        "크루즈 전 기간",
      ]),
      maxPerBooking: 10,
      order: 3,
    },
    {
      code: "shore-excursion-basic",
      name: "육상 투어 - 베이직",
      nameEn: "Shore Excursion - Basic",
      description: "주요 관광지 가이드 투어",
      price: 299,
      category: "shore-excursion",
      features: JSON.stringify([
        "전문 가이드 동행",
        "3개 주요 관광지",
        "왕복 교통편",
        "입장료 포함",
      ]),
      maxPerBooking: 10,
      order: 4,
    },
    {
      code: "shore-excursion-premium",
      name: "육상 투어 - 프리미엄",
      nameEn: "Shore Excursion - Premium",
      description: "프라이빗 럭셔리 투어 (소규모 그룹)",
      price: 599,
      category: "shore-excursion",
      features: JSON.stringify([
        "프라이빗 차량 및 가이드",
        "럭셔리 레스토랑 식사 포함",
        "5개 이상 관광지",
        "와이너리 또는 특별 체험",
      ]),
      maxPerBooking: 6,
      order: 5,
    },
    {
      code: "spa-package",
      name: "스파 패키지",
      nameEn: "Spa Package",
      description: "럭셔리 스파 트리트먼트 5회 이용권",
      price: 450,
      category: "spa",
      features: JSON.stringify([
        "전신 마사지 3회",
        "페이셜 트리트먼트 2회",
        "사우나 및 스팀룸 무제한",
        "뷰티 케어 상품 증정",
      ]),
      maxPerBooking: 10,
      order: 6,
    },
  ];

  for (const extra of cruiseExtras) {
    await prisma.cruiseExtra.upsert({
      where: { code: extra.code },
      update: extra,
      create: extra,
    });
    console.log(`✅ Created/Updated cruise extra: ${extra.name}`);
  }

  // 3. Destinations
  const destinations = [
    {
      code: "caribbean",
      name: "카리브해",
      nameEn: "Caribbean",
      region: "Americas",
      description: "청록빛 바다와 열대 낙원을 탐험하세요",
      order: 1,
    },
    {
      code: "mediterranean",
      name: "지중해",
      nameEn: "Mediterranean",
      region: "Europe",
      description: "고대 문명과 아름다운 해안선을 따라",
      order: 2,
    },
    {
      code: "northern-europe",
      name: "북유럽",
      nameEn: "Northern Europe",
      region: "Europe",
      description: "피요르드와 북유럽의 매력을 만나다",
      order: 3,
    },
    {
      code: "alaska",
      name: "알래스카",
      nameEn: "Alaska",
      region: "Americas",
      description: "빙하와 야생의 자연을 경험하세요",
      order: 4,
    },
    {
      code: "asia",
      name: "아시아",
      nameEn: "Asia",
      region: "Asia",
      description: "동양의 신비와 문화를 탐험",
      order: 5,
    },
    {
      code: "middle-east",
      name: "중동",
      nameEn: "Middle East",
      region: "Middle East",
      description: "고대와 현대가 공존하는 중동",
      order: 6,
    },
    {
      code: "south-america",
      name: "남미",
      nameEn: "South America",
      region: "Americas",
      description: "정열과 자연이 가득한 남미 대륙",
      order: 7,
    },
  ];

  for (const destination of destinations) {
    await prisma.destination.upsert({
      where: { code: destination.code },
      update: destination,
      create: destination,
    });
    console.log(`✅ Created/Updated destination: ${destination.name}`);
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
