import { User } from '../core/user.entity';
export declare class ManagerProfile {
    id: string;
    userId: string;
    managerLevel: string;
    maxTeamSize: number;
    canHire: boolean;
    canFire: boolean;
    canApproveSecurity: boolean;
    budgetAuthority: number;
    reportingTo: string;
    isActive: boolean;
    managementStartDate: Date;
    managementEndDate: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
