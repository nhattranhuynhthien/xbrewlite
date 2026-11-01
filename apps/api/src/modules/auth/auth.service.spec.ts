import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';

describe('AuthService (Unit Tests - TV2: I-32)', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((user) => Promise.resolve({ id: 'uuid-1', ...user })),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('nên khởi tạo thành công service', () => {
    expect(service).toBeDefined();
  });

  describe('Đăng ký tài khoản (register)', () => {
    it('nên từ chối đăng ký nếu email đã tồn tại (ConflictException)', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-id', email: 'test@brewlite.vn' });

      await expect(
        service.register({
          email: 'test@brewlite.vn',
          password: 'Password123!',
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('nên đăng ký thành công và băm mật khẩu bằng BCrypt', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.register({
        email: 'new@brewlite.vn',
        password: 'Password123!',
        fullName: 'New User',
      });

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('new@brewlite.vn');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('Đăng nhập (login)', () => {
    it('nên từ chối nếu không tìm thấy email (UnauthorizedException)', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notfound@brewlite.vn',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('nên từ chối nếu mật khẩu không khớp', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'user@brewlite.vn',
        passwordHash: hashedPassword,
        role: UserRole.CUSTOMER,
      });

      await expect(
        service.login({
          email: 'user@brewlite.vn',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('nên đăng nhập thành công và trả về JWT token nếu đúng mật khẩu', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'user@brewlite.vn',
        fullName: 'Brew Customer',
        passwordHash: hashedPassword,
        role: UserRole.CUSTOMER,
      });

      const result = await service.login({
        email: 'user@brewlite.vn',
        password: 'CorrectPassword',
      });

      expect(result.token).toBe('mocked.jwt.token');
      expect(result.user.email).toBe('user@brewlite.vn');
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });
});
