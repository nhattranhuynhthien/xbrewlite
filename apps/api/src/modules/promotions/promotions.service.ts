import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { LoyaltyTransaction } from './entities/loyalty-transaction.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promoRepo: Repository<Promotion>,
    @InjectRepository(LoyaltyTransaction)
    private readonly loyaltyRepo: Repository<LoyaltyTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async validatePromoCode(code: string, orderTotal: number) {
    const promo = await this.promoRepo.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!promo) {
      throw new NotFoundException('Mã khuyến mãi không tồn tại hoặc đã hết hạn');
    }

    if (orderTotal < Number(promo.minOrderAmount)) {
      throw new BadRequestException(
        `Đơn hàng cần đạt tối thiểu ${promo.minOrderAmount.toLocaleString('vi-VN')} VND để sử dụng mã này`,
      );
    }

    let discount = (orderTotal * promo.discountPercent) / 100;
    if (discount > Number(promo.maxDiscountAmount)) {
      discount = Number(promo.maxDiscountAmount);
    }

    return {
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      discountAmount: Math.floor(discount),
      finalTotal: Math.max(0, orderTotal - Math.floor(discount)),
    };
  }

  async addLoyaltyPoints(userId: string, orderId: string, orderTotal: number) {
    // 10,000 VND = 1 loyalty point
    const points = Math.floor(orderTotal / 10000);
    if (points <= 0) return null;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
      await this.userRepo.save(user);

      const txn = this.loyaltyRepo.create({
        userId,
        orderId,
        pointsChanged: points,
        type: 'ORDER_EARN',
      });
      return this.loyaltyRepo.save(txn);
    }
    return null;
  }
}
