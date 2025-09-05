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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const used_book_post_entity_1 = require("../../book/entities/used-book-post.entity");
let UserService = class UserService {
    constructor(userRepository, usedBookPostRepository) {
        this.userRepository = userRepository;
        this.usedBookPostRepository = usedBookPostRepository;
    }
    async findByProviderId(provider, providerId) {
        return this.userRepository.findOne({ where: { provider, providerId } });
    }
    async createUser(socialLoginDto) {
        const newUser = this.userRepository.create(socialLoginDto);
        return this.userRepository.save(newUser);
    }
    async findById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
    async setCurrentRefreshToken(refreshToken, userId) {
        await this.userRepository.update(userId, {
            currentHashedRefreshToken: refreshToken,
        });
    }
    async findMyPosts(userId) {
        return this.usedBookPostRepository.find({
            where: { user: { id: userId } },
            relations: ['book', 'user'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(used_book_post_entity_1.UsedBookPost)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map