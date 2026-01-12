import { Injectable, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../../database/entities/core/user.entity';
import { MfaSetting } from '../../../database/entities/auth/mfa-setting.entity';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { ValidationService } from './validation.service';
import { EmployeeIdGeneratorService } from './employee-id-generator.service';

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(MfaSetting)
    private readonly mfaSettingRepository: Repository<MfaSetting>,
    
    private readonly validationService: ValidationService,
    private readonly employeeIdGenerator: EmployeeIdGeneratorService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // 1. Validate inputs (except employeeId)
    this.validateInputs(registerDto);

    // 2. Check for existing user (email & username)
    await this.checkExistingUser(registerDto);

    // 3. Auto-generate Employee ID
    const employeeId = await this.employeeIdGenerator.generateEmployeeId(
      registerDto.department
    );

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // 5. Create user entity với auto-generated employeeId
    const user = this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
      employeeId: employeeId, // ⭐ AUTO-GENERATED
      jobTitle: registerDto.jobTitle || 'Staff',
      department: registerDto.department || 'IT',
      hireDate: new Date(),
      mfaRequired: registerDto.mfaRequired ?? true,
      securityClearanceLevel: 1,
      lastPasswordChange: new Date(),
      accountLockedUntil: null,
      lockReason: null,
      isActive: true,
      isEmailVerified: false,
      isLocked: false,
      lastLoginAt: null,
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      managerId: null,
      primaryTeamId: null,
    });

    // 6. Save user
    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('employee_id')) {
          // Retry with new employee ID if duplicate (rare case)
          return this.register(registerDto);
        } else if (error.message.includes('email')) {
          throw new ConflictException('Email already registered');
        } else if (error.message.includes('username')) {
          throw new ConflictException('Username already taken');
        }
      }
      throw new InternalServerErrorException('Failed to create account');
    }

    // 7. Create MFA settings
    await this.createMfaSettings(savedUser.id, registerDto.mfaRequired);

    // 8. Assign default role
    await this.assignDefaultRole(savedUser.id);

    // 9. Create audit log
    await this.createAuditLog(savedUser);

    // 10. Return response với employeeId
    return this.buildRegisterResponse(savedUser);
  }

  private validateInputs(dto: RegisterDto): void {
    this.validationService.validateEmail(dto.email);
    this.validationService.validatePassword(dto.password);
    this.validationService.validateDepartment(dto.department);
    
    // Additional validation
    if (dto.phone && !this.validationService.validatePhone(dto.phone)) {
      throw new BadRequestException('Invalid phone number format');
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

  private async assignDefaultRole(userId: string): Promise<void> {
    // TODO: Implement role assignment from RoleService
    // For now, just log
    console.log(`Default role assigned to user ${userId}`);
  }

  private async createAuditLog(user: User): Promise<void> {
    // TODO: Implement audit log service
    console.log(`Audit: User ${user.username} registered with employee ID ${user.employeeId}`);
  }

  private buildRegisterResponse(user: User): RegisterResponseDto {
    const response = new RegisterResponseDto();
    
    response.id = user.id;
    response.email = user.email;
    response.username = user.username;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.employeeId = user.employeeId; // ⭐ Include in response
    response.department = user.department;
    response.jobTitle = user.jobTitle;
    response.mfaRequired = user.mfaRequired;
    response.isEmailVerified = user.isEmailVerified;
    response.createdAt = user.createdAt;
    response.requiresEmailVerification = !user.isEmailVerified;
    response.requiresManagerApproval = this.requiresManagerApproval(user);
    response.nextSteps = this.getNextSteps(user);
    
    return response;
  }

  private requiresManagerApproval(user: User): boolean {
    const highSecurityDepartments = ['IT', 'SECURITY', 'FINANCE'];
    const managerialTitles = ['Manager', 'Director', 'VP', 'Head of'];
    
    const needsDeptApproval = highSecurityDepartments.some(dept => 
      user.department?.toUpperCase().includes(dept)
    );
    const needsTitleApproval = managerialTitles.some(title => 
      user.jobTitle?.toUpperCase().includes(title.toUpperCase())
    );
    
    return needsDeptApproval || needsTitleApproval;
  }

  private getNextSteps(user: User): string[] {
    const steps: string[] = [];
    
    if (!user.isEmailVerified) {
      steps.push('Check email for verification link');
    }
    
    if (user.mfaRequired) {
      steps.push('Setup Multi-Factor Authentication');
    }
    
    if (this.requiresManagerApproval(user)) {
      steps.push('Await manager approval for account activation');
    }
    
    steps.push('Complete security awareness training');
    steps.push('Review access permissions with your manager');
    
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

  async suggestEmployeeId(department: string = 'IT'): Promise<string> {
    return this.employeeIdGenerator.generateEmployeeId(department);
  }
}
