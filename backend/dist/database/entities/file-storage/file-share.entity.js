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
exports.FileShare = void 0;
const typeorm_1 = require("typeorm");
const file_entity_1 = require("./file.entity");
let FileShare = class FileShare {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FileShare.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], FileShare.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shared_with_type', length: 10 }),
    __metadata("design:type", String)
], FileShare.prototype, "sharedWithType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shared_with_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], FileShare.prototype, "sharedWithId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'permission_level', length: 20, default: 'view' }),
    __metadata("design:type", String)
], FileShare.prototype, "permissionLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encryption_key_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], FileShare.prototype, "encryptionKeyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'share_token', length: 100, unique: true, nullable: true }),
    __metadata("design:type", String)
], FileShare.prototype, "shareToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], FileShare.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', nullable: true }),
    __metadata("design:type", Date)
], FileShare.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'download_limit', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], FileShare.prototype, "downloadLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'watermark_enabled', default: false }),
    __metadata("design:type", Boolean)
], FileShare.prototype, "watermarkEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shared_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], FileShare.prototype, "sharedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shared_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], FileShare.prototype, "sharedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FileShare.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => file_entity_1.File, file => file.id),
    (0, typeorm_1.JoinColumn)({ name: 'file_id' }),
    __metadata("design:type", file_entity_1.File)
], FileShare.prototype, "file", void 0);
FileShare = __decorate([
    (0, typeorm_1.Entity)('file_shares')
], FileShare);
exports.FileShare = FileShare;
//# sourceMappingURL=file-share.entity.js.map