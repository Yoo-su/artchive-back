"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../features/auth/auth.module");
const user_module_1 = require("../features/user/user.module");
const user_entity_1 = require("../features/user/entities/user.entity");
const logger_middleware_1 = require("../shared/middlewares/logger.middleware");
const book_module_1 = require("../features/book/book.module");
const used_book_post_entity_1 = require("../features/book/entities/used-book-post.entity");
const book_entity_1 = require("../features/book/entities/book.entity");
const chat_module_1 = require("../features/chat/chat.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(logger_middleware_1.LoggerMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    url: configService.get('DB_URL'),
                    entities: [user_entity_1.User, book_entity_1.Book, used_book_post_entity_1.UsedBookPost],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    autoLoadEntities: true,
                }),
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            book_module_1.BookModule,
            chat_module_1.ChatModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map