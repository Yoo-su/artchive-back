import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat.service';
import { AuthService } from '@/features/auth/services/auth.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // 실제 프로덕션에서는 프론트엔드 주소로 제한
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  // 클라이언트 연결 시 인증 처리
  async handleConnection(client: Socket) {
    try {
      // ✨ [수정됨] 옵셔널 체이닝(?.)과 nullish coalescing(??)을 사용하여 안전하게 토큰 추출
      const token = client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('Missing authentication token');
      }

      // 💡 참고: AuthService에 verifyUserByToken 메서드를 구현해야 합니다.
      // 이 메서드는 JWT 토큰을 검증하고 유저 정보를 반환합니다.
      const user = await this.authService.verifyUserByToken(token);
      if (!user) {
        throw new Error('Invalid token');
      }

      // 소켓 인스턴스에 유저 정보를 저장하여 나중에 사용
      client.data.user = user;
      this.logger.log(`Client connected: ${client.id}, User ID: ${user.id}`);
    } catch (e) {
      this.logger.error(`Connection failed: ${e.message}`);
      client.disconnect(); // 인증 실패 시 연결을 끊습니다.
    }
  }

  // 클라이언트 연결 해제 시
  handleDisconnect(client: Socket) {
    if (client.data.user) {
      this.logger.log(
        `Client disconnected: ${client.id}, User ID: ${client.data.user.id}`,
      );
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  // 채팅방 입장
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(String(roomId));
    this.logger.log(`Client ${client.id} joined room ${roomId}`);
  }

  // 메시지 전송
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    const { roomId, content } = data;

    // 1. 메시지를 DB에 저장
    const message = await this.chatService.saveMessage(content, roomId, user);

    // 2. 해당 룸의 모든 클라이언트에게 메시지 전송 (보낸 사람 포함)
    this.server.to(String(roomId)).emit('newMessage', message);
  }
}
