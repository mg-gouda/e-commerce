import { ProductsService } from './products.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    private readonly uploadService;
    constructor(productsService: ProductsService, uploadService: UploadService);
    findAll(page?: number, limit?: number, search?: string, category?: string, minPrice?: number, maxPrice?: number, sort?: string): Promise<{
        products: import("../entities").Product[];
        total: number;
    }>;
    search(query: string, page?: number, limit?: number, category?: string, minPrice?: number, maxPrice?: number): Promise<{
        products: import("../entities").Product[];
        total: number;
    }>;
    findByCategory(categoryId: string, page?: number, limit?: number): Promise<{
        products: import("../entities").Product[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../entities").Product>;
    create(createProductDto: CreateProductDto): Promise<import("../entities").Product>;
    uploadProductImage(id: string, file: Express.Multer.File): Promise<{
        message: string;
        imageUrl: string;
        product: import("../entities").Product;
    }>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("../entities").Product>;
    remove(id: string): Promise<void>;
    updateStock(id: string, stock: number): Promise<import("../entities").Product>;
    adjustStock(id: string, adjustment: number): Promise<import("../entities").Product>;
    getLowStockProducts(threshold?: number): Promise<import("../entities").Product[]>;
    getOutOfStockProducts(): Promise<import("../entities").Product[]>;
    getInventoryStats(): Promise<{
        totalProducts: number;
        inStock: number;
        lowStock: number;
        outOfStock: number;
        totalValue: number;
    }>;
    bulkUpdateStock(updates: Array<{
        id: string;
        stock: number;
    }>): Promise<import("../entities").Product[]>;
    checkStockAvailability(id: string, quantity: number): Promise<{
        available: boolean;
        productId: string;
        requestedQuantity: number;
    }>;
    getRelatedProducts(id: string, limit?: number): Promise<import("../entities").Product[]>;
    getTrendingProducts(limit?: number): Promise<import("../entities").Product[]>;
    getFeaturedProducts(limit?: number): Promise<import("../entities").Product[]>;
    getNewArrivals(limit?: number): Promise<import("../entities").Product[]>;
    getProductsBySameBrand(id: string, limit?: number): Promise<import("../entities").Product[]>;
    getSimilarPriceProducts(id: string, limit?: number): Promise<import("../entities").Product[]>;
    getFrequentlyBoughtTogether(id: string, limit?: number): Promise<import("../entities").Product[]>;
    getPersonalizedRecommendations(req: any, limit?: number): Promise<import("../entities").Product[]>;
}
