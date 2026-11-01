import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';

@ApiTags('Promotions & Loyalty')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('validate')
  @ApiOperation({ summary: 'Kiểm tra và áp dụng mã giảm giá' })
  @ApiQuery({ name: 'code', example: 'BREW10' })
  @ApiQuery({ name: 'amount', example: 85000 })
  @ApiResponse({ status: 200, description: 'Mã hợp lệ và trả về số tiền chiết khấu' })
  @ApiResponse({ status: 400, description: 'Mã không đủ điều kiện' })
  async validateCode(
    @Query('code') code: string,
    @Query('amount') amount: string,
  ) {
    if (!code || !amount) {
      throw new BadRequestException('Vui lòng cung cấp mã code và giá trị đơn hàng');
    }
    return this.promotionsService.validatePromoCode(code, parseFloat(amount));
  }
}
