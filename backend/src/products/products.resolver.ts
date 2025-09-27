import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './models/product.model';
import { CreateProductInput } from './inputs/create-product.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { ProductsResponse } from './models/products-response.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Product)
  createProduct(@Args('createProductInput') createProductInput: CreateProductInput) {
    return this.productsService.create(createProductInput);
  }

  @Query(() => ProductsResponse, { name: 'products' })
  findAll(
    @Args('page', { type: () => Number, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Number, defaultValue: 10 }) limit: number,
  ) {
    return this.productsService.findAll(page, limit);
  }

  @Query(() => Product, { name: 'product' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.findOne(id);
  }

  @Query(() => [Product], { name: 'searchProducts' })
  searchProducts(
    @Args('query') query: string,
    @Args('category', { nullable: true }) category?: string,
    @Args('priceMin', { type: () => Number, nullable: true }) priceMin?: number,
    @Args('priceMax', { type: () => Number, nullable: true }) priceMax?: number,
  ) {
    const filters = { category, priceMin, priceMax };
    return this.productsService.search(query, filters);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Product)
  updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return this.productsService.update(id, updateProductInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async removeProduct(@Args('id', { type: () => ID }) id: string) {
    await this.productsService.remove(id);
    return true;
  }
}