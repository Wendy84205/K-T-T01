import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    try {
      // For development, we auto-create an Ethereal test account.
      // In production, you would configure SMTP directly from ConfigService.
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      
      this.logger.log(`MailService initialized with Ethereal Email (User: ${testAccount.user})`);
    } catch (error) {
      this.logger.error('Failed to initialize MailService transporter', error);
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    if (!this.transporter) {
      this.logger.error('Transporter not initialized, email not sent');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: '"CyberSecure System" <noreply@ktt01-cybersecure.local>',
        to,
        subject: 'KTT01 - Password Reset Request',
        text: `You requested a password reset. Please click the following link to reset your password: ${resetLink}\n\nThis link will expire in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #334155; border-radius: 12px; background-color: #0f172a; color: #f8fafc;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #818cf8; margin: 0; font-style: italic;">KTT01</h1>
              <p style="color: #64748b; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">CyberSecure Enterprise Platform</p>
            </div>
            
            <h2 style="color: #fff; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #cbd5e1; line-height: 1.6;">We received a request to reset the password for your account (<strong>${to}</strong>).</p>
            <p style="color: #cbd5e1; line-height: 1.6;">Please click the secure button below to establish a new password. This link is only valid for <strong>15 minutes</strong>.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; display: inline-block;">
                RESET PASSWORD
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 40px; border-top: 1px solid #334155; padding-top: 20px;">
              If you didn't request this action, please ignore this email or contact the administrator immediately. Your password will remain unchanged until you create a new one using the link above.
            </p>
          </div>
        `,
      });

      this.logger.log(`Password reset email sent to ${to}`);
      this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`); // Essential for dev
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw new Error('Email sending failed');
    }
  }
}
