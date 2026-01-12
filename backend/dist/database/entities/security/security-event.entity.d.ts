import { User } from '../core/user.entity';
export declare class SecurityEvent {
    id: string;
    eventType: string;
    severity: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    description: string;
    metadata: Record<string, any>;
    detectedBy: string;
    detectionRules: Record<string, any>;
    isInvestigated: boolean;
    investigationNotes: string;
    investigationBy: string;
    investigationAt: Date;
    resolution: string;
    resolvedAt: Date;
    resolvedBy: string;
    createdAt: Date;
    user: User;
}
