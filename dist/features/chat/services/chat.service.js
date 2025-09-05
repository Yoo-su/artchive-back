"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_room_entity_1 = require("../entities/chat-room.entity");
const chat_participant_entity_1 = require("../entities/chat-participant.entity");
const chat_message_entity_1 = require("../entities/chat-message.entity");
const used_book_post_entity_1 = require("../../book/entities/used-book-post.entity");
const read_receipt_entity_1 = require("../entities/read-receipt.entity");
let ChatService = class ChatService {
    constructor(chatRoomRepository, chatParticipantRepository, chatMessageRepository, usedBookPostRepository, readReceiptRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.usedBookPostRepository = usedBookPostRepository;
        this.readReceiptRepository = readReceiptRepository;
    }
    async findOrCreateRoom(postId, buyerId) {
        const post = await this.usedBookPostRepository.findOne({
            where: { id: postId },
            relations: ['user'],
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found.');
        }
        const sellerId = post.user.id;
        if (buyerId === sellerId) {
            throw new common_1.ForbiddenException('You cannot start a chat with yourself.');
        }
        const existingRoom = await this.chatRoomRepository
            .createQueryBuilder('room')
            .innerJoin('room.participants', 'p1', 'p1.userId = :buyerId', { buyerId })
            .innerJoin('room.participants', 'p2', 'p2.userId = :sellerId', {
            sellerId,
        })
            .where('room.usedBookPost.id = :postId', { postId })
            .getOne();
        if (existingRoom) {
            return existingRoom;
        }
        const newRoom = this.chatRoomRepository.create({ usedBookPost: post });
        await this.chatRoomRepository.save(newRoom);
        const buyerParticipant = this.chatParticipantRepository.create({
            chatRoom: newRoom,
            user: { id: buyerId },
        });
        const sellerParticipant = this.chatParticipantRepository.create({
            chatRoom: newRoom,
            user: { id: sellerId },
        });
        await this.chatParticipantRepository.save([
            buyerParticipant,
            sellerParticipant,
        ]);
        return newRoom;
    }
    async getChatRooms(userId) {
        const rooms = await this.chatRoomRepository
            .createQueryBuilder('room')
            .innerJoin('room.participants', 'participant', 'participant.userId = :userId', { userId })
            .leftJoinAndSelect('room.participants', 'allParticipants')
            .leftJoinAndSelect('allParticipants.user', 'participantUser')
            .leftJoinAndSelect('room.usedBookPost', 'post')
            .leftJoinAndSelect('post.book', 'book')
            .orderBy('room.updatedAt', 'DESC')
            .getMany();
        const roomsWithDetails = await Promise.all(rooms.map(async (room) => {
            const lastMessage = await this.chatMessageRepository.findOne({
                where: { chatRoom: { id: room.id } },
                order: { createdAt: 'DESC' },
                relations: ['sender'],
            });
            const unreadCount = await this.chatMessageRepository
                .createQueryBuilder('message')
                .leftJoin('message.readReceipts', 'receipt', 'receipt.userId = :userId', { userId })
                .where('message.chatRoom.id = :roomId', { roomId: room.id })
                .andWhere('message.sender.id != :userId', { userId })
                .andWhere('receipt.id IS NULL')
                .getCount();
            return {
                ...room,
                lastMessage,
                unreadCount,
            };
        }));
        roomsWithDetails.sort((a, b) => {
            if (!a.lastMessage)
                return 1;
            if (!b.lastMessage)
                return -1;
            return (b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime());
        });
        return roomsWithDetails;
    }
    async getChatMessages(roomId, page, limit) {
        const [messages, total] = await this.chatMessageRepository.findAndCount({
            where: { chatRoom: { id: roomId } },
            relations: ['sender'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: (page - 1) * limit,
        });
        const hasNextPage = page * limit < total;
        return {
            messages: messages,
            hasNextPage,
        };
    }
    async saveMessage(content, roomId, sender) {
        const chatRoom = await this.chatRoomRepository.findOneBy({ id: roomId });
        if (!chatRoom)
            throw new common_1.NotFoundException('Chat room not found');
        chatRoom.updatedAt = new Date();
        await this.chatRoomRepository.save(chatRoom);
        const message = this.chatMessageRepository.create({
            content,
            chatRoom,
            sender,
        });
        return this.chatMessageRepository.save(message);
    }
    async markMessagesAsRead(roomId, userId) {
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
        const newReceipts = unreadMessages.map((message) => this.readReceiptRepository.create({
            user: { id: userId },
            message: { id: message.id },
        }));
        await this.readReceiptRepository.save(newReceipts);
        return { success: true, message: 'Messages marked as read.' };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_room_entity_1.ChatRoom)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_participant_entity_1.ChatParticipant)),
    __param(2, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __param(3, (0, typeorm_1.InjectRepository)(used_book_post_entity_1.UsedBookPost)),
    __param(4, (0, typeorm_1.InjectRepository)(read_receipt_entity_1.ReadReceipt)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map