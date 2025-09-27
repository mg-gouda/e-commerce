import { User } from './user.entity';
import { Product } from './product.entity';
export declare enum VendorStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Vendor {
    id: string;
    user_id: string;
    shop_name: string;
    status: VendorStatus;
    created_at: Date;
    user: User;
    products: Product[];
}
