import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryption } from '@/lib/encryption';

// GET /api/admin/sns-accounts - Get all SNS accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (platform) {
      where.platform = platform;
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const accounts = await prisma.snsAccount.findMany({
      where,
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
      orderBy: [
        { platform: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Security: Mask tokens in response
    const maskedAccounts = accounts.map(account => ({
      ...account,
      accessToken: account.accessToken ? encryption.maskSensitiveData(account.accessToken) : null,
      refreshToken: account.refreshToken ? encryption.maskSensitiveData(account.refreshToken) : null,
    }));

    return NextResponse.json({ accounts: maskedAccounts });
  } catch (error: any) {
    console.error('[SNS Accounts API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch SNS accounts', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/sns-accounts - Create new SNS account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      platform,
      accountName,
      accountId,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      isActive,
    } = body;

    // Validation
    if (!userId || !platform || !accountId) {
      return NextResponse.json(
        { error: 'userId, platform, and accountId are required' },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existing = await prisma.snsAccount.findUnique({
      where: {
        userId_platform_accountId: {
          userId,
          platform,
          accountId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'SNS account with this combination already exists' },
        { status: 400 }
      );
    }

    // Security: Encrypt tokens before storing
    const encryptedAccessToken = accessToken ? encryption.encrypt(accessToken) : null;
    const encryptedRefreshToken = refreshToken ? encryption.encrypt(refreshToken) : null;

    console.log('[Security] Encrypting SNS tokens before storage');

    // Create account
    const account = await prisma.snsAccount.create({
      data: {
        userId,
        platform,
        accountName,
        accountId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
        isActive: isActive ?? true,
      },
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

    // Security: Mask tokens in response
    const maskedAccount = {
      ...account,
      accessToken: account.accessToken ? encryption.maskSensitiveData(account.accessToken) : null,
      refreshToken: account.refreshToken ? encryption.maskSensitiveData(account.refreshToken) : null,
    };

    return NextResponse.json({ account: maskedAccount }, { status: 201 });
  } catch (error: any) {
    console.error('[SNS Accounts API Error]', error);
    return NextResponse.json(
      { error: 'Failed to create SNS account', message: error.message },
      { status: 500 }
    );
  }
}
