import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Thanh toán đơn hàng mô phỏng (Ví / Thẻ) kèm Idempotency-Key' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Khóa UUIDv4 duy nhất chống thanh toán trừ tiền trùng lặp',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Thanh toán thành công' })
  @ApiResponse({ status: 400, description: 'Thiếu header Idempotency-Key hoặc giao dịch thất bại' })
  async processPayment(
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() dto: ProcessPaymentDto,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Bắt buộc phải cung cấp header Idempotency-Key');
    }
    return this.paymentsService.processPayment(idempotencyKey, dto);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Lấy lịch sử giao dịch thanh toán của một đơn hàng' })
  @ApiResponse({ status: 200, description: 'Danh sách giao dịch' })
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrderId(orderId);
  }
}
