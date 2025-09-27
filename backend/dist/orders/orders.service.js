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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const product_entity_1 = require("../entities/product.entity");
const cart_service_1 = require("../cart/cart.service");
let OrdersService = class OrdersService {
    orderRepository;
    orderItemRepository;
    productRepository;
    cartService;
    constructor(orderRepository, orderItemRepository, productRepository, cartService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
    }
    async createOrder(userId, sessionId, createOrderDto) {
        const cart = await this.cartService.getCart(userId, sessionId);
        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        let total = 0;
        const orderItems = [];
        for (const cartItem of cart.cartItems) {
            const product = await this.productRepository.findOne({ where: { id: cartItem.product_id } });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${cartItem.product_id} not found`);
            }
            if (product.stock < cartItem.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for product ${product.name}`);
            }
            const itemTotal = product.price * cartItem.quantity;
            total += itemTotal;
            orderItems.push({
                product_id: cartItem.product_id,
                quantity: cartItem.quantity,
                price: product.price,
            });
        }
        const order = this.orderRepository.create({
            user_id: userId,
            status: order_entity_1.OrderStatus.PENDING,
            total,
        });
        const savedOrder = await this.orderRepository.save(order);
        for (const orderItemData of orderItems) {
            const orderItem = this.orderItemRepository.create({
                order_id: savedOrder.id,
                ...orderItemData,
            });
            await this.orderItemRepository.save(orderItem);
            await this.productRepository.decrement({ id: orderItemData.product_id }, 'stock', orderItemData.quantity);
        }
        await this.cartService.clearCart(userId, sessionId);
        return this.findOne(savedOrder.id);
    }
    async findAll(userId, page = 1, limit = 10) {
        const queryBuilder = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.orderItems', 'orderItems')
            .leftJoinAndSelect('orderItems.product', 'product')
            .leftJoinAndSelect('order.user', 'user');
        if (userId) {
            queryBuilder.where('order.user_id = :userId', { userId });
        }
        const [orders, total] = await queryBuilder
            .orderBy('order.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { orders, total };
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['orderItems', 'orderItems.product', 'user', 'payments'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateOrderStatus(id, status) {
        const order = await this.findOne(id);
        order.status = status;
        await this.orderRepository.save(order);
        return order;
    }
    async getUserOrders(userId, page = 1, limit = 10) {
        return this.findAll(userId, page, limit);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cart_service_1.CartService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map