import { File } from './file.entity';
export declare class FileVersion {
    id: string;
    fileId: string;
    versionNumber: number;
    storagePath: string;
    sizeBytes: number;
    fileHash: string;
    encryptionKeyId: string;
    changesDescription: string;
    changedBy: string;
    createdAt: Date;
    file: File;
}
