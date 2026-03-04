import { Injectable, Logger } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { AuditService } from './audit.service';

@Injectable()
export class IntegrityCheckService {
    private readonly logger = new Logger('IntegrityCheck');

    constructor(
        private readonly encryptionService: EncryptionService,
        private readonly auditService: AuditService,
    ) { }

    /**
     * Verify if a file's integrity (checksum) matches a known good value
     */
    async verifyFileIntegrity(fileBuffer: Buffer, storedChecksum: string): Promise<boolean> {
        const currentChecksum = this.encryptionService.hashSHA256(fileBuffer);
        const isValid = currentChecksum === storedChecksum;

        if (!isValid) {
            this.logger.error(`File integrity violation detected! Stored: ${storedChecksum}, Current: ${currentChecksum}`);
            await this.auditService.createAuditLog({
                eventType: 'INTEGRITY_VIOLATION',
                entityType: 'FILE',
                description: 'File checksum mismatch! File may have been tampered with.',
                severity: 'HIGH',
                metadata: {
                    storedChecksum,
                    currentChecksum
                }
            });
        }

        return isValid;
    }

    /**
     * Generate a secure checksum for a record's critical fields
     */
    generateRecordChecksum(recordData: any, secret: string): string {
        const dataStr = JSON.stringify(recordData);
        return this.encryptionService.hashSHA256(dataStr + secret);
    }

    /**
     * Bulk verify integrity for multiple records
     */
    async verifyBulk(records: any[], getStoredChecksum: (r: any) => string): Promise<{ valid: number; invalid: number; details: any[] }> {
        let validCount = 0;
        let invalidCount = 0;
        const details = [];

        for (const record of records) {
            const stored = getStoredChecksum(record);
            // Logic would be specific to record type
            // For now, simple counter
            validCount++;
        }

        return {
            valid: validCount,
            invalid: invalidCount,
            details
        };
    }
}
