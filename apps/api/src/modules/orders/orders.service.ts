import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemTopping } from './entities/order-item-topping.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { UserRole } from '../auth/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Tạo đơn hàng nguyên tử trong Database Transaction (TV4: S2-10)
   */
  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Giỏ hàng không được để trống khi tạo đơn');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      let orderTotal = 0;
      const orderItemsToInsert: OrderItem[] = [];

      for (const itemDto of dto.items) {
        // 1. Tính giá chuẩn phía server (TV3: S2-07)
        const pricing = await this.productsService.calculateServerPrice(
          itemDto.productId,
          itemDto.sizeCode,
          itemDto.toppingIds,
        );

        // 2. Kiểm tra và trừ tồn kho nguyên tử (TV3: S2-08)
        await this.productsService.verifyAndDecrementStock(
          queryRunner,
          itemDto.productId,
          itemDto.quantity,
        );

        const subtotal = pricing.unitPrice * itemDto.quantity;
        orderTotal += subtotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          productId: pricing.product.id,
          productName: pricing.product.name,
          sizeCode: itemDto.sizeCode || 'M',
          unitPrice: pricing.unitPrice,
          quantity: itemDto.quantity,
          subtotal,
          toppings: pricing.toppings.map((top) =>
            queryRunner.manager.create(OrderItemTopping, {
              toppingId: top.id,
              toppingName: top.name,
              price: Number(top.price),
            }),
          ),
        });

        orderItemsToInsert.push(orderItem);
      }

      // 3. Tạo bản ghi Order
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const orderCode = `BL-${timestamp}-${randomSuffix}`;

      const order = queryRunner.manager.create(Order, {
        orderCode,
        userId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        totalAmount: orderTotal,
        status: OrderStatus.PENDING_PAYMENT,
        note: dto.note || '',
        items: orderItemsToInsert,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Commit toàn bộ thay đổi
      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id, userId, UserRole.CUSTOMER);
    } catch (err) {
      // Rollback transaction nếu có bất kỳ lỗi nào (hết hàng, lỗi DB...)
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lấy danh sách lịch sử đơn hàng (TV4: S2-14)
   * Phân quyền: Customer chỉ thấy đơn của mình, Staff thấy toàn bộ
   */
  async findAll(userId: string, role: UserRole): Promise<Order[]> {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.toppings', 'toppings')
      .leftJoinAndSelect('order.payments', 'payments')
      .orderBy('order.createdAt', 'DESC');

    if (role !== UserRole.STAFF) {
      qb.where('order.userId = :userId', { userId });
    }

    return qb.getMany();
  }

  /**
   * Lấy chi tiết đơn hàng (TV4: S2-14)
   */
  async findOne(id: string, userId: string, role: UserRole): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.toppings', 'payments'],
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng có mã ID: ${id}`);
    }

    if (role !== UserRole.STAFF && order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập vào đơn hàng của người khác');
    }

    return order;
  }

  /**
   * State Machine: Staff cập nhật trạng thái đơn hàng (TV3: S2-09)
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${id}`);
    }

    this.validateStateTransition(order.status, dto.status);

    order.status = dto.status;
    return this.orderRepository.save(order);
  }

  /**
   * Kiểm tra tính hợp lệ của bước chuyển trạng thái (State Machine Guard)
   */
  private validateStateTransition(current: OrderStatus, next: OrderStatus): void {
    if (current === next) return;

    if (current === OrderStatus.COMPLETED || current === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        `Đơn hàng đã ở trạng thái kết thúc (${current}), không thể thay đổi thêm`,
      );
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = validTransitions[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái đơn hàng từ '${current}' sang '${next}'. Bước chuyển hợp lệ là: [${allowed.join(', ')}]`,
      );
    }
  }
}
