import { ChatService } from '../services/chat.service';
import { Request } from 'express';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMyChatRooms(req: Request): Promise<{
        lastMessage: import("../entities/chat-message.entity").ChatMessage | null;
        unreadCount: number;
        id: number;
        createdAt: Date;
        usedBookPost: import("../../book/entities/used-book-post.entity").UsedBookPost;
        participants: import("../entities/chat-participant.entity").ChatParticipant[];
        messages: import("../entities/chat-message.entity").ChatMessage[];
        updatedAt: Date;
    }[]>;
    getMessages(roomId: number, page?: number, limit?: number): Promise<{
        messages: import("../entities/chat-message.entity").ChatMessage[];
        hasNextPage: boolean;
    }>;
    findOrCreateRoom(postId: number, req: Request): Promise<import("../entities/chat-room.entity").ChatRoom>;
    markAsRead(roomId: number, req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
}
