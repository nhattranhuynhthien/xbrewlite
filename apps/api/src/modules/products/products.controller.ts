import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-product.dto';

@ApiTags('Products / Catalog')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm đồ uống (Menu)' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm thành công' })
  async findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get('toppings')
  @ApiOperation({ summary: 'Lấy danh sách topping khả dụng' })
  @ApiResponse({ status: 200, description: 'Danh sách topping' })
  async getToppings() {
    return this.productsService.getToppings();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm kèm Size và Topping' })
  @ApiParam({ name: 'id', description: 'Mã định danh sản phẩm (UUID)' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết sản phẩm' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
