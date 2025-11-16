import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/services/payment.service';

/**
 * POST /api/v1/payments
 * Initialize payment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { bookingId, amount, currency, paymentMethod, customerEmail, customerName } = body;

    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (paymentMethod !== 'tosspay' && paymentMethod !== 'stripe') {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method. Must be tosspay or stripe' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const result = await paymentService.initiatePayment({
      bookingId,
      amount,
      currency: currency || 'USD',
      paymentMethod,
      customerEmail: customerEmail || session.user.email || '',
      customerName: customerName || session.user.name || 'Customer',
      successUrl: `${baseUrl}/payment/success?bookingId=${bookingId}`,
      failUrl: `${baseUrl}/payment/fail?bookingId=${bookingId}`,
      metadata: {
        userId: session.user.id,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initiation failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/payments?bookingId=xxx
 * Get payment status
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

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Missing bookingId parameter' },
        { status: 400 }
      );
    }

    const result = await paymentService.getPaymentStatus(bookingId);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error: any) {
    console.error('Get payment status API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
