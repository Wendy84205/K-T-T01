import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v1');
  
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  
  await app.listen(port);
  
  console.log('=========================================');
  console.log(`Server running on http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api/v1`);
  console.log(`Auth: http://localhost:${port}/api/v1/auth`);
  console.log(`Users: http://localhost:${port}/api/v1/users`);
  console.log('=========================================');
}
bootstrap();
