import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/core/user.entity';
import { Role } from './entities/core/role.entity';
import { UserRepository } from './repositories/user.repository';
import { MfaSetting } from './entities/auth/mfa-setting.entity';
import { UserSession } from './entities/auth/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, MfaSetting, UserSession, UserRepository]),
  ],
  providers: [UserRepository],
  exports: [TypeOrmModule, UserRepository],
})
export class DatabaseModule { }