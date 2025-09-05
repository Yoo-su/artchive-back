import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

@Entity({ name: 'chat_participants' })
@Unique(['user', 'chatRoom'])
export class ChatParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chatParticipants)
  user: User;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.participants)
  chatRoom: ChatRoom;
}
