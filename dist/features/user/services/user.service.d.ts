import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SocialLoginDto } from '@/features/auth/dtos/social-login.dto';
import { UsedBookPost } from '@/features/book/entities/used-book-post.entity';
export declare class UserService {
    private userRepository;
    private readonly usedBookPostRepository;
    constructor(userRepository: Repository<User>, usedBookPostRepository: Repository<UsedBookPost>);
    findByProviderId(provider: string, providerId: string): Promise<User | null>;
    createUser(socialLoginDto: SocialLoginDto): Promise<User>;
    findById(id: number): Promise<User | null>;
    setCurrentRefreshToken(refreshToken: string, userId: number): Promise<void>;
    findMyPosts(userId: number): Promise<UsedBookPost[]>;
}
