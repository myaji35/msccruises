import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 크루즈 항로 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const itineraries = await prisma.cruiseItinerary.findMany({
      where: { cruiseId: id },
      orderBy: [{ day: "asc" }, { order: "asc" }],
    });

    return NextResponse.json({ success: true, itineraries });
  } catch (error) {
    console.error("Error fetching cruise itineraries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch itineraries" },
      { status: 500 }
    );
  }
}

// POST: 크루즈 항로 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify cruise exists
    const cruise = await prisma.cruise.findUnique({
      where: { id },
    });

    if (!cruise) {
      return NextResponse.json(
        { success: false, error: "Cruise not found" },
        { status: 404 }
      );
    }

    const itinerary = await prisma.cruiseItinerary.create({
      data: {
        cruiseId: id,
        day: body.day,
        portType: body.portType,
        port: body.port,
        portCode: body.portCode,
        country: body.country,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        arrival: body.arrival,
        departure: body.departure,
        durationHours: body.durationHours ? parseInt(body.durationHours) : null,
        activities: body.activities,
        description: body.description,
        imageUrl: body.imageUrl,
        order: body.order || 0,
      },
    });

    return NextResponse.json({ success: true, itinerary }, { status: 201 });
  } catch (error) {
    console.error("Error creating cruise itinerary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create itinerary" },
      { status: 500 }
    );
  }
}

// PUT: 크루즈 항로 일괄 업데이트 (전체 항로를 한 번에 저장)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itineraries } = body;

    if (!Array.isArray(itineraries)) {
      return NextResponse.json(
        { success: false, error: "Invalid itineraries data" },
        { status: 400 }
      );
    }

    // Transaction으로 일괄 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 1. 기존 항로 모두 삭제
      await tx.cruiseItinerary.deleteMany({
        where: { cruiseId: id },
      });

      // 2. 새 항로 생성
      if (itineraries.length > 0) {
        await tx.cruiseItinerary.createMany({
          data: itineraries.map((item: any) => ({
            cruiseId: id,
            day: item.day,
            portType: item.portType,
            port: item.port,
            portCode: item.portCode,
            country: item.country,
            latitude: item.latitude ? parseFloat(item.latitude) : null,
            longitude: item.longitude ? parseFloat(item.longitude) : null,
            arrival: item.arrival,
            departure: item.departure,
            durationHours: item.durationHours
              ? parseInt(item.durationHours)
              : null,
            activities: item.activities,
            description: item.description,
            imageUrl: item.imageUrl,
            order: item.order || 0,
          })),
        });
      }

      // 3. 업데이트된 항로 조회
      return await tx.cruiseItinerary.findMany({
        where: { cruiseId: id },
        orderBy: [{ day: "asc" }, { order: "asc" }],
      });
    });

    return NextResponse.json({ success: true, itineraries: result });
  } catch (error) {
    console.error("Error updating cruise itineraries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update itineraries" },
      { status: 500 }
    );
  }
}

// DELETE: 크루즈 항로 전체 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.cruiseItinerary.deleteMany({
      where: { cruiseId: id },
    });

    return NextResponse.json({
      success: true,
      message: "All itineraries deleted",
    });
  } catch (error) {
    console.error("Error deleting cruise itineraries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete itineraries" },
      { status: 500 }
    );
  }
}
