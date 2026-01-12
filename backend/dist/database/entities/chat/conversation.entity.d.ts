import { Team } from '../team-collaboration/team.entity';
import { User } from '../core/user.entity';
export declare class Conversation {
    id: string;
    name: string;
    avatarUrl: string;
    conversationType: string;
    teamId: string;
    isPrivate: boolean;
    encryptionRequired: boolean;
    defaultEncryptionKeyId: string;
    createdBy: string;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
    team: Team;
    creator: User;
}
