import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/core/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MfaSetting } from '../../database/entities/auth/mfa-setting.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly mfaSettingRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, mfaSettingRepository: Repository<MfaSetting>, jwtService: JwtService);
    validateUser(identifier: string, password: string): Promise<User>;
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
    validateToken(token: string): Promise<{
        valid: boolean;
        payload?: any;
        error?: string;
    }>;
    getUserProfile(userId: string): Promise<User>;
    refreshToken(userId: string): Promise<{
        accessToken: string;
    }>;
}
