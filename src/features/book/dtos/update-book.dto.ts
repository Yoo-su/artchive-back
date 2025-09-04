import { PartialType } from '@nestjs/mapped-types';
import { CreateBookPostDto } from './create-book-post.dto';

export class UpdateBookDto extends PartialType(CreateBookPostDto) {}
