// src/features/user/user.controller.ts

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /user/me
  @Get('me')
  @UseGuards(AuthGuard('jwt')) // 이 가드가 토큰을 검증합니다.
  getProfile(@Req() req: Request) {
    return {
      message: 'Hello World! This is a protected route.',
    };
  }

  /**
   * ✨ [신규] 내가 등록한 모든 판매글을 조회하는 엔드포인트
   */
  @Get('my-posts')
  @UseGuards(AuthGuard('jwt'))
  async getMyPosts(@Req() req: Request) {
    const userId = (req.user as any).id;
    const posts = await this.userService.findMyPosts(userId);
    return {
      success: true,
      data: posts,
    };
  }
}
