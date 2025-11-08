import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/features/user/services/user.service';

import { User } from '@/features/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(socialLoginDto: {
    provider: string;
    providerId: string;
    username: string;
    profileImg: string;
  }) {
    const { provider, providerId, username, profileImg } = socialLoginDto;
    const user = await this.userService.findByProviderId(provider, providerId);
    if (user) {
      return user;
    }
    const newUser = await this.userService.createUser({
      provider,
      providerId,
      nickname: username,
      profileImageUrl: profileImg,
    });
    return newUser;
  }

  async getTokens(userId: number, nickname: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, nickname },
        { secret: process.env.JWT_SECRET, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, nickname },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '1d' },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  async socialLogin(user: User) {
    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.nickname,
    );

    return { accessToken, refreshToken, user };
  }

  async refresh(userId: number, nickname: string) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, nickname },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' },
    );
    return { accessToken };
  }
}
