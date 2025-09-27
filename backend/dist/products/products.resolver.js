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
exports.ProductsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const product_model_1 = require("./models/product.model");
const create_product_input_1 = require("./inputs/create-product.input");
const update_product_input_1 = require("./inputs/update-product.input");
const products_response_model_1 = require("./models/products-response.model");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ProductsResolver = class ProductsResolver {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    createProduct(createProductInput) {
        return this.productsService.create(createProductInput);
    }
    findAll(page, limit) {
        return this.productsService.findAll(page, limit);
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    searchProducts(query, category, priceMin, priceMax) {
        const filters = { category, priceMin, priceMax };
        return this.productsService.search(query, filters);
    }
    updateProduct(id, updateProductInput) {
        return this.productsService.update(id, updateProductInput);
    }
    async removeProduct(id) {
        await this.productsService.remove(id);
        return true;
    }
};
exports.ProductsResolver = ProductsResolver;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, graphql_1.Mutation)(() => product_model_1.Product),
    __param(0, (0, graphql_1.Args)('createProductInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_input_1.CreateProductInput]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "createProduct", null);
__decorate([
    (0, graphql_1.Query)(() => products_response_model_1.ProductsResponse, { name: 'products' }),
    __param(0, (0, graphql_1.Args)('page', { type: () => Number, defaultValue: 1 })),
    __param(1, (0, graphql_1.Args)('limit', { type: () => Number, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => product_model_1.Product, { name: 'product' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => [product_model_1.Product], { name: 'searchProducts' }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('category', { nullable: true })),
    __param(2, (0, graphql_1.Args)('priceMin', { type: () => Number, nullable: true })),
    __param(3, (0, graphql_1.Args)('priceMax', { type: () => Number, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "searchProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, graphql_1.Mutation)(() => product_model_1.Product),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('updateProductInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_input_1.UpdateProductInput]),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "updateProduct", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "removeProduct", null);
exports.ProductsResolver = ProductsResolver = __decorate([
    (0, graphql_1.Resolver)(() => product_model_1.Product),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsResolver);
//# sourceMappingURL=products.resolver.js.map