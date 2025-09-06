import { BookService } from '../services/book.service';
import { CreateBookPostDto } from '../dtos/create-book-post.dto';
import { Request } from 'express';
import { UpdatePostStatusDto } from '../../user/dtos/update-post-status.dto';
import { GetBookPostsQueryDto } from '../dtos/get-book-posts-query.dto';
export declare class BookController {
    private readonly bookService;
    constructor(bookService: BookService);
    createUsedBookPost(createBookPostDto: CreateBookPostDto, req: Request): Promise<{
        success: boolean;
        data: import("../entities/used-book-post.entity").UsedBookPost;
    }>;
    updateBookPostStatus(id: number, req: Request, updatePostStatusDto: UpdatePostStatusDto): Promise<{
        success: boolean;
        data: import("../entities/used-book-post.entity").UsedBookPost;
    }>;
    getPostById(id: number): Promise<import("../entities/used-book-post.entity").UsedBookPost>;
    getBookPosts(isbn: string, query: GetBookPostsQueryDto): Promise<{
        posts: import("../entities/used-book-post.entity").UsedBookPost[];
        total: number;
        page: number;
        hasNextPage: boolean;
    }>;
}
