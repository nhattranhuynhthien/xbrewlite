import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';

describe('PaymentsService (Unit Tests - TV4: I-38, Idempotency & Gateway Mock)', () => {
  let service: PaymentsService;
  let mockPaymentRepo: any;
  let mockOrderRepo: any;

  beforeEach(async () => {
    mockPaymentRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((p) => p),
      save: jest.fn().mockImplementation((p) => Promise.resolve({ id: 'pay-uuid', ...p })),
    };

    mockOrderRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((o) => Promise.resolve(o)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('nên từ chối thanh toán nếu thiếu Idempotency-Key', async () => {
    await expect(
      service.processPayment('', {
        orderId: 'ord-1',
        method: PaymentMethod.E_WALLET,
        amount: 85000,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('cơ chế Idempotency: nếu key đã tồn tại, trả về ngay giao dịch cũ và đánh dấu isDuplicate = true', async () => {
    const existingPayment = {
      id: 'pay-1',
      idempotencyKey: 'idemp-uuid-1234',
      status: PaymentStatus.SUCCESS,
      amount: 85000,
      order: { id: 'ord-1', status: OrderStatus.PAID },
    };
    mockPaymentRepo.findOne.mockResolvedValue(existingPayment);

    const result = await service.processPayment('idemp-uuid-1234', {
      orderId: 'ord-1',
      method: PaymentMethod.E_WALLET,
      amount: 85000,
    });

    expect(result.isDuplicate).toBe(true);
    expect(result.payment.id).toBe('pay-1');
    expect(mockPaymentRepo.save).not.toHaveBeenCalled(); // Không tạo bản ghi mới!
  });

  it('xử lý thanh toán thành công: lưu payment SUCCESS và cập nhật order PAID', async () => {
    mockPaymentRepo.findOne.mockResolvedValue(null);
    mockOrderRepo.findOne.mockResolvedValue({
      id: 'ord-1',
      orderCode: 'BL-123',
      totalAmount: 85000,
      status: OrderStatus.PENDING_PAYMENT,
    });

    const result = await service.processPayment('new-idemp-key', {
      orderId: 'ord-1',
      method: PaymentMethod.E_WALLET,
      amount: 85000,
      simulateFailure: false,
    });

    expect(result.isDuplicate).toBe(false);
    expect(result.orderStatus).toBe(OrderStatus.PAID);
    expect(mockPaymentRepo.save).toHaveBeenCalled();
    expect(mockOrderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: OrderStatus.PAID }),
    );
  });

  it('xử lý thanh toán thất bại khi ví hết tiền / thẻ lỗi: lưu FAILED và ném BadRequestException', async () => {
    mockPaymentRepo.findOne.mockResolvedValue(null);
    mockOrderRepo.findOne.mockResolvedValue({
      id: 'ord-1',
      orderCode: 'BL-123',
      totalAmount: 85000,
      status: OrderStatus.PENDING_PAYMENT,
    });

    await expect(
      service.processPayment('fail-key', {
        orderId: 'ord-1',
        method: PaymentMethod.CARD,
        amount: 85000,
        simulateFailure: true,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockPaymentRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: PaymentStatus.FAILED }),
    );
  });
});
