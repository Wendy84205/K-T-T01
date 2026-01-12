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
exports.FileVersion = void 0;
const typeorm_1 = require("typeorm");
const file_entity_1 = require("./file.entity");
let FileVersion = class FileVersion {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FileVersion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], FileVersion.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'version_number', type: 'int' }),
    __metadata("design:type", Number)
], FileVersion.prototype, "versionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'storage_path', length: 500 }),
    __metadata("design:type", String)
], FileVersion.prototype, "storagePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'size_bytes', type: 'bigint' }),
    __metadata("design:type", Number)
], FileVersion.prototype, "sizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_hash', length: 64, nullable: true }),
    __metadata("design:type", String)
], FileVersion.prototype, "fileHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encryption_key_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], FileVersion.prototype, "encryptionKeyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changes_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], FileVersion.prototype, "changesDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], FileVersion.prototype, "changedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FileVersion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => file_entity_1.File, file => file.id),
    (0, typeorm_1.JoinColumn)({ name: 'file_id' }),
    __metadata("design:type", file_entity_1.File)
], FileVersion.prototype, "file", void 0);
FileVersion = __decorate([
    (0, typeorm_1.Entity)('file_versions')
], FileVersion);
exports.FileVersion = FileVersion;
//# sourceMappingURL=file-version.entity.js.map