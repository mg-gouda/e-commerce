"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../entities/product.entity");
const category_entity_1 = require("../entities/category.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
let ProductsService = class ProductsService {
    productRepository;
    categoryRepository;
    orderItemRepository;
    constructor(productRepository, categoryRepository, orderItemRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderItemRepository = orderItemRepository;
    }
    async create(createProductDto) {
        console.log('Received createProductDto:', createProductDto);
        const { category_ids, ...productData } = createProductDto;
        const categories = await this.categoryRepository.findByIds(category_ids);
        if (categories.length !== category_ids.length) {
            throw new common_1.NotFoundException('One or more categories not found');
        }
        console.log('Found categories:', categories.map(c => c.id));
        const product = this.productRepository.create({
            ...productData,
            categories,
        });
        console.log('Created product entity:', product);
        return this.productRepository.save(product);
    }
    async findAll(page = 1, limit = 10, filters) {
        const queryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'category');
        if (filters?.search) {
            queryBuilder.andWhere('(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))', { search: `%${filters.search}%` });
        }
        if (filters?.category) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.category });
        }
        if (filters?.minPrice !== undefined) {
            queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
        }
        if (filters?.maxPrice !== undefined) {
            queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
        }
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
        queryBuilder.skip((page - 1) * limit).take(limit);
        const [products, total] = await queryBuilder.getManyAndCount();
        return { products, total };
    }
    async findOne(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['categories'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        const { category_ids, ...productData } = updateProductDto;
        if (category_ids) {
            const categories = await this.categoryRepository.findByIds(category_ids);
            if (categories.length !== category_ids.length) {
                throw new common_1.NotFoundException('One or more categories not found');
            }
            product.categories = categories;
        }
        Object.assign(product, productData);
        const updatedProduct = await this.productRepository.save(product);
        return updatedProduct;
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
    }
    async search(query, page = 1, limit = 10, filters) {
        const queryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'category');
        if (query && query.trim() !== '') {
            queryBuilder.where('(LOWER(product.name) LIKE LOWER(:query) OR LOWER(product.description) LIKE LOWER(:query))', { query: `%${query}%` });
            queryBuilder.orderBy(`CASE
          WHEN LOWER(product.name) = LOWER(:exactQuery) THEN 1
          WHEN LOWER(product.name) LIKE LOWER(:startQuery) THEN 2
          WHEN LOWER(product.name) LIKE LOWER(:query) THEN 3
          ELSE 4
        END`, 'ASC');
            queryBuilder.setParameter('exactQuery', query.toLowerCase());
            queryBuilder.setParameter('startQuery', `${query.toLowerCase()}%`);
            queryBuilder.addOrderBy('product.average_rating', 'DESC');
        }
        else {
            queryBuilder.orderBy('product.average_rating', 'DESC');
            queryBuilder.addOrderBy('product.created_at', 'DESC');
        }
        if (filters?.category) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.category });
        }
        if (filters?.minPrice !== undefined) {
            queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
        }
        if (filters?.maxPrice !== undefined) {
            queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
        }
        queryBuilder.skip((page - 1) * limit).take(limit);
        const [products, total] = await queryBuilder.getManyAndCount();
        return { products, total };
    }
    async findByCategory(categoryId, page = 1, limit = 10) {
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
    async updateStock(id, quantity) {
        const product = await this.findOne(id);
        if (quantity < 0) {
            throw new common_1.NotFoundException('Stock quantity cannot be negative');
        }
        product.stock = quantity;
        return this.productRepository.save(product);
    }
    async adjustStock(id, adjustment) {
        const product = await this.findOne(id);
        const newStock = product.stock + adjustment;
        if (newStock < 0) {
            throw new common_1.NotFoundException('Insufficient stock for this adjustment');
        }
        product.stock = newStock;
        return this.productRepository.save(product);
    }
    async checkStockAvailability(id, quantity) {
        const product = await this.findOne(id);
        return product.stock >= quantity;
    }
    async getLowStockProducts(threshold = 10) {
        return this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'categories')
            .where('product.stock <= :threshold', { threshold })
            .andWhere('product.stock > 0')
            .orderBy('product.stock', 'ASC')
            .getMany();
    }
    async getOutOfStockProducts() {
        return this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'categories')
            .where('product.stock = 0')
            .orderBy('product.updated_at', 'DESC')
            .getMany();
    }
    async bulkUpdateStock(updates) {
        const updatedProducts = [];
        for (const update of updates) {
            const product = await this.updateStock(update.id, update.stock);
            updatedProducts.push(product);
        }
        return updatedProducts;
    }
    async getInventoryStats() {
        const allProducts = await this.productRepository.find();
        const stats = allProducts.reduce((acc, product) => {
            acc.totalProducts++;
            if (product.stock === 0) {
                acc.outOfStock++;
            }
            else if (product.stock <= 10) {
                acc.lowStock++;
                acc.inStock++;
            }
            else {
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
    async getRelatedProducts(productId, limit = 6) {
        const product = await this.findOne(productId);
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
    async getTrendingProducts(limit = 10) {
        return this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'categories')
            .where('product.stock > 0')
            .orderBy('product.created_at', 'DESC')
            .take(limit)
            .getMany();
    }
    async getFeaturedProducts(limit = 8) {
        return this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'categories')
            .where('product.stock > 0')
            .orderBy('product.stock', 'DESC')
            .take(limit)
            .getMany();
    }
    async getNewArrivals(limit = 12) {
        return this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'categories')
            .where('product.stock > 0')
            .orderBy('product.created_at', 'DESC')
            .take(limit)
            .getMany();
    }
    async getProductsBySameBrand(productId, limit = 6) {
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
    async getSimilarPriceProducts(productId, limit = 6) {
        const product = await this.findOne(productId);
        const price = Number(product.price);
        const minPrice = price * 0.7;
        const maxPrice = price * 1.3;
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
    async getFrequentlyBoughtTogether(productId, limit = 4) {
        const orderItemsWithProduct = await this.orderItemRepository
            .createQueryBuilder('orderItem')
            .select('orderItem.order_id')
            .where('orderItem.product_id = :productId', { productId })
            .getRawMany();
        if (orderItemsWithProduct.length === 0) {
            return this.getRelatedProducts(productId, limit);
        }
        const orderIds = orderItemsWithProduct.map(item => item.order_id);
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
        return this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'categories')
            .where('product.id IN (:...productIds)', { productIds })
            .andWhere('product.stock > 0')
            .getMany();
    }
    async getPersonalizedRecommendations(userId, limit = 10) {
        const userOrderItems = await this.orderItemRepository
            .createQueryBuilder('orderItem')
            .leftJoin('orderItem.order', 'order')
            .select('orderItem.product_id')
            .where('order.user_id = :userId', { userId })
            .getRawMany();
        if (userOrderItems.length === 0) {
            return this.getTrendingProducts(limit);
        }
        const userProductIds = userOrderItems.map(item => item.product_id);
        const userProducts = await this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'category')
            .where('product.id IN (:...userProductIds)', { userProductIds })
            .getMany();
        const categoryIds = new Set();
        userProducts.forEach(product => {
            product.categories.forEach(cat => categoryIds.add(cat.id));
        });
        if (categoryIds.size === 0) {
            return this.getTrendingProducts(limit);
        }
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map