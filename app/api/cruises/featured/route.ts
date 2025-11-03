import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cruises/featured - Get featured cruises (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const cruises = await prisma.cruise.findMany({
      where: {
        featured: true,
        status: "active", // Only show active cruises
      },
      include: {
        media: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6, // Limit to 6 featured cruises
    });

    return NextResponse.json({ cruises });
  } catch (error: any) {
    console.error("[Featured Cruises Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch featured cruises", message: error.message },
      { status: 500 }
    );
  }
}
