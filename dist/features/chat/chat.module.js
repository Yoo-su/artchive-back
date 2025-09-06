"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_gateway_1 = require("./gateways/chat.gateway");
const chat_service_1 = require("./services/chat.service");
const chat_controller_1 = require("./controllers/chat.controller");
const chat_room_entity_1 = require("./entities/chat-room.entity");
const chat_participant_entity_1 = require("./entities/chat-participant.entity");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const auth_module_1 = require("../auth/auth.module");
const user_module_1 = require("../user/user.module");
const book_module_1 = require("../book/book.module");
const used_book_post_entity_1 = require("../book/entities/used-book-post.entity");
const read_receipt_entity_1 = require("./entities/read-receipt.entity");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                chat_room_entity_1.ChatRoom,
                chat_participant_entity_1.ChatParticipant,
                chat_message_entity_1.ChatMessage,
                used_book_post_entity_1.UsedBookPost,
                read_receipt_entity_1.ReadReceipt,
            ]),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            book_module_1.BookModule,
        ],
        providers: [chat_gateway_1.ChatGateway, chat_service_1.ChatService],
        controllers: [chat_controller_1.ChatController],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map