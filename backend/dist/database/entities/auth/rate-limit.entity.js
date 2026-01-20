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
exports.RateLimit = void 0;
const typeorm_1 = require("typeorm");
let RateLimit = class RateLimit {
};
exports.RateLimit = RateLimit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RateLimit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], RateLimit.prototype, "identifier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bucket_type', length: 50 }),
    __metadata("design:type", String)
], RateLimit.prototype, "bucketType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'request_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RateLimit.prototype, "requestCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'limit_value', type: 'int' }),
    __metadata("design:type", Number)
], RateLimit.prototype, "limitValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'time_window', type: 'int' }),
    __metadata("design:type", Number)
], RateLimit.prototype, "timeWindow", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_blocked', default: false }),
    __metadata("design:type", Boolean)
], RateLimit.prototype, "isBlocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'block_reason', length: 100, nullable: true }),
    __metadata("design:type", String)
], RateLimit.prototype, "blockReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blocked_until', nullable: true }),
    __metadata("design:type", Date)
], RateLimit.prototype, "blockedUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_request_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RateLimit.prototype, "firstRequestAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_request_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RateLimit.prototype, "lastRequestAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RateLimit.prototype, "createdAt", void 0);
exports.RateLimit = RateLimit = __decorate([
    (0, typeorm_1.Entity)('rate_limits')
], RateLimit);
//# sourceMappingURL=rate-limit.entity.js.map