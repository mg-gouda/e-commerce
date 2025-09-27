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
const elasticsearch_service_1 = require("../elasticsearch/elasticsearch.service");
let ProductsService = class ProductsService {
    productRepository;
    categoryRepository;
    elasticsearchService;
    constructor(productRepository, categoryRepository, elasticsearchService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.elasticsearchService = elasticsearchService;
    }
    async create(createProductDto) {
        const category = await this.categoryRepository.findOne({
            where: { id: createProductDto.category_id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const product = this.productRepository.create(createProductDto);
        const savedProduct = await this.productRepository.save(product);
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
    async findAll(page = 1, limit = 10) {
        const [products, total] = await this.productRepository.findAndCount({
            relations: ['category'],
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return { products, total };
    }
    async findOne(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category', 'reviews', 'reviews.user'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        if (updateProductDto.category_id) {
            const category = await this.categoryRepository.findOne({
                where: { id: updateProductDto.category_id },
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
        }
        Object.assign(product, updateProductDto);
        const updatedProduct = await this.productRepository.save(product);
        await this.elasticsearchService.updateDocument('products', id, {
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: updatedProduct.price,
            category_id: updatedProduct.category_id,
            stock: updatedProduct.stock,
        });
        return updatedProduct;
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
        await this.elasticsearchService.deleteDocument('products', id);
    }
    async search(query, filters) {
        const searchResult = await this.elasticsearchService.searchProducts(query, filters);
        const productIds = searchResult.hits.hits.map((hit) => hit._source.id);
        if (productIds.length === 0) {
            return [];
        }
        return this.productRepository.find({
            where: { id: productIds },
            relations: ['category'],
        });
    }
    async findByCategory(categoryId, page = 1, limit = 10) {
        const [products, total] = await this.productRepository.findAndCount({
            where: { category_id: categoryId },
            relations: ['category'],
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return { products, total };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        elasticsearch_service_1.ElasticsearchService])
], ProductsService);
//# sourceMappingURL=products.service.js.map