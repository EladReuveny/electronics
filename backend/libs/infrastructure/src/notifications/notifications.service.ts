import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as Nodemailer from 'nodemailer';
import { User } from '../db/schema.types';
import { NOTIFICATION_CLIENT } from './notifications.constants';
import { JwtPayload } from '../../../../src/auth/types/auth.types';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_CLIENT)
    private readonly transport: Nodemailer.Transporter,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async sendWelcomeEmail(email: string) {
    await this.transport.sendMail({
      from: {
        address: this.configService.getOrThrow<string>('SMTP_FROM'),
        name: this.configService.getOrThrow<string>('SMTP_FROM_NAME'),
      },
      to: email,
      subject: 'Welcome to Electronics 🎉',
      html: `
        <div>
          <h1>Welcome to Electronics</h1>
          <p>Thank you for signing up with Electronics. We're excited to have you join our platform.</p>
          <p>Best regards,<br>The Electronics Team</p>
        </div>
      `,
    });
  }

  async sendOrderConfirmationEmail(email: string, orderId: string) {
    const viewOrderUrl = `${this.configService.getOrThrow<string>('FRONTEND_URL')}/orders/${orderId}`;

    await this.transport.sendMail({
      from: {
        address: this.configService.getOrThrow<string>('SMTP_FROM'),
        name: this.configService.getOrThrow<string>('SMTP_FROM_NAME'),
      },
      to: email,
      subject: 'Order Confirmation 🎉',
      html: `
        <div>
          <h1>Order Confirmation</h1>
          <p>Thank you for your order. Your order has been confirmed.</p>
          <p>Order ID: ${orderId}</p>
          <p>View your order details here: <a href="${viewOrderUrl}">View Order</a></p>
          <p>Best regards,<br>The Electronics Team</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(user: User) {
    const systemSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    const dynamicSecret = `${systemSecret}-${user.password}`;

    const token = this.jwtService.sign<JwtPayload & { action: string }>(
      { sub: user.id, role: user.role, action: 'reset-password' },
      { expiresIn: '15m', secret: dynamicSecret },
    );

    const resetUrl = `${this.configService.getOrThrow<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    await this.transport.sendMail({
      from: {
        address: this.configService.getOrThrow<string>('SMTP_FROM'),
        name: this.configService.getOrThrow<string>('SMTP_FROM_NAME'),
      },
      to: user.email,
      subject: 'Password Reset 🔑',
      html: `
        <div>
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>*** This link will expire in 15 minutes. ***</p>
        </div>
      `,
    });
  }
}
