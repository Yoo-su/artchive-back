import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from '../entities/chat-room.entity';
import { ChatParticipant } from '../entities/chat-participant.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { User } from '@/features/user/entities/user.entity';
import { UsedBookPost } from '@/features/book/entities/used-book-post.entity';
import { ReadReceipt } from '../entities/read-receipt.entity';
import { ChatGateway } from '../gateways/chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepository: Repository<ChatParticipant>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(UsedBookPost)
    private readonly usedBookPostRepository: Repository<UsedBookPost>,
    @InjectRepository(ReadReceipt)
    private readonly readReceiptRepository: Repository<ReadReceipt>,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * 채팅방을 찾거나 생성합니다.
   */
  async findOrCreateRoom(postId: number, buyerId: number): Promise<ChatRoom> {
    const post = await this.usedBookPostRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }
    const sellerId = post.user.id;
    if (buyerId === sellerId) {
      throw new ForbiddenException('You cannot start a chat with yourself.');
    }

    // 1. 참여자들의 ID를 기반으로 기존 채팅방을 찾습니다.
    const existingRoom = await this.chatRoomRepository
      .createQueryBuilder('room')
      .innerJoin('room.participants', 'p1', 'p1.userId = :buyerId', {
        buyerId,
      })
      .innerJoin('room.participants', 'p2', 'p2.userId = :sellerId', {
        sellerId,
      })
      .where('room.usedBookPost.id = :postId', { postId })
      .leftJoinAndSelect('room.participants', 'allParticipants') // 모든 참여자 정보 로드
      .getOne();

    // 2. 채팅방이 이미 존재할 경우
    if (existingRoom) {
      // 참여자들의 'isActive' 상태를 확인하고, false이면 true로 변경하여 재활성화합니다.
      const participantsToUpdate = existingRoom.participants.filter(
        (p) => !p.isActive,
      );

      if (participantsToUpdate.length > 0) {
        for (const participant of participantsToUpdate) {
          participant.isActive = true;
        }
        await this.chatParticipantRepository.save(participantsToUpdate);

        // 방의 updatedAt을 갱신하여 채팅 목록 상단에 노출되도록 합니다.
        existingRoom.updatedAt = new Date();
        await this.chatRoomRepository.save(existingRoom);
      }

      return existingRoom;
    }

    // 3. 채팅방이 존재하지 않을 경우 새로 생성합니다.
    const newRoom = this.chatRoomRepository.create({ usedBookPost: post });
    await this.chatRoomRepository.save(newRoom);

    const buyerParticipant = this.chatParticipantRepository.create({
      chatRoom: newRoom,
      user: { id: buyerId } as User,
      isActive: true, // 새로 만들 때는 항상 활성 상태
    });
    const sellerParticipant = this.chatParticipantRepository.create({
      chatRoom: newRoom,
      user: { id: sellerId } as User,
      isActive: true, // 새로 만들 때는 항상 활성 상태
    });

    await this.chatParticipantRepository.save([
      buyerParticipant,
      sellerParticipant,
    ]);
    return newRoom;
  }

  /**
   * [완성] 현재 로그인한 유저의 모든 채팅방 목록을 조회합니다.
   * 각 채팅방의 마지막 메시지, 안 읽은 메시지 개수, 상대방 정보를 포함합니다.
   */
  async getChatRooms(userId: number) {
    // 1. 현재 유저가 참여하고 있는 모든 채팅방을 찾습니다.
    const rooms = await this.chatRoomRepository
      .createQueryBuilder('room')
      .innerJoin(
        'room.participants',
        'participant',
        'participant.userId = :userId AND participant.isActive = true',
        { userId },
      )
      .leftJoinAndSelect('room.participants', 'allParticipants')
      .leftJoinAndSelect('allParticipants.user', 'participantUser')
      .leftJoinAndSelect('room.usedBookPost', 'post')
      .leftJoinAndSelect('post.book', 'book')
      .orderBy('room.updatedAt', 'DESC')
      .getMany();

    // 2. 각 채팅방에 대한 추가 정보(마지막 메시지, 안 읽은 개수)를 계산합니다.
    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        // 마지막 메시지 조회
        const lastMessage = await this.chatMessageRepository.findOne({
          where: { chatRoom: { id: room.id } },
          order: { createdAt: 'DESC' },
          relations: ['sender'],
        });

        // 안 읽은 메시지 개수 조회 (ReadReceipt 테이블 기준)
        const unreadCount = await this.chatMessageRepository
          .createQueryBuilder('message')
          .leftJoin(
            'message.readReceipts',
            'receipt',
            'receipt.userId = :userId',
            { userId },
          )
          .where('message.chatRoom.id = :roomId', { roomId: room.id })
          .andWhere('message.sender.id != :userId', { userId })
          .andWhere('receipt.id IS NULL') // 내가 읽음 기록을 남기지 않은 메시지
          .getCount();

        return {
          ...room,
          lastMessage,
          unreadCount,
        };
      }),
    );

    // 마지막 메시지 최신순으로 다시 정렬
    roomsWithDetails.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
      );
    });

    return roomsWithDetails;
  }

  /**
   * 특정 채팅방의 메시지 목록을 페이지네이션으로 조회합니다.
   */
  async getChatMessages(roomId: number, page: number, limit: number) {
    const [messages, total] = await this.chatMessageRepository.findAndCount({
      where: { chatRoom: { id: roomId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' }, // 최신 메시지가 먼저 오도록 정렬
      take: limit,
      skip: (page - 1) * limit,
    });

    const hasNextPage = page * limit < total;

    return {
      messages: messages,
      hasNextPage,
    };
  }

  async saveMessage(
    content: string,
    roomId: number,
    sender: User,
  ): Promise<ChatMessage> {
    const chatRoom = await this.chatRoomRepository.findOneBy({ id: roomId });
    if (!chatRoom) throw new NotFoundException('Chat room not found');

    // 메시지가 추가되면 해당 채팅방의 updatedAt을 갱신하여 목록 정렬에 사용
    chatRoom.updatedAt = new Date();
    await this.chatRoomRepository.save(chatRoom);

    const message = this.chatMessageRepository.create({
      content,
      chatRoom,
      sender,
    });
    return this.chatMessageRepository.save(message);
  }

  /**
   * 특정 채팅방의 안 읽은 메시지를 모두 읽음으로 처리하는 로직
   */
  async markMessagesAsRead(roomId: number, userId: number) {
    // 1. 이 방에서, 상대방이 보냈고, 내가 아직 읽지 않은 모든 메시지를 찾습니다.
    const unreadMessages = await this.chatMessageRepository
      .createQueryBuilder('message')
      .leftJoin('message.readReceipts', 'receipt', 'receipt.userId = :userId', {
        userId,
      })
      .where('message.chatRoom.id = :roomId', { roomId })
      .andWhere('message.sender.id != :userId', { userId })
      .andWhere('receipt.id IS NULL')
      .getMany();

    if (unreadMessages.length === 0) {
      return { success: true, message: 'No new messages to mark as read.' };
    }

    // 2. 찾아낸 모든 메시지에 대해 "내가 읽었다"는 기록을 새로 생성합니다.
    const newReceipts = unreadMessages.map((message) =>
      this.readReceiptRepository.create({
        user: { id: userId } as User,
        message: { id: message.id } as ChatMessage,
      }),
    );

    await this.readReceiptRepository.save(newReceipts);

    return { success: true, message: 'Messages marked as read.' };
  }

  /**
   * 채팅방 나가기
   * @param roomId - 나갈 채팅방 ID
   * @param userId - 나가는 사용자 ID
   */
  async leaveRoom(roomId: number, userId: number) {
    // 1. 내 참여 정보 조회
    const participant = await this.chatParticipantRepository.findOne({
      where: { chatRoom: { id: roomId }, user: { id: userId } },
      relations: ['user'],
    });

    if (!participant || !participant.isActive) {
      throw new NotFoundException('Chat room not found or already left.');
    }

    // 2. 내 참여 상태를 false로 변경
    participant.isActive = false;
    await this.chatParticipantRepository.save(participant);

    // 3. 시스템 메시지 생성 ("OOO님이 나갔습니다.")
    const systemMessage = this.chatMessageRepository.create({
      chatRoom: { id: roomId },
      content: `${participant.user.nickname}님이 나갔습니다.`,
      sender: null, // sender가 null이면 시스템 메시지로 간주
    });
    await this.chatMessageRepository.save(systemMessage);

    // 4. 상대방에게 실시간으로 "userLeft" 이벤트 전송
    this.chatGateway.server.to(String(roomId)).emit('userLeft', {
      roomId,
      message: systemMessage,
    });

    return { success: true, message: 'Successfully left the chat room.' };
  }
}
