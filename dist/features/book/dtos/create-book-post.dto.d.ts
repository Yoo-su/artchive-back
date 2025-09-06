import { BookInfoDto } from './book-info.dto';
export declare class CreateBookPostDto {
    title: string;
    price: number;
    city: string;
    district: string;
    content: string;
    imageUrls: string[];
    book: BookInfoDto;
}
