import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import * as express from 'express';

// Express 서버 인스턴스 생성
const expressApp = express();

// NestJS 앱을 생성하고 초기화하는 함수
const createNestApp = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  // 전역 미들웨어나 설정을 이곳에 추가합니다. (예: CORS, Global Pipes)
  app.enableCors({
    origin: process.env.CLIENT_DOMAIN || 'http://localhost:3000', // 실제 클라이언트 주소로 변경
    credentials: true,
  });

  await app.init();
};

// Vercel이 요청을 처리하기 위해 호출하는 기본 핸들러 함수
export default async function handler(req: Request, res: Response) {
  await createNestApp(expressApp);
  expressApp(req, res);
}
