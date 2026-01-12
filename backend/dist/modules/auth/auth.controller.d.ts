import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<import("./dto/login-response.dto").LoginResponseDto>;
    validateToken(body: {
        token: string;
    }): Promise<{
        valid: boolean;
        payload?: any;
        error?: string;
    }>;
}
