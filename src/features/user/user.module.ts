import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UsedBookPost } from '../book/entities/used-book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UsedBookPost])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
