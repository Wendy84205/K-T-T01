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
exports.ManagerProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
let ManagerProfile = class ManagerProfile {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ManagerProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36, unique: true }),
    __metadata("design:type", String)
], ManagerProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_level', length: 50, nullable: true }),
    __metadata("design:type", String)
], ManagerProfile.prototype, "managerLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_team_size', type: 'int', default: 20 }),
    __metadata("design:type", Number)
], ManagerProfile.prototype, "maxTeamSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'can_hire', default: false }),
    __metadata("design:type", Boolean)
], ManagerProfile.prototype, "canHire", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'can_fire', default: false }),
    __metadata("design:type", Boolean)
], ManagerProfile.prototype, "canFire", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'can_approve_security', default: false }),
    __metadata("design:type", Boolean)
], ManagerProfile.prototype, "canApproveSecurity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_authority', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ManagerProfile.prototype, "budgetAuthority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reporting_to', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], ManagerProfile.prototype, "reportingTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ManagerProfile.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'management_start_date', type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], ManagerProfile.prototype, "managementStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'management_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ManagerProfile.prototype, "managementEndDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ManagerProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ManagerProfile.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ManagerProfile.prototype, "user", void 0);
ManagerProfile = __decorate([
    (0, typeorm_1.Entity)('manager_profiles')
], ManagerProfile);
exports.ManagerProfile = ManagerProfile;
//# sourceMappingURL=manager-profile.entity.js.map