import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Order } from '../entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private paymentRepository;
    private orderRepository;
    constructor(paymentRepository: Repository<Payment>, orderRepository: Repository<Order>);
    createPayment(createPaymentDto: CreatePaymentDto): Promise<{
        payment_id: string;
        message: string;
        instructions?: any;
    }>;
    confirmBankTransferPayment(paymentId: string, adminUserId: string): Promise<Payment>;
    markCodPaymentCompleted(paymentId: string): Promise<Payment>;
    getBankTransferInstructions(): Promise<any>;
    getPayment(id: string): Promise<Payment>;
    getOrderPayments(orderId: string): Promise<Payment[]>;
}
