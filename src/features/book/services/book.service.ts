import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { PostStatus, UsedBookPost } from '../entities/used-book-post.entity';
import { CreateBookPostDto } from '../dtos/create-book-post.dto';
import { BookInfoDto } from '../dtos/book-info.dto';
import { UserService } from '../../user/services/user.service';
import { GetBookPostsQueryDto } from '../dtos/get-book-posts-query.dto';
import { UpdateBookPostDto } from '../dtos/update-book-post.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(UsedBookPost)
    private readonly usedBookPostRepository: Repository<UsedBookPost>,
    private readonly userService: UserService,
  ) {}

  // 책 정보가 DB에 있으면 찾고, 없으면 새로 생성하는 메서드
  private async findOrCreateBook(bookInfoDto: BookInfoDto): Promise<Book> {
    let book = await this.bookRepository.findOneBy({ isbn: bookInfoDto.isbn });
    if (!book) {
      book = this.bookRepository.create(bookInfoDto);
      await this.bookRepository.save(book);
    }
    return book;
  }

  async createUsedBookPost(
    createBookPostDto: CreateBookPostDto,
    userId: number,
  ): Promise<UsedBookPost> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const book = await this.findOrCreateBook(createBookPostDto.book);

    const newPost = this.usedBookPostRepository.create({
      ...createBookPostDto,
      user, // user 객체 전체를 할당
      book, // book 객체 전체를 할당
    });

    return this.usedBookPostRepository.save(newPost);
  }

  /**
   * 특정 판매글의 상태를 업데이트합니다.
   * @param postId - 업데이트할 게시글 ID
   * @param userId - 요청을 보낸 사용자 ID (소유권 확인용)
   * @param status - 변경할 새로운 상태
   * @returns 업데이트된 게시글 정보
   */
  async updatePostStatus(
    postId: number,
    userId: number,
    status: PostStatus,
  ): Promise<UsedBookPost> {
    const post = await this.usedBookPostRepository.findOne({
      where: { id: postId },
      relations: ['user'], // 소유권 확인을 위해 user 정보를 함께 조회
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 게시글의 작성자와 현재 로그인한 사용자가 동일한지 확인
    if (post.user.id !== userId) {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    post.status = status;
    return this.usedBookPostRepository.save(post);
  }

  async findPostById(id: number) {
    const post = await this.usedBookPostRepository.findOne({
      where: { id },
      relations: ['user', 'book'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found.`);
    }
    return post;
  }

  /**
   *  ISBN과 쿼리 옵션으로 판매글 목록을 조회하는 메서드
   */
  async findPostsByIsbn(isbn: string, queryDto: GetBookPostsQueryDto) {
    const { page, limit, city, district } = queryDto;

    const queryBuilder = this.usedBookPostRepository
      .createQueryBuilder('post')
      .where('post.bookIsbn = :isbn', { isbn })
      .leftJoinAndSelect('post.user', 'user') // 작성자 정보 포함
      .select([
        'post.id',
        'post.title',
        'post.price',
        'post.status',
        'post.createdAt',
        'post.imageUrls',
        'user.id',
        'user.nickname',
        'user.profileImageUrl',
      ]) // 필요한 필드만 선택하여 데이터 경량화
      .orderBy('post.createdAt', 'DESC') // 최신순으로 정렬
      .skip((page - 1) * limit)
      .take(limit);

    // 지역 필터링 조건이 있을 경우 동적으로 추가
    if (city) {
      queryBuilder.andWhere('post.city = :city', { city });
    }
    if (district) {
      queryBuilder.andWhere('post.district = :district', { district });
    }

    const [posts, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = page * limit < total;

    return {
      posts,
      total,
      page,
      hasNextPage,
    };
  }

  /**
   * 특정 판매글의 정보를 업데이트합니다.
   * @param postId - 업데이트할 게시글 ID
   * @param userId - 요청을 보낸 사용자 ID (소유권 확인용)
   * @param updateBookPostDto - 업데이트할 게시글 정보
   * @returns 업데이트된 게시글 정보
   */
  async updateUsedBookPost(
    postId: number,
    userId: number,
    updateBookPostDto: UpdateBookPostDto,
  ): Promise<UsedBookPost> {
    const post = await this.usedBookPostRepository.findOne({
      where: { id: postId },
      relations: ['user'], // 소유권 확인을 위해 user 정보를 함께 조회
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    // DTO의 내용과 기존 게시글 데이터를 병합합니다.
    // DTO에 포함된 필드만 업데이트됩니다.
    const updatedPost = this.usedBookPostRepository.merge(
      post,
      updateBookPostDto,
    );

    return this.usedBookPostRepository.save(updatedPost);
  }

  /**
   * 특정 판매글을 삭제합니다.
   * @param postId - 삭제할 게시글 ID
   * @param userId - 요청을 보낸 사용자 ID (소유권 확인용)
   */
  async deleteUsedBookPost(postId: number, userId: number): Promise<void> {
    const post = await this.usedBookPostRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('게시글을 삭제할 권한이 없습니다.');
    }

    // 참고: used_book_posts와 연관된 chat_rooms, chat_participants 등은
    // entity의 onDelete: 'CASCADE' 설정에 의해 DB 레벨에서 연쇄적으로 삭제될 수 있습니다.
    // 해당 설정이 없다면 여기서 직접 관련 데이터를 삭제하는 로직이 필요합니다.
    await this.usedBookPostRepository.remove(post);
  }
}
