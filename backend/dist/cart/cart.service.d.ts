import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';
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
    constructor(cartRepository: Repository<Cart>, cartItemRepository: Repository<CartItem>, productRepository: Repository<Product>);
    getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart>;
    addToCart(addToCartDto: AddToCartDto, userId?: string, sessionId?: string): Promise<Cart>;
    updateCartItem(itemId: string, updateCartItemDto: UpdateCartItemDto, userId?: string, sessionId?: string): Promise<Cart>;
    removeFromCart(itemId: string, userId?: string, sessionId?: string): Promise<Cart>;
    getCart(userId?: string, sessionId?: string): Promise<Cart>;
    clearCart(userId?: string, sessionId?: string): Promise<void>;
    private getCartWithItems;
}
