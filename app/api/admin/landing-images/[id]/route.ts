import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - 랜딩 이미지 수정 (순서, 활성화 상태, alt, title, description)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { order, isActive, alt, title, description } = body;

    // 이미지 존재 확인
    const existingImage = await prisma.landingImage.findUnique({
      where: { id }
    });

    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (alt !== undefined) updateData.alt = alt;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const updatedImage = await prisma.landingImage.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      image: updatedImage
    });
  } catch (error: any) {
    console.error('Failed to update landing image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update landing image' },
      { status: 500 }
    );
  }
}

// DELETE - 랜딩 이미지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 이미지 존재 확인
    const existingImage = await prisma.landingImage.findUnique({
      where: { id }
    });

    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    await prisma.landingImage.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error: any) {
    console.error('Failed to delete landing image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete landing image' },
      { status: 500 }
    );
  }
}
