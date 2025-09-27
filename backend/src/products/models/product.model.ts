import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Category } from '../../categories/models/category.model';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field()
  category_id: string;

  @Field({ nullable: true })
  vendor_id?: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => Category, { nullable: true })
  category?: Category;
}