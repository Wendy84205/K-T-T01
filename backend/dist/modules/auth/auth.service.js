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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../database/entities/core/user.entity");
const mfa_setting_entity_1 = require("../../database/entities/auth/mfa-setting.entity");
let AuthService = class AuthService {
    constructor(userRepository, mfaSettingRepository, jwtService) {
        this.userRepository = userRepository;
        this.mfaSettingRepository = mfaSettingRepository;
        this.jwtService = jwtService;
    }
    async validateUser(identifier, password) {
        const user = await this.userRepository.findOne({
            where: [
                { email: identifier, isActive: true },
                { username: identifier, isActive: true }
            ],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.isLocked) {
            if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
                const remainingMinutes = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / (1000 * 60));
                throw new common_1.UnauthorizedException(`Account is locked. Try again in ${remainingMinutes} minutes`);
            }
            else {
                user.isLocked = false;
                user.accountLockedUntil = null;
                user.lockReason = null;
                await this.userRepository.save(user);
            }
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            user.failedLoginAttempts += 1;
            user.lastFailedLogin = new Date();
            if (user.failedLoginAttempts >= 5) {
                user.isLocked = true;
                user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
                user.lockReason = 'Too many failed login attempts';
            }
            await this.userRepository.save(user);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.failedLoginAttempts = 0;
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
        return user;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const mfaSettings = await this.mfaSettingRepository.findOne({
            where: { userId: user.id }
        });
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            employeeId: user.employeeId,
            securityLevel: user.securityClearanceLevel,
            mfaRequired: user.mfaRequired,
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '24h',
        });
        const mfaVerified = user.mfaRequired ?
            !!((mfaSettings?.emailMfaEnabled && mfaSettings?.emailVerifiedAt) ||
                (mfaSettings?.totpEnabled && mfaSettings?.totpVerifiedAt) ||
                (mfaSettings?.smsMfaEnabled && mfaSettings?.smsVerifiedAt)) : true;
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
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.userRepository.findOne({
                where: { id: payload.sub, isActive: true }
            });
            if (!user) {
                return { valid: false, error: 'User not found or inactive' };
            }
            return { valid: true, payload };
        }
        catch (err) {
            return { valid: false, error: err?.message ?? 'Invalid token' };
        }
    }
    async getUserProfile(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, isActive: true },
            select: [
                'id', 'username', 'email', 'firstName', 'lastName',
                'employeeId', 'department', 'jobTitle', 'phone',
                'mfaRequired', 'securityClearanceLevel', 'createdAt'
            ]
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async refreshToken(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, isActive: true }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(mfa_setting_entity_1.MfaSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map