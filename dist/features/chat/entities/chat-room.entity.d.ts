import { UsedBookPost } from '@/features/book/entities/used-book-post.entity';
import { ChatParticipant } from './chat-participant.entity';
import { ChatMessage } from './chat-message.entity';
export declare class ChatRoom {
    id: number;
    createdAt: Date;
    usedBookPost: UsedBookPost;
    participants: ChatParticipant[];
    messages: ChatMessage[];
    updatedAt: Date;
}
