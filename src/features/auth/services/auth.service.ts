import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/features/user/services/user.service';
import { SocialLoginDto } from '../dtos/social-login.dto';
import { User } from '@/features/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async getTokens(userId: number, nickname: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, nickname },
        { secret: process.env.JWT_SECRET, expiresIn: '1h' },
      ),
      this.jwtService.signAsync(
        { sub: userId, nickname },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '1d' },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  async socialLogin(
    socialLoginDto: SocialLoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    let user = await this.userService.findByProviderId(
      socialLoginDto.provider,
      socialLoginDto.providerId,
    );

    if (!user) {
      user = await this.userService.createUser(socialLoginDto);
    }

    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.nickname,
    );
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    return { accessToken, refreshToken, user };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.currentHashedRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const isRefreshTokenMatching =
      refreshToken === user.currentHashedRefreshToken;
    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.nickname);
    await this.userService.setCurrentRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }
}
