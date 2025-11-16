/**
 * Data Ingestion Script: Customer Reviews
 *
 * This script collects customer reviews and creates embeddings
 * for sentiment-aware responses in the chatbot.
 *
 * Usage:
 *   npx tsx scripts/data-ingestion/ingest-reviews.ts
 */

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PINECONE_ENABLED = false;

/**
 * Mock customer reviews
 * In production, fetch from review aggregator (Trustpilot, TripAdvisor, etc.)
 */
const MOCK_REVIEWS = [
  {
    id: "REV001",
    cruiseId: "MSC001",
    cruiseName: "지중해 7일 크루즈",
    rating: 5,
    title: "평생 잊지 못할 여행!",
    content: "가족과 함께한 지중해 크루즈는 정말 환상적이었습니다. 바르셀로나의 가우디 건축물 투어가 특히 인상 깊었고, 객실도 깨끗하고 넓었습니다. 직원들이 매우 친절했고, 음식도 훌륭했습니다. 다만 와이파이 속도가 느려서 조금 아쉬웠지만, 크루즈에서는 디지털 디톡스를 경험할 수 있어서 오히려 좋았습니다.",
    date: "2024-09-15",
    author: "김민수",
    helpful: 24,
    tags: ["가족 여행", "음식 만족", "친절한 직원"],
  },
  {
    id: "REV002",
    cruiseId: "MSC002",
    cruiseName: "카리브해 10일 크루즈",
    rating: 4,
    title: "신혼여행으로 최고!",
    content: "신혼여행으로 카리브해 크루즈를 선택했는데 정말 잘한 것 같습니다. 코즈멜에서의 스노클링이 환상적이었고, 자메이카에서 럼주 증류소 투어도 재미있었습니다. 발코니 객실에서 바라보는 일출이 정말 아름다웠어요. 다만 10일은 조금 길게 느껴졌고, 일부 기항지에서 시간이 부족했습니다.",
    date: "2024-10-20",
    author: "이지은",
    helpful: 18,
    tags: ["신혼여행", "발코니 객실 추천", "스노클링"],
  },
  {
    id: "REV003",
    cruiseId: "MSC003",
    cruiseName: "북유럽 피오르드 14일",
    rating: 5,
    title: "자연의 경이로움!",
    content: "북유럽 피오르드 크루즈는 제 인생 최고의 여행이었습니다. 게이랑에르 피오르드의 장엄한 경치는 말로 표현할 수 없을 정도였고, 노르웨이의 작은 마을들도 너무 아름다웠습니다. 선상 강의 프로그램에서 바이킹 역사를 배울 수 있어서 더욱 의미 있었습니다. 가격은 다소 높지만 그만한 가치가 있습니다.",
    date: "2024-08-05",
    author: "박준호",
    helpful: 31,
    tags: ["자연 경관", "교육 프로그램", "가치 있는 여행"],
  },
  {
    id: "REV004",
    cruiseId: "MSC001",
    cruiseName: "지중해 7일 크루즈",
    rating: 3,
    title: "괜찮았지만 아쉬운 점도",
    content: "전반적으로 괜찮은 크루즈였지만, 몇 가지 아쉬운 점이 있었습니다. 나폴리 기항 시간이 너무 짧아서 폼페이 유적지를 제대로 보지 못했고, 뷔페 식당이 너무 혼잡했습니다. 하지만 제노바와 마르세유는 정말 아름다웠고, 선상 엔터테인먼트도 다양했습니다.",
    date: "2024-07-12",
    author: "최영희",
    helpful: 12,
    tags: ["시간 부족", "혼잡함", "엔터테인먼트 좋음"],
  },
  {
    id: "REV005",
    cruiseId: "MSC004",
    cruiseName: "아시아 탐험 12일",
    rating: 5,
    title: "동남아의 매력에 푹 빠지다",
    content: "동남아시아 크루즈는 문화적 다양성을 경험할 수 있는 최고의 방법입니다. 푸켓의 해변은 정말 아름다웠고, 페낭의 조지타운은 역사적 매력이 넘쳤습니다. 특히 랑카위 스카이브릿지에서 본 전망이 압권이었습니다. 음식도 현지 요리를 선상에서 맛볼 수 있어서 좋았습니다. 적극 추천합니다!",
    date: "2024-11-01",
    author: "정수현",
    helpful: 22,
    tags: ["문화 체험", "현지 음식", "스카이브릿지"],
  },
  {
    id: "REV006",
    cruiseId: "MSC002",
    cruiseName: "카리브해 10일 크루즈",
    rating: 4,
    title: "가격 대비 만족스러운 크루즈",
    content: "처음 크루즈를 탔는데, 기대 이상이었습니다. 특히 그랜드 케이맨에서의 스팅레이 시티 투어가 정말 특별했어요. 아이들이 엄청 좋아했습니다. 객실은 생각보다 작았지만, 하루 종일 밖에 있어서 크게 문제되지 않았습니다. 조기 예약 할인을 받아서 가격 대비 만족도가 높습니다.",
    date: "2024-09-28",
    author: "홍길동",
    helpful: 16,
    tags: ["가족 여행", "가성비", "스팅레이 시티"],
  },
];

