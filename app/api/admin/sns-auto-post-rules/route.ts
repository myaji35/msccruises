import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/sns-auto-post-rules - Get all auto-post rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const snsAccountId = searchParams.get('snsAccountId');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (contentType) where.contentType = contentType;
    if (snsAccountId) where.snsAccountId = snsAccountId;
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const rules = await prisma.snsAutoPostRule.findMany({
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
    });

    return NextResponse.json({ rules });
  } catch (error: any) {
    console.error('[SNS Auto-Post Rules API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-post rules', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/sns-auto-post-rules - Create new auto-post rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      contentType,
      snsAccountId,
      template,
      hashtagTemplate,
      postImmediately,
      scheduleDelayMinutes,
      isActive,
      createdBy,
    } = body;

    // Validation
    if (!name || !contentType || !snsAccountId || !template) {
      return NextResponse.json(
        { error: 'name, contentType, snsAccountId, and template are required' },
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

    // Create rule
    const rule = await prisma.snsAutoPostRule.create({
      data: {
        name,
        description,
        contentType,
        snsAccountId,
        template,
        hashtagTemplate,
        postImmediately: postImmediately ?? false,
        scheduleDelayMinutes,
        isActive: isActive ?? true,
        createdBy,
      },
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

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error: any) {
    console.error('[SNS Auto-Post Rules API Error]', error);
    return NextResponse.json(
      { error: 'Failed to create auto-post rule', message: error.message },
      { status: 500 }
    );
  }
}
