import { ProductsService } from './products.service';
import { CreateProductInput } from './inputs/create-product.input';
import { UpdateProductInput } from './inputs/update-product.input';
export declare class ProductsResolver {
    private readonly productsService;
    constructor(productsService: ProductsService);
    createProduct(createProductInput: CreateProductInput): Promise<import("../entities").Product>;
    findAll(page: number, limit: number): Promise<{
        products: import("../entities").Product[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../entities").Product>;
    searchProducts(query: string, category?: string, priceMin?: number, priceMax?: number): Promise<import("../entities").Product[]>;
    updateProduct(id: string, updateProductInput: UpdateProductInput): Promise<import("../entities").Product>;
    removeProduct(id: string): Promise<boolean>;
}
