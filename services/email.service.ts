/**
 * Email Service
 *
 * Handles email sending for receipts, confirmations, and notifications
 */

import nodemailer from 'nodemailer';

interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface ReceiptData {
  paymentId: string;
  orderId: string;
  bookingId: string;
  cruiseName: string;
  shipName: string;
  departureDate: string;
  returnDate: string;
  cabinCategory: string;
  numPassengers: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  paidAt: string;
  customerName: string;
  customerEmail: string;
}

class EmailService {
  private transporter: any;

  constructor() {
    // Configure email transporter
    // In production, use a proper SMTP service like SendGrid, AWS SES, or Mailgun
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send generic email
   */
  async sendEmail(config: EmailConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn('SMTP credentials not configured. Email not sent.');
        return {
          success: false,
          error: 'Email service not configured',
        };
      }

      await this.transporter.sendMail({
        from: config.from || process.env.SMTP_FROM || 'noreply@msccruises.com',
        to: config.to,
        subject: config.subject,
        html: config.html,
        text: config.text,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send payment receipt email
   */
  async sendReceipt(data: ReceiptData): Promise<{ success: boolean; error?: string }> {
    try {
      const html = this.generateReceiptHTML(data);
      const text = this.generateReceiptText(data);

      return await this.sendEmail({
        from: 'MSC Cruises <noreply@msccruises.com>',
        to: data.customerEmail,
        subject: `Payment Receipt - MSC Cruises (Order #${data.orderId})`,
        html,
        text,
      });
    } catch (error: any) {
      console.error('Send receipt error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send receipt',
      };
    }
  }

  /**
   * Generate receipt HTML
   */
  private generateReceiptHTML(data: ReceiptData): string {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatCurrency = (amount: number, currency: string) => {
      return `$${amount.toLocaleString()} ${currency}`;
    };

    const getCabinLabel = (category: string) => {
      const labels: Record<string, string> = {
        inside: 'Inside Cabin',
        oceanview: 'Ocean View',
        balcony: 'Balcony',
        suite: 'Suite',
      };
      return labels[category] || category;
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">MSC Cruises</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Payment Receipt</p>
  </div>

  <!-- Main Content -->
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <!-- Success Message -->
    <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
      <h2 style="color: #065f46; margin: 0 0 10px 0; font-size: 24px;">Payment Successful</h2>
      <p style="color: #047857; margin: 0; font-size: 14px;">Thank you for your payment!</p>
    </div>

    <!-- Payment Details -->
    <div style="margin-bottom: 30px;">
      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Payment Details</h3>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Order Number</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Payment ID</td>
          <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 12px;">${data.paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Payment Method</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${data.paymentMethod === 'tosspay' ? 'TossPay' : 'Stripe'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Payment Date</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${formatDate(data.paidAt)}</td>
        </tr>
      </table>
    </div>

    <!-- Cruise Details -->
    <div style="margin-bottom: 30px;">
      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Cruise Details</h3>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Cruise</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${data.cruiseName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Ship</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${data.shipName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Departure</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${formatDate(data.departureDate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Return</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${formatDate(data.returnDate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Cabin Category</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${getCabinLabel(data.cabinCategory)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Passengers</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px;">${data.numPassengers}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Booking ID</td>
          <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 12px;">${data.bookingId}</td>
        </tr>
      </table>
    </div>

    <!-- Total Amount -->
    <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
      <table style="width: 100%;">
        <tr>
          <td style="font-size: 18px; font-weight: 600; color: #1f2937;">Total Amount Paid</td>
          <td style="font-size: 28px; font-weight: bold; color: #2563eb; text-align: right;">${formatCurrency(data.amount, data.currency)}</td>
        </tr>
      </table>
    </div>

    <!-- Customer Info -->
    <div style="margin-bottom: 30px;">
      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Customer Information</h3>

      <p style="margin: 5px 0; color: #4b5563; font-size: 14px;">
        <strong>Name:</strong> ${data.customerName}
      </p>
      <p style="margin: 5px 0; color: #4b5563; font-size: 14px;">
        <strong>Email:</strong> ${data.customerEmail}
      </p>
    </div>

    <!-- Footer Note -->
    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
        <strong>Important:</strong> Please save this receipt for your records. You will need your booking ID for check-in and any future inquiries.
      </p>
    </div>

    <!-- Contact -->
    <div style="text-align: center; color: #6b7280; font-size: 13px;">
      <p style="margin: 5px 0;">Questions? Contact us at <a href="mailto:support@msccruises.com" style="color: #2563eb; text-decoration: none;">support@msccruises.com</a></p>
      <p style="margin: 5px 0;">Or call: 1-800-MSC-CRUISE</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="margin: 0; color: #6b7280; font-size: 12px;">
      © ${new Date().getFullYear()} MSC Cruises. All rights reserved.
    </p>
    <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
      This is an automated email. Please do not reply to this message.
    </p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate receipt plain text
   */
  private generateReceiptText(data: ReceiptData): string {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return `
MSC CRUISES - PAYMENT RECEIPT
================================

Payment Successful!
Thank you for your payment.

PAYMENT DETAILS
--------------------------------
Order Number: ${data.orderId}
Payment ID: ${data.paymentId}
Payment Method: ${data.paymentMethod === 'tosspay' ? 'TossPay' : 'Stripe'}
Payment Date: ${formatDate(data.paidAt)}

CRUISE DETAILS
--------------------------------
Cruise: ${data.cruiseName}
Ship: ${data.shipName}
Departure: ${formatDate(data.departureDate)}
Return: ${formatDate(data.returnDate)}
Cabin: ${data.cabinCategory}
Passengers: ${data.numPassengers}
Booking ID: ${data.bookingId}

AMOUNT PAID
--------------------------------
Total: $${data.amount.toLocaleString()} ${data.currency}

CUSTOMER INFORMATION
--------------------------------
Name: ${data.customerName}
Email: ${data.customerEmail}

================================

Important: Please save this receipt for your records.
You will need your booking ID for check-in.

Questions? Contact us:
Email: support@msccruises.com
Phone: 1-800-MSC-CRUISE

© ${new Date().getFullYear()} MSC Cruises. All rights reserved.
    `;
  }
}

export const emailService = new EmailService();
