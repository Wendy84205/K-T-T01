// src/app.module.ts - UPDATED VERSION
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TeamModule } from './modules/team/team.module';
import { MfaModule } from './modules/mfa/mfa.module';
import { SecurityModule } from './modules/security/security.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    // Config module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'cybersecure_db'),
        entities: [
          __dirname + '/**/*.entity{.ts,.js}',
          __dirname + '/database/entities/**/*.entity{.ts,.js}',
        ],

        synchronize: false,  // <-- ĐẶT LÀ false
        // Hoặc: synchronize: configService.get('DB_SYNC') === 'true',
        logging: configService.get('NODE_ENV') === 'development',
        charset: 'utf8mb4',
        timezone: 'Z',
        extra: {
          charset: 'utf8mb4_unicode_ci',
        },
      }),
    }),
    // Feature modules
    AuthModule,
    UsersModule,
    TeamModule,
    MfaModule,
    SecurityModule,
    // ChatModule,    
    // FileStorageModule,
    // NotificationModule,
    // ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }