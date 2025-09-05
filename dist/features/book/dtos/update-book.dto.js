"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBookDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_book_post_dto_1 = require("./create-book-post.dto");
class UpdateBookDto extends (0, mapped_types_1.PartialType)(create_book_post_dto_1.CreateBookPostDto) {
}
exports.UpdateBookDto = UpdateBookDto;
//# sourceMappingURL=update-book.dto.js.map