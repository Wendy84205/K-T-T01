// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../database/entities/core/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MfaSetting } from '../../database/entities/auth/mfa-setting.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(MfaSetting)
    private readonly mfaSettingRepository: Repository<MfaSetting>,
    
    private readonly jwtService: JwtService,
  ) {}

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
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (user.accountLockedUntil.getTime() - Date.now()) / (1000 * 60)
        );
        throw new UnauthorizedException(
          `Account is locked. Try again in ${remainingMinutes} minutes`
        );
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
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        user.lockReason = 'Too many failed login attempts';
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

  // Login method
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Check MFA settings
    const mfaSettings = await this.mfaSettingRepository.findOne({
      where: { userId: user.id }
    });

    // Create JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      employeeId: user.employeeId,
      securityLevel: user.securityClearanceLevel,
      mfaRequired: user.mfaRequired,
    };

    // Generate token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h', // Token expires in 24 hours
    });

    // Check if MFA is verified
    const mfaVerified = user.mfaRequired ? 
      !!(
        (mfaSettings?.emailMfaEnabled && mfaSettings?.emailVerifiedAt) ||
        (mfaSettings?.totpEnabled && mfaSettings?.totpVerifiedAt) ||
        (mfaSettings?.smsMfaEnabled && mfaSettings?.smsVerifiedAt)
      ) : true;

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
        mfaVerified: mfaVerified,
        securityClearanceLevel: user.securityClearanceLevel,
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
      select: [
        'id', 'username', 'email', 'firstName', 'lastName',
        'employeeId', 'department', 'jobTitle', 'phone',
        'mfaRequired', 'securityClearanceLevel', 'createdAt'
      ]
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