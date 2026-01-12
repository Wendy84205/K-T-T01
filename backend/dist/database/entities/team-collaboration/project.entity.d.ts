import { Team } from './team.entity';
import { User } from '../core/user.entity';
export declare class Project {
    id: string;
    name: string;
    description: string;
    teamId: string;
    managerId: string;
    securityLevel: number;
    isConfidential: boolean;
    status: string;
    priority: string;
    startDate: Date;
    endDate: Date;
    deadline: Date;
    createdAt: Date;
    updatedAt: Date;
    team: Team;
    manager: User;
}
