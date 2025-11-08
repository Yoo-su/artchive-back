import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { AuthService } from '../services/auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID ?? '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL ?? '',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any, // 'any' 대신 더 구체적인 타입을 정의할 수 있습니다.
    done: (error: any, user?: any, info?: any) => void,
  ) {
    try {
      // 1. profile 객체에서 원하는 정보를 추출합니다.
      const provider = 'kakao';
      const providerId = profile.id;
      const username = profile.username || profile._json.properties.nickname;
      const profileImg = profile._json.properties.profile_image;

      // 2. 이 정보로 AuthService를 통해 유저를 찾거나 생성합니다.
      const user = await this.authService.validateUser({
        provider,
        providerId,
        username,
        profileImg,
      });

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
