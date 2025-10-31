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
import { User } from '@/features/user/entities/user.entity';

type AckCallback = (response: {
  status: 'ok' | 'error';
  message?: any;
  error?: string;
}) => void;

@WebSocketGateway({
  cors: {
    origin: '*', // 실제 프로덕션에서는 프론트엔드 주소로 제한
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 유저 ID와 소켓 ID를 매핑하여 관리
  private connectedUsers: Map<number, Socket> = new Map();
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  // 클라이언트 연결 시 인증 처리 및 유저 매핑
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) throw new Error('Missing authentication token');

      const user = await this.authService.verifyUserByToken(token);
      if (!user) throw new Error('Invalid token');

      client.data.user = user;
      this.connectedUsers.set(user.id, client); // 유저 ID와 소켓 인스턴스 매핑
      this.logger.log(`Client connected: ${client.id}, User ID: ${user.id}`);
    } catch (e) {
      this.logger.error(`Connection failed: ${e.message}`);
      client.disconnect();
    }
  }

  // 클라이언트 연결 해제 시 유저 매핑 제거
  handleDisconnect(client: Socket) {
    if (client.data.user) {
      this.connectedUsers.delete(client.data.user.id);
      this.logger.log(
        `Client disconnected: ${client.id}, User ID: ${client.data.user.id}`,
      );
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  /**
   * 특정 유저들을 채팅방에 참여시킵니다.
   * @param userIds - 채팅방에 참여시킬 유저들의 ID 배열
   * @param roomId - 참여할 채팅방의 ID
   */
  joinRoom(userIds: number[], roomId: number) {
    const roomIdStr = String(roomId);
    userIds.forEach((userId) => {
      const userSocket = this.connectedUsers.get(userId);
      if (userSocket) {
        userSocket.join(roomIdStr);
        this.logger.log(
          `User ${userId} (Client ${userSocket.id}) joined room ${roomIdStr}`,
        );
      } else {
        this.logger.warn(`User ${userId} is not connected.`);
      }
    });
  }

  // 메시지 전송
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: number; content: string },
    @ConnectedSocket() client: Socket,
    ack: AckCallback,
  ) {
    const user = client.data.user as User;
    const { roomId, content } = data;

    try {
      const message = await this.chatService.saveMessage(content, roomId, user);
      this.server.to(String(roomId)).emit('newMessage', message);
      if (ack) ack({ status: 'ok', message });
    } catch (error) {
      if (ack) ack({ status: 'error', error: error.message });
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
    if (!Array.isArray(roomIds)) return;
    const roomIdsAsStrings = roomIds.map(String);
    client.join(roomIdsAsStrings);
    this.logger.log(
      `Client ${client.id} subscribed to rooms: [${roomIdsAsStrings.join(
        ', ',
      )}]`,
    );
  }

  // 입력 시작 이벤트
  @SubscribeMessage('startTyping')
  handleStartTyping(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user as User;
    client
      .to(String(data.roomId))
      .emit('typing', { nickname: user.nickname, isTyping: true });
  }

  // 입력 중지 이벤트
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(String(data.roomId)).emit('typing', { isTyping: false });
  }
}
