// src/modules/mfa/mfa.controller.ts
import { 
  Controller, Post, Get, Body, Param, UseGuards, Request 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MfaService } from './mfa.service';

@Controller('mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Get('status')
  async getMfaStatus(@Request() req) {
    return this.mfaService.getMfaStatus(req.user.userId);
  }

  @Post('setup/totp')
  async setupTotp(@Request() req) {
    return this.mfaService.setupTotp(req.user.userId);
  }

  @Post('verify/totp-setup')
  async verifyTotpSetup(@Request() req, @Body('token') token: string) {
    const verified = await this.mfaService.verifyTotpSetup(req.user.userId, token);
    return { verified };
  }

  @Post('verify/login')
  async verifyTotpLogin(@Request() req, @Body('token') token: string) {
    return this.mfaService.verifyTotpLogin(req.user.userId, token);
  }

  @Post('backup-codes/regenerate')
  async regenerateBackupCodes(@Request() req) {
    const codes = await this.mfaService.regenerateBackupCodes(req.user.userId);
    return { backupCodes: codes };
  }

  @Post('disable')
  async disableMfa(@Request() req, @Body('userId') userId: string) {
    // Only admins can disable MFA for others
    // Check admin permission here
    await this.mfaService.disableMfa(userId, req.user.userId);
    return { success: true };
  }
}