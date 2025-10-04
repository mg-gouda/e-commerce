import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Order } from '../entities/order.entity';
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
export declare class PaymentsService {
    private paymentRepository;
    private orderRepository;
    constructor(paymentRepository: Repository<Payment>, orderRepository: Repository<Order>);
    createPayment(createPaymentDto: CreatePaymentDto): Promise<{
        payment_id: string;
        message: string;
        instructions?: BankTransferInstructions;
    }>;
    confirmBankTransferPayment(paymentId: string, adminUserId: string): Promise<Payment>;
    markCodPaymentCompleted(paymentId: string): Promise<Payment>;
    getBankTransferInstructions(): Promise<any>;
    getPayment(id: string): Promise<Payment>;
    getOrderPayments(orderId: string): Promise<Payment[]>;
    getAllPayments(page?: number, limit?: number, status?: PaymentStatus): Promise<{
        payments: Payment[];
        total: number;
        page: number;
        pages: number;
    }>;
    getPaymentStats(): Promise<{
        total_payments: number;
        total_revenue: number;
        pending_count: number;
        paid_count: number;
        failed_count: number;
        pending_amount: number;
    }>;
}
