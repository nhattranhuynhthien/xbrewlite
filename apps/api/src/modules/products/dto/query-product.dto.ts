import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '../entities/product.entity';

export class QueryProductDto {
  @ApiPropertyOptional({ enum: ProductCategory, description: 'Lọc theo danh mục' })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên sản phẩm' })
  @IsOptional()
  @IsString()
  search?: string;
}
