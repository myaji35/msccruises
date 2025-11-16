import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cabin-categories - Get all active cabin categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.cabinCategory.findMany({
      where: {
        isActive: true,
      },
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
    console.error("[Cabin Categories Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch cabin categories", message: error.message },
      { status: 500 }
    );
  }
}
