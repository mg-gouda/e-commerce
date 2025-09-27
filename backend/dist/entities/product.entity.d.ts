import { Category } from './category.entity';
import { Vendor } from './vendor.entity';
import { OrderItem } from './order-item.entity';
import { CartItem } from './cart-item.entity';
import { Review } from './review.entity';
import { WishlistItem } from './wishlist-item.entity';
export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: string;
    vendor_id: string;
    created_at: Date;
    updated_at: Date;
    category: Category;
    vendor: Vendor;
    orderItems: OrderItem[];
    cartItems: CartItem[];
    reviews: Review[];
    wishlistItems: WishlistItem[];
}
