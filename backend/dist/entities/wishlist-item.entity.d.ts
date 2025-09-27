import { Wishlist } from './wishlist.entity';
import { Product } from './product.entity';
export declare class WishlistItem {
    id: string;
    wishlist_id: string;
    product_id: string;
    wishlist: Wishlist;
    product: Product;
}
