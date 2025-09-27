import { Order } from './order.entity';
import { Review } from './review.entity';
import { Cart } from './cart.entity';
import { Wishlist } from './wishlist.entity';
import { LoyaltyPoint } from './loyalty-point.entity';
export declare enum UserRole {
    CUSTOMER = "customer",
    ADMIN = "admin",
    VENDOR = "vendor"
}
export declare class User {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
    orders: Order[];
    reviews: Review[];
    carts: Cart[];
    wishlists: Wishlist[];
    loyaltyPoints: LoyaltyPoint[];
}
