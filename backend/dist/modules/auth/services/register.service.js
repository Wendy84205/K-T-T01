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
let RegisterService = class RegisterService {
    constructor(userRepository, mfaSettingRepository) {
        this.userRepository = userRepository;
        this.mfaSettingRepository = mfaSettingRepository;
    }
    async register(registerDto) {
        this.validateRegistrationInput(registerDto);
        await this.checkExistingUser(registerDto);
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
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
        let savedUser;
        try {
            savedUser = await this.userRepository.save(user);
        }
        catch (error) {
            console.error('Registration error:', error);
            throw new common_1.InternalServerErrorException('Failed to create account');
        }
        await this.createMfaSettings(savedUser.id, registerDto.mfaRequired);
        return this.buildRegisterResponse(savedUser);
    }
    validateRegistrationInput(dto) {
        const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || [];
        if (allowedDomains.length > 0) {
            const emailDomain = dto.email.split('@')[1];
            if (!allowedDomains.includes(emailDomain)) {
                throw new common_1.BadRequestException(`Email domain @${emailDomain} is not allowed`);
            }
        }
        if (dto.username.length > 50) {
            throw new common_1.BadRequestException('Username must be less than 50 characters');
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
    buildRegisterResponse(user) {
        const response = new register_response_dto_1.RegisterResponseDto();
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
    requiresManagerApproval(user) {
        return user.department === 'IT' || user.jobTitle?.includes('Manager');
    }
    getNextSteps(user) {
        const steps = [];
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
    async checkAvailability(field, value) {
        const user = await this.userRepository.findOne({
            where: { [field]: value },
        });
        return {
            available: !user,
        };
    }
};
RegisterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(mfa_setting_entity_1.MfaSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RegisterService);
exports.RegisterService = RegisterService;
//# sourceMappingURL=register.service.js.map