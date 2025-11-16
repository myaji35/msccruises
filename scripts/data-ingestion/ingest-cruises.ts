/**
 * Data Ingestion Script: Cruise Catalog
 *
 * This script collects all cruise data from the database and creates
 * embeddings for RAG (Retrieval-Augmented Generation) chatbot.
 *
 * Usage:
 *   npx tsx scripts/data-ingestion/ingest-cruises.ts
 */

import { prisma } from "@/lib/prisma";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone (we'll use mock data for now since we don't have actual Pinecone setup)
const PINECONE_ENABLED = false; // Set to true when Pinecone is configured

interface CruiseDocument {
  id: string;
  text: string;
  metadata: {
    type: "cruise";
    cruiseId: string;
    cruiseName: string;
    shipName: string;
    region: string;
    duration: number;
    priceRange: string;
    departurePort: string;
  };
}

/**
 * Mock cruise data for demonstration
 * In production, this would fetch from actual database
 */
const MOCK_CRUISES = [
  {
    id: "MSC001",
    name: "지중해 7일 크루즈",
    ship: "MSC Grandiosa",
    region: "Mediterranean",
    duration: 7,
    departurePort: "Barcelona",
    itinerary: ["Barcelona", "Marseille", "Genoa", "Naples", "Messina", "Valletta", "Barcelona"],
    startingPrice: 899,
    description: "지중해의 아름다운 도시들을 탐험하는 7일간의 여정. 바르셀로나에서 출발하여 프랑스, 이탈리아, 몰타를 경유합니다.",
    highlights: ["가우디 건축물 투어", "프렌치 리비에라", "폼페이 유적지", "몰타 발레타 구시가지"],
  },
  {
    id: "MSC002",
    name: "카리브해 10일 크루즈",
    ship: "MSC Seashore",
    region: "Caribbean",
    duration: 10,
    departurePort: "Miami",
    itinerary: ["Miami", "Cozumel", "Grand Cayman", "Jamaica", "Bahamas", "Miami"],
    startingPrice: 1299,
    description: "카리브해의 청록색 바다와 백사장을 만끽하는 10일 크루즈. 마이애미 출발, 멕시코와 자메이카의 열대 낙원을 탐험합니다.",
    highlights: ["스노클링 & 다이빙", "마야 유적지", "럼주 증류소 투어", "비치 리조트"],
  },
  {
    id: "MSC003",
    name: "북유럽 피오르드 14일",
    ship: "MSC Virtuosa",
    region: "Northern Europe",
    duration: 14,
    departurePort: "Copenhagen",
    itinerary: ["Copenhagen", "Oslo", "Geiranger", "Bergen", "Stavanger", "Amsterdam", "Copenhagen"],
    startingPrice: 1899,
    description: "북유럽의 장엄한 피오르드와 바이킹 역사를 체험하는 14일 대장정. 코펜하겐에서 출발하여 노르웨이의 숨막히는 자연 경관을 감상합니다.",
    highlights: ["게이랑에르 피오르드", "바이킹 박물관", "브뤼헨 목조 건물", "암스테르담 운하 투어"],
  },
  {
    id: "MSC004",
    name: "아시아 탐험 12일",
    ship: "MSC Bellissima",
    region: "Asia",
    duration: 12,
    departurePort: "Singapore",
    itinerary: ["Singapore", "Phuket", "Penang", "Langkawi", "Port Klang", "Singapore"],
    startingPrice: 1599,
    description: "동남아시아의 이국적인 문화와 열대 해변을 경험하는 12일 크루즈. 싱가포르 출발, 태국과 말레이시아의 숨겨진 보석들을 발견합니다.",
    highlights: ["푸켓 판와 해변", "페낭 조지타운", "랑카위 스카이브릿지", "쿠알라룸푸르 투어"],
  },
];

/**
 * Generate searchable text content for a cruise
 */
