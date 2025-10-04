import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null;

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { user_id: userId },
        relations: ['cartItems', 'cartItems.product'],
      });
    } else if (sessionId) {
      cart = await this.cartRepository.findOne({
        where: { session_id: sessionId },
        relations: ['cartItems', 'cartItems.product'],
      });
    }

    if (!cart) {
      cart = this.cartRepository.create({
        user_id: userId,
        session_id: sessionId,
      });
      cart = await this.cartRepository.save(cart);

      // Reload the cart with relations to ensure cartItems is always included
      const reloadedCart = await this.cartRepository.findOne({
        where: { id: cart.id },
        relations: ['cartItems', 'cartItems.product'],
      });
      if (reloadedCart) {
        cart = reloadedCart;
      }
    }

    return cart;
  }

  async addToCart(addToCartDto: AddToCartDto, userId?: string, sessionId?: string): Promise<Cart> {
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

    return this.getCartWithItems(cart.id);
  }

  async updateCartItem(itemId: string, updateCartItemDto: UpdateCartItemDto, userId?: string, sessionId?: string): Promise<Cart> {
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
    if (sessionId && cartItem.cart.session_id !== sessionId) {
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

    return this.getCartWithItems(cartItem.cart.id);
  }

  async removeFromCart(itemId: string, userId?: string, sessionId?: string): Promise<Cart> {
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
    if (sessionId && cartItem.cart.session_id !== sessionId) {
      throw new BadRequestException('Unauthorized');
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getCartWithItems(cartItem.cart.id);
  }

  async getCart(userId?: string, sessionId?: string): Promise<Cart> {
    return this.getOrCreateCart(userId, sessionId);
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await this.cartItemRepository.delete({ cart_id: cart.id });
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