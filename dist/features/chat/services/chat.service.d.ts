import { Repository } from 'typeorm';
import { ChatRoom } from '../entities/chat-room.entity';
import { ChatParticipant } from '../entities/chat-participant.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { User } from '@/features/user/entities/user.entity';
import { UsedBookPost } from '@/features/book/entities/used-book-post.entity';
import { ReadReceipt } from '../entities/read-receipt.entity';
export declare class ChatService {
    private readonly chatRoomRepository;
    private readonly chatParticipantRepository;
    private readonly chatMessageRepository;
    private readonly usedBookPostRepository;
    private readonly readReceiptRepository;
    constructor(chatRoomRepository: Repository<ChatRoom>, chatParticipantRepository: Repository<ChatParticipant>, chatMessageRepository: Repository<ChatMessage>, usedBookPostRepository: Repository<UsedBookPost>, readReceiptRepository: Repository<ReadReceipt>);
    findOrCreateRoom(postId: number, buyerId: number): Promise<ChatRoom>;
    getChatRooms(userId: number): Promise<{
        lastMessage: ChatMessage | null;
        unreadCount: number;
        id: number;
        createdAt: Date;
        usedBookPost: UsedBookPost;
        participants: ChatParticipant[];
        messages: ChatMessage[];
        updatedAt: Date;
    }[]>;
    getChatMessages(roomId: number, page: number, limit: number): Promise<{
        messages: ChatMessage[];
        hasNextPage: boolean;
    }>;
    saveMessage(content: string, roomId: number, sender: User): Promise<ChatMessage>;
    markMessagesAsRead(roomId: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
