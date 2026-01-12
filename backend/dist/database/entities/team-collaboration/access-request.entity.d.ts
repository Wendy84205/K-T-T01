import { User } from '../core/user.entity';
export declare class AccessRequest {
    id: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    requestedPermission: string;
    ipAddress: string;
    deviceId: string;
    locationData: Record<string, any>;
    riskScore: number;
    riskFactors: Record<string, any>;
    status: string;
    approverId: string;
    approvedAt: Date;
    approvalNotes: string;
    businessJustification: string;
    durationMinutes: number;
    requestedAt: Date;
    expiresAt: Date;
    accessedAt: Date;
    createdAt: Date;
    user: User;
    approver: User;
}
