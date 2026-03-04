import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Basic HSTS (Force HTTPS)
        res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');

        // Prevent MIME sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // XSS Protection for older browsers
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Frameguard (Prevent Clickjacking) - denying embedding in frames
        res.setHeader('X-Frame-Options', 'DENY');

        // Referer Policy
        res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

        // Permissions Policy (formerly Feature-Policy)
        res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

        // Disable server header
        res.removeHeader('X-Powered-By');

        next();
    }
}
