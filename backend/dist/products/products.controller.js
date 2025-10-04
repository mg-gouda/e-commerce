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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const products_service_1 = require("./products.service");
const upload_service_1 = require("../upload/upload.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../entities/user.entity");
let ProductsController = class ProductsController {
    productsService;
    uploadService;
    constructor(productsService, uploadService) {
        this.productsService = productsService;
        this.uploadService = uploadService;
    }
    findAll(page = 1, limit = 10, search, category, minPrice, maxPrice, sort) {
        console.log('🔥 Frontend requested /products endpoint with filters:', {
            page,
            limit,
            search,
            category,
            minPrice,
            maxPrice,
            sort
        });
        const filters = {
            search,
            category,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            sort,
        };
        return this.productsService.findAll(page, limit, filters);
    }
    search(query, page = 1, limit = 10, category, minPrice, maxPrice) {
        console.log('🔥 Frontend requested /products/search endpoint with query:', query);
        const filters = {
            category,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
        };
        return this.productsService.search(query || '', Number(page), Number(limit), filters);
    }
    findByCategory(categoryId, page = 1, limit = 10) {
        console.log(`🔥 Frontend requested /products/category/${categoryId} endpoint`);
        return this.productsService.findByCategory(categoryId, page, limit);
    }
    findOne(id) {
        console.log(`🔥 Frontend requested /products/${id} endpoint`);
        return this.productsService.findOne(id);
    }
    create(createProductDto) {
        console.log('🔥 Frontend requested POST /products endpoint');
        return this.productsService.create(createProductDto);
    }
    async uploadProductImage(id, file) {
        console.log(`🔥 Frontend requested POST /products/${id}/image endpoint`);
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const imageUrl = this.uploadService.getFileUrl(file.filename);
        const updatedProduct = await this.productsService.update(id, {
            image_url: imageUrl,
        });
        return {
            message: 'Image uploaded successfully',
            imageUrl,
            product: updatedProduct,
        };
    }
    update(id, updateProductDto) {
        console.log(`🔥 Frontend requested PUT /products/${id} endpoint`);
        return this.productsService.update(id, updateProductDto);
    }
    remove(id) {
        console.log(`🔥 Frontend requested DELETE /products/${id} endpoint`);
        return this.productsService.remove(id);
    }
    updateStock(id, stock) {
        console.log(`🔥 Admin requested PATCH /products/${id}/stock endpoint`);
        return this.productsService.updateStock(id, stock);
    }
    adjustStock(id, adjustment) {
        console.log(`🔥 Admin requested PATCH /products/${id}/stock/adjust endpoint`);
        return this.productsService.adjustStock(id, adjustment);
    }
    getLowStockProducts(threshold) {
        console.log('🔥 Admin requested GET /products/inventory/low-stock endpoint');
        return this.productsService.getLowStockProducts(threshold ? Number(threshold) : 10);
    }
    getOutOfStockProducts() {
        console.log('🔥 Admin requested GET /products/inventory/out-of-stock endpoint');
        return this.productsService.getOutOfStockProducts();
    }
    getInventoryStats() {
        console.log('🔥 Admin requested GET /products/inventory/stats endpoint');
        return this.productsService.getInventoryStats();
    }
    bulkUpdateStock(updates) {
        console.log('🔥 Admin requested PATCH /products/inventory/bulk endpoint');
        return this.productsService.bulkUpdateStock(updates);
    }
    async checkStockAvailability(id, quantity) {
        console.log(`🔥 Frontend requested GET /products/${id}/stock/check endpoint`);
        const available = await this.productsService.checkStockAvailability(id, Number(quantity));
        return { available, productId: id, requestedQuantity: Number(quantity) };
    }
    async getRelatedProducts(id, limit) {
        console.log(`🔥 Frontend requested GET /products/recommendations/related/${id} endpoint`);
        return this.productsService.getRelatedProducts(id, limit ? Number(limit) : 6);
    }
    async getTrendingProducts(limit) {
        console.log('🔥 Frontend requested GET /products/recommendations/trending endpoint');
        return this.productsService.getTrendingProducts(limit ? Number(limit) : 10);
    }
    async getFeaturedProducts(limit) {
        console.log('🔥 Frontend requested GET /products/recommendations/featured endpoint');
        return this.productsService.getFeaturedProducts(limit ? Number(limit) : 8);
    }
    async getNewArrivals(limit) {
        console.log('🔥 Frontend requested GET /products/recommendations/new-arrivals endpoint');
        return this.productsService.getNewArrivals(limit ? Number(limit) : 12);
    }
    async getProductsBySameBrand(id, limit) {
        console.log(`🔥 Frontend requested GET /products/recommendations/same-brand/${id} endpoint`);
        return this.productsService.getProductsBySameBrand(id, limit ? Number(limit) : 6);
    }
    async getSimilarPriceProducts(id, limit) {
        console.log(`🔥 Frontend requested GET /products/recommendations/similar-price/${id} endpoint`);
        return this.productsService.getSimilarPriceProducts(id, limit ? Number(limit) : 6);
    }
    async getFrequentlyBoughtTogether(id, limit) {
        console.log(`🔥 Frontend requested GET /products/recommendations/frequently-bought-together/${id} endpoint`);
        return this.productsService.getFrequentlyBoughtTogether(id, limit ? Number(limit) : 4);
    }
    async getPersonalizedRecommendations(req, limit) {
        console.log('🔥 Frontend requested GET /products/recommendations/personalized endpoint');
        return this.productsService.getPersonalizedRecommendations(req.user.id, limit ? Number(limit) : 10);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('minPrice')),
    __param(5, (0, common_1.Query)('maxPrice')),
    __param(6, (0, common_1.Query)('sort')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, Number, Number, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('minPrice')),
    __param(5, (0, common_1.Query)('maxPrice')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, Number, Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('category/:categoryId'),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', upload_service_1.UploadService.getMulterOptions())),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "uploadProductImage", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Patch)(':id/stock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('stock')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateStock", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Patch)(':id/stock/adjust'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('adjustment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('inventory/low-stock'),
    __param(0, (0, common_1.Query)('threshold')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getLowStockProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('inventory/out-of-stock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getOutOfStockProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('inventory/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getInventoryStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Patch)('inventory/bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkUpdateStock", null);
__decorate([
    (0, common_1.Get)(':id/stock/check'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('quantity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "checkStockAvailability", null);
__decorate([
    (0, common_1.Get)('recommendations/related/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getRelatedProducts", null);
__decorate([
    (0, common_1.Get)('recommendations/trending'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getTrendingProducts", null);
__decorate([
    (0, common_1.Get)('recommendations/featured'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getFeaturedProducts", null);
__decorate([
    (0, common_1.Get)('recommendations/new-arrivals'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getNewArrivals", null);
__decorate([
    (0, common_1.Get)('recommendations/same-brand/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProductsBySameBrand", null);
__decorate([
    (0, common_1.Get)('recommendations/similar-price/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getSimilarPriceProducts", null);
__decorate([
    (0, common_1.Get)('recommendations/frequently-bought-together/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getFrequentlyBoughtTogether", null);
__decorate([
    (0, common_1.Get)('recommendations/personalized'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, Request()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getPersonalizedRecommendations", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        upload_service_1.UploadService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map