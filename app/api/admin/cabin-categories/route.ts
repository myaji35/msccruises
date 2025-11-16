import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cabin-categories - Get all cabin categories (including inactive)
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.cabinCategory.findMany({
      orderBy: {
        order: "asc",
      },
    });

    // Parse JSON features for each category
    const categoriesWithParsedFeatures = categories.map((cat) => ({
      ...cat,
      features: cat.features ? JSON.parse(cat.features) : [],
    }));

    return NextResponse.json({ categories: categoriesWithParsedFeatures });
  } catch (error: any) {
    console.error("[Admin Cabin Categories Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch cabin categories", message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/cabin-categories - Create new cabin category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      nameEn,
      description,
      features,
      priceMultiplier,
      imageUrl,
      order,
      isActive,
    } = body;

    // Validation
    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.cabinCategory.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cabin category with this code already exists" },
        { status: 400 }
      );
    }

    // Create category
    const category = await prisma.cabinCategory.create({
      data: {
        code,
        name,
        nameEn,
        description,
        features: features ? JSON.stringify(features) : null,
        priceMultiplier: priceMultiplier || 1.0,
        imageUrl,
        order: order || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      category: {
        ...category,
        features: category.features ? JSON.parse(category.features) : [],
      },
    });
  } catch (error: any) {
    console.error("[Admin Cabin Categories Create Error]", error);
    return NextResponse.json(
      { error: "Failed to create cabin category", message: error.message },
      { status: 500 }
    );
  }
}
