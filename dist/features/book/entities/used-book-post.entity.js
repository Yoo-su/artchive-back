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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsedBookPost = exports.PostStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const book_entity_1 = require("./book.entity");
const chat_room_entity_1 = require("../../chat/entities/chat-room.entity");
var PostStatus;
(function (PostStatus) {
    PostStatus["FOR_SALE"] = "FOR_SALE";
    PostStatus["RESERVED"] = "RESERVED";
    PostStatus["SOLD"] = "SOLD";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
let UsedBookPost = class UsedBookPost {
};
exports.UsedBookPost = UsedBookPost;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UsedBookPost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UsedBookPost.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UsedBookPost.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UsedBookPost.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UsedBookPost.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], UsedBookPost.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], UsedBookPost.prototype, "imageUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PostStatus,
        default: PostStatus.FOR_SALE,
    }),
    __metadata("design:type", String)
], UsedBookPost.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.usedBookPosts, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UsedBookPost.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => book_entity_1.Book, (book) => book.usedBookPosts, {
        eager: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'bookIsbn' }),
    __metadata("design:type", book_entity_1.Book)
], UsedBookPost.prototype, "book", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UsedBookPost.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UsedBookPost.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_room_entity_1.ChatRoom, (chatRoom) => chatRoom.usedBookPost),
    __metadata("design:type", Array)
], UsedBookPost.prototype, "chatRooms", void 0);
exports.UsedBookPost = UsedBookPost = __decorate([
    (0, typeorm_1.Entity)({ name: 'used_book_posts' })
], UsedBookPost);
//# sourceMappingURL=used-book-post.entity.js.map