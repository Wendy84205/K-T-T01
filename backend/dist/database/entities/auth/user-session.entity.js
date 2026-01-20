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
exports.UserSession = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
let UserSession = class UserSession {
};
exports.UserSession = UserSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], UserSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_token', length: 512, unique: true }),
    __metadata("design:type", String)
], UserSession.prototype, "sessionToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_token', length: 512, unique: true, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'device_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'device_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "deviceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'device_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "deviceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'device_fingerprint', type: 'text', nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "deviceFingerprint", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "os", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "browser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'browser_fingerprint', type: 'text', nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "browserFingerprint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45 }),
    __metadata("design:type", String)
], UserSession.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'country_code', length: 2, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "countryCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_vpn', default: false }),
    __metadata("design:type", Boolean)
], UserSession.prototype, "isVpn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_trusted', default: false }),
    __metadata("design:type", Boolean)
], UserSession.prototype, "isTrusted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_mfa', default: true }),
    __metadata("design:type", Boolean)
], UserSession.prototype, "requiresMfa", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_score', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], UserSession.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_factors', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UserSession.prototype, "riskFactors", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issued_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserSession.prototype, "issuedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_accessed_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserSession.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at' }),
    __metadata("design:type", Date)
], UserSession.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revoked_at', nullable: true }),
    __metadata("design:type", Date)
], UserSession.prototype, "revokedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revoked_reason', length: 100, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "revokedReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revoked_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "revokedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserSession.prototype, "user", void 0);
exports.UserSession = UserSession = __decorate([
    (0, typeorm_1.Entity)('user_sessions')
], UserSession);
//# sourceMappingURL=user-session.entity.js.map