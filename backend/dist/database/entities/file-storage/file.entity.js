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
exports.File = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
const folder_entity_1 = require("./folder.entity");
const team_entity_1 = require("./../team-collaboration/team.entity");
let File = class File {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], File.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], File.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], File.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], File.prototype, "extension", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', length: 100, nullable: true }),
    __metadata("design:type", String)
], File.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'size_bytes', type: 'bigint' }),
    __metadata("design:type", Number)
], File.prototype, "sizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'storage_path', length: 500 }),
    __metadata("design:type", String)
], File.prototype, "storagePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encrypted_storage_path', length: 500, nullable: true }),
    __metadata("design:type", String)
], File.prototype, "encryptedStoragePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'storage_provider', length: 50, default: 'local' }),
    __metadata("design:type", String)
], File.prototype, "storageProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], File.prototype, "checksum", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_hash', length: 64 }),
    __metadata("design:type", String)
], File.prototype, "fileHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hash_algorithm', length: 20, default: 'SHA-256' }),
    __metadata("design:type", String)
], File.prototype, "hashAlgorithm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encryption_key_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], File.prototype, "encryptionKeyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_encrypted', default: true }),
    __metadata("design:type", Boolean)
], File.prototype, "isEncrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_hash_verification', nullable: true }),
    __metadata("design:type", Date)
], File.prototype, "lastHashVerification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'virus_scan_status', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], File.prototype, "virusScanStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'virus_scan_result', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], File.prototype, "virusScanResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scanned_at', nullable: true }),
    __metadata("design:type", Date)
], File.prototype, "scannedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], File.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'folder_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], File.prototype, "folderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], File.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', default: false }),
    __metadata("design:type", Boolean)
], File.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_approved', default: false }),
    __metadata("design:type", Boolean)
], File.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_status', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], File.prototype, "approvalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], File.prototype, "approvalBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_at', nullable: true }),
    __metadata("design:type", Date)
], File.prototype, "approvalAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'version_number', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], File.prototype, "versionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_latest_version', default: true }),
    __metadata("design:type", Boolean)
], File.prototype, "isLatestVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'share_token', length: 100, unique: true, nullable: true }),
    __metadata("design:type", String)
], File.prototype, "shareToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: () => "'{}'" }),
    __metadata("design:type", Object)
], File.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Date)
], File.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], File.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], File.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", user_entity_1.User)
], File.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => folder_entity_1.Folder, folder => folder.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'folder_id' }),
    __metadata("design:type", folder_entity_1.Folder)
], File.prototype, "folder", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, team => team.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], File.prototype, "team", void 0);
File = __decorate([
    (0, typeorm_1.Entity)('files')
], File);
exports.File = File;
//# sourceMappingURL=file.entity.js.map