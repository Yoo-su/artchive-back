import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookController } from './controllers/book.controller';
import { BookService } from './services/book.service';
import { Book } from './entities/book.entity';
import { UsedBookPost } from './entities/used-book.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Book, UsedBookPost]), UserModule],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
