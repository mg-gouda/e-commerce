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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
const payment_entity_1 = require("../entities/payment.entity");
const order_entity_1 = require("../entities/order.entity");
let PaymentsService = class PaymentsService {
    paymentRepository;
    orderRepository;
    stripe;
    constructor(paymentRepository, orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key', {
            apiVersion: '2025-08-27.basil',
        });
    }
    async createPaymentIntent(createPaymentIntentDto) {
        const { order_id } = createPaymentIntentDto;
        const order = await this.orderRepository.findOne({
            where: { id: order_id },
            relations: ['orderItems', 'orderItems.product'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status !== order_entity_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException('Order is not in pending status');
        }
        const payment = this.paymentRepository.create({
            order_id,
            provider: payment_entity_1.PaymentProvider.STRIPE,
            status: payment_entity_1.PaymentStatus.PENDING,
            amount: order.total,
        });
        const savedPayment = await this.paymentRepository.save(payment);
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(order.total * 100),
            currency: 'usd',
            metadata: {
                order_id: order.id,
                payment_id: savedPayment.id,
            },
        });
        return {
            client_secret: paymentIntent.client_secret,
            payment_id: savedPayment.id,
        };
    }
    async handleStripeWebhook(event) {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailure(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }
    async handlePaymentSuccess(paymentIntent) {
        const orderId = paymentIntent.metadata.order_id;
        const paymentId = paymentIntent.metadata.payment_id;
        if (paymentId) {
            await this.paymentRepository.update(paymentId, {
                status: payment_entity_1.PaymentStatus.PAID,
            });
        }
        if (orderId) {
            await this.orderRepository.update(orderId, {
                status: order_entity_1.OrderStatus.PROCESSING,
            });
        }
    }
    async handlePaymentFailure(paymentIntent) {
        const paymentId = paymentIntent.metadata.payment_id;
        if (paymentId) {
            await this.paymentRepository.update(paymentId, {
                status: payment_entity_1.PaymentStatus.FAILED,
            });
        }
    }
    async getPayment(id) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['order'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async getOrderPayments(orderId) {
        return this.paymentRepository.find({
            where: { order_id: orderId },
            order: { created_at: 'DESC' },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map