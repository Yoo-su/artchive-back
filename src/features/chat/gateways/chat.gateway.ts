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
      const token = client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('Missing authentication token');
      }

      // JWT 토큰을 검증하고 유저 정보를 반환합니다.
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

  // 메시지 전송
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    // ⭐️ 마지막 인자로 ack (callback 함수) 추가
    @MessageBody() data: { roomId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    const { roomId, content } = data;
    const ack = arguments[arguments.length - 1]; // ack 함수 가져오기

    try {
      const message = await this.chatService.saveMessage(content, roomId, user);
      this.server.to(String(roomId)).emit('newMessage', message);

      // ⭐️ 성공 시 클라이언트에 성공 응답 전송
      if (typeof ack === 'function') {
        ack({ status: 'ok', message });
      }
    } catch (error) {
      // ⭐️ 실패 시 클라이언트에 에러 응답 전송
      if (typeof ack === 'function') {
        ack({ status: 'error', error: error.message });
      }
      this.logger.error(
        `Failed to save message for user ${user.id} in room ${roomId}: ${error.message}`,
      );
    }
  }

  // 클라이언트가 보내는 모든 채팅방 구독 요청 처리
  @SubscribeMessage('subscribeToAllRooms')
  handleSubscribeToAllRooms(
    @MessageBody() roomIds: number[],
    @ConnectedSocket() client: Socket,
  ) {
    if (!Array.isArray(roomIds)) {
      return;
    }
    const roomIdsAsStrings = roomIds.map(String);
    client.join(roomIdsAsStrings);
    this.logger.log(
      `Client ${client.id} subscribed to rooms: [${roomIdsAsStrings.join(', ')}]`,
    );
  }

  // 입력 시작 이벤트
  @SubscribeMessage('startTyping')
  handleStartTyping(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    // 자신을 제외한 룸의 다른 사람들에게만 이벤트 전송
    client.to(String(data.roomId)).emit('typing', {
      nickname: user.nickname,
      isTyping: true,
    });
  }

  // 입력 중지 이벤트
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // 자신을 제외한 룸의 다른 사람들에게만 이벤트 전송
    client.to(String(data.roomId)).emit('typing', {
      isTyping: false,
    });
  }
}
