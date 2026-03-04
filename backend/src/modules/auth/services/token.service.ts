import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Generate an access token for a user
     * @param payload Data to include in the token
     * @param expiresIn Optional override for expiration
     */
    generateAccessToken(payload: any, expiresIn: any = '24h'): string {
        return this.jwtService.sign(payload, {
            expiresIn,
            secret: this.configService.get<string>('JWT_SECRET') || 'default_secret_321',
        });
    }

    /**
     * Generate a refresh token (longer lived, used to get new access tokens)
     */
    generateRefreshToken(payload: any): string {
        return this.jwtService.sign(payload, {
            expiresIn: '7d',
            secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret_123',
        });
    }

    /**
     * Verify a token and return its payload
     */
    verifyToken(token: string): any {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET') || 'default_secret_321',
            });
        } catch (error) {
            return null;
        }
    }

    /**
     * Decode a token without verifying (useful for quick checks)
     */
    decodeToken(token: string): any {
        return this.jwtService.decode(token);
    }
}
