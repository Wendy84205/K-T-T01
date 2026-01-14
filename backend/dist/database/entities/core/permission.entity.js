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
exports.Permission = void 0;
const typeorm_1 = require("typeorm");
let Permission = class Permission {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Permission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Permission.prototype, "resource", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Permission.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_role_level', type: 'int', default: 10 }),
    __metadata("design:type", Number)
], Permission.prototype, "minRoleLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_security_level', type: 'tinyint', default: 1 }),
    __metadata("design:type", Number)
], Permission.prototype, "minSecurityLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_mfa', default: false }),
    __metadata("design:type", Boolean)
], Permission.prototype, "requiresMfa", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Permission.prototype, "createdAt", void 0);
Permission = __decorate([
    (0, typeorm_1.Entity)('permissions')
], Permission);
exports.Permission = Permission;
//# sourceMappingURL=permission.entity.js.map