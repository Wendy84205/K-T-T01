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
exports.FileIntegrityLog = void 0;
const typeorm_1 = require("typeorm");
const file_entity_1 = require("./file.entity");
let FileIntegrityLog = class FileIntegrityLog {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FileIntegrityLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], FileIntegrityLog.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_hash', length: 64 }),
    __metadata("design:type", String)
], FileIntegrityLog.prototype, "originalHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_hash', length: 64 }),
    __metadata("design:type", String)
], FileIntegrityLog.prototype, "currentHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_verified_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], FileIntegrityLog.prototype, "lastVerifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verification_result', length: 20, default: 'VALID' }),
    __metadata("design:type", String)
], FileIntegrityLog.prototype, "verificationResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tampering_detected_at', nullable: true }),
    __metadata("design:type", Date)
], FileIntegrityLog.prototype, "tamperingDetectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tampering_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], FileIntegrityLog.prototype, "tamperingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tampering_details', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], FileIntegrityLog.prototype, "tamperingDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_to', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], FileIntegrityLog.prototype, "reportedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_at', nullable: true }),
    __metadata("design:type", Date)
], FileIntegrityLog.prototype, "reportedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_taken', length: 100, nullable: true }),
    __metadata("design:type", String)
], FileIntegrityLog.prototype, "actionTaken", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FileIntegrityLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FileIntegrityLog.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => file_entity_1.File, file => file.id),
    (0, typeorm_1.JoinColumn)({ name: 'file_id' }),
    __metadata("design:type", file_entity_1.File)
], FileIntegrityLog.prototype, "file", void 0);
FileIntegrityLog = __decorate([
    (0, typeorm_1.Entity)('file_integrity_logs')
], FileIntegrityLog);
exports.FileIntegrityLog = FileIntegrityLog;
//# sourceMappingURL=file-integrity.entity.js.map