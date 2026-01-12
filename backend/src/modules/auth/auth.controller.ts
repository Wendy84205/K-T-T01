// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }

  @Public()
  @Get('health')
  healthCheck() {
    return { status: 'Auth service is running' };
  }
}