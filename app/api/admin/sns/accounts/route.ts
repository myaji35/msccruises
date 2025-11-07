import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List SNS accounts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.snsAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error("Error fetching SNS accounts:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

// POST: Create SNS account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { platform, accountId, accessToken, isActive } = body;

    const account = await prisma.snsAccount.create({
      data: {
        userId: session.user.id,
        platform,
        accountId,
        accessToken, // In production, encrypt this!
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, account }, { status: 201 });
  } catch (error) {
    console.error("Error creating SNS account:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
