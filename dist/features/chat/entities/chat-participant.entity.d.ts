import { User } from '../../user/entities/user.entity';
import { ChatRoom } from './chat-room.entity';
export declare class ChatParticipant {
    id: number;
    user: User;
    chatRoom: ChatRoom;
}
