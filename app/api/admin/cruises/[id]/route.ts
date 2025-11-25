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

// PUT /api/admin/cruises/[id] - Update cruise by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Validation
    if (!data.name || !data.shipName || !data.departurePort) {
      return NextResponse.json(
        { error: "Missing required fields: name, shipName, departurePort" },
        { status: 400 }
      );
    }

    // Check if cruise exists
    const existingCruise = await prisma.cruise.findUnique({
      where: { id },
    });

    if (!existingCruise) {
      return NextResponse.json(
        { error: "Cruise not found" },
        { status: 404 }
      );
    }

    // Update cruise using transaction
    const updatedCruise = await prisma.$transaction(async (tx) => {
      // 1. Update basic cruise info
      const cruise = await tx.cruise.update({
        where: { id },
        data: {
          name: data.name,
          shipName: data.shipName,
          description: data.description || null,
          departurePort: data.departurePort,
          destinations: JSON.stringify(data.destinations || []),
          durationDays: parseInt(data.durationDays) || existingCruise.durationDays,
          startingPrice: parseFloat(data.startingPrice) || existingCruise.startingPrice,
          originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
          currency: data.currency || "USD",
          status: data.status || "draft",
          featured: data.featured || false,
          departureDate: data.departureDate || null,
          returnDate: data.returnDate || null,
          promotionTag: data.promotionTag || null,
          bookingStatus: data.bookingStatus || "일반",
          currentParticipants: data.currentParticipants || 0,
          maxParticipants: data.maxParticipants || null,
        },
      });

      // 2. Update media if provided
      if (data.media && Array.isArray(data.media)) {
        // Delete existing media
        await tx.cruiseMedia.deleteMany({
          where: { cruiseId: id },
        });

        // Create new media
        if (data.media.length > 0) {
          await tx.cruiseMedia.createMany({
            data: data.media.map((m: any, index: number) => ({
              cruiseId: id,
              type: m.type || "image",
              url: m.url,
              filename: m.filename,
              filesize: m.size || 0,
              mimeType: m.mimeType || "image/jpeg",
              isPrimary: m.isPrimary || false,
              order: index,
              alt: m.alt || "",
              caption: m.caption || "",
            })),
          });
        }
      }

      // 3. Return updated cruise with relations
      return await tx.cruise.findUnique({
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
    });

    return NextResponse.json({
      success: true,
      cruise: updatedCruise,
    });
  } catch (error: any) {
    console.error("[Cruise Update Error]", error);
    return NextResponse.json(
      { error: "Failed to update cruise", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cruises/[id] - Delete cruise by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if cruise exists
    const cruise = await prisma.cruise.findUnique({
      where: { id },
    });

    if (!cruise) {
      return NextResponse.json(
        { error: "Cruise not found" },
        { status: 404 }
      );
    }

    // Delete cruise (CASCADE delete handled by Prisma relations)
    await prisma.cruise.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Cruise deleted successfully",
    });
  } catch (error: any) {
    console.error("[Cruise Delete Error]", error);
    return NextResponse.json(
      { error: "Failed to delete cruise", message: error.message },
      { status: 500 }
    );
  }
}
