import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    // For development, we'll use a test account or console logging
    // In production, configure with actual SMTP credentials
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // If no SMTP credentials, log to console instead
    if (!process.env.SMTP_USER) {
      console.log('📧 Email service running in console mode (no SMTP configured)');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"E-Commerce Support" <noreply@ecommerce.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    try {
      if (!process.env.SMTP_USER) {
        // Development mode - log to console
        console.log('\n📧 ========== EMAIL WOULD BE SENT ==========');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Content:');
        console.log(mailOptions.text || mailOptions.html);
        console.log('==========================================\n');
      } else {
        // Production mode - actually send email
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // In production, you might want to throw this error or log to a monitoring service
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/reset-password?token=${resetToken}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; background-color: #3B82F6;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Password Reset Request</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                Hello,
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                We received a request to reset your password for your account. If you didn't make this request, you can safely ignore this email.
                            </p>
                            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                To reset your password, click the button below:
                            </p>

                            <!-- Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 4px; background-color: #3B82F6;">
                                        <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 20px 0; font-size: 14px; line-height: 20px; color: #666666;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #3B82F6; word-break: break-all;">
                                ${resetUrl}
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #666666;">
                                This link will expire in 1 hour for security reasons.
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #666666;">
                                If you didn't request a password reset, please contact our support team immediately.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999;">
                                This is an automated message, please do not reply to this email.
                            </p>
                            <p style="margin: 10px 0 0 0; font-size: 12px; line-height: 18px; color: #999999;">
                                © 2025 E-Commerce Platform. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const text = `
Password Reset Request

Hello,

We received a request to reset your password for your account.

To reset your password, please visit the following link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email or contact our support team.

Best regards,
E-Commerce Platform Team
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request - E-Commerce Platform',
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to E-Commerce</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; background-color: #3B82F6;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome to E-Commerce!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                Hi ${name},
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                Thank you for registering with our E-Commerce Platform! We're excited to have you on board.
                            </p>
                            <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">
                                Start exploring our products and enjoy shopping!
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                © 2025 E-Commerce Platform. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to E-Commerce Platform!',
      html,
      text: `Hi ${name},\n\nThank you for registering with our E-Commerce Platform!\n\nBest regards,\nE-Commerce Team`,
    });
  }

  async sendOrderConfirmationEmail(email: string, name: string, orderNumber: string, total: number): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; background-color: #10B981;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Order Confirmed!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                Hi ${name},
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                Thank you for your order! We've received your order and it's being processed.
                            </p>
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Order Number:</p>
                                <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: #333333;">${orderNumber}</p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Total Amount:</p>
                                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #10B981;">$${total.toFixed(2)}</p>
                            </div>
                            <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">
                                We'll send you another email when your order has been shipped.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                © 2025 E-Commerce Platform. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Order Confirmation - #${orderNumber}`,
      html,
      text: `Hi ${name},\n\nThank you for your order!\n\nOrder Number: ${orderNumber}\nTotal: $${total.toFixed(2)}\n\nWe'll send you another email when your order has been shipped.\n\nBest regards,\nE-Commerce Team`,
    });
  }

  async sendOrderStatusUpdateEmail(email: string, name: string, orderNumber: string, status: string): Promise<void> {
    const statusConfig = {
      processing: {
        color: '#3B82F6',
        title: 'Order is Being Processed',
        message: 'Great news! Your order is now being processed and will be shipped soon.',
      },
      shipped: {
        color: '#8B5CF6',
        title: 'Order Shipped!',
        message: 'Your order has been shipped and is on its way to you. You should receive it within 3-5 business days.',
      },
      delivered: {
        color: '#10B981',
        title: 'Order Delivered!',
        message: 'Your order has been successfully delivered. We hope you enjoy your purchase!',
      },
      cancelled: {
        color: '#EF4444',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
      },
    };

    const config = statusConfig[status] || statusConfig.processing;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; background-color: ${config.color};">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">${config.title}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                Hi ${name},
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                                ${config.message}
                            </p>
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Order Number:</p>
                                <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: #333333;">${orderNumber}</p>
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Status:</p>
                                <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${config.color}; text-transform: uppercase;">${status}</p>
                            </div>
                            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #666666;">
                                If you have any questions about your order, please don't hesitate to contact our support team.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                © 2025 E-Commerce Platform. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Order Update - #${orderNumber} - ${status.toUpperCase()}`,
      html,
      text: `Hi ${name},\n\n${config.message}\n\nOrder Number: ${orderNumber}\nStatus: ${status.toUpperCase()}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nE-Commerce Team`,
    });
  }
}
