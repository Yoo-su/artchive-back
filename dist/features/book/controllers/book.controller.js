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
exports.BookController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const book_service_1 = require("../services/book.service");
const create_book_post_dto_1 = require("../dtos/create-book-post.dto");
const update_post_status_dto_1 = require("../../user/dtos/update-post-status.dto");
const get_book_posts_query_dto_1 = require("../dtos/get-book-posts-query.dto");
let BookController = class BookController {
    constructor(bookService) {
        this.bookService = bookService;
    }
    async createUsedBookPost(createBookPostDto, req) {
        const userId = req.user.id;
        const newPost = await this.bookService.createUsedBookPost(createBookPostDto, userId);
        return {
            success: true,
            data: newPost,
        };
    }
    async updateBookPostStatus(id, req, updatePostStatusDto) {
        const userId = req.user.id;
        const updatedPost = await this.bookService.updatePostStatus(id, userId, updatePostStatusDto.status);
        return {
            success: true,
            data: updatedPost,
        };
    }
    getPostById(id) {
        return this.bookService.findPostById(id);
    }
    getBookPosts(isbn, query) {
        return this.bookService.findPostsByIsbn(isbn, query);
    }
};
exports.BookController = BookController;
__decorate([
    (0, common_1.Post)('sell'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_book_post_dto_1.CreateBookPostDto, Object]),
    __metadata("design:returntype", Promise)
], BookController.prototype, "createUsedBookPost", null);
__decorate([
    (0, common_1.Patch)('posts/:id/status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, update_post_status_dto_1.UpdatePostStatusDto]),
    __metadata("design:returntype", Promise)
], BookController.prototype, "updateBookPostStatus", null);
__decorate([
    (0, common_1.Get)('posts/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "getPostById", null);
__decorate([
    (0, common_1.Get)(':isbn/posts'),
    __param(0, (0, common_1.Param)('isbn')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_book_posts_query_dto_1.GetBookPostsQueryDto]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "getBookPosts", null);
exports.BookController = BookController = __decorate([
    (0, common_1.Controller)('book'),
    __metadata("design:paramtypes", [book_service_1.BookService])
], BookController);
//# sourceMappingURL=book.controller.js.map