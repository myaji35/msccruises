import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/services/payment.service';
import { emailService } from '@/services/email.service';

/**
 * POST /api/v1/payments/:id/receipt
 * Send payment receipt via email
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

    // Get payment details
    const paymentResult = await paymentService.getPaymentById(params.id);

    if (!paymentResult.success || !paymentResult.metadata) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = paymentResult.metadata;

    // Only send receipt for completed payments
    if (payment.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Receipt can only be sent for completed payments' },
        { status: 400 }
      );
    }

    // Get optional email from request body (to send to different address)
    const body = await req.json().catch(() => ({}));
    const recipientEmail = body.email || session.user.email;

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // Send receipt email
    const emailResult = await emailService.sendReceipt({
      paymentId: payment.id,
      orderId: payment.orderId || `ORDER-${payment.id.slice(0, 12)}`,
      bookingId: payment.bookingId,
      cruiseName: payment.cruiseName,
      shipName: payment.shipName,
      departureDate: payment.departureDate,
      returnDate: payment.returnDate,
      cabinCategory: payment.cabinCategory,
      numPassengers: payment.numPassengers,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paidAt: payment.completedAt || payment.createdAt,
      customerName: session.user.name || 'Valued Customer',
      customerEmail: recipientEmail,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to send receipt email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Receipt sent successfully',
        sentTo: recipientEmail,
      },
    });
  } catch (error: any) {
    console.error('Send receipt API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send receipt' },
      { status: 500 }
      );
  }
}
