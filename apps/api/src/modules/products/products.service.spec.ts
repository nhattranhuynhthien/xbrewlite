import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product, ProductCategory } from './entities/product.entity';
import { Size } from './entities/size.entity';
import { Topping } from './entities/topping.entity';

describe('ProductsService (Unit Tests - TV3: I-20, I-36)', () => {
  let service: ProductsService;
  let mockProductRepo: any;
  let mockSizeRepo: any;
  let mockToppingRepo: any;

  beforeEach(async () => {
    mockProductRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockSizeRepo = { find: jest.fn() };
    mockToppingRepo = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(Size), useValue: mockSizeRepo },
        { provide: getRepositoryToken(Topping), useValue: mockToppingRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findOne', () => {
    it('nên ném lỗi NotFoundException khi không tìm thấy sản phẩm', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });

    it('nên trả về thông tin sản phẩm kèm toppings khả dụng', async () => {
      const mockProd = { id: 'p-1', name: 'Trà Đào', basePrice: 40000, sizes: [] };
      mockProductRepo.findOne.mockResolvedValue(mockProd);
      mockToppingRepo.find.mockResolvedValue([{ id: 't-1', name: 'Trân châu', price: 10000 }]);

      const result = await service.findOne('p-1');
      expect(result.name).toBe('Trà Đào');
      expect(result.availableToppings).toHaveLength(1);
    });
  });

  describe('calculateServerPrice (Server-side price calculation - TV3: S2-07)', () => {
    it('nên tính giá chuẩn xác: basePrice + sizeExtra + toppings', async () => {
      const mockProd = {
        id: 'p-1',
        name: 'Trà Sữa Oolong',
        basePrice: 40000,
        isAvailable: true,
        stock: 10,
        sizes: [
          { code: 'S', name: 'Nhỏ', extraPrice: 0 },
          { code: 'L', name: 'Lớn', extraPrice: 10000 },
        ],
      };
      mockProductRepo.findOne.mockResolvedValue(mockProd);
      mockToppingRepo.find.mockResolvedValue([
        { id: 'top-1', name: 'Trân châu', price: 10000, isAvailable: true },
        { id: 'top-2', name: 'Kem cheese', price: 15000, isAvailable: true },
      ]);

      const result = await service.calculateServerPrice('p-1', 'L', ['top-1', 'top-2']);
      // 40000 (base) + 10000 (size L) + 10000 (topping 1) + 15000 (topping 2) = 75000
      expect(result.unitPrice).toBe(75000);
      expect(result.sizeName).toBe('Lớn');
    });

    it('nên từ chối nếu sản phẩm hết hàng trong kho', async () => {
      mockProductRepo.findOne.mockResolvedValue({
        id: 'p-out',
        name: 'Cold Brew',
        basePrice: 50000,
        isAvailable: false,
        stock: 0,
      });

      await expect(service.calculateServerPrice('p-out', 'M', [])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyAndDecrementStock (Stock Management - TV3: S2-08)', () => {
    it('nên trừ tồn kho thành công khi số lượng yêu cầu hợp lệ', async () => {
      const mockProduct = {
        id: 'p-1',
        name: 'Cà phê Đen',
        stock: 15,
        isAvailable: true,
      };

      const mockQueryRunner: any = {
        manager: {
          findOne: jest.fn().mockResolvedValue(mockProduct),
          save: jest.fn().mockImplementation((_, entity) => Promise.resolve(entity)),
        },
      };

      const updated = await service.verifyAndDecrementStock(mockQueryRunner, 'p-1', 5);
      expect(updated.stock).toBe(10);
      expect(updated.isAvailable).toBe(true);
    });

    it('nên ném lỗi BadRequestException nếu số lượng đặt vượt quá số lượng tồn kho', async () => {
      const mockProduct = {
        id: 'p-1',
        name: 'Cà phê Đen',
        stock: 2,
        isAvailable: true,
      };

      const mockQueryRunner: any = {
        manager: {
          findOne: jest.fn().mockResolvedValue(mockProduct),
        },
      };

      await expect(
        service.verifyAndDecrementStock(mockQueryRunner, 'p-1', 5),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
