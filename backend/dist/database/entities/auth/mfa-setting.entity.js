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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaSetting = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
let MfaSetting = class MfaSetting {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MfaSetting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36, unique: true }),
    __metadata("design:type", String)
], MfaSetting.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'totp_enabled', default: false }),
    __metadata("design:type", Boolean)
], MfaSetting.prototype, "totpEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'totp_secret', length: 100, nullable: true }),
    __metadata("design:type", String)
], MfaSetting.prototype, "totpSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'totp_backup_codes', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], MfaSetting.prototype, "totpBackupCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'totp_verified_at', nullable: true }),
    __metadata("design:type", Date)
], MfaSetting.prototype, "totpVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sms_mfa_enabled', default: false }),
    __metadata("design:type", Boolean)
], MfaSetting.prototype, "smsMfaEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], MfaSetting.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sms_verified_at', nullable: true }),
    __metadata("design:type", Date)
], MfaSetting.prototype, "smsVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_mfa_enabled', default: false }),
    __metadata("design:type", Boolean)
], MfaSetting.prototype, "emailMfaEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_verified_at', nullable: true }),
    __metadata("design:type", Date)
], MfaSetting.prototype, "emailVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recovery_email', length: 255, nullable: true }),
    __metadata("design:type", String)
], MfaSetting.prototype, "recoveryEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_mfa_used', length: 20, nullable: true }),
    __metadata("design:type", String)
], MfaSetting.prototype, "lastMfaUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mfa_failed_attempts', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MfaSetting.prototype, "mfaFailedAttempts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MfaSetting.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MfaSetting.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MfaSetting.prototype, "user", void 0);
MfaSetting = __decorate([
    (0, typeorm_1.Entity)('mfa_settings')
], MfaSetting);
exports.MfaSetting = MfaSetting;
//# sourceMappingURL=mfa-setting.entity.js.map