import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cabin-categories/[id] - Get single cabin category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.cabinCategory.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Cabin category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: {
        ...category,
        features: category.features ? JSON.parse(category.features) : [],
      },
    });
  } catch (error: any) {
    console.error("[Admin Cabin Category Get Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch cabin category", message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cabin-categories/[id] - Update cabin category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if category exists
    const existing = await prisma.cabinCategory.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cabin category not found" },
        { status: 404 }
      );
    }

    // If code is being changed, check if new code already exists
    if (code && code !== existing.code) {
      const codeExists = await prisma.cabinCategory.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Cabin category with this code already exists" },
          { status: 400 }
        );
      }
    }

    // Update category
    const category = await prisma.cabinCategory.update({
      where: { id: params.id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && {
          features: features ? JSON.stringify(features) : null,
        }),
        ...(priceMultiplier !== undefined && { priceMultiplier }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      category: {
        ...category,
        features: category.features ? JSON.parse(category.features) : [],
      },
    });
  } catch (error: any) {
    console.error("[Admin Cabin Category Update Error]", error);
    return NextResponse.json(
      { error: "Failed to update cabin category", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cabin-categories/[id] - Delete cabin category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category exists
    const existing = await prisma.cabinCategory.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cabin category not found" },
        { status: 404 }
      );
    }

    // Delete category
    await prisma.cabinCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Cabin Category Delete Error]", error);
    return NextResponse.json(
      { error: "Failed to delete cabin category", message: error.message },
      { status: 500 }
    );
  }
}
