import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentProvider } from '../../entities/payment.entity';

class BankDetailsDto {
  @IsOptional()
  @IsString()
  account_name?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  reference_number?: string;
}

export class CreatePaymentDto {
  @IsString()
  order_id: string;

  @IsEnum(PaymentProvider)
  payment_method: PaymentProvider;

  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bank_details?: BankDetailsDto;
}