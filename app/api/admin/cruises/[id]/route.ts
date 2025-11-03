import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cruises/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cruise = await prisma.cruise.findUnique({
      where: { id: params.id },
      include: {
        media: {
          orderBy: { order: "asc" },
        },
        itineraries: {
          orderBy: { day: "asc" },
        },
      },
    });

    if (!cruise) {
      return NextResponse.json({ error: "Cruise not found" }, { status: 404 });
    }

    return NextResponse.json({ cruise });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch cruise", message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cruises/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication (개발 모드에서는 우회)
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as any).userType !== "partner") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.log("[DEV MODE] Skipping authentication for cruise update");
    }

    const body = await request.json();
    const { media, itineraries, ...cruiseData } = body;

    // Update cruise
    const cruise = await prisma.cruise.update({
      where: { id: params.id },
      data: {
        ...cruiseData,
        destinations: cruiseData.destinations
          ? JSON.stringify(cruiseData.destinations)
          : undefined,
        durationDays: cruiseData.durationDays
          ? parseInt(cruiseData.durationDays)
          : undefined,
        startingPrice: cruiseData.startingPrice
          ? parseFloat(cruiseData.startingPrice)
          : undefined,
      },
      include: {
        media: true,
        itineraries: true,
      },
    });

    return NextResponse.json({ success: true, cruise });
  } catch (error: any) {
    console.error("[Cruise Update Error]", error);
    return NextResponse.json(
      { error: "Failed to update cruise", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cruises/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication (개발 모드에서는 우회)
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as any).userType !== "partner") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.log("[DEV MODE] Skipping authentication for cruise deletion");
    }

    await prisma.cruise.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Cruise deleted" });
  } catch (error: any) {
    console.error("[Cruise Delete Error]", error);
    return NextResponse.json(
      { error: "Failed to delete cruise", message: error.message },
      { status: 500 }
    );
  }
}
