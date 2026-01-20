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
exports.ConversationMember = void 0;
const typeorm_1 = require("typeorm");
const conversation_entity_1 = require("./conversation.entity");
const user_entity_1 = require("../core/user.entity");
let ConversationMember = class ConversationMember {
};
exports.ConversationMember = ConversationMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConversationMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversation_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], ConversationMember.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], ConversationMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'member' }),
    __metadata("design:type", String)
], ConversationMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encryption_key_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], ConversationMember.prototype, "encryptionKeyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_muted', default: false }),
    __metadata("design:type", Boolean)
], ConversationMember.prototype, "isMuted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_pinned', default: false }),
    __metadata("design:type", Boolean)
], ConversationMember.prototype, "isPinned", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'joined_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], ConversationMember.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'left_at', nullable: true }),
    __metadata("design:type", Date)
], ConversationMember.prototype, "leftAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConversationMember.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conversation_entity_1.Conversation, conversation => conversation.id),
    (0, typeorm_1.JoinColumn)({ name: 'conversation_id' }),
    __metadata("design:type", conversation_entity_1.Conversation)
], ConversationMember.prototype, "conversation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ConversationMember.prototype, "user", void 0);
exports.ConversationMember = ConversationMember = __decorate([
    (0, typeorm_1.Entity)('conversation_members')
], ConversationMember);
//# sourceMappingURL=conversation-member.entity.js.map