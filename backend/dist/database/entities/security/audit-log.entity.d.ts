import { User } from '../core/user.entity';
export declare class AuditLog {
    id: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    deviceId: string;
    locationData: Record<string, any>;
    eventType: string;
    entityType: string;
    entityId: string;
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
    changes: Record<string, any>;
    severity: string;
    riskScore: number;
    securityContext: Record<string, any>;
    description: string;
    metadata: Record<string, any>;
    createdAt: Date;
    user: User;
}
