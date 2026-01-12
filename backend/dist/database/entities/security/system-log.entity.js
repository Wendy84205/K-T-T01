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
exports.SystemLog = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../core/user.entity");
let SystemLog = class SystemLog {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SystemLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], SystemLog.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], SystemLog.prototype, "component", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SystemLog.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stack_trace', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SystemLog.prototype, "stackTrace", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'request_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], SystemLog.prototype, "requestId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36, nullable: true }),
    __metadata("design:type", String)
], SystemLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45, nullable: true }),
    __metadata("design:type", String)
], SystemLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SystemLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], SystemLog.prototype, "user", void 0);
SystemLog = __decorate([
    (0, typeorm_1.Entity)('system_logs')
], SystemLog);
exports.SystemLog = SystemLog;
//# sourceMappingURL=system-log.entity.js.map