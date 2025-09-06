import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/features/user/services/user.service';
import { SocialLoginDto } from '../dtos/social-login.dto';
import { User } from '@/features/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private configService;
    private userService;
    private jwtService;
    constructor(configService: ConfigService, userService: UserService, jwtService: JwtService);
    getTokens(userId: number, nickname: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    socialLogin(socialLoginDto: SocialLoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: User;
    }>;
    refreshToken(userId: number, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    verifyUserByToken(token: string): Promise<User | null>;
}
