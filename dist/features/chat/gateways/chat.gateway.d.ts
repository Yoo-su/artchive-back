import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat.service';
import { AuthService } from '@/features/auth/services/auth.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly authService;
    server: Server;
    private readonly logger;
    constructor(chatService: ChatService, authService: AuthService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(roomId: number, client: Socket): void;
    handleSendMessage(data: {
        roomId: number;
        content: string;
    }, client: Socket): Promise<void>;
}
