import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/services/payment.service';

/**
 * POST /api/v1/payments/:id/refund
 * Request refund for a payment
 */
export async function POST(
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

    const body = await req.json();
    const { amount, reason } = body;

    // Get payment details first to get bookingId
    const paymentResult = await paymentService.getPaymentById(params.id);

    if (!paymentResult.success || !paymentResult.metadata) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = paymentResult.metadata;

    // Validate amount if provided
    if (amount !== undefined) {
      if (amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Refund amount must be greater than 0' },
          { status: 400 }
        );
      }

      if (amount > payment.amount) {
        return NextResponse.json(
          { success: false, error: 'Refund amount cannot exceed payment amount' },
          { status: 400 }
        );
      }
    }

    // Process refund
    const result = await paymentService.refundPayment(
      payment.bookingId,
      amount // If undefined, will refund full amount
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: params.id,
        refundAmount: amount || payment.amount,
        message: 'Refund processed successfully',
      },
    });
  } catch (error: any) {
    console.error('Refund API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Refund request failed' },
      { status: 500 }
    );
  }
}
