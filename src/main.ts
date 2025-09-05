// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors({
    origin: process.env.CLIENT_DOMAIN || 'http://localhost:3000',
    credentials: true,
  });
  await app.init();
}

bootstrap();

export default server;
