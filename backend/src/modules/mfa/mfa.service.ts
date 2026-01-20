// src/modules/mfa/mfa.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { MfaSetting } from '../../database/entities/auth/mfa-setting.entity';
import { User } from '../../database/entities/core/user.entity';

@Injectable()
export class MfaService {
  constructor(
    @InjectRepository(MfaSetting)
    private mfaSettingRepository: Repository<MfaSetting>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // TOTP Methods
  async setupTotp(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    // Check user exists and has MFA required
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.mfaRequired) {
      throw new BadRequestException('MFA is not required for this user');
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `CyberSecure:${user.email}`,
      issuer: 'CyberSecure Enterprise',
      length: 20,
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Save or update MFA settings
    let mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId } });
    
    if (mfaSetting) {
      await this.mfaSettingRepository.update(
        { userId },
        {
          totpSecret: secret.base32,
          totpEnabled: true,
          totpBackupCodes: backupCodes,
          updatedAt: new Date(),
        }
      );
    } else {
      mfaSetting = this.mfaSettingRepository.create({
        userId,
        totpSecret: secret.base32,
        totpEnabled: true,
        totpBackupCodes: backupCodes,
        emailMfaEnabled: false,
        smsMfaEnabled: false,
      });
      await this.mfaSettingRepository.save(mfaSetting);
    }

    // Generate QR code for authenticator app
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32, // For manual entry
      qrCode,
      backupCodes,
    };
  }

  async verifyTotpSetup(userId: string, token: string): Promise<boolean> {
    const mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId } });
    
    if (!mfaSetting?.totpSecret) {
      throw new BadRequestException('TOTP not set up');
    }

    const verified = speakeasy.totp.verify({
      secret: mfaSetting.totpSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 1 minute before/after
    });

    if (verified) {
      await this.mfaSettingRepository.update(
        { userId },
        {
          totpVerifiedAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }

    return verified;
  }

  async verifyTotpLogin(userId: string, token: string): Promise<{ verified: boolean; usedBackupCode?: boolean }> {
    const mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId } });
    
    if (!mfaSetting?.totpSecret && !mfaSetting?.totpBackupCodes?.length) {
      throw new BadRequestException('MFA not configured');
    }

    // Try TOTP token first
    if (mfaSetting.totpSecret) {
      const totpVerified = speakeasy.totp.verify({
        secret: mfaSetting.totpSecret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (totpVerified) {
        return { verified: true, usedBackupCode: false };
      }
    }

    // Try backup codes
    if (mfaSetting.totpBackupCodes && mfaSetting.totpBackupCodes.length > 0) {
      const backupCodeIndex = mfaSetting.totpBackupCodes.indexOf(token.toUpperCase());
      
      if (backupCodeIndex !== -1) {
        // Remove used backup code
        const updatedBackupCodes = [...mfaSetting.totpBackupCodes];
        updatedBackupCodes.splice(backupCodeIndex, 1);
        
        await this.mfaSettingRepository.update(
          { userId },
          {
            totpBackupCodes: updatedBackupCodes,
            updatedAt: new Date(),
          }
        );
        
        return { verified: true, usedBackupCode: true };
      }
    }

    return { verified: false };
  }

  // Backup codes
  private generateBackupCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () => {
      return crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
    });
  }

  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();
    
    await this.mfaSettingRepository.update(
      { userId },
      {
        totpBackupCodes: backupCodes,
        updatedAt: new Date(),
      }
    );

    return backupCodes;
  }

  // MFA Status
  async getMfaStatus(userId: string) {
    const mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      mfaRequired: user.mfaRequired,
      totp: {
        enabled: mfaSetting?.totpEnabled || false,
        verified: !!mfaSetting?.totpVerifiedAt,
        setupDate: mfaSetting?.totpVerifiedAt,
      },
      emailMfa: {
        enabled: mfaSetting?.emailMfaEnabled || false,
        verified: !!mfaSetting?.emailVerifiedAt,
      },
      smsMfa: {
        enabled: mfaSetting?.smsMfaEnabled || false,
        verified: !!mfaSetting?.smsVerifiedAt,
      },
      backupCodes: {
        available: mfaSetting?.totpBackupCodes ? mfaSetting.totpBackupCodes.length : 0,
        lastGenerated: mfaSetting?.updatedAt,
      },
    };
  }

  // Disable MFA (admin only)
  async disableMfa(userId: string, adminId: string): Promise<void> {
    // Log this action in audit logs
    await this.mfaSettingRepository.update(
      { userId },
      {
        totpEnabled: false,
        emailMfaEnabled: false,
        smsMfaEnabled: false,
        updatedAt: new Date(),
      }
    );

    // Also update user's mfaRequired flag
    await this.userRepository.update(
      { id: userId },
      {
        mfaRequired: false,
        updatedAt: new Date(),
      }
    );
  }

  // Validate MFA for Zero Trust
  async validateMfaForAccess(
    userId: string, 
    operationType: string,
    riskScore: number
  ): Promise<{ 
    requiresMfa: boolean; 
    allowedMethods: string[] 
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Base requirement: user has MFA required
    const requiresMfa = user.mfaRequired || riskScore > 50;

    // Determine which methods are available and verified
    const availableMethods: string[] = [];

    if (mfaSetting?.totpEnabled && mfaSetting?.totpVerifiedAt) {
      availableMethods.push('totp');
    }

    if (mfaSetting?.emailMfaEnabled && mfaSetting?.emailVerifiedAt) {
      availableMethods.push('email');
    }

    if (mfaSetting?.smsMfaEnabled && mfaSetting?.smsVerifiedAt) {
      availableMethods.push('sms');
    }

    return {
      requiresMfa,
      allowedMethods: availableMethods,
    };
  }
}