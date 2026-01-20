import { User } from '../core/user.entity';
import { TeamMember } from './team-member.entity';
export declare class Team {
    id: string;
    name: string;
    code: string;
    description: string;
    departmentId: string;
    defaultSecurityLevel: number;
    requiresMfa: boolean;
    encryptionRequired: boolean;
    maxMembers: number;
    storageQuotaMb: number;
    fileSizeLimitMb: number;
    isActive: boolean;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    managerId: string;
    parentTeamId: string;
    manager: User;
    parentTeam: Team;
    members: TeamMember[];
}
