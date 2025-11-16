import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';

/**
 * POST /api/v1/payments/tosspay/confirm
 * Confirm TossPay payment after user approval
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: paymentKey, orderId, amount' },
        { status: 400 }
      );
    }

    const result = await paymentService.confirmTossPayment({
      paymentKey,
      orderId,
      amount,
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
    console.error('TossPay confirm API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'TossPay confirmation failed' },
      { status: 500 }
    );
  }
}
