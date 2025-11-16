import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cruise-extras - Get all active cruise extras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const extras = await prisma.cruiseExtra.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: [
        { category: "asc" },
        { order: "asc" },
      ],
    });

    // Parse JSON features for each extra
    const extrasWithParsedFeatures = extras.map((extra) => ({
      ...extra,
      features: extra.features ? JSON.parse(extra.features) : [],
    }));

    return NextResponse.json({ extras: extrasWithParsedFeatures });
  } catch (error: any) {
    console.error("[Cruise Extras Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch cruise extras", message: error.message },
      { status: 500 }
    );
  }
}
