import { User } from './user.entity';
import { WishlistItem } from './wishlist-item.entity';
export declare class Wishlist {
    id: string;
    user_id: string;
    user: User;
    wishlistItems: WishlistItem[];
}
