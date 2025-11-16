import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/sns-auto-post-rules/[id] - Get single auto-post rule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rule = await prisma.snsAutoPostRule.findUnique({
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

    if (!rule) {
      return NextResponse.json(
        { error: 'Auto-post rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ rule });
  } catch (error: any) {
    console.error('[SNS Auto-Post Rule API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-post rule', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/sns-auto-post-rules/[id] - Update auto-post rule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      template,
      hashtagTemplate,
      postImmediately,
      scheduleDelayMinutes,
      isActive,
    } = body;

    // Check if rule exists
    const existing = await prisma.snsAutoPostRule.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Auto-post rule not found' },
        { status: 404 }
      );
    }

    // Update rule
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (template !== undefined) data.template = template;
    if (hashtagTemplate !== undefined) data.hashtagTemplate = hashtagTemplate;
    if (postImmediately !== undefined) data.postImmediately = postImmediately;
    if (scheduleDelayMinutes !== undefined) data.scheduleDelayMinutes = scheduleDelayMinutes;
    if (isActive !== undefined) data.isActive = isActive;

    const rule = await prisma.snsAutoPostRule.update({
      where: { id: params.id },
      data,
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

    return NextResponse.json({ rule });
  } catch (error: any) {
    console.error('[SNS Auto-Post Rule API Error]', error);
    return NextResponse.json(
      { error: 'Failed to update auto-post rule', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sns-auto-post-rules/[id] - Delete auto-post rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if rule exists
    const existing = await prisma.snsAutoPostRule.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Auto-post rule not found' },
        { status: 404 }
      );
    }

    // Delete rule
    await prisma.snsAutoPostRule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[SNS Auto-Post Rule API Error]', error);
    return NextResponse.json(
      { error: 'Failed to delete auto-post rule', message: error.message },
      { status: 500 }
    );
  }
}
