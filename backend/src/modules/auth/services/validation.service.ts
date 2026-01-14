import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidationService {
  validateEmployeeId(employeeId: string): string {
    if (!employeeId || employeeId.trim() === '') {
      throw new BadRequestException('Employee ID is required');
    }

    const formattedId = employeeId.toUpperCase().trim();
    
    // Check for standard employee format: EMP2024-IT001
    const employeeRegex = /^EMP\d{4}-(IT|SEC|HR|FIN|OPS|SAL|MKT|DEV|GEN)\d{3}$/;
    
    // Check for admin format: ADM001
    const adminRegex = /^ADM\d{3}$/;
    
    if (!employeeRegex.test(formattedId) && !adminRegex.test(formattedId)) {
      throw new BadRequestException(
        'Employee ID must be either:\n' +
        '- EMP{YYYY}-{DEPT}{###} (e.g., EMP2024-IT001, EMP2024-SEC001)\n' +
        '- ADM{###} (e.g., ADM001, ADM002)'
      );
    }
    
    return formattedId;
  }

  validateDepartment(department?: string): string {
    const validDepartments = [
      'IT', 'SECURITY', 'HR', 'FINANCE', 
      'OPERATIONS', 'SALES', 'MARKETING', 'DEVELOPMENT'
    ];
    
    if (!department) {
      return 'IT'; // default
    }
    
    const formattedDept = department.toUpperCase();
    if (!validDepartments.map(d => d.toUpperCase()).includes(formattedDept)) {
      throw new BadRequestException(
        `Invalid department. Must be one of: ${validDepartments.join(', ')}`
      );
    }
    
    return formattedDept;
  }

  validateEmail(email: string): string {
    if (!email || email.trim() === '') {
      throw new BadRequestException('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Check allowed domains
    const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || ['company.com'];
    const domain = email.split('@')[1];
    
    if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
      throw new BadRequestException(`Email domain @${domain} is not allowed`);
    }

    return email.toLowerCase().trim();
  }

  validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
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
      throw new BadRequestException(`Password must contain: ${errors.join(', ')}`);
    }
  }

  validatePhone(phone: string): boolean {
    if (!phone) return true; // Optional
    
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  validateUsername(username: string): string {
    if (!username || username.trim() === '') {
      throw new BadRequestException('Username is required');
    }

    const trimmed = username.trim();
    
    if (trimmed.length < 3) {
      throw new BadRequestException('Username must be at least 3 characters long');
    }
    
    if (trimmed.length > 50) {
      throw new BadRequestException('Username must be less than 50 characters');
    }
    
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(trimmed)) {
      throw new BadRequestException(
        'Username can only contain letters, numbers, dots, underscores and hyphens'
      );
    }
    
    return trimmed;
  }

  validateName(name: string, fieldName: string): string {
    if (!name || name.trim() === '') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    const trimmed = name.trim();
    
    if (trimmed.length < 2) {
      throw new BadRequestException(`${fieldName} must be at least 2 characters long`);
    }
    
    if (trimmed.length > 100) {
      throw new BadRequestException(`${fieldName} must be less than 100 characters`);
    }
    
    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
      throw new BadRequestException(
        `${fieldName} can only contain letters, spaces, hyphens and apostrophes`
      );
    }
    
    return trimmed;
  }

  validateJobTitle(jobTitle?: string): string {
    if (!jobTitle) {
      return 'Staff'; // default
    }

    const trimmed = jobTitle.trim();
    
    if (trimmed.length > 100) {
      throw new BadRequestException('Job title must be less than 100 characters');
    }
    
    return trimmed;
  }

  // Helper method for register service
  validateRegisterInput(dto: any): void {
    // Validate email
    this.validateEmail(dto.email);
    
    // Validate username
    this.validateUsername(dto.username);
    
    // Validate password
    this.validatePassword(dto.password);
    
    // Validate names
    this.validateName(dto.firstName, 'First name');
    this.validateName(dto.lastName, 'Last name');
    
    // Validate phone (optional)
    if (dto.phone && !this.validatePhone(dto.phone)) {
      throw new BadRequestException('Invalid phone number format');
    }
    
    // Validate department
    this.validateDepartment(dto.department);
    
    // Validate job title
    this.validateJobTitle(dto.jobTitle);
  }
}
