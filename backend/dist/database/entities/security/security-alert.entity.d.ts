import { User } from '../core/user.entity';
export declare class SecurityAlert {
    id: string;
    alertType: string;
    severity: string;
    title: string;
    description: string;
    affectedUsers: string[];
    affectedResources: Record<string, any>;
    status: string;
    acknowledgedBy: string;
    acknowledgedAt: Date;
    resolvedBy: string;
    resolvedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    acknowledger: User;
    resolver: User;
}
