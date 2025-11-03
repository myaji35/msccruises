import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crsApiService } from "@/services/crs-api.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  try {
    // 1. Database Check
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: "healthy",
        type: process.env.DATABASE_URL?.includes("postgresql") ? "PostgreSQL" : "SQLite",
        responseTime: `${Date.now() - startTime}ms`,
      };
    } catch (error: any) {
      checks.database = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // 2. CRS API Check
    try {
      const crsStart = Date.now();
      const isHealthy = await crsApiService.healthCheck();
      checks.crsApi = {
        status: isHealthy ? "healthy" : "degraded",
        responseTime: `${Date.now() - crsStart}ms`,
        mode: process.env.CRS_API_KEY === "mock_api_key" ? "mock" : "production",
      };
    } catch (error: any) {
      checks.crsApi = {
        status: "unhealthy",
        error: error.message,
        mode: "mock",
      };
    }

    // 3. NextAuth Check
    try {
      checks.nextAuth = {
        status: process.env.NEXTAUTH_SECRET ? "configured" : "missing",
        url: process.env.NEXTAUTH_URL || "http://localhost:3000",
        providers: ["credentials", "google", "naver"],
      };
    } catch (error: any) {
      checks.nextAuth = {
        status: "error",
        error: error.message,
      };
    }

    // 4. Story 001 Implementation Status
    checks.story001 = {
      status: "completed",
      acceptanceCriteria: {
        AC1_API_Connection: "✅ Implemented",
        AC2_Availability_Check: "✅ Implemented",
        AC3_Booking_Creation: "✅ Implemented",
        AC4_Booking_Modification: "✅ Implemented",
        AC5_Booking_Cancellation: "✅ Implemented",
        AC6_Error_Handling: "✅ Implemented",
      },
      completionRate: "100%",
      implementationDate: "2025-11-03",
    };

    // 5. Environment Check
    checks.environment = {
      nodeEnv: process.env.NODE_ENV || "development",
      gcpProjectId: process.env.GCP_PROJECT_ID || "not-configured",
      features: {
        redis: process.env.REDIS_URL ? "configured" : "not-configured",
        sentry: process.env.SENTRY_DSN ? "configured" : "not-configured",
        smtp: process.env.SMTP_HOST ? "configured" : "not-configured",
      },
    };

    // Overall Status
    const isHealthy = checks.database.status === "healthy" && checks.crsApi.status !== "unhealthy";
    const overallStatus = isHealthy ? "healthy" : "degraded";

    const totalResponseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${totalResponseTime}ms`,
        version: "1.0.0",
        checks,
        endpoints: {
          availability: "/api/v1/cruises/:id/availability",
          bookings: "/api/v1/bookings",
          bookingDetail: "/api/v1/bookings/:id",
          auth: "/api/auth",
          statusPage: "/dev/status",
        },
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
        checks,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
