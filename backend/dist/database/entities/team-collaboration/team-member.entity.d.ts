import { Team } from './team.entity';
import { User } from '../core/user.entity';
export declare class TeamMember {
    id: string;
    teamId: string;
    userId: string;
    roleInTeam: string;
    securityClearance: number;
    joinedDate: Date;
    leftDate: Date;
    addedBy: string;
    requiresSecurityTraining: boolean;
    trainingCompletedAt: Date;
    createdAt: Date;
    team: Team;
    user: User;
}
