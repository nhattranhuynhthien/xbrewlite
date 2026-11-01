import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Xử lý thanh toán có kiểm tra Idempotency-Key (TV4: S2-12, S2-13)
   */
  async processPayment(
    idempotencyKey: string,
    dto: ProcessPaymentDto,
  ): Promise<{ payment: Payment; isDuplicate: boolean; orderStatus: OrderStatus }> {
    if (!idempotencyKey) {
      throw new BadRequestException('Bắt buộc phải cung cấp header Idempotency-Key để chống thanh toán trùng');
    }

    // 1. Kiểm tra Idempotency-Key đã xử lý trước đó chưa
    const existingPayment = await this.paymentRepository.findOne({
      where: { idempotencyKey },
      relations: ['order'],
    });

    if (existingPayment) {
      this.logger.log(`Idempotency hit: Trả về kết quả giao dịch cũ cho key ${idempotencyKey}`);
      return {
        payment: existingPayment,
        isDuplicate: true,
        orderStatus: existingPayment.order?.status || OrderStatus.PAID,
      };
    }

    // 2. Tìm đơn hàng
    const order = await this.orderRepository.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${dto.orderId}`);
    }

    if (order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Đơn hàng này đã được thanh toán thành công trước đó');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Đơn hàng này đã bị hủy, không thể thanh toán');
    }

    // 3. Giả lập gọi cổng thanh toán mô phỏng (Payment Gateway Mock)
    const paymentResult = await this.simulateGatewayCharge(dto);

    if (paymentResult.success) {
      // Thanh toán thành công: Lưu payment SUCCESS và cập nhật order PAID
      const payment = this.paymentRepository.create({
        orderId: order.id,
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.SUCCESS,
        idempotencyKey,
        transactionCode: paymentResult.transactionCode,
        failureReason: null,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      order.status = OrderStatus.PAID;
      await this.orderRepository.save(order);

      this.logger.log(`Thanh toán thành công đơn hàng ${order.orderCode} - Mã GD: ${payment.transactionCode}`);

      return {
        payment: savedPayment,
        isDuplicate: false,
        orderStatus: OrderStatus.PAID,
      };
    } else {
      // Thanh toán thất bại: Lưu payment FAILED, order giữ nguyên PENDING_PAYMENT
      const payment = this.paymentRepository.create({
        orderId: order.id,
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.FAILED,
        idempotencyKey,
        transactionCode: null,
        failureReason: paymentResult.message,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      this.logger.warn(`Thanh toán thất bại đơn hàng ${order.orderCode}: ${paymentResult.message}`);

      throw new BadRequestException({
        success: false,
        message: paymentResult.message,
        paymentStatus: PaymentStatus.FAILED,
        orderId: order.id,
      });
    }
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mô phỏng xử lý ngân hàng / Ví điện tử
   */
  private async simulateGatewayCharge(
    dto: ProcessPaymentDto,
  ): Promise<{ success: boolean; transactionCode?: string; message?: string }> {
    // Độ trễ giả lập 300ms
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Nếu client bật cờ simulateFailure
    if (dto.simulateFailure === true) {
      return {
        success: false,
        message: 'Thanh toán thất bại: Số dư tài khoản không đủ hoặc thẻ bị khóa',
      };
    }

    const randomTx = `TXN_${Date.now().toString().slice(-6)}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      transactionCode: randomTx,
    };
  }
}
