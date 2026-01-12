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
exports.TeamMember = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("./team.entity");
const user_entity_1 = require("../core/user.entity");
let TeamMember = class TeamMember {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TeamMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], TeamMember.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], TeamMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role_in_team', length: 50, default: 'member' }),
    __metadata("design:type", String)
], TeamMember.prototype, "roleInTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'security_clearance', type: 'tinyint', default: 2 }),
    __metadata("design:type", Number)
], TeamMember.prototype, "securityClearance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'joined_date', type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], TeamMember.prototype, "joinedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'left_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], TeamMember.prototype, "leftDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'added_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], TeamMember.prototype, "addedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_security_training', default: false }),
    __metadata("design:type", Boolean)
], TeamMember.prototype, "requiresSecurityTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_completed_at', nullable: true }),
    __metadata("design:type", Date)
], TeamMember.prototype, "trainingCompletedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TeamMember.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, team => team.id),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], TeamMember.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], TeamMember.prototype, "user", void 0);
TeamMember = __decorate([
    (0, typeorm_1.Entity)('team_members')
], TeamMember);
exports.TeamMember = TeamMember;
//# sourceMappingURL=team-member.entity.js.map