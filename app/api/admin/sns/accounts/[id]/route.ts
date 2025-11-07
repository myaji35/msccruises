import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE: Delete SNS account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.snsAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (error) {
    console.error("Error deleting SNS account:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
