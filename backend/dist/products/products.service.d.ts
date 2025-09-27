import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private productRepository;
    private categoryRepository;
    private elasticsearchService;
    constructor(productRepository: Repository<Product>, categoryRepository: Repository<Category>, elasticsearchService: ElasticsearchService);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(page?: number, limit?: number): Promise<{
        products: Product[];
        total: number;
    }>;
    findOne(id: string): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
    search(query: string, filters?: any): Promise<Product[]>;
    findByCategory(categoryId: string, page?: number, limit?: number): Promise<{
        products: Product[];
        total: number;
    }>;
}
