import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { VendorStatus } from '../../entities/vendor.entity';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  shop_name: string;

  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;
}
