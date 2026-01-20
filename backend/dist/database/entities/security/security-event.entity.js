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
exports.SecurityEvent = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
let SecurityEvent = class SecurityEvent {
};
exports.SecurityEvent = SecurityEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SecurityEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_type', length: 50 }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'MEDIUM' }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'device_fingerprint', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "deviceFingerprint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: () => "'{}'" }),
    __metadata("design:type", Object)
], SecurityEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detected_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "detectedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detection_rules', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SecurityEvent.prototype, "detectionRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_investigated', default: false }),
    __metadata("design:type", Boolean)
], SecurityEvent.prototype, "isInvestigated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'investigation_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "investigationNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'investigation_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "investigationBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'investigation_at', nullable: true }),
    __metadata("design:type", Date)
], SecurityEvent.prototype, "investigationAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_at', nullable: true }),
    __metadata("design:type", Date)
], SecurityEvent.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SecurityEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], SecurityEvent.prototype, "user", void 0);
exports.SecurityEvent = SecurityEvent = __decorate([
    (0, typeorm_1.Entity)('security_events')
], SecurityEvent);
//# sourceMappingURL=security-event.entity.js.map