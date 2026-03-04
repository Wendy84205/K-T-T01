import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from './audit.service';

@Injectable()
export class AnomalyDetectionService {
    private readonly logger = new Logger('AnomalyDetection');

    constructor(private readonly auditService: AuditService) { }

    /**
     * Analyze login patterns for a user to detect suspicious activity
     */
    async analyzeLoginPatterns(userId: string): Promise<{ suspicious: boolean; reason?: string }> {
        const recentLogs = await this.auditService.getUserLogs(userId, 50);
        const logins = recentLogs.filter(log => log.eventType === 'LOGIN_SUCCESS' || log.eventType === 'LOGIN_FAILURE');

        if (logins.length < 5) return { suspicious: false };

        // 1. Detect multiple failures followed by a success (Brute force sign)
        let failuresBeforeSuccess = 0;
        for (const log of logins) {
            if (log.eventType === 'LOGIN_FAILURE') {
                failuresBeforeSuccess++;
            } else if (log.eventType === 'LOGIN_SUCCESS') {
                if (failuresBeforeSuccess >= 3) {
                    return { suspicious: true, reason: 'Multiple failed logins followed by success (Potential brute force)' };
                }
                failuresBeforeSuccess = 0;
            }
        }

        // 2. Detect logins from different IP addresses in short time
        const distinctIps = new Set(logins.map(l => l.ipAddress));
        if (distinctIps.size > 3) {
            return { suspicious: true, reason: 'Logins from multiple distinct IP addresses recently' };
        }

        return { suspicious: false };
    }

    /**
     * Detect mass file access (potential data exfiltration)
     */
    async detectMassFileAccess(userId: string): Promise<boolean> {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const logs = await this.auditService.getUserLogs(userId, 100);

        const recentDownloads = logs.filter(log =>
            log.eventType === 'FILE_DOWNLOAD' &&
            new Date(log.createdAt) > oneHourAgo
        );

        if (recentDownloads.length > 50) {
            this.logger.warn(`Massive file access detected for user ${userId}: ${recentDownloads.length} downloads in 1 hour`);
            return true;
        }

        return false;
    }
}
