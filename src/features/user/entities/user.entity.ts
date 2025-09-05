import { UsedBookPost } from '@/features/book/entities/used-book-post.entity';
import { ChatParticipant } from '@/features/chat/entities/chat-participant.entity';
import { ReadReceipt } from '@/features/chat/entities/read-receipt.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'users' })
@Unique(['provider', 'providerId'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  provider: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  nickname: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl: string;

  @Column({ name: 'current_hashed_refresh_token', nullable: true })
  currentHashedRefreshToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UsedBookPost, (post) => post.user)
  usedBookPosts: UsedBookPost[];

  @OneToMany(() => ChatParticipant, (participant) => participant.user)
  chatParticipants: ChatParticipant[];

  @OneToMany(() => ReadReceipt, (receipt) => receipt.user)
  readReceipts: ReadReceipt[];
}
