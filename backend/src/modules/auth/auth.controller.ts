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
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) { }

  private setRefreshCookie(res: any, token: string) {
    if (token) {
      res.cookie('refresh_token', token, {
        httpOnly: true,
        secure: process.env.JWT_COOKIE_SECURE === 'true',
        sameSite: process.env.JWT_COOKIE_SAME_SITE || 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto, @Res({ passthrough: true }) res: any) {
    const result: any = await this.authService.login(req.user);
    if (result.refreshToken) {
      this.setRefreshCookie(res, result.refreshToken);
      delete result.refreshToken;
    }
    return result;
  }

  @Public()
  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Body() mfaVerifyDto: MfaVerifyDto, @Res({ passthrough: true }) res: any) {
    const { token, tempToken } = mfaVerifyDto;

    if (!tempToken) {
      throw new BadRequestException('Temporary token is required');
    }

    try {
      const decoded = this.jwtService.verify(tempToken);
      if (!decoded.mfaPending || !decoded.sub) {
        throw new UnauthorizedException('Invalid temporary token');
      }
      const result: any = await this.authService.verifyMfaAndLogin(decoded.sub, token);
      if (result.refreshToken) {
        this.setRefreshCookie(res, result.refreshToken);
        delete result.refreshToken;
      }
      return result;
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) throw err;
      throw new UnauthorizedException('Invalid or expired temporary token');
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: any, @Res({ passthrough: true }) res: any) {
    const cookieHeader = req.headers.cookie;
    let refreshToken = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      for (const cookie of cookies) {
        if (cookie.startsWith('refresh_token=')) {
          refreshToken = cookie.substring('refresh_token='.length);
          break;
        }
      }
    }
    if (!refreshToken) {
      throw new UnauthorizedException('Session expired or invalid');
    }
    // FIX LỖ HỔNG 8: Token Rotation — nhận refresh_token mới và ghi lại vào cookie
    const result = await this.authService.refreshToken(refreshToken);
    if (result.newRefreshToken) {
      // Thay thế cookie với refresh_token mới (xóa token cũ về mặt logic)
      this.setRefreshCookie(res, result.newRefreshToken);
    }
    return { accessToken: result.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any, @Res({ passthrough: true }) res: any) {
    await this.authService.logout(req.user.userId);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Request() req: any) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await this.authService.heartbeat(token);
    }
    return { status: 'OK' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    const profile = await this.authService.getUserProfile(userId);
    
    const roleNames = profile?.roles?.map(r => typeof r === 'string' ? r : r.name) || [];

    return {
      user: {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        employeeId: profile.employeeId,
        department: profile.department,
        mfaRequired: profile.mfaRequired,
        securityClearanceLevel: profile.securityClearanceLevel,
        roles: roleNames, // Use names derived from database
        publicKey: profile.publicKey,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-password')
  @HttpCode(HttpStatus.OK)
  async verifyPassword(@Request() req, @Body('password') password: string) {
    const isValid = await this.authService.verifyPassword(req.user.userId, password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return { success: true };
  }

  @Public()
  @Get('health')
  healthCheck() {
    return { status: 'Auth service is running' };
  }
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    await this.authService.forgotPassword(email);
    return { success: true, message: 'If the email exists, a password reset link has been sent.' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: any) {
    const { token, email, newPassword } = body;
    if (!token || !email || !newPassword) {
      throw new BadRequestException('Token, email, and newPassword are required');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    await this.authService.resetPassword(token, email, newPassword);
    return { success: true, message: 'Password has been reset successfully' };
  }
}