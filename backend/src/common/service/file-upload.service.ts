import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { VirusScanService } from './virus-scan.service';
import { IntegrityCheckService } from './integrity-check.service';
import { EncryptionService } from './encryption.service';
import { FileUtils } from '../../utils/file.utils';

@Injectable()
export class FileUploadService {
    private readonly logger = new Logger('FileUpload');

    constructor(
        private readonly virusScanService: VirusScanService,
        private readonly integrityCheckService: IntegrityCheckService,
        private readonly encryptionService: EncryptionService,
    ) { }

    /**
     * Process an uploaded file through security checks and encryption.
     */
    async processUpload(file: { buffer: Buffer; originalname: string; mimetype: string }): Promise<{
        filename: string;
        checksum: string;
        encryptionMetadata: any;
    }> {
        // 1. Scan for virus
        const scanResult = await this.virusScanService.scanFile(file.buffer, file.originalname);
        if (!scanResult.isClean) {
            await this.virusScanService.handleInfectedFile(file.originalname, scanResult.threat || 'Unknown');
            throw new BadRequestException(`Security alert: file '${file.originalname}' contains malware (${scanResult.threat})`);
        }

        // 2. Integrity check: Calculate checksum using SHA-256
        const checksum = this.encryptionService.hashSHA256(file.buffer);

        // 3. Generate a secure, unique filename
        const sanitizedFilename = FileUtils.generateUniqueFilename(file.originalname);

        // 4. Encrypt the file data
        // In a real scenario, we'd get a per-file key from KeyManagementService
        const masterKey = Buffer.alloc(32, 'secure_key_123'); // Example key
        const encryptedResult = this.encryptionService.encryptFile(file.buffer, masterKey);

        this.logger.log(`File '${file.originalname}' processed and encrypted as '${sanitizedFilename}'`);

        return {
            filename: sanitizedFilename,
            checksum,
            encryptionMetadata: {
                iv: encryptedResult.iv,
                tag: encryptedResult.tag,
                algorithm: 'aes-256-gcm',
            }
        };
    }
}
