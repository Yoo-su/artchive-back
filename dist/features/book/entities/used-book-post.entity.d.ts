import { User } from '@/features/user/entities/user.entity';
import { Book } from './book.entity';
import { ChatRoom } from '@/features/chat/entities/chat-room.entity';
export declare enum PostStatus {
    FOR_SALE = "FOR_SALE",
    RESERVED = "RESERVED",
    SOLD = "SOLD"
}
export declare class UsedBookPost {
    id: number;
    title: string;
    price: number;
    city: string;
    district: string;
    content: string;
    imageUrls: string[];
    status: PostStatus;
    user: User;
    book: Book;
    createdAt: Date;
    updatedAt: Date;
    chatRooms: ChatRoom[];
}
