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
exports.Folder = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
const team_entity_1 = require("../team-collaboration/team.entity");
let Folder = class Folder {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Folder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Folder.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_folder_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], Folder.prototype, "parentFolderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], Folder.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], Folder.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', default: false }),
    __metadata("design:type", Boolean)
], Folder.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_level', length: 20, default: 'private' }),
    __metadata("design:type", String)
], Folder.prototype, "accessLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encryption_required', default: true }),
    __metadata("design:type", Boolean)
], Folder.prototype, "encryptionRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_encryption_key_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], Folder.prototype, "defaultEncryptionKeyId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Folder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Folder.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", user_entity_1.User)
], Folder.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, team => team.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], Folder.prototype, "team", void 0);
Folder = __decorate([
    (0, typeorm_1.Entity)('folders')
], Folder);
exports.Folder = Folder;
//# sourceMappingURL=folder.entity.js.map