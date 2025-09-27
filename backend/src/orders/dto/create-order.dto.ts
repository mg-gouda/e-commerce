import { IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  shipping_address_line1: string;

  @IsOptional()
  @IsString()
  shipping_address_line2?: string;

  @IsString()
  shipping_city: string;

  @IsString()
  shipping_state: string;

  @IsString()
  shipping_postal_code: string;

  @IsString()
  shipping_country: string;

  @IsString()
  payment_method: string;
}