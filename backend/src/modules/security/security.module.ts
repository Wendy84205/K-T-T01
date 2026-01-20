// src/modules/security/security.module.ts - UPDATE IMPORTS
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { AuditLog } from '../../database/entities/security/audit-log.entity';
import { SecurityEvent } from '../../database/entities/security/security-event.entity';
import { RateLimit } from '../../database/entities/auth/rate-limit.entity';
import { FailedLoginAttempt } from '../../database/entities/auth/failed-login.entity';
import { SecurityAlert } from '../../database/entities/security/security-alert.entity';
import { SecurityPolicy } from '../../database/entities/security/security-policy.entity';
import { SystemLog } from '../../database/entities/security/system-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditLog, 
      SecurityEvent, 
      RateLimit, 
      FailedLoginAttempt,
      SecurityAlert,
      SecurityPolicy,
      SystemLog
    ]),
  ],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}