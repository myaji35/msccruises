// Story 001 - AC2: Real-time Availability Check
// GET /api/v1/cruises/{id}/availability
// Response time target: < 500ms
// Redis caching: TTL 5 minutes

import { NextRequest, NextResponse } from "next/server";
import { crsApiService } from "@/services/crs-api.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const cruiseId = params.id;

  try {
    // AC2: Call CRS API with < 500ms target
    const availability = await crsApiService.getAvailability(cruiseId);

    const responseTime = Date.now() - startTime;
    console.log(`[CRS Availability] Response time: ${responseTime}ms`);

    // AC2: Warn if response time exceeds target
    if (responseTime > 500) {
      console.warn(
        `[Performance Warning] Availability check took ${responseTime}ms (target: <500ms)`
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: availability,
        meta: {
          response_time_ms: responseTime,
          cached: false, // TODO: Implement Redis caching
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300", // 5 minutes
        },
      }
    );
  } catch (error: any) {
    console.error("[CRS Availability Error]", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || "AVAILABILITY_ERROR",
          message: error.message || "Failed to fetch availability",
        },
      },
      { status: error.statusCode || 500 }
    );
  }
}
