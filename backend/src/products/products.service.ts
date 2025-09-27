import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.category_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    // Index in Elasticsearch
    await this.elasticsearchService.indexDocument('products', savedProduct.id, {
      id: savedProduct.id,
      name: savedProduct.name,
      description: savedProduct.description,
      price: savedProduct.price,
      category_id: savedProduct.category_id,
      stock: savedProduct.stock,
    });

    return savedProduct;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ products: Product[]; total: number }> {
    const [products, total] = await this.productRepository.findAndCount({
      relations: ['category'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { products, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'reviews', 'reviews.user'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.category_id },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productRepository.save(product);

    // Update in Elasticsearch
    await this.elasticsearchService.updateDocument('products', id, {
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      category_id: updatedProduct.category_id,
      stock: updatedProduct.stock,
    });

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    // Remove from Elasticsearch
    await this.elasticsearchService.deleteDocument('products', id);
  }

  async search(query: string, filters?: any): Promise<Product[]> {
    const searchResult = await this.elasticsearchService.searchProducts(query, filters);
    const productIds = searchResult.body.hits.hits.map((hit: any) => hit._source.id);

    if (productIds.length === 0) {
      return [];
    }

    return this.productRepository.findByIds(productIds, {
      relations: ['category'],
    });
  }

  async findByCategory(categoryId: string, page: number = 1, limit: number = 10): Promise<{ products: Product[]; total: number }> {
    const [products, total] = await this.productRepository.findAndCount({
      where: { category_id: categoryId },
      relations: ['category'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { products, total };
  }
}