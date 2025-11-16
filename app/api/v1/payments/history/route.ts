import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/services/payment.service';

/**
 * GET /api/v1/payments/history
 * Get payment history for current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await paymentService.getPaymentHistory(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.metadata?.payments || [],
    });
  } catch (error: any) {
    console.error('Payment history API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve payment history' },
      { status: 500 }
    );
  }
}
