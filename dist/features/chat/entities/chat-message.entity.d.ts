import { User } from '../../user/entities/user.entity';
import { ChatRoom } from './chat-room.entity';
import { ReadReceipt } from './read-receipt.entity';
export declare class ChatMessage {
    id: number;
    content: string;
    createdAt: Date;
    sender: User;
    chatRoom: ChatRoom;
    readReceipts: ReadReceipt[];
}
