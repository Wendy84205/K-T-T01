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
exports.AccessRequest = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
let AccessRequest = class AccessRequest {
};
exports.AccessRequest = AccessRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AccessRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], AccessRequest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resource_type', length: 50 }),
    __metadata("design:type", String)
], AccessRequest.prototype, "resourceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resource_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], AccessRequest.prototype, "resourceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_permission', length: 50 }),
    __metadata("design:type", String)
], AccessRequest.prototype, "requestedPermission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45 }),
    __metadata("design:type", String)
], AccessRequest.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'device_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], AccessRequest.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], AccessRequest.prototype, "locationData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_score', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AccessRequest.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_factors', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], AccessRequest.prototype, "riskFactors", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'PENDING' }),
    __metadata("design:type", String)
], AccessRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approver_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], AccessRequest.prototype, "approverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_at', nullable: true }),
    __metadata("design:type", Date)
], AccessRequest.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AccessRequest.prototype, "approvalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_justification', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AccessRequest.prototype, "businessJustification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_minutes', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AccessRequest.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], AccessRequest.prototype, "requestedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', nullable: true }),
    __metadata("design:type", Date)
], AccessRequest.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accessed_at', nullable: true }),
    __metadata("design:type", Date)
], AccessRequest.prototype, "accessedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AccessRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], AccessRequest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approver_id' }),
    __metadata("design:type", user_entity_1.User)
], AccessRequest.prototype, "approver", void 0);
exports.AccessRequest = AccessRequest = __decorate([
    (0, typeorm_1.Entity)('access_requests')
], AccessRequest);
//# sourceMappingURL=access-request.entity.js.map