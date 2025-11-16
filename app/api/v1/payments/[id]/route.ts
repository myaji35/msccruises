import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/services/payment.service';

/**
 * GET /api/v1/payments/:id
 * Get payment details by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await paymentService.getPaymentById(params.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Payment not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.metadata,
    });
  } catch (error: any) {
    console.error('Get payment API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve payment' },
      { status: 500 }
    );
  }
}
