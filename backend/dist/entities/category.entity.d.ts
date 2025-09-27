import { Product } from './product.entity';
export declare class Category {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    products: Product[];
}
