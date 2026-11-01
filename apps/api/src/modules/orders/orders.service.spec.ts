import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { ProductsService } from '../products/products.service';

describe('OrdersService (Unit Tests - TV4: I-38, TV3: I-36)', () => {
  let service: OrdersService;
  let mockOrderRepo: any;
  let mockProductsService: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockOrderRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((order) => Promise.resolve(order)),
      createQueryBuilder: jest.fn(),
    };

    mockProductsService = {
      calculateServerPrice: jest.fn(),
      verifyAndDecrementStock: jest.fn(),
    };

    mockDataSource = {
      createQueryRunner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('nên khởi tạo thành công OrdersService', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder validation', () => {
    it('nên từ chối tạo đơn nếu danh sách món rỗng', async () => {
      await expect(
        service.createOrder('user-1', {
          customerName: 'Khách',
          customerPhone: '0901',
          items: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus (State Machine - TV3: S2-09)', () => {
    it('cho phép chuyển từ PENDING_PAYMENT sang PAID', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'ord-1',
        status: OrderStatus.PENDING_PAYMENT,
      });

      const updated = await service.updateStatus('ord-1', { status: OrderStatus.PAID });
      expect(updated.status).toBe(OrderStatus.PAID);
    });

    it('cho phép chuyển từ PAID sang PREPARING', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'ord-1',
        status: OrderStatus.PAID,
      });

      const updated = await service.updateStatus('ord-1', { status: OrderStatus.PREPARING });
      expect(updated.status).toBe(OrderStatus.PREPARING);
    });

    it('cho phép chuyển từ PREPARING sang READY', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'ord-1',
        status: OrderStatus.PREPARING,
      });

      const updated = await service.updateStatus('ord-1', { status: OrderStatus.READY });
      expect(updated.status).toBe(OrderStatus.READY);
    });

    it('cho phép chuyển từ READY sang COMPLETED', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'ord-1',
        status: OrderStatus.READY,
      });

      const updated = await service.updateStatus('ord-1', { status: OrderStatus.COMPLETED });
      expect(updated.status).toBe(OrderStatus.COMPLETED);
    });

    it('chặn nhảy cóc không hợp lệ: từ PENDING_PAYMENT nhảy thẳng sang COMPLETED', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'ord-1',
        status: OrderStatus.PENDING_PAYMENT,
      });

      await expect(
        service.updateStatus('ord-1', { status: OrderStatus.COMPLETED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('chặn đổi trạng thái khi đơn đã hoàn tất (COMPLETED)', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'ord-1',
        status: OrderStatus.COMPLETED,
      });

      await expect(
        service.updateStatus('ord-1', { status: OrderStatus.CANCELLED }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
