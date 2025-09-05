import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from '../services/chat.service';
import { Request } from 'express';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 내 채팅방 목록 조회
  @Get('rooms')
  getMyChatRooms(@Req() req: Request) {
    const userId = req.user.id;
    return this.chatService.getChatRooms(userId);
  }

  // 특정 채팅방 메시지 조회 (페이지네이션)
  @Get('rooms/:roomId/messages')
  getMessages(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.chatService.getChatMessages(roomId, page, limit);
  }

  /**
   * 특정 판매글에 대한 채팅방을 찾거나 생성하는 API
   */
  @Post('rooms')
  findOrCreateRoom(
    @Body('postId', ParseIntPipe) postId: number,
    @Req() req: Request,
  ) {
    const buyerId = req.user.id;
    return this.chatService.findOrCreateRoom(postId, buyerId);
  }

  /**
   * 특정 채팅방의 메시지를 모두 읽음으로 처리하는 API
   */
  @Patch('rooms/:roomId/read')
  markAsRead(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Req() req: Request,
  ) {
    const userId = req.user.id;
    return this.chatService.markMessagesAsRead(roomId, userId);
  }
}
