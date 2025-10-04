import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '../../entities/coupon.entity';

export class CreateCouponDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount_value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_purchase_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_discount_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  usage_limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  usage_limit_per_user?: number;

  @IsOptional()
  @IsDateString()
  valid_from?: string;

  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  first_order_only?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_products?: string[];
}
