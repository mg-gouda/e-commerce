import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';
import { RedisService } from '../redis/redis.service';
export interface AddToCartDto {
    product_id: string;
    quantity: number;
}
export interface UpdateCartItemDto {
    quantity: number;
}
export declare class CartService {
    private cartRepository;
    private cartItemRepository;
    private productRepository;
    private redisService;
    constructor(cartRepository: Repository<Cart>, cartItemRepository: Repository<CartItem>, productRepository: Repository<Product>, redisService: RedisService);
    getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart>;
    addToCart(userId: string | undefined, sessionId: string | undefined, addToCartDto: AddToCartDto): Promise<Cart>;
    updateCartItem(userId: string | undefined, sessionId: string | undefined, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart>;
    removeFromCart(userId: string | undefined, sessionId: string | undefined, itemId: string): Promise<Cart>;
    getCart(userId: string | undefined, sessionId: string | undefined): Promise<Cart>;
    clearCart(userId: string | undefined, sessionId: string | undefined): Promise<void>;
    private getCartWithItems;
}
