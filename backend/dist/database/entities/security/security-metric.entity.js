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
exports.SecurityMetric = void 0;
const typeorm_1 = require("typeorm");
let SecurityMetric = class SecurityMetric {
};
exports.SecurityMetric = SecurityMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SecurityMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metric_date', type: 'date' }),
    __metadata("design:type", Date)
], SecurityMetric.prototype, "metricDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metric_type', length: 50 }),
    __metadata("design:type", String)
], SecurityMetric.prototype, "metricType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SecurityMetric.prototype, "totalCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'success_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SecurityMetric.prototype, "successCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failure_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SecurityMetric.prototype, "failureCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: () => "'{}'" }),
    __metadata("design:type", Object)
], SecurityMetric.prototype, "breakdown", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SecurityMetric.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SecurityMetric.prototype, "updatedAt", void 0);
exports.SecurityMetric = SecurityMetric = __decorate([
    (0, typeorm_1.Entity)('security_metrics')
], SecurityMetric);
//# sourceMappingURL=security-metric.entity.js.map