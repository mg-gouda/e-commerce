import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { IsString, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  stock: number;

  @Field(() => ID)
  @IsUUID()
  category_id: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  vendor_id?: string;
}