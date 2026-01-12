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
exports.SecurityAlert = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
let SecurityAlert = class SecurityAlert {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SecurityAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alert_type', length: 50 }),
    __metadata("design:type", String)
], SecurityAlert.prototype, "alertType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'MEDIUM' }),
    __metadata("design:type", String)
], SecurityAlert.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], SecurityAlert.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SecurityAlert.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'affected_users', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], SecurityAlert.prototype, "affectedUsers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'affected_resources', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SecurityAlert.prototype, "affectedResources", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'ACTIVE' }),
    __metadata("design:type", String)
], SecurityAlert.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'acknowledged_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], SecurityAlert.prototype, "acknowledgedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'acknowledged_at', nullable: true }),
    __metadata("design:type", Date)
], SecurityAlert.prototype, "acknowledgedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], SecurityAlert.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_at', nullable: true }),
    __metadata("design:type", Date)
], SecurityAlert.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SecurityAlert.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SecurityAlert.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'acknowledged_by' }),
    __metadata("design:type", user_entity_1.User)
], SecurityAlert.prototype, "acknowledger", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'resolved_by' }),
    __metadata("design:type", user_entity_1.User)
], SecurityAlert.prototype, "resolver", void 0);
SecurityAlert = __decorate([
    (0, typeorm_1.Entity)('security_alerts')
], SecurityAlert);
exports.SecurityAlert = SecurityAlert;
//# sourceMappingURL=security-alert.entity.js.map