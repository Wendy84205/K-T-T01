// src/modules/auth/services/register.service.ts
import { Injectable, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../../database/entities/core/user.entity';
import { MfaSetting } from '../../../database/entities/auth/mfa-setting.entity';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(MfaSetting)
    private readonly mfaSettingRepository: Repository<MfaSetting>,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // 1. Validate input
    this.validateRegistrationInput(registerDto);

    // 2. Check for existing user
    await this.checkExistingUser(registerDto);

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 4. Create user entity
    const user = this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
      employeeId: registerDto.employeeId,
      jobTitle: registerDto.jobTitle,
      department: registerDto.department,
      mfaRequired: registerDto.mfaRequired ?? true,
      lastPasswordChange: new Date(),
      securityClearanceLevel: 1,
      isActive: true,
      isEmailVerified: false,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Save user
    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (error) {
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Failed to create account');
    }

    // 6. Create MFA settings
    await this.createMfaSettings(savedUser.id, registerDto.mfaRequired);

    // 7. Return response
    return this.buildRegisterResponse(savedUser);
  }

  private validateRegistrationInput(dto: RegisterDto): void {
    // Email domain validation
    const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || [];
    if (allowedDomains.length > 0) {
      const emailDomain = dto.email.split('@')[1];
      if (!allowedDomains.includes(emailDomain)) {
        throw new BadRequestException(`Email domain @${emailDomain} is not allowed`);
      }
    }

    // Username length validation
    if (dto.username.length > 50) {
      throw new BadRequestException('Username must be less than 50 characters');
    }
  }

  private async checkExistingUser(dto: RegisterDto): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: dto.email },
        { username: dto.username }
      ],
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      if (existingUser.username === dto.username) {
        throw new ConflictException('Username already taken');
      }
    }
  }

  private async createMfaSettings(userId: string, mfaRequired: boolean): Promise<void> {
    const mfaSetting = this.mfaSettingRepository.create({
      userId,
      emailMfaEnabled: mfaRequired,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.mfaSettingRepository.save(mfaSetting);
  }

  private buildRegisterResponse(user: User): RegisterResponseDto {
    const response = new RegisterResponseDto();
    
    response.id = user.id;
    response.email = user.email;
    response.username = user.username;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.mfaRequired = user.mfaRequired;
    response.isEmailVerified = user.isEmailVerified;
    response.createdAt = user.createdAt;
    response.requiresEmailVerification = !user.isEmailVerified;
    response.requiresManagerApproval = this.requiresManagerApproval(user);
    response.nextSteps = this.getNextSteps(user);
    
    return response;
  }

  private requiresManagerApproval(user: User): boolean {
    // Simple logic - modify as needed
    return user.department === 'IT' || user.jobTitle?.includes('Manager');
  }

  private getNextSteps(user: User): string[] {
    const steps: string[] = [];
    
    if (!user.isEmailVerified) {
      steps.push('Check your email for verification');
    }
    
    if (user.mfaRequired) {
      steps.push('Setup Multi-Factor Authentication');
    }
    
    if (this.requiresManagerApproval(user)) {
      steps.push('Await manager approval');
    }
    
    return steps;
  }

  async checkAvailability(field: 'email' | 'username', value: string): Promise<{ available: boolean }> {
    const user = await this.userRepository.findOne({
      where: { [field]: value },
    });

    return {
      available: !user,
    };
  }
}