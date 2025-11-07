import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentKey, amount } = await request.json();

    // Verify payment with Toss Payments API
    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.TOSS_SECRET_KEY}:`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          paymentKey,
          amount,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Payment verification failed" },
        { status: response.status }
      );
    }

    // TODO: Save payment data to database
    // TODO: Update booking status to "paid"
    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      payment: data,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
