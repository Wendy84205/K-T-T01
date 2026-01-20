// src/modules/mfa/mfa.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';
import { MfaSetting } from '../../database/entities/auth/mfa-setting.entity';
import { User } from '../../database/entities/core/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MfaSetting, User]),
  ],
  controllers: [MfaController],
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {}