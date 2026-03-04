import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../../../database/entities/auth/user-session.entity';
import { SecurityService } from '../../security/security.service';

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(UserSession)
        private readonly userSessionRepository: Repository<UserSession>,
        private readonly securityService: SecurityService,
    ) { }

    /**
     * Create a new tracking session for a user login
     */
    async createSession(
        userId: string,
        token: string,
        ipAddress: string = '0.0.0.0',
        deviceInfo: any = {},
        expiresIn: number = 24 * 60 * 60 * 1000 // default 24h ms
    ): Promise<UserSession> {
        const session = this.userSessionRepository.create({
            userId,
            sessionToken: token.substring(0, 500), // Securely stored partial token or hash
            ipAddress,
            deviceName: deviceInfo.device || 'Unknown',
            browser: deviceInfo.browser || 'Unknown',
            deviceType: deviceInfo.type || 'desktop',
            isTrusted: true,
            lastAccessedAt: new Date(),
            expiresAt: new Date(Date.now() + expiresIn),
        });

        const saved = await this.userSessionRepository.save(session);
        this.securityService.logSecurityEvent('SESSION_CREATED', userId, `Session established from ${ipAddress}`, { sessionId: saved.id }, 'LOW');
        return saved;
    }

    /**
     * Mark a session as revoked (logout)
     */
    async revokeSession(token: string, reason: string = 'User logout'): Promise<void> {
        const tokenPart = token.substring(0, 500);
        const session = await this.userSessionRepository.findOne({
            where: { sessionToken: tokenPart, revokedAt: null }
        });

        if (session) {
            session.revokedAt = new Date();
            session.revokedReason = reason;
            await this.userSessionRepository.save(session);
            this.securityService.logSecurityEvent('SESSION_REVOKED', session.userId, `Session revoked: ${reason}`, { sessionId: session.id }, 'LOW');
        }
    }

    /**
     * Update heartbeat for an active session
     */
    async updateActivity(token: string): Promise<void> {
        const tokenPart = token.substring(0, 500);
        try {
            await this.userSessionRepository.update(
                { sessionToken: tokenPart, revokedAt: null },
                { lastAccessedAt: new Date() }
            );
        } catch {
            // Silent fail for performance
        }
    }

    /**
     * Get all active sessions for a specific user
     */
    async getUserActiveSessions(userId: string): Promise<UserSession[]> {
        return this.userSessionRepository.find({
            where: {
                userId,
                revokedAt: null
            },
            order: { lastAccessedAt: 'DESC' }
        });
    }

    /**
     * Revoke all sessions for a user (e.g. on password change)
     */
    async revokeAllUserSessions(userId: string, reason: string): Promise<void> {
        await this.userSessionRepository.update(
            { userId, revokedAt: null },
            { revokedAt: new Date(), revokedReason: reason }
        );
        this.securityService.logSecurityEvent('MASS_SESSION_REVOCATION', userId, reason, {}, 'MEDIUM');
    }

    /**
     * Verify if a specific session is still active/valid
     */
    async isSessionValid(token: string): Promise<boolean> {
        const tokenPart = token.substring(0, 500);
        const session = await this.userSessionRepository.findOne({
            where: { sessionToken: tokenPart }
        });

        if (!session || session.revokedAt || (session.expiresAt && session.expiresAt < new Date())) {
            return false;
        }
        return true;
    }
}
