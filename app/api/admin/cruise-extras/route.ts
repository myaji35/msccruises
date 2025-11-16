import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cruise-extras - Get all cruise extras (including inactive)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const extras = await prisma.cruiseExtra.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    const extrasWithParsedFeatures = extras.map((extra) => ({
      ...extra,
      features: extra.features ? JSON.parse(extra.features) : [],
    }));

    return NextResponse.json({ extras: extrasWithParsedFeatures });
  } catch (error: any) {
    console.error("[Admin Cruise Extras Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch cruise extras", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/cruise-extras - Create new cruise extra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      nameEn,
      description,
      price,
      currency,
      category,
      features,
      imageUrl,
      maxPerBooking,
      order,
      isActive,
    } = body;

    if (!code || !name || !price || !category) {
      return NextResponse.json(
        { error: "Code, name, price, and category are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.cruiseExtra.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cruise extra with this code already exists" },
        { status: 400 }
      );
    }

    const extra = await prisma.cruiseExtra.create({
      data: {
        code,
        name,
        nameEn,
        description,
        price,
        currency: currency || "USD",
        category,
        features: features ? JSON.stringify(features) : null,
        imageUrl,
        maxPerBooking,
        order: order || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      extra: {
        ...extra,
        features: extra.features ? JSON.parse(extra.features) : [],
      },
    });
  } catch (error: any) {
    console.error("[Admin Cruise Extras Create Error]", error);
    return NextResponse.json(
      { error: "Failed to create cruise extra", message: error.message },
      { status: 500 }
    );
  }
}
