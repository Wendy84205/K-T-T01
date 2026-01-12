import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/core/user.entity';

@Injectable()
export class EmployeeIdGeneratorService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async generateEmployeeId(department: string = 'IT'): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    // Map department to code
    const departmentMap: Record<string, string> = {
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
    
    // Find the highest employee ID in this department for current year
    const latestEmployee = await this.userRepository
      .createQueryBuilder('user')
      .where('user.employeeId LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('user.employeeId', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (latestEmployee && latestEmployee.employeeId) {
      // Extract number from EMP2024-IT001 -> 001
      const lastId = latestEmployee.employeeId;
      const match = lastId.match(new RegExp(`^${prefix}(\\d+)$`));
      
      if (match && match[1]) {
        const lastNumber = parseInt(match[1], 10);
        nextNumber = lastNumber + 1;
      }
    }

    // Format: EMP2024-IT001, EMP2024-IT002, etc.
    const sequentialNumber = nextNumber.toString().padStart(3, '0');
    const employeeId = `${prefix}${sequentialNumber}`;
    
    // Double-check uniqueness (race condition safety)
    const exists = await this.userRepository.findOne({
      where: { employeeId }
    });
    
    if (exists) {
      // If somehow exists, try next number
      return this.generateEmployeeId(department);
    }
    
    return employeeId;
  }

  validateEmployeeIdFormat(employeeId: string): boolean {
    const regex = /^EMP\d{4}-(IT|SEC|HR|FIN|OPS|SAL|MKT|DEV|GEN)\d{3}$/;
    return regex.test(employeeId);
  }

  getDepartmentFromEmployeeId(employeeId: string): string | null {
    const match = employeeId.match(/^EMP\d{4}-([A-Z]{2,3})\d{3}$/);
    if (!match) return null;
    
    const deptCode = match[1];
    const codeMap: Record<string, string> = {
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
}
