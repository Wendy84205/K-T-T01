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
exports.FailedLoginAttempt = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
let FailedLoginAttempt = class FailedLoginAttempt {
};
exports.FailedLoginAttempt = FailedLoginAttempt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FailedLoginAttempt.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], FailedLoginAttempt.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], FailedLoginAttempt.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45 }),
    __metadata("design:type", String)
], FailedLoginAttempt.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], FailedLoginAttempt.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attempt_time', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], FailedLoginAttempt.prototype, "attemptTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_successful', default: false }),
    __metadata("design:type", Boolean)
], FailedLoginAttempt.prototype, "isSuccessful", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_suspicious', default: false }),
    __metadata("design:type", Boolean)
], FailedLoginAttempt.prototype, "isSuspicious", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'suspicious_reason', length: 100, nullable: true }),
    __metadata("design:type", String)
], FailedLoginAttempt.prototype, "suspiciousReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blocked_until', nullable: true }),
    __metadata("design:type", Date)
], FailedLoginAttempt.prototype, "blockedUntil", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FailedLoginAttempt.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], FailedLoginAttempt.prototype, "user", void 0);
exports.FailedLoginAttempt = FailedLoginAttempt = __decorate([
    (0, typeorm_1.Entity)('failed_login_attempts')
], FailedLoginAttempt);
//# sourceMappingURL=failed-login.entity.js.map