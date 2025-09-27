import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment } from '../entities/payment.entity';
import { Order } from '../entities/order.entity';
export interface CreatePaymentIntentDto {
    order_id: string;
    payment_method?: string;
}
export declare class PaymentsService {
    private paymentRepository;
    private orderRepository;
    private stripe;
    constructor(paymentRepository: Repository<Payment>, orderRepository: Repository<Order>);
    createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<{
        client_secret: string;
        payment_id: string;
    }>;
    handleStripeWebhook(event: Stripe.Event): Promise<void>;
    private handlePaymentSuccess;
    private handlePaymentFailure;
    getPayment(id: string): Promise<Payment>;
    getOrderPayments(orderId: string): Promise<Payment[]>;
}
