"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
let ValidationService = class ValidationService {
    validateEmployeeId(employeeId) {
        if (!employeeId || employeeId.trim() === '') {
            throw new common_1.BadRequestException('Employee ID is required');
        }
        const formattedId = employeeId.toUpperCase().trim();
        const employeeRegex = /^EMP\d{4}-(IT|SEC|HR|FIN|OPS|SAL|MKT|DEV|GEN)\d{3}$/;
        const adminRegex = /^ADM\d{3}$/;
        if (!employeeRegex.test(formattedId) && !adminRegex.test(formattedId)) {
            throw new common_1.BadRequestException('Employee ID must be either:\n' +
                '- EMP{YYYY}-{DEPT}{###} (e.g., EMP2024-IT001, EMP2024-SEC001)\n' +
                '- ADM{###} (e.g., ADM001, ADM002)');
        }
        return formattedId;
    }
    validateDepartment(department) {
        const validDepartments = [
            'IT', 'SECURITY', 'HR', 'FINANCE',
            'OPERATIONS', 'SALES', 'MARKETING', 'DEVELOPMENT'
        ];
        if (!department) {
            return 'IT';
        }
        const formattedDept = department.toUpperCase();
        if (!validDepartments.map(d => d.toUpperCase()).includes(formattedDept)) {
            throw new common_1.BadRequestException(`Invalid department. Must be one of: ${validDepartments.join(', ')}`);
        }
        return formattedDept;
    }
    validateEmail(email) {
        if (!email || email.trim() === '') {
            throw new common_1.BadRequestException('Email is required');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new common_1.BadRequestException('Invalid email format');
        }
        const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || ['company.com'];
        const domain = email.split('@')[1];
        if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
            throw new common_1.BadRequestException(`Email domain @${domain} is not allowed`);
        }
        return email.toLowerCase().trim();
    }
    validatePassword(password) {
        if (!password || password.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters long');
        }
        const requirements = [
            { regex: /[A-Z]/, message: 'at least one uppercase letter' },
            { regex: /[a-z]/, message: 'at least one lowercase letter' },
            { regex: /\d/, message: 'at least one number' },
            { regex: /[@$!%*?&]/, message: 'at least one special character (@$!%*?&)' },
        ];
        const errors = requirements
            .filter(req => !req.regex.test(password))
            .map(req => req.message);
        if (errors.length > 0) {
            throw new common_1.BadRequestException(`Password must contain: ${errors.join(', ')}`);
        }
    }
    validatePhone(phone) {
        if (!phone)
            return true;
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    }
    validateUsername(username) {
        if (!username || username.trim() === '') {
            throw new common_1.BadRequestException('Username is required');
        }
        const trimmed = username.trim();
        if (trimmed.length < 3) {
            throw new common_1.BadRequestException('Username must be at least 3 characters long');
        }
        if (trimmed.length > 50) {
            throw new common_1.BadRequestException('Username must be less than 50 characters');
        }
        const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
        if (!usernameRegex.test(trimmed)) {
            throw new common_1.BadRequestException('Username can only contain letters, numbers, dots, underscores and hyphens');
        }
        return trimmed;
    }
    validateName(name, fieldName) {
        if (!name || name.trim() === '') {
            throw new common_1.BadRequestException(`${fieldName} is required`);
        }
        const trimmed = name.trim();
        if (trimmed.length < 2) {
            throw new common_1.BadRequestException(`${fieldName} must be at least 2 characters long`);
        }
        if (trimmed.length > 100) {
            throw new common_1.BadRequestException(`${fieldName} must be less than 100 characters`);
        }
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!nameRegex.test(trimmed)) {
            throw new common_1.BadRequestException(`${fieldName} can only contain letters, spaces, hyphens and apostrophes`);
        }
        return trimmed;
    }
    validateJobTitle(jobTitle) {
        if (!jobTitle) {
            return 'Staff';
        }
        const trimmed = jobTitle.trim();
        if (trimmed.length > 100) {
            throw new common_1.BadRequestException('Job title must be less than 100 characters');
        }
        return trimmed;
    }
    validateRegisterInput(dto) {
        this.validateEmail(dto.email);
        this.validateUsername(dto.username);
        this.validatePassword(dto.password);
        this.validateName(dto.firstName, 'First name');
        this.validateName(dto.lastName, 'Last name');
        if (dto.phone && !this.validatePhone(dto.phone)) {
            throw new common_1.BadRequestException('Invalid phone number format');
        }
        this.validateDepartment(dto.department);
        this.validateJobTitle(dto.jobTitle);
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)()
], ValidationService);
//# sourceMappingURL=validation.service.js.map