import { AuthService } from '../services/auth.service';
import { SocialLoginDto } from '../dtos/social-login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    socialLogin(socialLoginDto: SocialLoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: import("../../user/entities/user.entity").User;
    }>;
    refreshTokens(req: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(req: any): any;
}
