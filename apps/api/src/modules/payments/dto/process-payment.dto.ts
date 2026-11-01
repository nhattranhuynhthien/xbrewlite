import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'ID đơn hàng cần thanh toán' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.E_WALLET,
    description: 'Phương thức thanh toán: E-WALLET (Ví Momo) hoặc CARD (Thẻ Visa)',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty({ example: 85000, description: 'Số tiền thanh toán (VND)' })
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Cờ kiểm thử giả lập lỗi thanh toán (Ví hết tiền / Thẻ lỗi)',
  })
  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}
