import { Product } from './product.entity';
import { User } from './user.entity';
export declare class Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: Date;
    product: Product;
    user: User;
}
