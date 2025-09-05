import { User } from '../../user/entities/user.entity';
import { ChatMessage } from './chat-message.entity';
export declare class ReadReceipt {
    id: number;
    user: User;
    message: ChatMessage;
}
