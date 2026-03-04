import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionKey } from '../../database/entities/security/encryption-key.entity';
import { EncryptionService } from './encryption.service';
import { AuditService } from './audit.service';

@Injectable()
export class KeyManagementService {
    private readonly logger = new Logger('KeyManagement');

    constructor(
        @InjectRepository(EncryptionKey)
        private readonly keyRepository: Repository<EncryptionKey>,
        private readonly encryptionService: EncryptionService,
        private readonly auditService: AuditService,
    ) { }

    /**
     * Create a new encryption key for a specific purpose
     */
    async createKey(purpose: string, algorithm: string = 'AES-256-GCM'): Promise<EncryptionKey> {
        const rawKey = this.encryptionService.generateRandomKey();

        const key = this.keyRepository.create({
            keyType: purpose,
            keyName: `${purpose}_v1`,
            encryptedKey: rawKey.toString('base64'),
            keyAlgorithm: algorithm,
            keyVersion: 1,
            isActive: true,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days validity
        });

        const savedKey = await this.keyRepository.save(key);

        await this.auditService.createAuditLog({
            eventType: 'KEY_CREATED',
            entityType: 'ENCRYPTION_KEY',
            entityId: savedKey.id,
            description: `New encryption key created for purpose: ${purpose}`,
            severity: 'MEDIUM',
        });

        return savedKey;
    }

    /**
     * Get the current active key for a purpose, or create one if none exists
     */
    async getActiveKey(purpose: string): Promise<EncryptionKey> {
        let key = await this.keyRepository.findOne({
            where: { keyType: purpose, isActive: true },
            order: { keyVersion: 'DESC' }
        });

        if (!key) {
            this.logger.log(`No active key found for purpose: ${purpose}. Creating one...`);
            key = await this.createKey(purpose);
        }

        return key;
    }

    /**
     * Revoke a key (e.g. if compromised)
     */
    async revokeKey(keyId: string, reason: string): Promise<void> {
        const key = await this.keyRepository.findOne({ where: { id: keyId } });
        if (key) {
            key.isActive = false;
            key.revokedAt = new Date();
            await this.keyRepository.save(key);

            await this.auditService.createAuditLog({
                eventType: 'KEY_REVOKED',
                entityType: 'ENCRYPTION_KEY',
                entityId: keyId,
                description: `Key revoked. Reason: ${reason}`,
                severity: 'HIGH',
            });
        }
    }

    /**
     * Rotate a key for a specific purpose
     */
    async rotateKey(purpose: string): Promise<EncryptionKey> {
        // 1. Deactivate old keys
        await this.keyRepository.update({ keyType: purpose, isActive: true }, { isActive: false });

        // 2. Create new version
        const newKey = await this.createKey(purpose);
        this.logger.log(`Key rotated for purpose: ${purpose}`);

        return newKey;
    }
}