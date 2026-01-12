import { File } from './file.entity';
export declare class FileIntegrityLog {
    id: string;
    fileId: string;
    originalHash: string;
    currentHash: string;
    lastVerifiedAt: Date;
    verificationResult: string;
    tamperingDetectedAt: Date;
    tamperingType: string;
    tamperingDetails: Record<string, any>;
    reportedTo: string;
    reportedAt: Date;
    actionTaken: string;
    createdAt: Date;
    updatedAt: Date;
    file: File;
}
