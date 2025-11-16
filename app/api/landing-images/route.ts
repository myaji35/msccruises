import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 활성화된 랜딩 이미지만 조회 (프론트엔드용)
export async function GET(request: NextRequest) {
  try {
    const images = await prisma.landingImage.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        url: true,
        alt: true,
        title: true,
        description: true,
        order: true
      }
    });

    return NextResponse.json({
      success: true,
      images
    });
  } catch (error: any) {
    console.error('Failed to fetch active landing images:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch landing images' },
      { status: 500 }
    );
  }
}
