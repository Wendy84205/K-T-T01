import { User } from './user.entity';
export declare class Role {
    id: string;
    name: string;
    level: number;
    description: string;
    isSystemRole: boolean;
    securityLevelRequired: number;
    createdAt: Date;
    users: User[];
}
