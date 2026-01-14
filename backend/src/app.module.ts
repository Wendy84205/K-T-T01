import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { User } from './database/entities/core/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'cybersecure_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
  
    TypeOrmModule.forFeature([User]),
    
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService], 
})
export class AppModule {}