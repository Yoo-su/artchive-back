import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/features/auth/auth.module';
import { UserModule } from '@/features/user/user.module';
import { User } from '@/features/user/entities/user.entity';
import { LoggerMiddleware } from '@/shared/middlewares/logger.middleware';
import { BookModule } from '@/features/book/book.module';
import { UsedBookPost } from '@/features/book/entities/used-book-post.entity';
import { Book } from '@/features/book/entities/book.entity';
import { ChatModule } from '@/features/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Book, UsedBookPost],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // 개발 환경에서만 true로 설정
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UserModule,
    BookModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
