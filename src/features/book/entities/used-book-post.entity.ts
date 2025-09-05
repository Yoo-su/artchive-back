import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/features/user/entities/user.entity';
import { Book } from './book.entity';
import { ChatRoom } from '@/features/chat/entities/chat-room.entity';

export enum PostStatus {
  FOR_SALE = 'FOR_SALE', // 판매중
  RESERVED = 'RESERVED', // 예약중
  SOLD = 'SOLD', // 판매완료
}

@Entity({ name: 'used_book_posts' })
export class UsedBookPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  price: number;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column('text')
  content: string;

  @Column('simple-array')
  imageUrls: string[];

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.FOR_SALE,
  })
  status: PostStatus;

  @ManyToOne(() => User, (user) => user.usedBookPosts, {
    onDelete: 'CASCADE', // 유저가 삭제되면 게시글도 함께 삭제
  })
  @JoinColumn({ name: 'userId' }) // 외래 키 컬럼명을 'userId'로 명시
  user: User;

  @ManyToOne(() => Book, (book) => book.usedBookPosts, {
    eager: true, // 판매글 조회 시 항상 책 정보도 함께 로드
    onDelete: 'SET NULL', // 책 마스터 정보가 삭제되더라도 판매글은 유지 (null로 설정)
  })
  @JoinColumn({ name: 'bookIsbn' }) // 외래 키 컬럼명을 'bookIsbn'로 명시
  book: Book;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 하나의 판매글은 여러개의 채팅방을 가질 수 있습니다.
  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.usedBookPost)
  chatRooms: ChatRoom[];
}
