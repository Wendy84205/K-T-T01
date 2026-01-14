export declare class EncryptionKey {
    id: string;
    keyType: string;
    keyName: string;
    encryptedKey: string;
    keyAlgorithm: string;
    keyVersion: number;
    keyOwnerId: string;
    keyScope: string;
    scopeId: string;
    isActive: boolean;
    createdDate: Date;
    rotationDate: Date;
    nextRotationDate: Date;
    expiresAt: Date;
    createdBy: string;
    createdAt: Date;
    revokedAt: Date;
    revokedBy: string;
}
