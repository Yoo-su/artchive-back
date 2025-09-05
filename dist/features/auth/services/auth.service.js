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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../../user/services/user.service");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(configService, userService, jwtService) {
        this.configService = configService;
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async getTokens(userId, nickname) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, nickname }, { secret: process.env.JWT_SECRET, expiresIn: '1h' }),
            this.jwtService.signAsync({ sub: userId, nickname }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '1d' }),
        ]);
        return { accessToken, refreshToken };
    }
    async socialLogin(socialLoginDto) {
        let user = await this.userService.findByProviderId(socialLoginDto.provider, socialLoginDto.providerId);
        if (!user) {
            user = await this.userService.createUser(socialLoginDto);
        }
        const { accessToken, refreshToken } = await this.getTokens(user.id, user.nickname);
        await this.userService.setCurrentRefreshToken(refreshToken, user.id);
        return { accessToken, refreshToken, user };
    }
    async refreshToken(userId, refreshToken) {
        const user = await this.userService.findById(userId);
        if (!user || !user.currentHashedRefreshToken) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const isRefreshTokenMatching = refreshToken === user.currentHashedRefreshToken;
        if (!isRefreshTokenMatching) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const tokens = await this.getTokens(user.id, user.nickname);
        await this.userService.setCurrentRefreshToken(tokens.refreshToken, user.id);
        return tokens;
    }
    async verifyUserByToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_SECRET'),
            });
            const user = await this.userService.findById(payload.sub);
            return user;
        }
        catch (error) {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map