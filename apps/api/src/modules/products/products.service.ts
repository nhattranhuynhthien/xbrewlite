import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, In } from 'typeorm';
import { Product, ProductCategory } from './entities/product.entity';
import { Size } from './entities/size.entity';
import { Topping } from './entities/topping.entity';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
    @InjectRepository(Topping)
    private readonly toppingRepository: Repository<Topping>,
  ) {}

  async findAll(query?: QueryProductDto): Promise<{ products: Product[]; total: number }> {
    const qb = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.sizes', 'sizes')
      .orderBy('product.createdAt', 'ASC');

    if (query?.category) {
      qb.andWhere('product.category = :category', { category: query.category });
    }

    if (query?.search) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', { search: `%${query.search}%` });
    }

    const [products, total] = await qb.getManyAndCount();
    return { products, total };
  }

  async findOne(id: string): Promise<Product & { availableToppings: Topping[] }> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['sizes'],
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có mã ID: ${id}`);
    }

    const availableToppings = await this.toppingRepository.find({
      where: { isAvailable: true },
    });

    return {
      ...product,
      availableToppings,
    };
  }

  async getToppings(): Promise<Topping[]> {
    return this.toppingRepository.find({ where: { isAvailable: true } });
  }

  /**
   * Tính đơn giá chuẩn phía Server (Server-side price calculation - TV3: S2-07)
   * Formula: unitPrice = basePrice + sizeExtraPrice + sum(toppingPrices)
   */
  async calculateServerPrice(
    productId: string,
    sizeCode: string,
    toppingIds: string[] = [],
  ): Promise<{
    product: Product;
    unitPrice: number;
    sizeName: string;
    toppings: Topping[];
  }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['sizes'],
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm không tồn tại (ID: ${productId})`);
    }

    if (!product.isAvailable || product.stock <= 0) {
      throw new BadRequestException(`Sản phẩm '${product.name}' hiện đã hết hàng`);
    }

    let extraSizePrice = 0;
    let sizeName = 'Tiêu chuẩn (M)';
    if (sizeCode) {
      const matchedSize = product.sizes?.find((s) => s.code.toUpperCase() === sizeCode.toUpperCase());
      if (matchedSize) {
        extraSizePrice = Number(matchedSize.extraPrice);
        sizeName = matchedSize.name;
      }
    }

    let toppings: Topping[] = [];
    let toppingsTotal = 0;
    if (toppingIds && toppingIds.length > 0) {
      toppings = await this.toppingRepository.find({
        where: { id: In(toppingIds), isAvailable: true },
      });
      toppingsTotal = toppings.reduce((sum, t) => sum + Number(t.price), 0);
    }

    const unitPrice = Number(product.basePrice) + extraSizePrice + toppingsTotal;

    return {
      product,
      unitPrice,
      sizeName,
      toppings,
    };
  }

  /**
   * Atomic stock decrement in transaction (TV3: S2-08)
   */
  async verifyAndDecrementStock(
    queryRunner: QueryRunner,
    productId: string,
    quantity: number,
  ): Promise<Product> {
    const product = await queryRunner.manager.findOne(Product, {
      where: { id: productId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm ${productId}`);
    }

    if (!product.isAvailable || product.stock < quantity) {
      throw new BadRequestException(
        `Sản phẩm '${product.name}' không đủ số lượng tồn kho (còn lại ${product.stock}, yêu cầu ${quantity})`,
      );
    }

    product.stock -= quantity;
    if (product.stock === 0) {
      product.isAvailable = false;
    }

    return queryRunner.manager.save(Product, product);
  }
}
