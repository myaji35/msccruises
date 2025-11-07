import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cruises/[id] - Get cruise by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cruise = await prisma.cruise.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: {
            order: "asc",
          },
        },
        cruiseItineraries: {
          orderBy: {
            day: "asc",
          },
        },
        flightItineraries: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!cruise) {
      return NextResponse.json(
        { error: "Cruise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ cruise });
  } catch (error: any) {
    console.error("[Cruise Detail Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch cruise", message: error.message },
      { status: 500 }
    );
  }
}
