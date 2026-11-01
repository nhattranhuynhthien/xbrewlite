import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID sản phẩm' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'M', description: 'Mã size (S, M, L)' })
  @IsString()
  @IsNotEmpty()
  sizeCode: string;

  @ApiProperty({ example: 1, description: 'Số lượng đặt' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: [], description: 'Danh sách ID topping kèm theo', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  toppingIds?: string[];
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên người nhận' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại nhận hàng' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ example: 'Giao tại bàn số 5, ít đường', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [CreateOrderItemDto], description: 'Danh sách món đặt' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
