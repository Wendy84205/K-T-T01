import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';

import { RegisterService } from '../services/register.service';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('auth/register')
@Public()
export class RegisterController {
  constructor(private readonly registerService: RegisterService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.registerService.register(registerDto);
  }

  @Get('check-availability')
  @HttpCode(HttpStatus.OK)
  async checkAvailability(
    @Query('field') field: 'email' | 'username',
    @Query('value') value: string,
  ): Promise<{ available: boolean }> {
    return this.registerService.checkAvailability(field, value);
  }
}