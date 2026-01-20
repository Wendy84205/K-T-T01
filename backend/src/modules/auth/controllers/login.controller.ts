// src/modules/auth/controllers/login.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../auth.service';

@Controller('auth/login')
@Public()
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  async login(@Request() req) {
    // LocalAuthGuard đã validate user
    return this.authService.login(req.user);
  }
}