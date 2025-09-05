import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SocialLoginDto } from '../dtos/social-login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('social-login')
  async socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    return this.authService.socialLogin(socialLoginDto);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  refreshTokens(@Req() req) {
    const userId = req.user.sub;
    const refreshToken = req.headers.authorization.split(' ')[1];
    return this.authService.refreshToken(userId, refreshToken);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    return req.user;
  }
}
