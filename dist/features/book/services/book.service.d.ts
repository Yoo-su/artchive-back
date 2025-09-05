import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { PostStatus, UsedBookPost } from '../entities/used-book-post.entity';
import { CreateBookPostDto } from '../dtos/create-book-post.dto';
import { UserService } from '../../user/services/user.service';
import { GetBookPostsQueryDto } from '../dtos/get-book-posts-query.dto';
export declare class BookService {
    private readonly bookRepository;
    private readonly usedBookPostRepository;
    private readonly userService;
    constructor(bookRepository: Repository<Book>, usedBookPostRepository: Repository<UsedBookPost>, userService: UserService);
    private findOrCreateBook;
    createUsedBookPost(createBookPostDto: CreateBookPostDto, userId: number): Promise<UsedBookPost>;
    updatePostStatus(postId: number, userId: number, status: PostStatus): Promise<UsedBookPost>;
    findPostById(id: number): Promise<UsedBookPost>;
    findPostsByIsbn(isbn: string, queryDto: GetBookPostsQueryDto): Promise<{
        posts: UsedBookPost[];
        total: number;
        page: number;
        hasNextPage: boolean;
    }>;
}
