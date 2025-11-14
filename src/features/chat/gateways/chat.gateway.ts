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
import { User } from '@/features/user/entities/user.entity';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/features/user/services/user.service';
import { JwtPayload } from '@/features/auth/types/jwt-payload.type';

type AckCallback = (response: {
  status: 'ok' | 'error';
  message?: any;
  error?: string;
}) => void;

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_DOMAIN || 'http://localhost:3000',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<number, Socket> = new Map();
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // handleConnection에서 직접 인증 처리
  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;

      if (!authHeader) {
        this.logger.warn('Missing authorization header');
        client.disconnect(true);
        return;
      }

      const [type, accessToken] = authHeader.split(' ');

      if (type !== 'Bearer' || !accessToken) {
        this.logger.warn('Invalid token format');
        client.disconnect(true);
        return;
      }

      // JWT 검증
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        accessToken,
        {
          secret: process.env.JWT_SECRET,
        },
      );

      // 사용자 조회
      const user = await this.userService.findById(payload.sub);

      if (!user) {
        this.logger.warn(`User with id ${payload.sub} not found`);
        client.disconnect(true);
        return;
      }

      client.data.user = user;

      // 유저 매핑
      this.connectedUsers.set(user.id, client);
      this.logger.log(`Client connected: ${client.id}, User ID: ${user.id}`);
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
      client.disconnect(true);
    }
  }

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

  async joinRoom(userIds: number[], roomId: number) {
    const roomIdStr = String(roomId);

    const joinPromises = userIds.map(async (userId) => {
      const userSocket = this.connectedUsers.get(userId);
      if (userSocket) {
        try {
          await userSocket.join(roomIdStr);
          this.logger.log(
            `User ${userId} (Client ${userSocket.id}) joined room ${roomIdStr}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to join room ${roomIdStr} for user ${userId}: ${error.message}`,
          );
        }
      } else {
        this.logger.warn(`User ${userId} is not connected.`);
      }
    });

    await Promise.all(joinPromises);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: number; content: string },
    @ConnectedSocket() client: Socket,
    ack: AckCallback,
  ) {
    const user = client.data.user as User;
    const { roomId, content } = data;

    if (!user) {
      const errorMsg = 'User is not authenticated. Cannot send message.';
      this.logger.error(errorMsg);
      if (ack) ack({ status: 'error', error: errorMsg });
      return;
    }

    try {
      const message = await this.chatService.saveMessage(content, roomId, user);
      this.server.to(String(roomId)).emit('newMessage', message);
      if (ack) ack({ status: 'ok', message });
    } catch (error) {
      const errorMsg = `Failed to save message for user ${
        user?.id || 'UNKNOWN'
      } in room ${roomId}: ${error.message}`;
      this.logger.error(errorMsg);
      if (ack) ack({ status: 'error', error: error.message });
    }
  }

  @SubscribeMessage('subscribeToAllRooms')
  async andleSubscribeToAllRooms(
    @MessageBody() roomIds: number[],
    @ConnectedSocket() client: Socket,
  ) {
    if (!Array.isArray(roomIds)) return;
    const roomIdsAsStrings = roomIds.map(String);
    await client.join(roomIdsAsStrings);
    this.logger.log(
      `Client ${client.id} subscribed to rooms: [${roomIdsAsStrings.join(
        ', ',
      )}]`,
    );
  }

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

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(String(data.roomId)).emit('typing', { isTyping: false });
  }
}
