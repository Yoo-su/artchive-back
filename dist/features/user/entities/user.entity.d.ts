import { UsedBookPost } from '@/features/book/entities/used-book-post.entity';
import { ChatParticipant } from '@/features/chat/entities/chat-participant.entity';
import { ReadReceipt } from '@/features/chat/entities/read-receipt.entity';
export declare class User {
    id: number;
    provider: string;
    providerId: string;
    email: string;
    nickname: string;
    profileImageUrl: string;
    currentHashedRefreshToken: string;
    createdAt: Date;
    updatedAt: Date;
    usedBookPosts: UsedBookPost[];
    chatParticipants: ChatParticipant[];
    readReceipts: ReadReceipt[];
}
