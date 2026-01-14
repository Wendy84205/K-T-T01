import { User } from '../core/user.entity';
import { Role } from '../core/role.entity';
export declare class UserRole {
    id: string;
    userId: string;
    roleId: string;
    assignedBy: string;
    assignedAt: Date;
    expiresAt: Date;
    requiresReview: boolean;
    createdAt: Date;
    user: User;
    role: Role;
}
