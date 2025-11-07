import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cruises - List all cruises
export async function GET(request: NextRequest) {
  try {
    // Check authentication (개발 모드에서는 우회)
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.log("[DEV MODE] Skipping authentication for cruise list");
    }

    const cruises = await prisma.cruise.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ cruises });
  } catch (error: any) {
    console.error("[Cruises List Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch cruises", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/cruises - Create new cruise
export async function POST(request: NextRequest) {
  try {
    // Check authentication (개발 모드에서는 우회)
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check if user is partner (admin)
      const userType = (session.user as any).userType;
      if (userType !== "partner") {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }
    } else {
      console.log("[DEV MODE] Skipping authentication for cruise creation");
    }

    const body = await request.json();
    const {
      name,
      shipName,
      description,
      departurePort,
      destinations,
      durationDays,
      startingPrice,
      currency,
      status,
      featured,
      media,
      itineraries,
    } = body;

    // Validate required fields
    if (!name || !shipName || !departurePort || !durationDays || !startingPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create cruise with media and itineraries
    const cruise = await prisma.cruise.create({
      data: {
        name,
        shipName,
        description: description || "",
        departurePort,
        destinations: JSON.stringify(destinations || []),
        durationDays: parseInt(durationDays),
        startingPrice: parseFloat(startingPrice),
        currency: currency || "USD",
        status: status || "draft",
        featured: featured || false,
        media: media
          ? {
              create: media.map((m: any, index: number) => ({
                type: m.type,
                url: m.url,
                filename: m.filename,
                filesize: m.size,
                mimeType: m.mimeType,
                width: m.width,
                height: m.height,
                duration: m.duration,
                isPrimary: m.isPrimary || index === 0,
                order: index,
                alt: m.alt || "",
                caption: m.caption || "",
              })),
            }
          : undefined,
        cruiseItineraries: itineraries
          ? {
              create: itineraries.map((it: any) => ({
                day: parseInt(it.day),
                portType: it.portType || "port_of_call",
                port: it.port,
                arrival: it.arrival || null,
                departure: it.departure || null,
                activities: JSON.stringify(it.activities || []),
                description: it.description || "",
              })),
            }
          : undefined,
      },
      include: {
        media: true,
        cruiseItineraries: true,
      },
    });

    return NextResponse.json({
      success: true,
      cruise,
    });
  } catch (error: any) {
    console.error("[Cruise Create Error]", error);
    return NextResponse.json(
      { error: "Failed to create cruise", message: error.message },
      { status: 500 }
    );
  }
}