/**
 * Generate searchable review text
 */
function generateReviewText(review: typeof MOCK_REVIEWS[0]): string {
  const sentiment = review.rating >= 4 ? "긍정적" : review.rating === 3 ? "중립적" : "부정적";
  const recommendation = review.rating >= 4 ? "추천" : "조건부 추천";

  return `
고객 리뷰: ${review.cruiseName}
평점: ${review.rating}/5 (${sentiment})
제목: ${review.title}
작성자: ${review.author}
작성일: ${review.date}

리뷰 내용:
${review.content}

태그: ${review.tags.join(", ")}
도움됨: ${review.helpful}명

분석:
- 추천 여부: ${recommendation}
- 긍정 포인트: ${review.rating >= 4 ? "서비스, 경치, 음식, 액티비티" : "일부 기항지"}
- 개선 포인트: ${review.rating <= 3 ? "시간 부족, 혼잡함, 객실 크기" : "와이파이 속도"}
- 적합한 고객: ${review.tags.includes("가족 여행") ? "가족 단위 여행객" : review.tags.includes("신혼여행") ? "신혼부부" : "자연을 사랑하는 여행객"}
`.trim();
}

/**
 * Create embedding for review
 */
async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
    dimensions: 3072,
  });

  return response.data[0].embedding;
}

/**
 * Main ingestion function
 */
async function ingestReviews() {
  console.log("🚀 Starting review data ingestion...\n");

  for (const review of MOCK_REVIEWS) {
    console.log(`📝 Processing: ${review.title} (${review.rating}⭐)...`);

    const text = generateReviewText(review);

    if (process.env.OPENAI_API_KEY) {
      try {
        console.log(`  🔄 Creating embedding...`);
        const embedding = await createEmbedding(text);
        console.log(`  ✅ Embedding created (${embedding.length} dimensions)`);

        // Store locally
        const fs = require("fs");
        const path = require("path");
        const outputDir = path.join(process.cwd(), "data", "embeddings", "reviews");

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(
          path.join(outputDir, `${review.id}.json`),
          JSON.stringify({
            id: review.id,
            text: text,
            embedding: embedding,
            metadata: {
              type: "review",
              reviewId: review.id,
              cruiseId: review.cruiseId,
              cruiseName: review.cruiseName,
              rating: review.rating,
              sentiment: review.rating >= 4 ? "positive" : review.rating === 3 ? "neutral" : "negative",
              date: review.date,
              tags: review.tags,
            },
          }, null, 2)
        );

        console.log(`  💾 Stored locally`);

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ❌ Error:`, error);
      }
    } else {
      console.log(`  ⚠️  OPENAI_API_KEY not set, skipping embedding`);
    }

    console.log();
  }

  console.log(`\n✅ Review ingestion complete!`);
  console.log(`   Total reviews: ${MOCK_REVIEWS.length}`);
  console.log(`   Storage: data/embeddings/reviews/\n`);
}

// Run
ingestReviews()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
