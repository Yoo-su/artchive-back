import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/features/user/services/user.service';
import { SocialLoginDto } from '../dtos/social-login.dto';
import { User } from '@/features/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async getTokens(userId: number, nickname: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, nickname },
        { secret: process.env.JWT_SECRET, expiresIn: '1s' },
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

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException('Access Denied');
    }
    const tokens = await this.getTokens(user.id, user.nickname);
    await this.userService.setCurrentRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  /**
   * WebSocket 인증을 위한 토큰 검증 메서드
   * - Access Token을 받아 유효성을 검사하고, 해당 유저 정보를 반환합니다.
   * @param token - 클라이언트가 보낸 Access Token
   * @returns {Promise<User | null>} 유저 정보 또는 null
   */
  async verifyUserByToken(token: string): Promise<User | null> {
    try {
      // 1. 토큰의 유효성(서명, 만료일 등)을 검사합니다.
      //    비밀 키는 환경 변수에서 안전하게 가져옵니다.
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 2. 토큰이 유효하면, payload의 sub(userId)를 사용해 DB에서 유저를 찾습니다.
      const user = await this.userService.findById(payload.sub);
      return user;
    } catch (error) {
      // 토큰이 유효하지 않거나(만료, 변조 등) 에러 발생 시 null을 반환합니다.
      return null;
    }
  }
}
