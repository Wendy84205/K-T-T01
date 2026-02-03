// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }