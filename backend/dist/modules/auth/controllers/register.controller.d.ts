import { RegisterService } from '../services/register.service';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
export declare class RegisterController {
    private readonly registerService;
    constructor(registerService: RegisterService);
    register(registerDto: RegisterDto): Promise<RegisterResponseDto>;
    checkAvailability(field: 'email' | 'username', value: string): Promise<{
        available: boolean;
    }>;
}
