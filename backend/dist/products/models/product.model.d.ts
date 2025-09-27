import { Category } from '../../categories/models/category.model';
export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: string;
    vendor_id?: string;
    created_at: Date;
    updated_at: Date;
    category?: Category;
}
