import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Response } from 'express';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái hệ thống và kết nối cơ sở dữ liệu' })
  @ApiResponse({ status: 200, description: 'Hệ thống hoạt động bình thường' })
  @ApiResponse({ status: 503, description: 'Cơ sở dữ liệu mất kết nối' })
  async checkHealth(@Res() res: Response) {
    let dbStatus = 'down';
    let isDbHealthy = false;

    try {
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbStatus = 'up';
        isDbHealthy = true;
      }
    } catch (error) {
      dbStatus = 'down';
      isDbHealthy = false;
    }

    const payload = {
      status: isDbHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        database: dbStatus,
        api: 'up',
      },
    };

    if (isDbHealthy) {
      return res.status(HttpStatus.OK).json(payload);
    } else {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(payload);
    }
  }
}
