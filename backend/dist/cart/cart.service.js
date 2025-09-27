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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("../entities/cart.entity");
const cart_item_entity_1 = require("../entities/cart-item.entity");
const product_entity_1 = require("../entities/product.entity");
const redis_service_1 = require("../redis/redis.service");
let CartService = class CartService {
    cartRepository;
    cartItemRepository;
    productRepository;
    redisService;
    constructor(cartRepository, cartItemRepository, productRepository, redisService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.redisService = redisService;
    }
    async getOrCreateCart(userId, sessionId) {
        let cart = null;
        if (userId) {
            cart = await this.cartRepository.findOne({
                where: { user_id: userId },
                relations: ['cartItems', 'cartItems.product'],
            });
        }
        if (!cart && sessionId) {
            const cartData = await this.redisService.get(`cart:${sessionId}`);
            if (cartData) {
                return JSON.parse(cartData);
            }
        }
        if (!cart) {
            cart = this.cartRepository.create({
                user_id: userId,
            });
            cart = await this.cartRepository.save(cart);
        }
        return cart;
    }
    async addToCart(userId, sessionId, addToCartDto) {
        const { product_id, quantity } = addToCartDto;
        const product = await this.productRepository.findOne({ where: { id: product_id } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.stock < quantity) {
            throw new common_1.BadRequestException('Insufficient stock');
        }
        const cart = await this.getOrCreateCart(userId, sessionId);
        let cartItem = await this.cartItemRepository.findOne({
            where: { cart_id: cart.id, product_id },
        });
        if (cartItem) {
            cartItem.quantity += quantity;
            if (cartItem.quantity > product.stock) {
                throw new common_1.BadRequestException('Insufficient stock');
            }
            await this.cartItemRepository.save(cartItem);
        }
        else {
            cartItem = this.cartItemRepository.create({
                cart_id: cart.id,
                product_id,
                quantity,
            });
            await this.cartItemRepository.save(cartItem);
        }
        if (!userId && sessionId) {
            const updatedCart = await this.getCartWithItems(cart.id);
            await this.redisService.set(`cart:${sessionId}`, JSON.stringify(updatedCart), 3600 * 24);
        }
        return this.getCartWithItems(cart.id);
    }
    async updateCartItem(userId, sessionId, itemId, updateCartItemDto) {
        const { quantity } = updateCartItemDto;
        const cartItem = await this.cartItemRepository.findOne({
            where: { id: itemId },
            relations: ['cart', 'product'],
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (userId && cartItem.cart.user_id !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        if (quantity <= 0) {
            await this.cartItemRepository.remove(cartItem);
        }
        else {
            if (cartItem.product.stock < quantity) {
                throw new common_1.BadRequestException('Insufficient stock');
            }
            cartItem.quantity = quantity;
            await this.cartItemRepository.save(cartItem);
        }
        if (!userId && sessionId) {
            const updatedCart = await this.getCartWithItems(cartItem.cart.id);
            await this.redisService.set(`cart:${sessionId}`, JSON.stringify(updatedCart), 3600 * 24);
        }
        return this.getCartWithItems(cartItem.cart.id);
    }
    async removeFromCart(userId, sessionId, itemId) {
        const cartItem = await this.cartItemRepository.findOne({
            where: { id: itemId },
            relations: ['cart'],
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (userId && cartItem.cart.user_id !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        await this.cartItemRepository.remove(cartItem);
        if (!userId && sessionId) {
            const updatedCart = await this.getCartWithItems(cartItem.cart.id);
            await this.redisService.set(`cart:${sessionId}`, JSON.stringify(updatedCart), 3600 * 24);
        }
        return this.getCartWithItems(cartItem.cart.id);
    }
    async getCart(userId, sessionId) {
        return this.getOrCreateCart(userId, sessionId);
    }
    async clearCart(userId, sessionId) {
        const cart = await this.getOrCreateCart(userId, sessionId);
        await this.cartItemRepository.delete({ cart_id: cart.id });
        if (!userId && sessionId) {
            await this.redisService.del(`cart:${sessionId}`);
        }
    }
    async getCartWithItems(cartId) {
        const cart = await this.cartRepository.findOne({
            where: { id: cartId },
            relations: ['cartItems', 'cartItems.product', 'cartItems.product.category'],
        });
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        return cart;
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService])
], CartService);
//# sourceMappingURL=cart.service.js.map