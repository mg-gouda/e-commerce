import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private productRepository;
    private categoryRepository;
    private orderItemRepository;
    constructor(productRepository: Repository<Product>, categoryRepository: Repository<Category>, orderItemRepository: Repository<OrderItem>);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(page?: number, limit?: number, filters?: {
        search?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
    }): Promise<{
        products: Product[];
        total: number;
    }>;
    findOne(id: string): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
    search(query: string, page?: number, limit?: number, filters?: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{
        products: Product[];
        total: number;
    }>;
    findByCategory(categoryId: string, page?: number, limit?: number): Promise<{
        products: Product[];
        total: number;
    }>;
    updateStock(id: string, quantity: number): Promise<Product>;
    adjustStock(id: string, adjustment: number): Promise<Product>;
    checkStockAvailability(id: string, quantity: number): Promise<boolean>;
    getLowStockProducts(threshold?: number): Promise<Product[]>;
    getOutOfStockProducts(): Promise<Product[]>;
    bulkUpdateStock(updates: Array<{
        id: string;
        stock: number;
    }>): Promise<Product[]>;
    getInventoryStats(): Promise<{
        totalProducts: number;
        inStock: number;
        lowStock: number;
        outOfStock: number;
        totalValue: number;
    }>;
    getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;
    getTrendingProducts(limit?: number): Promise<Product[]>;
    getFeaturedProducts(limit?: number): Promise<Product[]>;
    getNewArrivals(limit?: number): Promise<Product[]>;
    getProductsBySameBrand(productId: string, limit?: number): Promise<Product[]>;
    getSimilarPriceProducts(productId: string, limit?: number): Promise<Product[]>;
    getFrequentlyBoughtTogether(productId: string, limit?: number): Promise<Product[]>;
    getPersonalizedRecommendations(userId: string, limit?: number): Promise<Product[]>;
}
