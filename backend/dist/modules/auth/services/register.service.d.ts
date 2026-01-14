import { Repository } from 'typeorm';
import { User } from '../../../database/entities/core/user.entity';
import { MfaSetting } from '../../../database/entities/auth/mfa-setting.entity';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
export declare class RegisterService {
    private readonly userRepository;
    private readonly mfaSettingRepository;
    constructor(userRepository: Repository<User>, mfaSettingRepository: Repository<MfaSetting>);
    register(registerDto: RegisterDto): Promise<RegisterResponseDto>;
    private validateRegistrationInput;
    private checkExistingUser;
    private createMfaSettings;
    private buildRegisterResponse;
    private requiresManagerApproval;
    private getNextSteps;
    checkAvailability(field: 'email' | 'username', value: string): Promise<{
        available: boolean;
    }>;
}
