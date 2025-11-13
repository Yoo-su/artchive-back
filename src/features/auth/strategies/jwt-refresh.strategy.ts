import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { extractCookie } from '@/shared/utils/extract-cookie';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => extractCookie(req, 'refreshToken'),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
    });
  }

  validate(payload: JwtPayload) {
    return { sub: payload.sub, nickname: payload.username };
  }
}
