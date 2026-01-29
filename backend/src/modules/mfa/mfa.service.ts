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
  ) { }

  /**
   * Khởi tạo thiết lập TOTP (Google Authenticator)
   */
  async setupTotp(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = speakeasy.generateSecret({
      name: `CyberSecure:${user.email}`,
      issuer: 'CyberSecure',
      length: 20,
    });

    const backupCodes = this.generateBackupCodes();

    let mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId } });

    if (mfaSetting) {
      await this.mfaSettingRepository.update({ userId }, {
        totpSecret: secret.base32,
        totpEnabled: true,
        totpBackupCodes: backupCodes,
        updatedAt: new Date(),
      });
    } else {
      await this.mfaSettingRepository.save({
        userId,
        totpSecret: secret.base32,
        totpEnabled: true,
        totpBackupCodes: backupCodes,
      });
    }

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    return { secret: secret.base32, qrCode, backupCodes };
  }

  /**
   * Xác thực mã OTP khi đăng nhập
   */
  async verifyTotpLogin(userId: string, token: string): Promise<{ verified: boolean; usedBackupCode?: boolean }> {
    const mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId } });

    if (!mfaSetting || !mfaSetting.totpSecret) {
      return { verified: false };
    }

    // 1. Kiểm tra mã TOTP
    const verified = speakeasy.totp.verify({
      secret: mfaSetting.totpSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Cho phép lệch 1 phút
    });

    if (verified) {
      return { verified: true, usedBackupCode: false };
    }

    // 2. Kiểm tra mã Backup nếu mã TOTP sai
    if (mfaSetting.totpBackupCodes?.includes(token.toUpperCase())) {
      // Xóa mã backup đã sử dụng
      const updatedCodes = mfaSetting.totpBackupCodes.filter(c => c !== token.toUpperCase());
      await this.mfaSettingRepository.update({ userId }, { totpBackupCodes: updatedCodes });

      return { verified: true, usedBackupCode: true };
    }

    return { verified: false };
  }

  /**
   * Xác thực mã khi thiết lập 2FA lần đầu
   */
  async verifyTotpSetup(userId: string, token: string): Promise<boolean> {
    const mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId } });
    if (!mfaSetting?.totpSecret) return false;

    const verified = speakeasy.totp.verify({
      secret: mfaSetting.totpSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      await this.mfaSettingRepository.update({ userId }, {
        totpVerifiedAt: new Date()
      });
    }
    return verified;
  }

  /**
   * Tạo lại bộ mã backup mới
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();
    await this.mfaSettingRepository.update({ userId }, { totpBackupCodes: backupCodes });
    return backupCodes;
  }

  /**
   * Tắt MFA (Dành cho Admin)
   */
  async disableMfa(userId: string, adminId: string): Promise<void> {
    await this.mfaSettingRepository.update({ userId }, {
      totpEnabled: false,
      smsMfaEnabled: false,
      emailMfaEnabled: false
    });
    await this.userRepository.update({ id: userId }, { mfaRequired: false });
  }

  /**
   * Lấy trạng thái bảo mật MFA của User
   */
  async getMfaStatus(userId: string) {
    const [mfaSetting, user] = await Promise.all([
      this.mfaSettingRepository.findOne({ where: { userId } }),
      this.userRepository.findOne({ where: { id: userId } })
    ]);

    return {
      mfaRequired: user?.mfaRequired || false,
      totp: {
        enabled: mfaSetting?.totpEnabled || false,
        verified: !!mfaSetting?.totpVerifiedAt
      },
      backupCodes: {
        available: mfaSetting?.totpBackupCodes?.length || 0
      }
    };
  }

  private generateBackupCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8)
    );
  }

  /**
   * Kiểm tra MFA cho các thao tác nhạy cảm (Zero Trust)
   */
  async validateMfaForAccess(userId: string, operationType: string, riskScore: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return {
      requiresMfa: user?.mfaRequired || riskScore > 50,
      allowedMethods: ['totp']
    };
  }
}