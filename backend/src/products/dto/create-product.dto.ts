import { IsString, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsUUID()
  category_id: string;

  @IsOptional()
  @IsUUID()
  vendor_id?: string;
}