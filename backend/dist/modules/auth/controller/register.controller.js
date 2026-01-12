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
exports.RegisterController = void 0;
const common_1 = require("@nestjs/common");
const register_service_1 = require("../services/register.service");
const register_dto_1 = require("../dto/register.dto");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
let RegisterController = class RegisterController {
    constructor(registerService) {
        this.registerService = registerService;
    }
    async register(registerDto) {
        return await this.registerService.register(registerDto);
    }
    async checkAvailability(field, value) {
        return this.registerService.checkAvailability(field, value);
    }
    async getRequirements() {
        return {
            passwordRequirements: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                specialChars: '@$!%*?&',
            },
            usernameRequirements: {
                minLength: 3,
                maxLength: 50,
                allowedChars: 'a-zA-Z0-9_',
            },
            mfaRequired: process.env.MFA_REQUIRED === 'true',
            allowedEmailDomains: process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || [],
        };
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], RegisterController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('check-availability'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RegisterController.prototype, "checkAvailability", null);
__decorate([
    (0, common_1.Get)('requirements'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RegisterController.prototype, "getRequirements", null);
RegisterController = __decorate([
    (0, common_1.Controller)('auth/register'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [register_service_1.RegisterService])
], RegisterController);
exports.RegisterController = RegisterController;
//# sourceMappingURL=register.controller.js.map