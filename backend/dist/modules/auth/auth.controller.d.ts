import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: any): Promise<import("./dto/login-response.dto").LoginResponseDto>;
    getProfile(req: any): Promise<{
        user: any;
    }>;
    healthCheck(): {
        status: string;
    };
}
