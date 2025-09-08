import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SocialLoginDto } from '@/features/auth/dtos/social-login.dto';
import { UsedBookPost } from '@/features/book/entities/used-book-post.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UsedBookPost)
    private readonly usedBookPostRepository: Repository<UsedBookPost>,
  ) {}

  async findByProviderId(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.userRepository.findOne({ where: { provider, providerId } });
  }

  async createUser(socialLoginDto: SocialLoginDto): Promise<User> {
    const newUser = this.userRepository.create(socialLoginDto);
    return this.userRepository.save(newUser);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    // 실제 프로덕션에서는 bcrypt.hash 등으로 해시하여 저장해야 합니다.
    await this.userRepository.update(userId, {
      currentHashedRefreshToken: refreshToken,
    });
  }

  /**
   * 특정 사용자가 작성한 모든 중고책 판매글을 조회합니다.
   * @param userId - 사용자 ID
   * @returns 사용자의 판매글 목록
   */
  async findMyPosts(userId: number): Promise<UsedBookPost[]> {
    return this.usedBookPostRepository.find({
      where: { user: { id: userId } },
      relations: ['book', 'user'], // 게시글과 연관된 책과 유저 정보를 함께 불러옵니다.
      order: { createdAt: 'DESC' }, // 최신순으로 정렬
    });
  }
}
