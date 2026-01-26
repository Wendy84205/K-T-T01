import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { User } from '../../database/entities/core/user.entity';
import { MfaSetting } from '../../database/entities/auth/mfa-setting.entity';

// Controllers
import { AuthController } from './auth.controller';
import { RegisterController } from './controllers/register.controller';

// Services
import { AuthService } from './auth.service';
import { RegisterService } from './services/register.service';
import { ValidationService } from './services/validation.service';
import { EmployeeIdGeneratorService } from './services/employee-id-generator.service';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

// Import MfaModule to use MfaService
import { MfaModule } from '../mfa/mfa.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MfaSetting]),
    PassportModule,
    forwardRef(() => MfaModule), // Use forwardRef to avoid circular dependency
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRES_IN', 86400),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, RegisterController],
  providers: [
    AuthService, 
    RegisterService,
    ValidationService,
    EmployeeIdGeneratorService,
    JwtStrategy, 
    LocalStrategy
  ],
  exports: [AuthService, RegisterService, JwtModule],
})
export class AuthModule {}
