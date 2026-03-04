import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class DeviceFingerprintMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = req.ip || '0.0.0.0';
        const acceptLanguage = req.headers['accept-language'] || '';

        // Simple fingerprint based on client info
        const data = `${userAgent}|${ip}|${acceptLanguage}`;
        const fingerprint = crypto.createHash('sha256').update(data).digest('hex');

        // Attach to request
        (req as any).fingerprint = fingerprint;
        (req as any).deviceInfo = {
            userAgent,
            ip,
            fingerprint,
            platform: userAgent.includes('Windows') ? 'Windows' :
                userAgent.includes('Mac') ? 'Mac' :
                    userAgent.includes('Linux') ? 'Linux' :
                        userAgent.includes('Android') ? 'Android' :
                            userAgent.includes('iPhone') ? 'iOS' : 'Unknown',
        };

        next();
    }
}
