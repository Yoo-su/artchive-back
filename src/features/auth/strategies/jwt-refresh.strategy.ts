import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');

    // 디버깅용 (나중에 삭제)
    console.log('🔄 JWT_REFRESH_SECRET loaded:', !!refreshSecret);

    if (!refreshSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET is required for JWT refresh strategy',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshSecret,
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, nickname: payload.nickname };
  }
}
