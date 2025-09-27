import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from './product.model';

@ObjectType()
export class ProductsResponse {
  @Field(() => [Product])
  products: Product[];

  @Field(() => Int)
  total: number;
}