import { PaymentsService, CreatePaymentIntentDto } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<{
        client_secret: string;
        payment_id: string;
    }>;
    handleWebhook(body: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
    findOne(id: string): Promise<import("../entities").Payment>;
    getOrderPayments(orderId: string): Promise<import("../entities").Payment[]>;
}
