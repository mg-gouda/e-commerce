import { CartService } from './cart.service';
import type { AddToCartDto, UpdateCartItemDto } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any, sessionId?: string): Promise<import("../entities").Cart>;
    addToCart(addToCartDto: AddToCartDto, req: any, sessionId?: string): Promise<import("../entities").Cart>;
    updateCartItem(itemId: string, updateCartItemDto: UpdateCartItemDto, req: any, sessionId?: string): Promise<import("../entities").Cart>;
    removeFromCart(itemId: string, req: any, sessionId?: string): Promise<import("../entities").Cart>;
    clearCart(req: any, sessionId?: string): Promise<void>;
}
