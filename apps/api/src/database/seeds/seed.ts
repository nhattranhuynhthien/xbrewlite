import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { User, UserRole } from '../../modules/auth/entities/user.entity';
import { Product, ProductCategory } from '../../modules/products/entities/product.entity';
import { Size } from '../../modules/products/entities/size.entity';
import { Topping } from '../../modules/products/entities/topping.entity';
import { Promotion } from '../../modules/promotions/entities/promotion.entity';
import { dataSourceOptions } from '../data-source';

export async function runSeed(ds?: DataSource) {
  const dataSource = ds || new DataSource({
    ...dataSourceOptions,
    synchronize: true, // Auto-create tables for seed if ds not supplied
  });

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  console.log('--- Đang khởi tạo dữ liệu mẫu (Seeding BrewLite DB) ---');

  const userRepo = dataSource.getRepository(User);
  const productRepo = dataSource.getRepository(Product);
  const sizeRepo = dataSource.getRepository(Size);
  const toppingRepo = dataSource.getRepository(Topping);
  const promoRepo = dataSource.getRepository(Promotion);

  // 1. Seed Demo Users (TV2: S2-42)
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  const demoUsers = [
    {
      email: 'customer@brewlite.vn',
      fullName: 'Nguyễn Văn Khách',
      phone: '0901234567',
      role: UserRole.CUSTOMER,
      passwordHash: defaultPassword,
      loyaltyPoints: 50,
    },
    {
      email: 'staff@brewlite.vn',
      fullName: 'Trần Thị Thu Ngân (Barista)',
      phone: '0912345678',
      role: UserRole.STAFF,
      passwordHash: defaultPassword,
      loyaltyPoints: 0,
    },
    {
      email: 'admin@brewlite.vn',
      fullName: 'Đỗ Hoàng Quản Lý',
      phone: '0987654321',
      role: UserRole.STAFF,
      passwordHash: defaultPassword,
      loyaltyPoints: 100,
    },
  ];

  for (const u of demoUsers) {
    const exists = await userRepo.findOne({ where: { email: u.email } });
    if (!exists) {
      await userRepo.save(userRepo.create(u));
      console.log(`+ Đã tạo tài khoản demo: ${u.email} [${u.role}]`);
    }
  }

  // 2. Seed Toppings (TV3: S1-11)
  const sampleToppings = [
    { name: 'Trân châu trắng 3Q', price: 10000, isAvailable: true },
    { name: 'Thạch đào giòn', price: 12000, isAvailable: true },
    { name: 'Kem Cheese phô mai béo ngậy', price: 15000, isAvailable: true },
    { name: 'Sương sáo thanh nhiệt', price: 8000, isAvailable: true },
    { name: 'Hạt sen Huế hầm đường phèn', price: 14000, isAvailable: true },
  ];

  for (const top of sampleToppings) {
    const exists = await toppingRepo.findOne({ where: { name: top.name } });
    if (!exists) {
      await toppingRepo.save(toppingRepo.create(top));
    }
  }
  console.log('+ Đã nạp danh sách 5 Toppings khả dụng');

  // 3. Seed Products & Sizes (TV3: S1-11)
  const sampleProducts = [
    {
      name: 'Cà phê Phin Đen Đá Đậm Vị',
      category: ProductCategory.COFFEE,
      basePrice: 29000,
      description: 'Hạt Robusta Buôn Ma Thuột rang mộc nguyên chất, pha phin truyền thống thơm nồng đượm đà.',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      stock: 50,
      isAvailable: true,
      sizes: [
        { code: 'S', name: 'Nhỏ (S)', extraPrice: 0 },
        { code: 'M', name: 'Vừa (M)', extraPrice: 6000 },
        { code: 'L', name: 'Lớn (L)', extraPrice: 10000 },
      ],
    },
    {
      name: 'Cà phê Muối Cố Đô',
      category: ProductCategory.COFFEE,
      basePrice: 39000,
      description: 'Sự hòa quyện tuyệt hảo giữa lớp kem muối béo ngậy mằn mặn và cốt cà phê phin sánh mịn.',
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      stock: 45,
      isAvailable: true,
      sizes: [
        { code: 'M', name: 'Vừa (M)', extraPrice: 0 },
        { code: 'L', name: 'Lớn (L)', extraPrice: 8000 },
      ],
    },
    {
      name: 'Trà Đào Cam Sả Tươi Mát',
      category: ProductCategory.TEA,
      basePrice: 45000,
      description: 'Trà đen hảo hạng ủ lạnh kết hợp miếng đào giòn ngọt lịm, nước cốt cam sành mọng nước và hương sả nồng nàn.',
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
      stock: 60,
      isAvailable: true,
      sizes: [
        { code: 'M', name: 'Vừa (M)', extraPrice: 0 },
        { code: 'L', name: 'Lớn (L)', extraPrice: 8000 },
      ],
    },
    {
      name: 'Trà Sữa Oolong Nướng Trân Châu',
      category: ProductCategory.TEA,
      basePrice: 49000,
      description: 'Lá trà Oolong nướng than củi dậy mùi khói thơm lừng kết hợp sữa tươi nguyên kem béo dịu.',
      imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80',
      stock: 35,
      isAvailable: true,
      sizes: [
        { code: 'S', name: 'Nhỏ (S)', extraPrice: 0 },
        { code: 'M', name: 'Vừa (M)', extraPrice: 6000 },
        { code: 'L', name: 'Lớn (L)', extraPrice: 12000 },
      ],
    },
    {
      name: 'BrewLite Signature Matcha Macchiato',
      category: ProductCategory.SIGNATURE,
      basePrice: 55000,
      description: 'Bột trà xanh Uji Kyoto Nhật Bản phủ lớp kem Macchiato bồng bềnh ngọt dịu.',
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
      stock: 25,
      isAvailable: true,
      sizes: [
        { code: 'M', name: 'Vừa (M)', extraPrice: 0 },
        { code: 'L', name: 'Lớn (L)', extraPrice: 10000 },
      ],
    },
    {
      name: 'Cold Brew Cam Vàng Mật Ong',
      category: ProductCategory.SIGNATURE,
      basePrice: 52000,
      description: 'Cà phê Arabica Cầu Đất ủ lạnh 18 giờ, kết hợp mật ong hoa cà phê và lát cam vàng thanh tao.',
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
      stock: 40,
      isAvailable: true,
      sizes: [
        { code: 'M', name: 'Vừa (M)', extraPrice: 0 },
        { code: 'L', name: 'Lớn (L)', extraPrice: 8000 },
      ],
    },
  ];

  for (const item of sampleProducts) {
    const existing = await productRepo.findOne({ where: { name: item.name } });
    if (!existing) {
      const { sizes, ...prodData } = item;
      const product = await productRepo.save(productRepo.create(prodData));
      for (const s of sizes) {
        await sizeRepo.save(sizeRepo.create({ ...s, productId: product.id }));
      }
    }
  }
  console.log('+ Đã nạp 6 Đồ uống Menu kèm phân Size hoàn chỉnh');

  // 4. Seed Promotion Code (TV2: S2-05)
  const samplePromo = [
    { code: 'BREW10', discountPercent: 10, maxDiscountAmount: 30000, minOrderAmount: 50000, isActive: true },
    { code: 'WELCOME20', discountPercent: 20, maxDiscountAmount: 50000, minOrderAmount: 80000, isActive: true },
  ];

  for (const p of samplePromo) {
    const exists = await promoRepo.findOne({ where: { code: p.code } });
    if (!exists) {
      await promoRepo.save(promoRepo.create(p));
    }
  }
  console.log('+ Đã nạp 2 Mã khuyến mãi mẫu (BREW10, WELCOME20)');

  console.log('--- Hoàn tất Seeding thành công 100% ---');

  if (!ds) {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error('Lỗi khi nạp dữ liệu mẫu seed:', err);
    process.exit(1);
  });
}
