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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeIdGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../../database/entities/core/user.entity");
let EmployeeIdGeneratorService = class EmployeeIdGeneratorService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async generateEmployeeId(department = 'IT') {
        const currentYear = new Date().getFullYear();
        const departmentMap = {
            'IT': 'IT',
            'SECURITY': 'SEC',
            'HR': 'HR',
            'FINANCE': 'FIN',
            'OPERATIONS': 'OPS',
            'SALES': 'SAL',
            'MARKETING': 'MKT',
            'DEVELOPMENT': 'DEV',
            'GENERAL': 'GEN',
        };
        const deptCode = departmentMap[department.toUpperCase()] || 'GEN';
        const prefix = `EMP${currentYear}-${deptCode}`;
        const latestEmployee = await this.userRepository
            .createQueryBuilder('user')
            .where('user.employeeId LIKE :prefix', { prefix: `${prefix}%` })
            .orderBy('user.employeeId', 'DESC')
            .getOne();
        let nextNumber = 1;
        if (latestEmployee && latestEmployee.employeeId) {
            const lastId = latestEmployee.employeeId;
            const match = lastId.match(new RegExp(`^${prefix}(\\d+)$`));
            if (match && match[1]) {
                const lastNumber = parseInt(match[1], 10);
                nextNumber = lastNumber + 1;
            }
        }
        const sequentialNumber = nextNumber.toString().padStart(3, '0');
        const employeeId = `${prefix}${sequentialNumber}`;
        const exists = await this.userRepository.findOne({
            where: { employeeId }
        });
        if (exists) {
            return this.generateEmployeeId(department);
        }
        return employeeId;
    }
    validateEmployeeIdFormat(employeeId) {
        const regex = /^EMP\d{4}-(IT|SEC|HR|FIN|OPS|SAL|MKT|DEV|GEN)\d{3}$/;
        return regex.test(employeeId);
    }
    getDepartmentFromEmployeeId(employeeId) {
        const match = employeeId.match(/^EMP\d{4}-([A-Z]{2,3})\d{3}$/);
        if (!match)
            return null;
        const deptCode = match[1];
        const codeMap = {
            'IT': 'IT',
            'SEC': 'SECURITY',
            'HR': 'HR',
            'FIN': 'FINANCE',
            'OPS': 'OPERATIONS',
            'SAL': 'SALES',
            'MKT': 'MARKETING',
            'DEV': 'DEVELOPMENT',
            'GEN': 'GENERAL',
        };
        return codeMap[deptCode] || null;
    }
};
exports.EmployeeIdGeneratorService = EmployeeIdGeneratorService;
exports.EmployeeIdGeneratorService = EmployeeIdGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmployeeIdGeneratorService);
//# sourceMappingURL=employee-id-generator.service.js.map