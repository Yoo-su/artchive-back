import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  ParseIntPipe,
  Get,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookService } from '../services/book.service';
import { CreateBookPostDto } from '../dtos/create-book-post.dto';
import { Request } from 'express';
import { UpdatePostStatusDto } from '../../user/dtos/update-post-status.dto';
import { GetBookPostsQueryDto } from '../dtos/get-book-posts-query.dto';
import { UpdateBookPostDto } from '../dtos/update-book-post.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('sell')
  @UseGuards(AuthGuard('jwt'))
  async createUsedBookPost(
    @Body() createBookPostDto: CreateBookPostDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id; // JwtStrategy에서 반환된 user 객체의 id
    const newPost = await this.bookService.createUsedBookPost(
      createBookPostDto,
      userId,
    );
    return {
      success: true,
      post: newPost,
    };
  }

  /**
   * 판매글의 상태를 업데이트하는 엔드포인트
   * @param id - 게시글 ID
   * @param updatePostStatusDto - 변경할 상태 정보
   */
  @Patch('posts/:id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateBookPostStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() updatePostStatusDto: UpdatePostStatusDto,
  ) {
    const userId = (req.user as any).id;
    const updatedPost = await this.bookService.updatePostStatus(
      id,
      userId,
      updatePostStatusDto.status,
    );
    return {
      success: true,
      post: updatedPost,
    };
  }

  /**
   * 최근 판매글 목록을 조회하는 엔드포인트
   */
  @Get('posts/recent')
  getRecentPosts() {
    return this.bookService.findRecentPosts();
  }

  @Get('posts/:id')
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findPostById(id);
  }

  /**
   * 특정 책(ISBN)에 대한 판매글 목록을 페이지네이션으로 조회하는 API
   * @param isbn - 책의 ISBN
   * @param query - 페이지네이션 및 필터링 옵션 (page, limit, city, district)
   */
  @Get(':isbn/posts')
  getBookPosts(
    @Param('isbn') isbn: string,
    @Query() query: GetBookPostsQueryDto,
  ) {
    return this.bookService.findPostsByIsbn(isbn, query);
  }

  /**
   * 판매글의 내용을 업데이트하는 엔드포인트
   */
  @Patch('posts/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateBookPost(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() updateBookPostDto: UpdateBookPostDto,
  ) {
    const userId = (req.user as any).id;
    const updatedPost = await this.bookService.updateUsedBookPost(
      id,
      userId,
      updateBookPostDto,
    );
    return {
      success: true,
      post: updatedPost,
    };
  }

  /**
   * 판매글을 삭제하는 엔드포인트
   */
  @Delete('posts/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT) // 성공 시 204 No Content 응답
  async deleteBookPost(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    await this.bookService.deleteUsedBookPost(id, userId);
    return;
  }
}
