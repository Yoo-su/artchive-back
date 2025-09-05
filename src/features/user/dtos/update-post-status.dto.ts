import { IsEnum, IsNotEmpty } from 'class-validator';
import { PostStatus } from '@/features/book/entities/used-book-post.entity';

export class UpdatePostStatusDto {
  @IsNotEmpty()
  @IsEnum(PostStatus)
  status: PostStatus;
}
