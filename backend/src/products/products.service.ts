import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    console.log('Received createProductDto:', createProductDto);

    const { category_ids, ...productData } = createProductDto;

    // Validate all categories exist
    const categories = await this.categoryRepository.findByIds(category_ids);

    if (categories.length !== category_ids.length) {
      throw new NotFoundException('One or more categories not found');
    }

    console.log('Found categories:', categories.map(c => c.id));

    const product = this.productRepository.create({
      ...productData,
      categories,
    });

    console.log('Created product entity:', product);

    return this.productRepository.save(product) as unknown as Promise<Product>;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    }
  ): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category');

    // Search by name or description
    if (filters?.search) {
      queryBuilder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` }
      );
    }

    // Filter by category
    if (filters?.category) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.category });
    }

    // Filter by price range
    if (filters?.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters?.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    // Sorting
    switch (filters?.sort) {
      case 'price_asc':
        queryBuilder.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        queryBuilder.orderBy('product.price', 'DESC');
        break;
      case 'name_asc':
        queryBuilder.orderBy('product.name', 'ASC');
        break;
      case 'name_desc':
        queryBuilder.orderBy('product.name', 'DESC');
        break;
      case 'rating':
        queryBuilder.orderBy('product.average_rating', 'DESC');
        break;
      default:
        queryBuilder.orderBy('product.created_at', 'DESC');
    }

    // Pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return { products, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    const { category_ids, ...productData } = updateProductDto;

    if (category_ids) {
      // Validate all categories exist
      const categories = await this.categoryRepository.findByIds(category_ids);

      if (categories.length !== category_ids.length) {
        throw new NotFoundException('One or more categories not found');
      }

      product.categories = categories;
    }

    Object.assign(product, productData);
    const updatedProduct = await this.productRepository.save(product);

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category');

    // Full-text search on name and description
    if (query && query.trim() !== '') {
      queryBuilder.where(
        '(LOWER(product.name) LIKE LOWER(:query) OR LOWER(product.description) LIKE LOWER(:query))',
        { query: `%${query}%` }
      );

      // Order by relevance (products with query in name appear first)
      queryBuilder.orderBy(
        `CASE
          WHEN LOWER(product.name) = LOWER(:exactQuery) THEN 1
          WHEN LOWER(product.name) LIKE LOWER(:startQuery) THEN 2
          WHEN LOWER(product.name) LIKE LOWER(:query) THEN 3
          ELSE 4
        END`,
        'ASC'
      );
      queryBuilder.setParameter('exactQuery', query.toLowerCase());
      queryBuilder.setParameter('startQuery', `${query.toLowerCase()}%`);
      queryBuilder.addOrderBy('product.average_rating', 'DESC');
    } else {
      // No search query, just order by rating and date
      queryBuilder.orderBy('product.average_rating', 'DESC');
      queryBuilder.addOrderBy('product.created_at', 'DESC');
    }

    // Apply filters
    if (filters?.category) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.category });
    }

    if (filters?.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    // Pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return { products, total };
  }

  async findByCategory(categoryId: string, page: number = 1, limit: number = 10): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .where('category.id = :categoryId', { categoryId })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('product.created_at', 'DESC');

    const [products, total] = await queryBuilder.getManyAndCount();

    return { products, total };
  }

  // Inventory Management Methods

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    if (quantity < 0) {
      throw new NotFoundException('Stock quantity cannot be negative');
    }

    product.stock = quantity;
    return this.productRepository.save(product);
  }

  async adjustStock(id: string, adjustment: number): Promise<Product> {
    const product = await this.findOne(id);

    const newStock = product.stock + adjustment;
    if (newStock < 0) {
      throw new NotFoundException('Insufficient stock for this adjustment');
    }

    product.stock = newStock;
    return this.productRepository.save(product);
  }

  async checkStockAvailability(id: string, quantity: number): Promise<boolean> {
    const product = await this.findOne(id);
    return product.stock >= quantity;
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.stock <= :threshold', { threshold })
      .andWhere('product.stock > 0')
      .orderBy('product.stock', 'ASC')
      .getMany();
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.stock = 0')
      .orderBy('product.updated_at', 'DESC')
      .getMany();
  }

  async bulkUpdateStock(updates: Array<{ id: string; stock: number }>): Promise<Product[]> {
    const updatedProducts: Product[] = [];

    for (const update of updates) {
      const product = await this.updateStock(update.id, update.stock);
      updatedProducts.push(product);
    }

    return updatedProducts;
  }

  async getInventoryStats(): Promise<{
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  }> {
    const allProducts = await this.productRepository.find();

    const stats = allProducts.reduce((acc, product) => {
      acc.totalProducts++;

      if (product.stock === 0) {
        acc.outOfStock++;
      } else if (product.stock <= 10) {
        acc.lowStock++;
        acc.inStock++;
      } else {
        acc.inStock++;
      }

      acc.totalValue += Number(product.price) * product.stock;

      return acc;
    }, {
      totalProducts: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0,
    });

    return stats;
  }

  // Product Recommendation Methods

  async getRelatedProducts(productId: string, limit: number = 6): Promise<Product[]> {
    const product = await this.findOne(productId);

    // Get products from the same categories
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.id != :productId', { productId })
      .andWhere('product.stock > 0')
      .andWhere('categories.id IN (:...categoryIds)', {
        categoryIds: product.categories.map(c => c.id),
      })
      .orderBy('RANDOM()')
      .take(limit)
      .getMany();
  }

  async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    // For now, return random products with high stock
    // In production, this would use actual sales/view data
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.stock > 0')
      .orderBy('product.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    // Return products with highest stock or featured flag
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.stock > 0')
      .orderBy('product.stock', 'DESC')
      .take(limit)
      .getMany();
  }

  async getNewArrivals(limit: number = 12): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.stock > 0')
      .orderBy('product.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  async getProductsBySameBrand(productId: string, limit: number = 6): Promise<Product[]> {
    const product = await this.findOne(productId);

    if (!product.brand) {
      return [];
    }

    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.id != :productId', { productId })
      .andWhere('product.brand = :brand', { brand: product.brand })
      .andWhere('product.stock > 0')
      .orderBy('product.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  async getSimilarPriceProducts(productId: string, limit: number = 6): Promise<Product[]> {
    const product = await this.findOne(productId);
    const price = Number(product.price);
    const minPrice = price * 0.7; // 30% lower
    const maxPrice = price * 1.3; // 30% higher

    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.id != :productId', { productId })
      .andWhere('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
      .andWhere('product.stock > 0')
      .orderBy('RANDOM()')
      .take(limit)
      .getMany();
  }

  async getFrequentlyBoughtTogether(productId: string, limit: number = 4): Promise<Product[]> {
    // Find orders that contain this product
    const orderItemsWithProduct = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .select('orderItem.order_id')
      .where('orderItem.product_id = :productId', { productId })
      .getRawMany();

    if (orderItemsWithProduct.length === 0) {
      // If no orders found, return related products as fallback
      return this.getRelatedProducts(productId, limit);
    }

    const orderIds = orderItemsWithProduct.map(item => item.order_id);

    // Find other products in those orders, count occurrences
    const frequentProducts = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .select('orderItem.product_id', 'product_id')
      .addSelect('COUNT(*)', 'count')
      .where('orderItem.order_id IN (:...orderIds)', { orderIds })
      .andWhere('orderItem.product_id != :productId', { productId })
      .groupBy('orderItem.product_id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    if (frequentProducts.length === 0) {
      return this.getRelatedProducts(productId, limit);
    }

    const productIds = frequentProducts.map(fp => fp.product_id);

    // Get full product details
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.id IN (:...productIds)', { productIds })
      .andWhere('product.stock > 0')
      .getMany();
  }

  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<Product[]> {
    // Find products from user's order history
    const userOrderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.order', 'order')
      .select('orderItem.product_id')
      .where('order.user_id = :userId', { userId })
      .getRawMany();

    if (userOrderItems.length === 0) {
      // New user, return trending products
      return this.getTrendingProducts(limit);
    }

    const userProductIds = userOrderItems.map(item => item.product_id);

    // Get products from the same categories as user's purchased products
    const userProducts = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .where('product.id IN (:...userProductIds)', { userProductIds })
      .getMany();

    const categoryIds = new Set<string>();
    userProducts.forEach(product => {
      product.categories.forEach(cat => categoryIds.add(cat.id));
    });

    if (categoryIds.size === 0) {
      return this.getTrendingProducts(limit);
    }

    // Find products in those categories that user hasn't bought
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('categories.id IN (:...categoryIds)', { categoryIds: Array.from(categoryIds) })
      .andWhere('product.id NOT IN (:...userProductIds)', { userProductIds })
      .andWhere('product.stock > 0')
      .orderBy('product.created_at', 'DESC')
      .take(limit)
      .getMany();
  }
}