import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/features/auth/auth.module';
import { UserModule } from '@/features/user/user.module';
import { User } from '@/features/user/entities/user.entity';
import { LoggerMiddleware } from '@/shared/middlewares/logger.middleware';
import { BookModule } from '@/features/book/book.module';
import { UsedBookPost } from '@/features/book/entities/used-book.entity';
import { Book } from '@/features/book/entities/book.entity';

@Module({
  imports: [
    // 1. 환경 변수 설정을 위한 ConfigModule
    // isGlobal: true로 설정하여 모든 모듈에서 process.env 대신 ConfigService를 사용할 수 있게 합니다.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // 루트 디렉토리의 .env 파일을 사용
    }),

    // 2. 데이터베이스 연결을 위한 TypeOrmModule
    // forRootAsync를 사용하여 ConfigService로부터 환경 변수를 주입받아 설정합니다.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Book, UsedBookPost], // User 엔티티만 사용하므로 직접 지정
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // 개발 환경에서만 true로 설정
      }),
    }),

    // 3. 기능별 모듈 등록
    AuthModule,
    UserModule,
    BookModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware) // LoggerMiddleware를 적용합니다.
      .forRoutes('*'); // '*'는 모든 라우트에 적용하겠다는 의미입니다.
  }
}
