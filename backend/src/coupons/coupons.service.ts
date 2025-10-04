import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Coupon, CouponStatus, CouponType } from '../entities/coupon.entity';
import { UserCoupon } from '../entities/user-coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto, CouponValidationResult } from './dto/validate-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepository: Repository<UserCoupon>,
  ) {}

  /**
   * Create a new coupon
   */
  async create(createCouponDto: CreateCouponDto, userId: string): Promise<Coupon> {
    // Check if code already exists
    const existing = await this.couponRepository.findOne({
      where: { code: createCouponDto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    // Validate discount value based on type
    if (createCouponDto.type === CouponType.PERCENTAGE) {
      if (createCouponDto.discount_value > 100) {
        throw new BadRequestException('Percentage discount cannot exceed 100%');
      }
    }

    const coupon = this.couponRepository.create({
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase(),
      created_by: userId,
    });

    return this.couponRepository.save(coupon);
  }

  /**
   * Get all coupons with pagination
   */
  async findAll(page: number = 1, limit: number = 20) {
    const [coupons, total] = await this.couponRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      coupons,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get active coupons only
   */
  async findActive() {
    const now = new Date();
    return this.couponRepository.find({
      where: {
        status: CouponStatus.ACTIVE,
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get coupon by ID
   */
  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  /**
   * Get coupon by code
   */
  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  /**
   * Update coupon
   */
  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);

    // If updating code, check for duplicates
    if (updateCouponDto.code && updateCouponDto.code !== coupon.code) {
      const existing = await this.couponRepository.findOne({
        where: { code: updateCouponDto.code.toUpperCase() },
      });
      if (existing) {
        throw new ConflictException('Coupon code already exists');
      }
      updateCouponDto.code = updateCouponDto.code.toUpperCase();
    }

    Object.assign(coupon, updateCouponDto);
    return this.couponRepository.save(coupon);
  }

  /**
   * Delete coupon
   */
  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
  }

  /**
   * Validate coupon and calculate discount
   */
  async validateCoupon(
    validateDto: ValidateCouponDto,
    userId: string,
  ): Promise<CouponValidationResult> {
    const { code, cart_total, product_ids, category_ids } = validateDto;

    // Find coupon
    let coupon: Coupon;
    try {
      coupon = await this.findByCode(code);
    } catch {
      return { valid: false, error: 'Invalid coupon code' };
    }

    // Check if coupon is active
    if (coupon.status !== CouponStatus.ACTIVE) {
      return { valid: false, error: 'This coupon is no longer active' };
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { valid: false, error: 'This coupon is not yet valid' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { valid: false, error: 'This coupon has expired' };
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    // Check per-user usage limit
    if (coupon.usage_limit_per_user) {
      const userUsageCount = await this.userCouponRepository.count({
        where: { user_id: userId, coupon_id: coupon.id },
      });
      if (userUsageCount >= coupon.usage_limit_per_user) {
        return { valid: false, error: 'You have already used this coupon the maximum number of times' };
      }
    }

    // Check minimum purchase amount
    if (coupon.min_purchase_amount && cart_total < coupon.min_purchase_amount) {
      return {
        valid: false,
        error: `Minimum purchase amount of $${coupon.min_purchase_amount} required`,
      };
    }

    // Check category restrictions
    if (coupon.allowed_categories && coupon.allowed_categories.length > 0 && category_ids) {
      const hasAllowedCategory = category_ids.some((catId) =>
        coupon.allowed_categories.includes(catId)
      );
      if (!hasAllowedCategory) {
        return { valid: false, error: 'This coupon is not valid for the items in your cart' };
      }
    }

    // Check product restrictions
    if (coupon.allowed_products && coupon.allowed_products.length > 0 && product_ids) {
      const hasAllowedProduct = product_ids.some((prodId) =>
        coupon.allowed_products.includes(prodId)
      );
      if (!hasAllowedProduct) {
        return { valid: false, error: 'This coupon is not valid for the items in your cart' };
      }
    }

    // Calculate discount
    let discount_amount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discount_amount = (cart_total * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount_amount = Math.min(discount_amount, coupon.max_discount_amount);
      }
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      discount_amount = Math.min(coupon.discount_value, cart_total);
    } else if (coupon.type === CouponType.FREE_SHIPPING) {
      discount_amount = 0; // Shipping cost will be handled separately
    }

    const final_amount = Math.max(0, cart_total - discount_amount);

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discount_value: coupon.discount_value,
        discount_amount: Math.round(discount_amount * 100) / 100,
        final_amount: Math.round(final_amount * 100) / 100,
      },
    };
  }

  /**
   * Apply coupon (record usage)
   */
  async applyCoupon(couponId: string, userId: string, orderId: string, discountAmount: number): Promise<void> {
    // Record usage
    const userCoupon = this.userCouponRepository.create({
      user_id: userId,
      coupon_id: couponId,
      order_id: orderId,
      discount_amount: discountAmount,
    });
    await this.userCouponRepository.save(userCoupon);

    // Increment usage count
    await this.couponRepository.increment({ id: couponId }, 'usage_count', 1);
  }

  /**
   * Get user's coupon usage history
   */
  async getUserCouponHistory(userId: string) {
    return this.userCouponRepository.find({
      where: { user_id: userId },
      relations: ['coupon', 'order'],
      order: { used_at: 'DESC' },
    });
  }

  /**
   * Get coupon usage statistics
   */
  async getCouponStats(couponId: string) {
    const coupon = await this.findOne(couponId);
    const usages = await this.userCouponRepository.find({
      where: { coupon_id: couponId },
      relations: ['order'],
    });

    const totalDiscount = usages.reduce((sum, usage) => sum + Number(usage.discount_amount), 0);
    const uniqueUsers = new Set(usages.map((u) => u.user_id)).size;

    return {
      coupon,
      total_uses: usages.length,
      unique_users: uniqueUsers,
      total_discount_given: totalDiscount,
      remaining_uses: coupon.usage_limit ? coupon.usage_limit - coupon.usage_count : null,
    };
  }
}
