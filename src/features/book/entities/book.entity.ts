import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsedBookPost } from './used-book-post.entity';

@Entity({ name: 'books' })
export class Book {
  @PrimaryColumn()
  isbn: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  publisher: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  image: string;

  @OneToMany(() => UsedBookPost, (post) => post.book)
  usedBookPosts: UsedBookPost[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