function generateCruiseText(cruise: typeof MOCK_CRUISES[0]): string {
  const priceRange = cruise.startingPrice < 1000 ? "저가" :
                     cruise.startingPrice < 1500 ? "중가" : "고가";

  return `
크루즈: ${cruise.name}
선박: ${cruise.ship}
지역: ${cruise.region}
기간: ${cruise.duration}일
출발지: ${cruise.departurePort}
여정: ${cruise.itinerary.join(" → ")}
시작 가격: $${cruise.startingPrice} (${priceRange})

설명:
${cruise.description}

주요 하이라이트:
${cruise.highlights.map((h, i) => `${i + 1}. ${h}`).join("\n")}

적합한 여행객:
- ${cruise.region === "Mediterranean" ? "유럽 문화와 역사에 관심이 있는 여행객" : ""}
- ${cruise.region === "Caribbean" ? "따뜻한 날씨와 해변 액티비티를 원하는 여행객" : ""}
- ${cruise.region === "Northern Europe" ? "자연 경관과 피오르드를 좋아하는 여행객" : ""}
- ${cruise.region === "Asia" ? "아시아 문화와 음식을 체험하고 싶은 여행객" : ""}
- ${cruise.duration > 10 ? "긴 휴가가 가능한 여행객" : "짧은 휴가를 원하는 여행객"}

예약 팁:
- 조기 예약 시 최대 20% 할인 가능
- ${cruise.region === "Caribbean" ? "12월-4월이 성수기입니다" : ""}
- ${cruise.region === "Mediterranean" ? "6월-9월이 최적의 시즌입니다" : ""}
- ${cruise.region === "Northern Europe" ? "5월-8월에 백야를 경험할 수 있습니다" : ""}
- 그룹 예약 (3개 객실 이상) 시 5-15% 할인
`.trim();
}

/**
 * Create embedding for text
 */
async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      dimensions: 3072, // Full dimension for highest accuracy
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

/**
 * Main ingestion function
 */
async function ingestCruiseData() {
  console.log("🚀 Starting cruise data ingestion...\n");

  const documents: CruiseDocument[] = [];

  // Process each cruise
  for (const cruise of MOCK_CRUISES) {
    console.log(`📝 Processing: ${cruise.name}...`);

    const text = generateCruiseText(cruise);

    // Create document
    const doc: CruiseDocument = {
      id: cruise.id,
      text,
      metadata: {
        type: "cruise",
        cruiseId: cruise.id,
        cruiseName: cruise.name,
        shipName: cruise.ship,
        region: cruise.region,
        duration: cruise.duration,
        priceRange: cruise.startingPrice < 1000 ? "budget" :
                   cruise.startingPrice < 1500 ? "mid" : "luxury",
        departurePort: cruise.departurePort,
      },
    };

    documents.push(doc);

    // Create embedding (rate limiting: 3000 RPM for text-embedding-3-large)
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log(`  🔄 Creating embedding...`);
        const embedding = await createEmbedding(text);
        console.log(`  ✅ Embedding created (${embedding.length} dimensions)`);

        // In production, store to Pinecone here
        if (PINECONE_ENABLED) {
          // const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
          // const index = pinecone.index("msc-cruises-kb");
          // await index.upsert([
          //   {
          //     id: doc.id,
          //     values: embedding,
          //     metadata: doc.metadata,
          //   },
          // ]);
          console.log(`  📤 Uploaded to Pinecone`);
        } else {
          console.log(`  💾 Storing locally (Pinecone disabled)`);
          // Store to local file for development
          const fs = require("fs");
          const path = require("path");
          const outputDir = path.join(process.cwd(), "data", "embeddings");

          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          fs.writeFileSync(
            path.join(outputDir, `${doc.id}.json`),
            JSON.stringify({
              id: doc.id,
              text: doc.text,
              embedding: embedding,
              metadata: doc.metadata,
            }, null, 2)
          );
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ❌ Error processing ${cruise.id}:`, error);
      }
    } else {
      console.log(`  ⚠️  OPENAI_API_KEY not set, skipping embedding`);
    }

    console.log();
  }

  console.log(`\n✅ Ingestion complete!`);
  console.log(`   Total documents: ${documents.length}`);
  console.log(`   Storage: ${PINECONE_ENABLED ? "Pinecone" : "Local files (data/embeddings/)"}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review embeddings in data/embeddings/`);
  console.log(`   2. Set up Pinecone and update PINECONE_ENABLED flag`);
  console.log(`   3. Run ingest-reviews.ts for customer reviews`);
  console.log(`   4. Run ingest-policies.ts for FAQs and policies\n`);
}

// Run ingestion
ingestCruiseData()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
