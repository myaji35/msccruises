import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cruise-extras/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const extra = await prisma.cruiseExtra.findUnique({
      where: { id: params.id },
    });

    if (!extra) {
      return NextResponse.json(
        { error: "Cruise extra not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      extra: {
        ...extra,
        features: extra.features ? JSON.parse(extra.features) : [],
      },
    });
  } catch (error: any) {
    console.error("[Admin Cruise Extra Get Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch cruise extra", message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cruise-extras/[id]
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
      price,
      currency,
      category,
      features,
      imageUrl,
      maxPerBooking,
      order,
      isActive,
    } = body;

    const existing = await prisma.cruiseExtra.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cruise extra not found" },
        { status: 404 }
      );
    }

    if (code && code !== existing.code) {
      const codeExists = await prisma.cruiseExtra.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Cruise extra with this code already exists" },
          { status: 400 }
        );
      }
    }

    const extra = await prisma.cruiseExtra.update({
      where: { id: params.id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(currency !== undefined && { currency }),
        ...(category && { category }),
        ...(features !== undefined && {
          features: features ? JSON.stringify(features) : null,
        }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(maxPerBooking !== undefined && { maxPerBooking }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      extra: {
        ...extra,
        features: extra.features ? JSON.parse(extra.features) : [],
      },
    });
  } catch (error: any) {
    console.error("[Admin Cruise Extra Update Error]", error);
    return NextResponse.json(
      { error: "Failed to update cruise extra", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cruise-extras/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.cruiseExtra.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cruise extra not found" },
        { status: 404 }
      );
    }

    await prisma.cruiseExtra.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Cruise Extra Delete Error]", error);
    return NextResponse.json(
      { error: "Failed to delete cruise extra", message: error.message },
      { status: 500 }
    );
  }
}
