import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    private readonly logger = new Logger('Email');

    constructor(private readonly configService: ConfigService) { }

    /**
     * Send an email asynchronously.
     * Mock implementation for development; can be replaced with Nodemailer/SendGrid.
     */
    async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
        const isProd = this.configService.get('NODE_ENV') === 'production';

        if (!isProd) {
            this.logger.log(`[EMAIL-MOCK] To: ${to} | Subject: ${subject} | Content: ${content.substring(0, 100)}...`);
            return true;
        }

        // Producion logic would use nodemailer or a service API here
        this.logger.log(`[EMAIL-PROD] Simulated send to ${to}`);
        return true;
    }

    /**
     * Helper for sending MFA codes
     */
    async sendMfaCode(to: string, code: string): Promise<void> {
        await this.sendEmail(
            to,
            'Your Secure MFA Code',
            `Your verification code is: ${code}. It will expire in 5 minutes.`
        );
    }

    /**
     * Helper for security alerts
     */
    async sendSecurityAlert(to: string, event: string, details: string): Promise<void> {
        await this.sendEmail(
            to,
            `[ALERT] Security Event: ${event}`,
            `A security event occurred on your account: ${details}`
        );
    }
}