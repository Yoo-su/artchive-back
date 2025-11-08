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
import { CookieOptions, Response } from 'express';

import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverLogin() {
    // initiates the Naver OAuth2 login flow
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverLoginCallback(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.socialLogin(
      req.user,
    );

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    res.redirect(this.configService.get('CLIENT_DOMAIN') ?? '');
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {
    // initiates the Kakao OAuth2 login flow
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.socialLogin(
      req.user,
    );

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    res.redirect(this.configService.get('CLIENT_DOMAIN') ?? '');
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    };
    res.clearCookie('accessToken', {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.clearCookie('refreshToken', {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { sub: userId, nickname } = req.user;
    const { accessToken } = await this.authService.refresh(userId, nickname);

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  getUser(@Req() req) {
    return req.user;
  }
}
