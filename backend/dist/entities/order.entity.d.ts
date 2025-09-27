import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare class Order {
    id: string;
    user_id: string;
    status: OrderStatus;
    total: number;
    created_at: Date;
    updated_at: Date;
    user: User;
    orderItems: OrderItem[];
    payments: Payment[];
}
