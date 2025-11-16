import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/destinations - Get all active destinations
export async function GET(request: NextRequest) {
  try {
    const destinations = await prisma.destination.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({ destinations });
  } catch (error: any) {
    console.error("[Destinations Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations", message: error.message },
      { status: 500 }
    );
  }
}
