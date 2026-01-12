import { File } from './file.entity';
export declare class FileShare {
    id: string;
    fileId: string;
    sharedWithType: string;
    sharedWithId: string;
    permissionLevel: string;
    encryptionKeyId: string;
    shareToken: string;
    isActive: boolean;
    expiresAt: Date;
    downloadLimit: number;
    watermarkEnabled: boolean;
    sharedBy: string;
    sharedAt: Date;
    createdAt: Date;
    file: File;
}
