import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(createPaymentDto: CreatePaymentDto): Promise<{
        payment_id: string;
        message: string;
        instructions?: any;
    }>;
    getBankTransferInstructions(): Promise<any>;
    confirmBankTransferPayment(id: string, req: any): Promise<import("../entities").Payment>;
    markCodPaymentCompleted(id: string): Promise<import("../entities").Payment>;
    findOne(id: string): Promise<import("../entities").Payment>;
    getOrderPayments(orderId: string): Promise<import("../entities").Payment[]>;
}
