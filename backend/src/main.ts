import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  console.log(`=========================================`);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api/v1`);
  console.log(`Auth: http://localhost:${port}/api/v1/auth`);
  console.log(`Users: http://localhost:${port}/api/v1/users`);
  console.log(`=========================================`);
}
bootstrap();