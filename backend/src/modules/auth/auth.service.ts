import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../database/entities/core/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MfaSetting } from '../../database/entities/auth/mfa-setting.entity';
import { MfaService } from '../mfa/mfa.service';
import { SecurityService } from '../security/security.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(MfaSetting)
    private readonly mfaSettingRepository: Repository<MfaSetting>,

    private readonly jwtService: JwtService,
    private readonly mfaService: MfaService,
    private readonly securityService: SecurityService,
  ) { }

  // Validate user for login
  async validateUser(identifier: string, password: string): Promise<User> {
    // Try to find user by email or username
    const user = await this.userRepository.findOne({
      where: [
        { email: identifier, isActive: true },
        { username: identifier, isActive: true }
      ],
    });

    if (!user) {
      this.securityService.logSecurityEvent('LOGIN_FAILURE', null, `Login attempt failed: User not found (${identifier})`, {}, 'MEDIUM');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (user.accountLockedUntil.getTime() - Date.now()) / (1000 * 60)
        );
        const remainingSeconds = Math.ceil(
          (user.accountLockedUntil.getTime() - Date.now()) / 1000
        );
        this.securityService.logSecurityEvent('LOGIN_BLOCKED', user.id, `Login attempt blocked: Account is locked`, {}, 'HIGH');
        throw new UnauthorizedException({
          message: `Account is locked. Try again in ${remainingMinutes} minutes`,
          error: 'ACCOUNT_LOCKED',
          remainingSeconds,
          lockedUntil: user.accountLockedUntil.toISOString()
        });
      } else {
        // Unlock if lock period has passed
        user.isLocked = false;
        user.accountLockedUntil = null;
        user.lockReason = null;
        await this.userRepository.save(user);
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      user.lastFailedLogin = new Date();

      this.securityService.logSecurityEvent('LOGIN_FAILURE', user.id, `Invalid password attempt for ${user.email}`, { attempts: user.failedLoginAttempts }, 'MEDIUM');

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        user.lockReason = 'Too many failed login attempts';

        await this.userRepository.save(user);

        this.securityService.logSecurityEvent('ACCOUNT_LOCKOUT', user.id, `Account locked due to too many failed attempts`, { attempts: user.failedLoginAttempts }, 'HIGH');

        const remainingMinutes = Math.ceil(
          (user.accountLockedUntil.getTime() - Date.now()) / (1000 * 60)
        );
        const remainingSeconds = Math.ceil(
          (user.accountLockedUntil.getTime() - Date.now()) / 1000
        );

        throw new UnauthorizedException({
          message: `Account is locked. Try again in ${remainingMinutes} minutes`,
          error: 'ACCOUNT_LOCKED',
          remainingSeconds,
          lockedUntil: user.accountLockedUntil.toISOString()
        });
      }

      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return user;
  }

  // Login method - returns temporary token if MFA required and configured; otherwise full token
  async login(user: User): Promise<LoginResponseDto | { requiresMfa: boolean; tempToken: string; mfaMethods: string[] }> {

    // Load user with roles for JWT and response
    const userWithRoles = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['roles'],
    });
    const roles: string[] = (userWithRoles?.roles || []).map((r: { name: string }) => r.name);

    // Check MFA settings
    const mfaSettings = await this.mfaSettingRepository.findOne({
      where: { userId: user.id }
    });

    const mfaMethods: string[] = [];
    if (mfaSettings) {
      if (mfaSettings.totpEnabled) mfaMethods.push('totp');
      if (mfaSettings.emailMfaEnabled) mfaMethods.push('email');
      if (mfaSettings.smsMfaEnabled) mfaMethods.push('sms');
    }

    // FORCED MFA LOGIC: Nếu user.mfaRequired = true thì bắt buộc phải qua Stage 3
    if (user.mfaRequired) {
      if (mfaMethods.length === 0) mfaMethods.push('totp'); // Mặc định hiện TOTP nếu chưa setup phương thức nào
      this.securityService.logSecurityEvent('MFA_STEP_REQUIRED', user.id, `MFA verification step required for user: ${user.email}`, { methods: mfaMethods }, 'LOW');
      const tempPayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        mfaPending: true,
      };
      const tempToken = this.jwtService.sign(tempPayload, { expiresIn: '5m' });
      return {
        requiresMfa: true,
        tempToken,
        mfaMethods,
      };
    }

    // No MFA or no method configured: allow login, issue full token
    const mfaSetupRequired = user.mfaRequired && mfaMethods.length === 0;

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      employeeId: user.employeeId,
      securityLevel: user.securityClearanceLevel,
      mfaRequired: user.mfaRequired,
      mfaVerified: !mfaSetupRequired,
      roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    this.securityService.logSecurityEvent('LOGIN_SUCCESS', user.id, `User logged in successfully: ${user.email}`, { roles }, 'LOW');

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        department: user.department,
        mfaRequired: user.mfaRequired,
        mfaVerified: !mfaSetupRequired,
        mfaSetupRequired: mfaSetupRequired || undefined,
        securityClearanceLevel: user.securityClearanceLevel,
        roles,
      },
    };
  }

  // Verify MFA and complete login
  async verifyMfaAndLogin(userId: string, token: string): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    /* 
    // BYPASS FOR TESTING: Cho phép 123456 để test luồng nhanh
    let isVerified = token === '123456';
    if (!isVerified) {
      const mfaResult = await this.mfaService.verifyTotpLogin(userId, token);
      isVerified = mfaResult.verified;
    }
    */

    const mfaResult = await this.mfaService.verifyTotpLogin(userId, token);
    const isVerified = mfaResult.verified;

    if (!isVerified) {
      this.securityService.logSecurityEvent('MFA_VERIFY_FAILURE', userId, `MFA verification failed for user: ${user.email}`, {}, 'MEDIUM');
      throw new UnauthorizedException('Invalid MFA token');
    }

    this.securityService.logSecurityEvent('MFA_VERIFY_SUCCESS', userId, `MFA verification successful for user: ${user.email}`, {}, 'LOW');

    const roles: string[] = (user.roles || []).map((r: { name: string }) => r.name);
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      employeeId: user.employeeId,
      securityLevel: user.securityClearanceLevel,
      mfaRequired: true,
      mfaVerified: true,
      roles,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        department: user.department,
        mfaRequired: true,
        mfaVerified: true,
        securityClearanceLevel: user.securityClearanceLevel,
        roles,
      },
    };
  }

  // Validate token
  async validateToken(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
    try {
      const payload = this.jwtService.verify(token);

      // Check if user still exists and is active
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true }
      });

      if (!user) {
        return { valid: false, error: 'User not found or inactive' };
      }

      return { valid: true, payload };
    } catch (err) {
      return { valid: false, error: err?.message ?? 'Invalid token' };
    }
  }

  // Get user profile
  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['roles']
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Refresh token
  async refreshToken(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      employeeId: user.employeeId,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '24h' }),
    };
  }
}