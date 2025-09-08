import { PartialType } from '@nestjs/mapped-types';
import { CreateBookPostDto } from './create-book-post.dto';

export class UpdateBookPostDto extends PartialType(CreateBookPostDto) {}
