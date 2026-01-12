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
exports.SensitiveOperation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
let SensitiveOperation = class SensitiveOperation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'operation_type', length: 50 }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "operationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45 }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_entity_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "targetEntityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_entity_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "targetEntityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "justification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_required', default: true }),
    __metadata("design:type", Boolean)
], SensitiveOperation.prototype, "approvalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_at', nullable: true }),
    __metadata("design:type", Date)
], SensitiveOperation.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'operation_result', length: 20, nullable: true }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "operationResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SensitiveOperation.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SensitiveOperation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], SensitiveOperation.prototype, "user", void 0);
SensitiveOperation = __decorate([
    (0, typeorm_1.Entity)('sensitive_operations_log')
], SensitiveOperation);
exports.SensitiveOperation = SensitiveOperation;
//# sourceMappingURL=sensitive-operation.entity.js.map