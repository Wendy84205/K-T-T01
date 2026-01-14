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
exports.Conversation = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("../team-collaboration/team.entity");
const user_entity_1 = require("../core/user.entity");
let Conversation = class Conversation {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avatar_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversation_type', length: 20, default: 'direct' }),
    __metadata("design:type", String)
], Conversation.prototype, "conversationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_private', default: true }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isPrivate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encryption_required', default: true }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "encryptionRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_encryption_key_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "defaultEncryptionKeyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_message_at', nullable: true }),
    __metadata("design:type", Date)
], Conversation.prototype, "lastMessageAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Conversation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Conversation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, team => team.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], Conversation.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Conversation.prototype, "creator", void 0);
Conversation = __decorate([
    (0, typeorm_1.Entity)('conversations')
], Conversation);
exports.Conversation = Conversation;
//# sourceMappingURL=conversation.entity.js.map