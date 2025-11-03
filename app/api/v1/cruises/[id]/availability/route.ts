import { NextRequest, NextResponse } from "next/server";
import { crsApiService } from "@/services/crs-api.service";

// In-memory cache (AC2: Redis 캐싱 요구사항 - 프로덕션에서는 Redis로 교체)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    const cruiseId = params.id;

    if (!cruiseId) {
      return NextResponse.json(
        { error: "Cruise ID is required" },
        { status: 400 }
      );
    }

    // Check cache first (AC2: TTL 5분)
    const cached = cache.get(cruiseId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const responseTime = Date.now() - startTime;
      console.log(`[Cache Hit] Availability for ${cruiseId} - ${responseTime}ms`);

      return NextResponse.json({
        ...cached.data,
        _meta: {
          cached: true,
          response_time_ms: responseTime,
        },
      });
    }

    // Call CRS API
    const availability = await crsApiService.getAvailability(cruiseId);

    // Store in cache
    cache.set(cruiseId, {
      data: availability,
      timestamp: Date.now(),
    });

    const responseTime = Date.now() - startTime;

    // AC2: 응답 시간 < 500ms 확인
    if (responseTime > 500) {
      console.warn(`[Performance Warning] Availability query took ${responseTime}ms (> 500ms)`);
    } else {
      console.log(`[Success] Availability for ${cruiseId} - ${responseTime}ms`);
    }

    return NextResponse.json({
      ...availability,
      _meta: {
        cached: false,
        response_time_ms: responseTime,
      },
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error("[Error] Failed to fetch availability:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch cruise availability",
        code: "CRS_AVAILABILITY_ERROR",
        message: error.message,
        _meta: {
          response_time_ms: responseTime,
        },
      },
      { status: 500 }
    );
  }
}

// Health check endpoint (AC1)
export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Quick availability check without full data
    const isHealthy = await crsApiService.healthCheck();

    if (isHealthy) {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 503 });
    }
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
