import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoPostContent } from "@/services/sns-posting.service";

export async function GET(request: NextRequest) {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ destinations });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch destinations", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, nameEn, region, description, imageUrl, order, isActive, createdBy } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.destination.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Destination with this code already exists" },
        { status: 400 }
      );
    }

    const destination = await prisma.destination.create({
      data: {
        code,
        name,
        nameEn,
        region,
        description,
        imageUrl,
        order: order || 0,
        isActive: isActive ?? true,
      },
    });

    // Auto-post to SNS
    const tempUserId = createdBy || 'system';
    const { postIds, errors } = await autoPostContent(
      'destination',
      destination.id,
      tempUserId
    );

    if (errors.length > 0) {
      console.warn('[Destination Created] SNS auto-post errors:', errors);
    }

    return NextResponse.json({
      destination,
      snsPostsCreated: postIds.length,
      snsErrors: errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create destination", message: error.message },
      { status: 500 }
    );
  }
}
