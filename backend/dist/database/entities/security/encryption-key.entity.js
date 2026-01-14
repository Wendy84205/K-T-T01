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
exports.EncryptionKey = void 0;
const typeorm_1 = require("typeorm");
let EncryptionKey = class EncryptionKey {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EncryptionKey.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_type', length: 50 }),
    __metadata("design:type", String)
], EncryptionKey.prototype, "keyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_name', length: 100 }),
    __metadata("design:type", String)
], EncryptionKey.prototype, "keyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encrypted_key', type: 'text' }),
    __metadata("design:type", String)
], EncryptionKey.prototype, "encryptedKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_algorithm', length: 50, default: 'AES-256-GCM' }),
    __metadata("design:type", String)
], EncryptionKey.prototype, "keyAlgorithm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_version', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], EncryptionKey.prototype, "keyVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_owner_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], EncryptionKey.prototype, "keyOwnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_scope', length: 50, nullable: true }),
    __metadata("design:type", String)
], EncryptionKey.prototype, "keyScope", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scope_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], EncryptionKey.prototype, "scopeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], EncryptionKey.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_date', type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], EncryptionKey.prototype, "createdDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rotation_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EncryptionKey.prototype, "rotationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_rotation_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EncryptionKey.prototype, "nextRotationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', nullable: true }),
    __metadata("design:type", Date)
], EncryptionKey.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], EncryptionKey.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EncryptionKey.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revoked_at', nullable: true }),
    __metadata("design:type", Date)
], EncryptionKey.prototype, "revokedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revoked_by', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], EncryptionKey.prototype, "revokedBy", void 0);
EncryptionKey = __decorate([
    (0, typeorm_1.Entity)('encryption_keys')
], EncryptionKey);
exports.EncryptionKey = EncryptionKey;
//# sourceMappingURL=encryption-key.entity.js.map