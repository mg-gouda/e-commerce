import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment, PaymentProvider, PaymentStatus } from '../entities/payment.entity';
import { Order, OrderStatus } from '../entities/order.entity';

export interface CreatePaymentIntentDto {
  order_id: string;
  payment_method?: string;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key', {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<{ client_secret: string; payment_id: string }> {
    const { order_id } = createPaymentIntentDto;

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
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
      amount: order.total,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        order_id: order.id,
        payment_id: savedPayment.id,
      },
    });

    return {
      client_secret: paymentIntent.client_secret!,
      payment_id: savedPayment.id,
    };
  }

  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.order_id;
    const paymentId = paymentIntent.metadata.payment_id;

    if (paymentId) {
      // Update payment status
      await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.PAID,
      });
    }

    if (orderId) {
      // Update order status
      await this.orderRepository.update(orderId, {
        status: OrderStatus.PROCESSING,
      });
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const paymentId = paymentIntent.metadata.payment_id;

    if (paymentId) {
      // Update payment status
      await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.FAILED,
      });
    }
  }

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
}