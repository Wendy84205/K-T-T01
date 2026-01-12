import { Repository } from 'typeorm';
import { User } from '../../../database/entities/core/user.entity';
import { MfaSetting } from '../../../database/entities/auth/mfa-setting.entity';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { ValidationService } from './validation.service';
import { EmployeeIdGeneratorService } from './employee-id-generator.service';
export declare class RegisterService {
    private readonly userRepository;
    private readonly mfaSettingRepository;
    private readonly validationService;
    private readonly employeeIdGenerator;
    constructor(userRepository: Repository<User>, mfaSettingRepository: Repository<MfaSetting>, validationService: ValidationService, employeeIdGenerator: EmployeeIdGeneratorService);
    register(registerDto: RegisterDto): Promise<RegisterResponseDto>;
    private validateInputs;
    private checkExistingUser;
    private createMfaSettings;
    private assignDefaultRole;
    private createAuditLog;
    private buildRegisterResponse;
    private requiresManagerApproval;
    private getNextSteps;
    checkAvailability(field: 'email' | 'username', value: string): Promise<{
        available: boolean;
    }>;
    suggestEmployeeId(department?: string): Promise<string>;
}
