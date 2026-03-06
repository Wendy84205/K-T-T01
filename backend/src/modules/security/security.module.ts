import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

// Entities
import { AuditLog } from '../../database/entities/security/audit-log.entity';
import { RateLimit } from '../../database/entities/auth/rate-limit.entity';
import { SecurityIncident } from '../../database/entities/security/security-incident.entity';
import { SecurityPolicy } from '../../database/entities/security/security-policy.entity';
import { SystemLog } from '../../database/entities/security/system-log.entity';
import { UserSession } from '../../database/entities/auth/user-session.entity';
import { EncryptionKey } from '../../database/entities/security/encryption-key.entity';

// Common Services
import { AuditService } from '../../common/service/audit.service';
import { AnomalyDetectionService } from '../../common/service/anomaly-detection.service';
import { EncryptionService } from '../../common/service/encryption.service';
import { IntegrityCheckService } from '../../common/service/integrity-check.service';
import { KeyManagementService } from '../../common/service/key-management.service';
import { ThreatDetectionService } from '../../common/service/threat-detection.service';
import { VirusScanService } from '../../common/service/virus-scan.service';
import { EmailService } from '../../common/service/email.service';
import { FileUploadService } from '../../common/service/file-upload.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditLog,
      RateLimit,
      SecurityIncident,
      SecurityPolicy,
      SystemLog,
      UserSession,
      EncryptionKey
    ]),
  ],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    AuditService,
    EncryptionService,
    AnomalyDetectionService,
    IntegrityCheckService,
    KeyManagementService,
    ThreatDetectionService,
    VirusScanService,
    EmailService,
    FileUploadService,
  ],
  exports: [
    SecurityService,
    AuditService,
    EncryptionService,
    AnomalyDetectionService,
    IntegrityCheckService,
    KeyManagementService,
    ThreatDetectionService,
    VirusScanService,
    EmailService,
    FileUploadService,
  ],
})
export class SecurityModule { }