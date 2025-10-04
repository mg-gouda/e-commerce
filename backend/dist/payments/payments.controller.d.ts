import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '../entities/payment.entity';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getAllPayments(page?: number, limit?: number, status?: PaymentStatus): Promise<{
        payments: import("../entities/payment.entity").Payment[];
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
    createPayment(createPaymentDto: CreatePaymentDto): Promise<{
        payment_id: string;
        message: string;
        instructions?: import("./payments.service").BankTransferInstructions;
    }>;
    getBankTransferInstructions(): Promise<any>;
    confirmBankTransferPayment(id: string, req: any): Promise<import("../entities/payment.entity").Payment>;
    markCodPaymentCompleted(id: string): Promise<import("../entities/payment.entity").Payment>;
    findOne(id: string): Promise<import("../entities/payment.entity").Payment>;
    getOrderPayments(orderId: string): Promise<import("../entities/payment.entity").Payment[]>;
}
