import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CLIENT_DOMAIN || 'http://localhost:3000',
    credentials: true, // 쿠키나 인증 헤더를 주고받기 위함
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
