import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postToSns } from '@/services/sns-posting.service';

// GET /api/admin/sns-posts - Get all SNS posts with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    const snsAccountId = searchParams.get('snsAccountId');
    const limit = searchParams.get('limit');

    const where: any = {};
    if (platform) where.platform = platform;
    if (status) where.status = status;
    if (contentType) where.contentType = contentType;
    if (snsAccountId) where.snsAccountId = snsAccountId;

    const posts = await prisma.snsPost.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    });

    // Parse JSON fields
    const postsWithParsedFields = posts.map((post) => ({
      ...post,
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
    }));

    return NextResponse.json({ posts: postsWithParsedFields });
  } catch (error: any) {
    console.error('[SNS Posts API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch SNS posts', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/sns-posts - Create and post to SNS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contentType,
      contentId,
      snsAccountId,
      content,
      mediaUrls,
      hashtags,
      scheduledAt,
      createdBy,
    } = body;

    // Validation
    if (!contentType || !snsAccountId || !content || !createdBy) {
      return NextResponse.json(
        { error: 'contentType, snsAccountId, content, and createdBy are required' },
        { status: 400 }
      );
    }

    // Verify SNS account exists
    const account = await prisma.snsAccount.findUnique({
      where: { id: snsAccountId },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'SNS account not found' },
        { status: 404 }
      );
    }

    if (!account.isActive) {
      return NextResponse.json(
        { error: 'SNS account is inactive' },
        { status: 400 }
      );
    }

    // Post to SNS using service
    const { postId, result } = await postToSns({
      contentType,
      contentId,
      snsAccountId,
      content,
      mediaUrls,
      hashtags,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdBy,
    });

    // Get created post with relations
    const post = await prisma.snsPost.findUnique({
      where: { id: postId },
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

    return NextResponse.json({
      post: {
        ...post,
        mediaUrls: post?.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      },
      result,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[SNS Posts API Error]', error);
    return NextResponse.json(
      { error: 'Failed to create SNS post', message: error.message },
      { status: 500 }
    );
  }
}
