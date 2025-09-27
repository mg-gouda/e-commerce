import { Order } from './order.entity';
export declare enum PaymentProvider {
    COD = "cod",
    BANK_TRANSFER = "bank_transfer"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed"
}
export declare class Payment {
    id: string;
    order_id: string;
    provider: PaymentProvider;
    status: PaymentStatus;
    amount: number;
    created_at: Date;
    order: Order;
}
