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
exports.User = void 0;
const used_book_post_entity_1 = require("../../book/entities/used-book-post.entity");
const chat_participant_entity_1 = require("../../chat/entities/chat-participant.entity");
const read_receipt_entity_1 = require("../../chat/entities/read-receipt.entity");
const typeorm_1 = require("typeorm");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'provider_id' }),
    __metadata("design:type", String)
], User.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_image_url', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profileImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_hashed_refresh_token', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "currentHashedRefreshToken", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => used_book_post_entity_1.UsedBookPost, (post) => post.user),
    __metadata("design:type", Array)
], User.prototype, "usedBookPosts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_participant_entity_1.ChatParticipant, (participant) => participant.user),
    __metadata("design:type", Array)
], User.prototype, "chatParticipants", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => read_receipt_entity_1.ReadReceipt, (receipt) => receipt.user),
    __metadata("design:type", Array)
], User.prototype, "readReceipts", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' }),
    (0, typeorm_1.Unique)(['provider', 'providerId'])
], User);
//# sourceMappingURL=user.entity.js.map