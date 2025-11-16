import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 모든 랜딩 이미지 조회
export async function GET(request: NextRequest) {
  try {
    const images = await prisma.landingImage.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      images,
      total: images.length
    });
  } catch (error: any) {
    console.error('Failed to fetch landing images:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch landing images' },
      { status: 500 }
    );
  }
}

// POST - 새 랜딩 이미지 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, filename, alt, title, description } = body;

    if (!url || !filename) {
      return NextResponse.json(
        { success: false, error: 'URL and filename are required' },
        { status: 400 }
      );
    }

    // 현재 최대 order 값을 찾아서 +1
    const maxOrderImage = await prisma.landingImage.findFirst({
      orderBy: { order: 'desc' }
    });

    const newOrder = maxOrderImage ? maxOrderImage.order + 1 : 0;

    const image = await prisma.landingImage.create({
      data: {
        url,
        filename,
        alt: alt || '',
        title: title || null,
        description: description || null,
        order: newOrder,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      image
    });
  } catch (error: any) {
    console.error('Failed to create landing image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create landing image' },
      { status: 500 }
    );
  }
}
