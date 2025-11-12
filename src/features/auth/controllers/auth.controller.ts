import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { SocialAuth } from '../decorators/social-auth.decorator';
import { getCookieOptions } from '@/shared/utils/get-cookie-options';
import { TOKEN_EXPIRY } from '../auth.constants';
import { CurrentUser } from '@/features/user/decorators/current-user.decorator';
import { COOKIE_NAMES } from '@/shared/constants/cookie.constant';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  private isProduction(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  private redirectToClient(res: Response): void {
    res.redirect(this.configService.get('CLIENT_DOMAIN') ?? '');
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction = this.isProduction();
    const baseCookieOptions = getCookieOptions(isProduction);

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      ...baseCookieOptions,
      maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
    });

    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      ...baseCookieOptions,
      maxAge: TOKEN_EXPIRY.REFRESH_TOKEN,
    });
  }

  @Get('naver')
  @SocialAuth('naver')
  async naverLogin() {
    // initiates the Naver OAuth2 login flow
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverLoginCallback(@CurrentUser() user, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.socialLogin(user);

    this.setAuthCookies(res, accessToken, refreshToken);
    this.redirectToClient(res);
  }

  @Get('kakao')
  @SocialAuth('kakao')
  async kakaoLogin() {
    // initiates the Kakao OAuth2 login flow
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@CurrentUser() user, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.socialLogin(user);

    this.setAuthCookies(res, accessToken, refreshToken);
    this.redirectToClient(res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = this.isProduction();
    const cookieOptions = getCookieOptions(isProduction);

    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, cookieOptions);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, cookieOptions);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async refresh(
    @CurrentUser() user,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isProduction = this.isProduction();
    const { sub: userId, nickname } = user;
    const { accessToken } = await this.authService.refresh(userId, nickname);

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      ...getCookieOptions(isProduction),
      maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
    });
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  getUser(@CurrentUser() user) {
    return user;
  }
}
