import { User } from '../core/user.entity';
import { Team } from '../team-collaboration/team.entity';
export declare class Folder {
    id: string;
    name: string;
    parentFolderId: string;
    ownerId: string;
    teamId: string;
    isPublic: boolean;
    accessLevel: string;
    encryptionRequired: boolean;
    defaultEncryptionKeyId: string;
    createdAt: Date;
    updatedAt: Date;
    owner: User;
    team: Team;
}
