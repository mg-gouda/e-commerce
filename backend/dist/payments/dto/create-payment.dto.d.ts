import { PaymentProvider } from '../../entities/payment.entity';
declare class BankDetailsDto {
    account_name?: string;
    account_number?: string;
    bank_name?: string;
    reference_number?: string;
}
export declare class CreatePaymentDto {
    order_id: string;
    payment_method: PaymentProvider;
    bank_details?: BankDetailsDto;
}
export {};
