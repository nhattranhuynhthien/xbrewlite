import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, Idempotency-Key',
  });

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger OpenAPI Setup (TV3 - I-20: S1-24)
  const config = new DocumentBuilder()
    .setTitle('BrewLite Coffee & Tea API')
    .setDescription('Hợp đồng giao tiếp API RESTful của hệ thống BrewLite - Assignment 2')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health', 'Kiểm tra trạng thái hệ thống')
    .addTag('Auth', 'Xác thực tài khoản và JWT')
    .addTag('Products / Catalog', 'Quản lý Menu, Danh mục, Size và Topping')
    .addTag('Orders', 'Đặt hàng trong Database Transaction và State Machine')
    .addTag('Payments', 'Thanh toán mô phỏng (Ví/Thẻ) kèm Idempotency-Key')
    .addTag('Promotions & Loyalty', 'Khuyến mãi và tích điểm thành viên')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || process.env.API_PORT || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`====================================================`);
  logger.log(`BrewLite API Server đang chạy tại: http://localhost:${port}/api/v1`);
  logger.log(`Tài liệu Swagger OpenAPI: http://localhost:${port}/docs`);
  logger.log(`Health Check: http://localhost:${port}/api/v1/health`);
  logger.log(`====================================================`);
}

bootstrap();
