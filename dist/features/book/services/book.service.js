"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const book_entity_1 = require("../entities/book.entity");
const used_book_post_entity_1 = require("../entities/used-book-post.entity");
const user_service_1 = require("../../user/services/user.service");
let BookService = class BookService {
    constructor(bookRepository, usedBookPostRepository, userService) {
        this.bookRepository = bookRepository;
        this.usedBookPostRepository = usedBookPostRepository;
        this.userService = userService;
    }
    async findOrCreateBook(bookInfoDto) {
        let book = await this.bookRepository.findOneBy({ isbn: bookInfoDto.isbn });
        if (!book) {
            book = this.bookRepository.create(bookInfoDto);
            await this.bookRepository.save(book);
        }
        return book;
    }
    async createUsedBookPost(createBookPostDto, userId) {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const book = await this.findOrCreateBook(createBookPostDto.book);
        const newPost = this.usedBookPostRepository.create({
            ...createBookPostDto,
            user,
            book,
        });
        return this.usedBookPostRepository.save(newPost);
    }
    async updatePostStatus(postId, userId, status) {
        const post = await this.usedBookPostRepository.findOne({
            where: { id: postId },
            relations: ['user'],
        });
        if (!post) {
            throw new Error('게시글을 찾을 수 없습니다.');
        }
        if (post.user.id !== userId) {
            throw new common_1.ForbiddenException('게시글을 수정할 권한이 없습니다.');
        }
        post.status = status;
        return this.usedBookPostRepository.save(post);
    }
    async findPostById(id) {
        const post = await this.usedBookPostRepository.findOne({
            where: { id },
            relations: ['user', 'book'],
        });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${id} not found.`);
        }
        return post;
    }
    async findPostsByIsbn(isbn, queryDto) {
        const { page, limit, city, district } = queryDto;
        const queryBuilder = this.usedBookPostRepository
            .createQueryBuilder('post')
            .where('post.bookIsbn = :isbn', { isbn })
            .leftJoinAndSelect('post.user', 'user')
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
        ])
            .orderBy('post.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
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
};
exports.BookService = BookService;
exports.BookService = BookService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(book_entity_1.Book)),
    __param(1, (0, typeorm_1.InjectRepository)(used_book_post_entity_1.UsedBookPost)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        user_service_1.UserService])
], BookService);
//# sourceMappingURL=book.service.js.map