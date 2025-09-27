import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private redisService: RedisService,
  ) {}

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null;

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { user_id: userId },
        relations: ['cartItems', 'cartItems.product'],
      });
    }

    if (!cart && sessionId) {
      // Try to get cart from Redis for guest users
      const cartData = await this.redisService.get(`cart:${sessionId}`);
      if (cartData) {
        return JSON.parse(cartData);
      }
    }

    if (!cart) {
      cart = this.cartRepository.create({
        user_id: userId,
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(userId: string | undefined, sessionId: string | undefined, addToCartDto: AddToCartDto): Promise<Cart> {
    const { product_id, quantity } = addToCartDto;

    // Verify product exists and has sufficient stock
    const product = await this.productRepository.findOne({ where: { id: product_id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id },
    });

    if (cartItem) {
      // Update quantity
      cartItem.quantity += quantity;
      if (cartItem.quantity > product.stock) {
        throw new BadRequestException('Insufficient stock');
      }
      await this.cartItemRepository.save(cartItem);
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        cart_id: cart.id,
        product_id,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    // Update cart in Redis for guest users
    if (!userId && sessionId) {
      const updatedCart = await this.getCartWithItems(cart.id);
      await this.redisService.set(`cart:${sessionId}`, JSON.stringify(updatedCart), 3600 * 24); // 24 hours
    }

    return this.getCartWithItems(cart.id);
  }

  async updateCartItem(userId: string | undefined, sessionId: string | undefined, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const { quantity } = updateCartItemDto;

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart', 'product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify user owns this cart item
    if (userId && cartItem.cart.user_id !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    if (quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      if (cartItem.product.stock < quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      cartItem.quantity = quantity;
      await this.cartItemRepository.save(cartItem);
    }

    // Update cart in Redis for guest users
    if (!userId && sessionId) {
      const updatedCart = await this.getCartWithItems(cartItem.cart.id);
      await this.redisService.set(`cart:${sessionId}`, JSON.stringify(updatedCart), 3600 * 24);
    }

    return this.getCartWithItems(cartItem.cart.id);
  }

  async removeFromCart(userId: string | undefined, sessionId: string | undefined, itemId: string): Promise<Cart> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify user owns this cart item
    if (userId && cartItem.cart.user_id !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    await this.cartItemRepository.remove(cartItem);

    // Update cart in Redis for guest users
    if (!userId && sessionId) {
      const updatedCart = await this.getCartWithItems(cartItem.cart.id);
      await this.redisService.set(`cart:${sessionId}`, JSON.stringify(updatedCart), 3600 * 24);
    }

    return this.getCartWithItems(cartItem.cart.id);
  }

  async getCart(userId: string | undefined, sessionId: string | undefined): Promise<Cart> {
    return this.getOrCreateCart(userId, sessionId);
  }

  async clearCart(userId: string | undefined, sessionId: string | undefined): Promise<void> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await this.cartItemRepository.delete({ cart_id: cart.id });

    // Clear cart from Redis for guest users
    if (!userId && sessionId) {
      await this.redisService.del(`cart:${sessionId}`);
    }
  }

  private async getCartWithItems(cartId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['cartItems', 'cartItems.product', 'cartItems.product.category'],
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }
}