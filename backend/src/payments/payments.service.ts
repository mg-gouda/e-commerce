import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import Stripe from 'stripe'; // Commented out for now
import { Payment, PaymentProvider, PaymentStatus } from '../entities/payment.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

export interface BankTransferInstructions {
  bank_name: string;
  account_name: string;
  account_number: string;
  routing_number: string;
  amount: number;
  reference: string;
  instructions: string[];
}

@Injectable()
export class PaymentsService {
  // private stripe: Stripe; // Commented out for now

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    // Stripe initialization commented out for now
    // this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key', {
    //   apiVersion: '2025-08-27.basil',
    // });
  }

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<{ payment_id: string; message: string; instructions?: BankTransferInstructions }> {
    const { order_id, payment_method, bank_details } = createPaymentDto;

    // Find the order
    const order = await this.orderRepository.findOne({
      where: { id: order_id },
      relations: ['orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending status');
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      order_id,
      provider: payment_method,
      status: PaymentStatus.PENDING,
      amount: order.total,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Handle different payment methods
    let message = '';
    let instructions: any = {};

    switch (payment_method) {
      case PaymentProvider.COD:
        // For COD, mark order as confirmed and update payment status
        await this.orderRepository.update(order_id, {
          status: OrderStatus.PROCESSING,
        });
        await this.paymentRepository.update(savedPayment.id, {
          status: PaymentStatus.PENDING, // Will be paid on delivery
        });
        message = 'Order confirmed. Payment will be collected on delivery.';
        instructions = {
          delivery_instructions: 'Please have the exact amount ready for payment on delivery.',
          estimated_delivery: '3-7 business days',
        };
        break;

      case PaymentProvider.BANK_TRANSFER:
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
        throw new BadRequestException('Unsupported payment method');
    }

    return {
      payment_id: savedPayment.id,
      message,
      instructions,
    };
  }

  async confirmBankTransferPayment(paymentId: string, adminUserId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.provider !== PaymentProvider.BANK_TRANSFER) {
      throw new BadRequestException('This payment is not a bank transfer');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    // Update payment status to paid
    await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.PAID,
    });

    // Update order status to processing
    await this.orderRepository.update(payment.order.id, {
      status: OrderStatus.PROCESSING,
    });

    return this.getPayment(paymentId);
  }

  async markCodPaymentCompleted(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.provider !== PaymentProvider.COD) {
      throw new BadRequestException('This payment is not COD');
    }

    // Update payment status to paid (when delivery is completed)
    await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.PAID,
    });

    // Update order status to delivered
    await this.orderRepository.update(payment.order.id, {
      status: OrderStatus.DELIVERED,
    });

    return this.getPayment(paymentId);
  }

  async getBankTransferInstructions(): Promise<any> {
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

  // Commented out Stripe webhook handling for now
  // async handleStripeWebhook(event: Stripe.Event): Promise<void> {
  //   switch (event.type) {
  //     case 'payment_intent.succeeded':
  //       await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
  //       break;
  //     case 'payment_intent.payment_failed':
  //       await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
  //       break;
  //     default:
  //       console.log(`Unhandled event type ${event.type}`);
  //   }
  // }

  async getPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getOrderPayments(orderId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { order_id: orderId },
      order: { created_at: 'DESC' },
    });
  }

  async getAllPayments(page: number = 1, limit: number = 20, status?: PaymentStatus) {
    const where = status ? { status } : {};

    const [payments, total] = await this.paymentRepository.findAndCount({
      where,
      relations: ['order', 'order.user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      payments,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getPaymentStats() {
    const allPayments = await this.paymentRepository.find();

    const totalRevenue = allPayments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingPayments = allPayments.filter(p => p.status === PaymentStatus.PENDING);
    const paidPayments = allPayments.filter(p => p.status === PaymentStatus.PAID);
    const failedPayments = allPayments.filter(p => p.status === PaymentStatus.FAILED);

    return {
      total_payments: allPayments.length,
      total_revenue: totalRevenue,
      pending_count: pendingPayments.length,
      paid_count: paidPayments.length,
      failed_count: failedPayments.length,
      pending_amount: pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    };
  }
}