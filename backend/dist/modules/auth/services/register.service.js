"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../../database/entities/core/user.entity");
const mfa_setting_entity_1 = require("../../../database/entities/auth/mfa-setting.entity");
const register_response_dto_1 = require("../dto/register-response.dto");
const validation_service_1 = require("./validation.service");
const employee_id_generator_service_1 = require("./employee-id-generator.service");
let RegisterService = class RegisterService {
    constructor(userRepository, mfaSettingRepository, validationService, employeeIdGenerator) {
        this.userRepository = userRepository;
        this.mfaSettingRepository = mfaSettingRepository;
        this.validationService = validationService;
        this.employeeIdGenerator = employeeIdGenerator;
    }
    async register(registerDto) {
        this.validateInputs(registerDto);
        await this.checkExistingUser(registerDto);
        const employeeId = await this.employeeIdGenerator.generateEmployeeId(registerDto.department);
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        const user = this.userRepository.create({
            username: registerDto.username,
            email: registerDto.email,
            passwordHash: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phone: registerDto.phone,
            employeeId: employeeId,
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
        let savedUser;
        try {
            savedUser = await this.userRepository.save(user);
        }
        catch (error) {
            console.error('Registration error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('employee_id')) {
                    return this.register(registerDto);
                }
                else if (error.message.includes('email')) {
                    throw new common_1.ConflictException('Email already registered');
                }
                else if (error.message.includes('username')) {
                    throw new common_1.ConflictException('Username already taken');
                }
            }
            throw new common_1.InternalServerErrorException('Failed to create account');
        }
        await this.createMfaSettings(savedUser.id, registerDto.mfaRequired);
        await this.assignDefaultRole(savedUser.id);
        await this.createAuditLog(savedUser);
        return this.buildRegisterResponse(savedUser);
    }
    validateInputs(dto) {
        this.validationService.validateEmail(dto.email);
        this.validationService.validatePassword(dto.password);
        this.validationService.validateDepartment(dto.department);
        if (dto.phone && !this.validationService.validatePhone(dto.phone)) {
            throw new common_1.BadRequestException('Invalid phone number format');
        }
    }
    async checkExistingUser(dto) {
        const existingUser = await this.userRepository.findOne({
            where: [
                { email: dto.email },
                { username: dto.username }
            ],
        });
        if (existingUser) {
            if (existingUser.email === dto.email) {
                throw new common_1.ConflictException('Email already registered');
            }
            if (existingUser.username === dto.username) {
                throw new common_1.ConflictException('Username already taken');
            }
        }
    }
    async createMfaSettings(userId, mfaRequired) {
        const mfaSetting = this.mfaSettingRepository.create({
            userId,
            emailMfaEnabled: mfaRequired,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await this.mfaSettingRepository.save(mfaSetting);
    }
    async assignDefaultRole(userId) {
        console.log(`Default role assigned to user ${userId}`);
    }
    async createAuditLog(user) {
        console.log(`Audit: User ${user.username} registered with employee ID ${user.employeeId}`);
    }
    buildRegisterResponse(user) {
        const response = new register_response_dto_1.RegisterResponseDto();
        response.id = user.id;
        response.email = user.email;
        response.username = user.username;
        response.firstName = user.firstName;
        response.lastName = user.lastName;
        response.employeeId = user.employeeId;
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
    requiresManagerApproval(user) {
        const highSecurityDepartments = ['IT', 'SECURITY', 'FINANCE'];
        const managerialTitles = ['Manager', 'Director', 'VP', 'Head of'];
        const needsDeptApproval = highSecurityDepartments.some(dept => user.department?.toUpperCase().includes(dept));
        const needsTitleApproval = managerialTitles.some(title => user.jobTitle?.toUpperCase().includes(title.toUpperCase()));
        return needsDeptApproval || needsTitleApproval;
    }
    getNextSteps(user) {
        const steps = [];
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
    async checkAvailability(field, value) {
        const user = await this.userRepository.findOne({
            where: { [field]: value },
        });
        return {
            available: !user,
        };
    }
    async suggestEmployeeId(department = 'IT') {
        return this.employeeIdGenerator.generateEmployeeId(department);
    }
};
RegisterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(mfa_setting_entity_1.MfaSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        validation_service_1.ValidationService,
        employee_id_generator_service_1.EmployeeIdGeneratorService])
], RegisterService);
exports.RegisterService = RegisterService;
//# sourceMappingURL=register.service.js.map