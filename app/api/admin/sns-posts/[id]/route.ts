import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/sns-posts/[id] - Get single SNS post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.snsPost.findUnique({
      where: { id: params.id },
      include: {
        snsAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
            accountId: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'SNS post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      post: {
        ...post,
        mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      },
    });
  } catch (error: any) {
    console.error('[SNS Post API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch SNS post', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sns-posts/[id] - Delete/cancel SNS post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if post exists
    const existing = await prisma.snsPost.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'SNS post not found' },
        { status: 404 }
      );
    }

    // Check if post was already posted
    if (existing.status === 'posted') {
      return NextResponse.json(
        {
          error: 'Cannot delete already posted content',
          message: 'This post has already been published to the platform',
        },
        { status: 400 }
      );
    }

    // Delete post
    await prisma.snsPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[SNS Post API Error]', error);
    return NextResponse.json(
      { error: 'Failed to delete SNS post', message: error.message },
      { status: 500 }
    );
  }
}
