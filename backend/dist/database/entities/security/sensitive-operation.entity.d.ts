import { User } from '../core/user.entity';
export declare class SensitiveOperation {
    id: string;
    operationType: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    targetEntityType: string;
    targetEntityId: string;
    justification: string;
    approvalRequired: boolean;
    approvedBy: string;
    approvedAt: Date;
    operationResult: string;
    errorMessage: string;
    createdAt: Date;
    user: User;
}
