import { User } from '../core/user.entity';
export declare class FailedLoginAttempt {
    id: string;
    userId: string;
    username: string;
    ipAddress: string;
    userAgent: string;
    attemptTime: Date;
    isSuccessful: boolean;
    isSuspicious: boolean;
    suspiciousReason: string;
    blockedUntil: Date;
    createdAt: Date;
    user: User;
}
