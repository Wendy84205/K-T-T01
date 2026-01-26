import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Body() mfaVerifyDto: MfaVerifyDto) {
    const { token, tempToken } = mfaVerifyDto;

    if (!tempToken) {
      throw new BadRequestException('Temporary token is required');
    }

    try {
      const decoded = this.jwtService.verify(tempToken);
      if (!decoded.mfaPending || !decoded.sub) {
        throw new UnauthorizedException('Invalid temporary token');
      }
      return this.authService.verifyMfaAndLogin(decoded.sub, token);
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) throw err;
      throw new UnauthorizedException('Invalid or expired temporary token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: any) {
    return this.authService.refreshToken(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const profile = await this.authService.getUserProfile(req.user.userId);
    return {
      user: {
        ...profile,
        userId: req.user.userId,
        roles: req.user.roles ?? [],
      },
    };
  }

  @Public()
  @Get('health')
  healthCheck() {
    return { status: 'Auth service is running' };
  }
}