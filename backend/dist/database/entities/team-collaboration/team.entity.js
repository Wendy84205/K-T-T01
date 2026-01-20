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
exports.Team = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
const team_member_entity_1 = require("./team-member.entity");
let Team = class Team {
};
exports.Team = Team;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Team.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Team.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    __metadata("design:type", String)
], Team.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_security_level', type: 'tinyint', default: 2 }),
    __metadata("design:type", Number)
], Team.prototype, "defaultSecurityLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_mfa', default: true }),
    __metadata("design:type", Boolean)
], Team.prototype, "requiresMfa", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encryption_required', default: true }),
    __metadata("design:type", Boolean)
], Team.prototype, "encryptionRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_members', type: 'int', default: 50 }),
    __metadata("design:type", Number)
], Team.prototype, "maxMembers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'storage_quota_mb', type: 'int', default: 1024 }),
    __metadata("design:type", Number)
], Team.prototype, "storageQuotaMb", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size_limit_mb', type: 'int', default: 100 }),
    __metadata("design:type", Number)
], Team.prototype, "fileSizeLimitMb", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Team.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', default: false }),
    __metadata("design:type", Boolean)
], Team.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Team.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Team.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], Team.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_team_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "parentTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", user_entity_1.User)
], Team.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Team, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_team_id' }),
    __metadata("design:type", Team)
], Team.prototype, "parentTeam", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_member_entity_1.TeamMember, teamMember => teamMember.team),
    __metadata("design:type", Array)
], Team.prototype, "members", void 0);
exports.Team = Team = __decorate([
    (0, typeorm_1.Entity)('teams')
], Team);
//# sourceMappingURL=team.entity.js.map