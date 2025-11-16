import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/sns-accounts/[id] - Get single SNS account
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const account = await prisma.snsAccount.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            posts: true,
            autoPostRules: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'SNS account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error: any) {
    console.error('[SNS Account API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch SNS account', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/sns-accounts/[id] - Update SNS account
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      accountName,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      isActive,
    } = body;

    // Check if account exists
    const existing = await prisma.snsAccount.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'SNS account not found' },
        { status: 404 }
      );
    }

    // Update account
    const data: any = {};
    if (accountName !== undefined) data.accountName = accountName;
    if (accessToken !== undefined) data.accessToken = accessToken;
    if (refreshToken !== undefined) data.refreshToken = refreshToken;
    if (tokenExpiresAt !== undefined) {
      data.tokenExpiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : null;
    }
    if (isActive !== undefined) data.isActive = isActive;

    const account = await prisma.snsAccount.update({
      where: { id: params.id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ account });
  } catch (error: any) {
    console.error('[SNS Account API Error]', error);
    return NextResponse.json(
      { error: 'Failed to update SNS account', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sns-accounts/[id] - Delete SNS account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if account exists
    const existing = await prisma.snsAccount.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            posts: true,
            autoPostRules: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'SNS account not found' },
        { status: 404 }
      );
    }

    // Check if account has posts or rules
    if (existing._count.posts > 0 || existing._count.autoPostRules > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete SNS account with existing posts or auto-post rules',
          message: `This account has ${existing._count.posts} posts and ${existing._count.autoPostRules} auto-post rules`,
        },
        { status: 400 }
      );
    }

    // Delete account
    await prisma.snsAccount.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[SNS Account API Error]', error);
    return NextResponse.json(
      { error: 'Failed to delete SNS account', message: error.message },
      { status: 500 }
    );
  }
}
