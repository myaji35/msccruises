import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cruises/scheduled - Get scheduled cruises with departure dates (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const cruises = await prisma.cruise.findMany({
      where: {
        status: "active",
        departureDate: {
          not: null,
        },
      },
      include: {
        media: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        departureDate: "asc",
      },
      take: 10, // Limit to 10 scheduled cruises
    });

    return NextResponse.json({ cruises });
  } catch (error: any) {
    console.error("[Scheduled Cruises Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled cruises", message: error.message },
      { status: 500 }
    );
  }
}
