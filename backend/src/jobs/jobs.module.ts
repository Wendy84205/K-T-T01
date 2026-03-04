import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyRotationJob } from './key-rotation.job';
import { SecurityScanJob } from './security-scan.job';
import { EncryptionKey } from '../database/entities/security/encryption-key.entity';
import { AuditLog } from '../database/entities/security/audit-log.entity';
import { User } from '../database/entities/core/user.entity';
import { SecurityAlert } from '../database/entities/security/security-alert.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EncryptionKey,
            AuditLog,
            User,
            SecurityAlert,
        ]),
    ],
    providers: [
        KeyRotationJob,
        SecurityScanJob,
    ],
    exports: [
        KeyRotationJob,
        SecurityScanJob,
    ],
})
export class JobsModule { }
