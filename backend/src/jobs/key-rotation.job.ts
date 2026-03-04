import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EncryptionKey } from '../database/entities/security/encryption-key.entity';
import { KeyManagementService } from '../common/service/key-management.service';
import { AuditService } from '../common/service/audit.service';
import { EmailService } from '../common/service/email.service';

@Injectable()
export class KeyRotationJob {
    private readonly logger = new Logger(KeyRotationJob.name);

    constructor(
        @InjectRepository(EncryptionKey)
        private readonly keyRepository: Repository<EncryptionKey>,
        private readonly keyManagementService: KeyManagementService,
        private readonly auditService: AuditService,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Run key rotation every midnight
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleKeyRotation() {
        this.logger.log('Starting scheduled key rotation check...');

        try {
            // 1. Find all active keys that are expired or expiring soon (within 24h)
            const expiringSoon = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const expiredKeys = await this.keyRepository.find({
                where: {
                    isActive: true,
                    expiresAt: LessThan(expiringSoon),
                },
            });

            if (expiredKeys.length === 0) {
                this.logger.log('No keys require rotation today.');
                return;
            }

            this.logger.log(`Found ${expiredKeys.length} keys requiring rotation.`);
            const rotationSummary = [];

            // 2. Rotate each key
            for (const key of expiredKeys) {
                try {
                    const newKey = await this.keyManagementService.rotateKey(key.keyType);
                    rotationSummary.push({
                        purpose: key.keyType,
                        oldKeyId: key.id,
                        newKeyId: newKey.id,
                        status: 'SUCCESS',
                    });

                    this.logger.log(`Successfully rotated key for purpose: ${key.keyType}`);
                } catch (err) {
                    this.logger.error(`Failed to rotate key ${key.id} (${key.keyType}): ${err.message}`);
                    rotationSummary.push({
                        purpose: key.keyType,
                        oldKeyId: key.id,
                        status: 'FAILED',
                        error: err.message,
                    });
                }
            }

            // 3. Log the rotation summary
            await this.auditService.createAuditLog({
                eventType: 'KEY_ROTATION_JOB',
                entityType: 'SYSTEM',
                description: `Scheduled key rotation job completed. Rotated ${rotationSummary.filter(s => s.status === 'SUCCESS').length} keys.`,
                metadata: { summary: rotationSummary },
                severity: rotationSummary.some(s => s.status === 'FAILED') ? 'HIGH' : 'INFO',
            });

            // 4. Notify admins if any rotations failed
            const failures = rotationSummary.filter(s => s.status === 'FAILED');
            if (failures.length > 0) {
                await this.emailService.sendSecurityAlert(
                    'admin@cybersecure.local',
                    'CRITICAL: Key Rotation Failure',
                    `The scheduled key rotation job encountered failures for the following purposes: ${failures.map(f => f.purpose).join(', ')}. Please investigate immediately.`,
                );
            }

        } catch (error) {
            this.logger.error(`Error in scheduled key rotation job: ${error.message}`);

            await this.auditService.createAuditLog({
                eventType: 'KEY_ROTATION_ERROR',
                entityType: 'SYSTEM',
                description: `Critical error in scheduled key rotation job: ${error.message}`,
                severity: 'CRITICAL',
            });
        }
    }

    /**
     * Manual trigger for testing (optional)
     */
    async triggerRotationManually() {
        return await this.handleKeyRotation();
    }
}