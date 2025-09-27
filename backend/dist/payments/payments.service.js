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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../entities/payment.entity");
const order_entity_1 = require("../entities/order.entity");
let PaymentsService = class PaymentsService {
    paymentRepository;
    orderRepository;
    constructor(paymentRepository, orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }
    async createPayment(createPaymentDto) {
        const { order_id, payment_method, bank_details } = createPaymentDto;
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
            provider: payment_method,
            status: payment_entity_1.PaymentStatus.PENDING,
            amount: order.total,
        });
        const savedPayment = await this.paymentRepository.save(payment);
        let message = '';
        let instructions = {};
        switch (payment_method) {
            case payment_entity_1.PaymentProvider.COD:
                await this.orderRepository.update(order_id, {
                    status: order_entity_1.OrderStatus.PROCESSING,
                });
                await this.paymentRepository.update(savedPayment.id, {
                    status: payment_entity_1.PaymentStatus.PENDING,
                });
                message = 'Order confirmed. Payment will be collected on delivery.';
                instructions = {
                    delivery_instructions: 'Please have the exact amount ready for payment on delivery.',
                    estimated_delivery: '3-7 business days',
                };
                break;
            case payment_entity_1.PaymentProvider.BANK_TRANSFER:
                message = 'Please complete the bank transfer using the details below.';
                instructions = {
                    bank_name: 'E-Commerce Bank',
                    account_name: 'E-Commerce Platform Ltd',
                    account_number: '1234567890',
                    routing_number: '123456789',
                    amount: order.total,
                    reference: `ORDER-${order_id.slice(-8).toUpperCase()}`,
                    instructions: [
                        'Use the reference number in your transfer description',
                        'Payment verification may take 1-2 business days',
                        'Your order will be processed after payment confirmation',
                    ],
                };
                break;
            default:
                throw new common_1.BadRequestException('Unsupported payment method');
        }
        return {
            payment_id: savedPayment.id,
            message,
            instructions,
        };
    }
    async confirmBankTransferPayment(paymentId, adminUserId) {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['order'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.provider !== payment_entity_1.PaymentProvider.BANK_TRANSFER) {
            throw new common_1.BadRequestException('This payment is not a bank transfer');
        }
        if (payment.status !== payment_entity_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Payment is not in pending status');
        }
        await this.paymentRepository.update(paymentId, {
            status: payment_entity_1.PaymentStatus.PAID,
        });
        await this.orderRepository.update(payment.order.id, {
            status: order_entity_1.OrderStatus.PROCESSING,
        });
        return this.getPayment(paymentId);
    }
    async markCodPaymentCompleted(paymentId) {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['order'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.provider !== payment_entity_1.PaymentProvider.COD) {
            throw new common_1.BadRequestException('This payment is not COD');
        }
        await this.paymentRepository.update(paymentId, {
            status: payment_entity_1.PaymentStatus.PAID,
        });
        await this.orderRepository.update(payment.order.id, {
            status: order_entity_1.OrderStatus.DELIVERED,
        });
        return this.getPayment(paymentId);
    }
    async getBankTransferInstructions() {
        return {
            bank_name: 'E-Commerce Bank',
            account_name: 'E-Commerce Platform Ltd',
            account_number: '1234567890',
            routing_number: '123456789',
            swift_code: 'ECOMBANK',
            instructions: [
                'Include your order reference number in the transfer description',
                'Payment verification takes 1-2 business days',
                'Contact support if you need assistance',
            ],
        };
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