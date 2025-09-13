import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CLIENT_DOMAIN || 'http://localhost:3000',
    credentials: true,
  });

  app.enableShutdownHooks();

  const dataSource = app.get(DataSource);

  app
    .getHttpAdapter()
    .getInstance()
    .on('close', async () => {
      console.log('Server is closing, closing database connection...');
      if (dataSource.isInitialized) {
        await dataSource.destroy();
        console.log('Database connection closed.');
      }
    });

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
