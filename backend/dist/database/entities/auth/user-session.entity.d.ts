import { User } from '../core/user.entity';
export declare class UserSession {
    id: string;
    userId: string;
    sessionToken: string;
    refreshToken: string;
    deviceId: string;
    deviceName: string;
    deviceType: string;
    deviceFingerprint: string;
    os: string;
    browser: string;
    browserFingerprint: string;
    ipAddress: string;
    countryCode: string;
    city: string;
    isVpn: boolean;
    isTrusted: boolean;
    requiresMfa: boolean;
    riskScore: number;
    riskFactors: Record<string, any>;
    issuedAt: Date;
    lastAccessedAt: Date;
    expiresAt: Date;
    revokedAt: Date;
    revokedReason: string;
    revokedBy: string;
    user: User;
}
