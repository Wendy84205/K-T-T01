import { Injectable, Logger } from '@nestjs/common';
import { SecurityUtils } from '../../utils/security.utils';

@Injectable()
export class ThreatDetectionService {
    private readonly logger = new Logger('ThreatDetection');

    /**
     * Detect common web threats in a request payload
     */
    detectThreats(payload: any): { detected: boolean; type?: string; details?: string } {
        if (!payload || typeof payload !== 'object') return { detected: false };

        for (const key of Object.keys(payload)) {
            const value = payload[key];
            if (typeof value === 'string') {
                // 1. Check for SQL Injection
                if (SecurityUtils.detectSQLInjection(value)) {
                    return { detected: true, type: 'SQL_INJECTION', details: `Pattern in field: ${key}` };
                }

                // 2. Check for XSS
                if (/<script\b[^>]*>|javascript:|onclick=|onerror=/i.test(value)) {
                    return { detected: true, type: 'XSS_ATTEMPT', details: `Script pattern in field: ${key}` };
                }

                // 3. Check for Path Traversal
                if (/\.\.\/|\.\.\\/.test(value)) {
                    return { detected: true, type: 'PATH_TRAVERSAL', details: `Traversal pattern in field: ${key}` };
                }
            }
        }

        return { detected: false };
    }

    /**
     * Detect session hijacking by comparing current against original info
     */
    detectSessionHijacking(currentIp: string, originalIp: string, currentUA: string, originalUA: string): boolean {
        // If both IP and User Agent changed, it's highly suspicious
        if (currentIp !== originalIp && currentUA !== originalUA) {
            this.logger.warn(`Potential session hijacking detected. IP: ${currentIp}, UA: ${currentUA}`);
            return true;
        }
        return false;
    }
}
