import { Category } from './category.entity';
import { Vendor } from './vendor.entity';
export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    vendor_id: string;
    average_rating: number;
    image_url: string;
    sku: string;
    brand: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    images: string[];
    video_url: string;
    attributes: Array<{
        name: string;
        value: string;
    }>;
    tags: string[];
    slug: string;
    short_description: string;
    status: string;
    created_at: Date;
    updated_at: Date;
    categories: Category[];
    vendor: Vendor;
}
