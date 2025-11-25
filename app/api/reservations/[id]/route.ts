import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Get single reservation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Parse participants JSON
    const parsedReservation = {
      ...reservation,
      participants: JSON.parse(reservation.participants),
    };

    return NextResponse.json({
      success: true,
      reservation: parsedReservation,
    });
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

// PATCH: Update reservation status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes, processedBy } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === "confirmed") {
        updateData.processedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (processedBy) {
      updateData.processedBy = processedBy;
    }

    const reservation = await prisma.reservation.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      reservation,
      message: "Reservation updated successfully",
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

// DELETE: Delete reservation (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.reservation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete reservation" },
      { status: 500 }
    );
  }
}
