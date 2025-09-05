import { UsedBookPost } from './used-book-post.entity';
export declare class Book {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    description: string;
    image: string;
    usedBookPosts: UsedBookPost[];
    createdAt: Date;
    updatedAt: Date;
}
