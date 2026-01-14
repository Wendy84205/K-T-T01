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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("../team-collaboration/team.entity");
let User = User_1 = class User {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 255 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avatar_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', length: 50, unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_title', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hire_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "hireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mfa_required', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "mfaRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_password_change', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], User.prototype, "lastPasswordChange", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_locked_until', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "accountLockedUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lock_reason', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lockReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'security_clearance_level', type: 'tinyint', default: 1 }),
    __metadata("design:type", Number)
], User.prototype, "securityClearanceLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_email_verified', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_locked', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isLocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login_at', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_login_attempts', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "failedLoginAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_failed_login', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastFailedLogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_team_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "primaryTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", User)
], User.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'primary_team_id' }),
    __metadata("design:type", team_entity_1.Team)
], User.prototype, "primaryTeam", void 0);
User = User_1 = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map