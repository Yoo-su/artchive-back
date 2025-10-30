import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  ParseIntPipe,
  Get,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookService } from '../services/book.service';
import { CreateBookSaleDto } from '../dtos/create-book-sale.dto';
import { Request } from 'express';
import { UpdateSaleStatusDto } from '../../user/dtos/update-sale-status.dto';
import { GetBookSalesQueryDto } from '../dtos/get-book-sales-query.dto';
import { UpdateBookSaleDto } from '../dtos/update-book-sale.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('sale')
  @UseGuards(AuthGuard('jwt'))
  async createUsedBookSale(
    @Body() createBookSaleDto: CreateBookSaleDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id; // JwtStrategy에서 반환된 user 객체의 id
    const newSale = await this.bookService.createUsedBookSale(
      createBookSaleDto,
      userId,
    );
    return {
      success: true,
      sale: newSale,
    };
  }

  /**
   * 판매글의 상태를 업데이트하는 엔드포인트
   * @param id - 판매글 ID
   * @param updateSaleStatusDto - 변경할 상태 정보
   */
  @Patch('sales/:id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateBookSaleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() updateSaleStatusDto: UpdateSaleStatusDto,
  ) {
    const userId = (req.user as any).id;
    const updatedSale = await this.bookService.updateSaleStatus(
      id,
      userId,
      updateSaleStatusDto.status,
    );
    return {
      success: true,
      sale: updatedSale,
    };
  }

  /**
   * 최근 판매글 목록을 조회하는 엔드포인트
   */
  @Get('sales/recent')
  getRecentSales() {
    return this.bookService.findRecentSales();
  }

  @Get('sales/:id')
  getSaleById(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findSaleById(id);
  }

  /**
   * 특정 책(ISBN)에 대한 판매글 목록을 페이지네이션으로 조회하는 API
   * @param isbn - 책의 ISBN
   * @param query - 페이지네이션 및 필터링 옵션 (page, limit, city, district)
   */
  @Get(':isbn/sales')
  getBookSales(
    @Param('isbn') isbn: string,
    @Query() query: GetBookSalesQueryDto,
  ) {
    return this.bookService.findSalesByIsbn(isbn, query);
  }

  /**
   * 판매글의 내용을 업데이트하는 엔드포인트
   */
  @Patch('sales/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateBookSale(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() updateBookSaleDto: UpdateBookSaleDto,
  ) {
    const userId = (req.user as any).id;
    const updatedSale = await this.bookService.updateUsedBookSale(
      id,
      userId,
      updateBookSaleDto,
    );
    return {
      success: true,
      sale: updatedSale,
    };
  }

  /**
   * 판매글을 삭제하는 엔드포인트
   */
  @Delete('sales/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT) // 성공 시 204 No Content 응답
  async deleteBookSale(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    await this.bookService.deleteUsedBookSale(id, userId);
    return;
  }
}
