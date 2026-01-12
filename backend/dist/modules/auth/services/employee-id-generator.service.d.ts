import { Repository } from 'typeorm';
import { User } from '../../../database/entities/core/user.entity';
export declare class EmployeeIdGeneratorService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    generateEmployeeId(department?: string): Promise<string>;
    validateEmployeeIdFormat(employeeId: string): boolean;
    getDepartmentFromEmployeeId(employeeId: string): string | null;
}
