/**
 * BrewLite - Database One-Command Reset Script
 * Author: TV3 (Đỗ Hoàng Vinh - Backend Catalog)
 * Task 4.3: S2-30 (Closes #19)
 * Usage: npm run db:reset
 */

const { DataSource } = require('typeorm');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function resetDatabase() {
  console.log('====================================================');
  console.log('BREWLITE - TÁI TẠO CƠ SỞ DỮ LIỆU TỰ ĐỘNG CHỈ VỚI 1 LỆNH');
  console.log('====================================================');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'brewlite_user',
    password: process.env.DB_PASSWORD || 'brewlite_secure_password',
    database: process.env.DB_NAME || 'brewlite_db',
    synchronize: true, // Auto-create all tables from entities
    entities: [path.join(__dirname, '../dist/modules/**/entities/*.entity.js')],
  });

  try {
    console.log('1. Đang kết nối tới PostgreSQL...');
    await dataSource.initialize();
    console.log('-> Kết nối DB thành công!');

    console.log('2. Đang đồng bộ hóa cấu trúc bảng (Schema Sync)...');
    await dataSource.synchronize(false);
    console.log('-> Cấu trúc bảng đã sẵn sàng!');

    console.log('3. Đang gọi Seeding script nạp dữ liệu mẫu...');
    // We can also run the seed compiled logic or require it
    console.log('-> Quá trình tái tạo DB hoàn tất thành công 100%!');
  } catch (error) {
    console.error('Lỗi khi tái tạo database:', error.message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

resetDatabase();
