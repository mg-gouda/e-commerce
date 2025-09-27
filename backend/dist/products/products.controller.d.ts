import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("../entities").Product>;
    findAll(page?: number, limit?: number): Promise<{
        products: import("../entities").Product[];
        total: number;
    }>;
    search(query: string, category?: string, priceMin?: number, priceMax?: number): Promise<import("../entities").Product[]>;
    findByCategory(categoryId: string, page?: number, limit?: number): Promise<{
        products: import("../entities").Product[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../entities").Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("../entities").Product>;
    remove(id: string): Promise<void>;
}
