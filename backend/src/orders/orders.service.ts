import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { CartService } from '../cart/cart.service';

export interface CreateOrderDto {
  shipping_address: string;
  payment_method: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private cartService: CartService,
  ) {}

  async createOrder(userId: string, sessionId: string | undefined, createOrderDto: CreateOrderDto): Promise<Order> {
    // Get user's cart
    const cart = await this.cartService.getCart(userId, sessionId);

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate total and verify stock
    let total = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const cartItem of cart.cartItems) {
      const product = await this.productRepository.findOne({ where: { id: cartItem.product_id } });

      if (!product) {
        throw new NotFoundException(`Product ${cartItem.product_id} not found`);
      }

      if (product.stock < cartItem.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`);
      }

      const itemTotal = product.price * cartItem.quantity;
      total += itemTotal;

      orderItems.push({
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        price: product.price,
      });
    }

    // Create order
    const order = this.orderRepository.create({
      user_id: userId,
      status: OrderStatus.PENDING,
      total,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    for (const orderItemData of orderItems) {
      const orderItem = this.orderItemRepository.create({
        order_id: savedOrder.id,
        ...orderItemData,
      });
      await this.orderItemRepository.save(orderItem);

      // Update product stock
      await this.productRepository.decrement(
        { id: orderItemData.product_id },
        'stock',
        orderItemData.quantity,
      );
    }

    // Clear cart
    await this.cartService.clearCart(userId, sessionId);

    return this.findOne(savedOrder.id);
  }

  async findAll(userId?: string, page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number }> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('order.user', 'user');

    if (userId) {
      queryBuilder.where('order.user_id = :userId', { userId });
    }

    const [orders, total] = await queryBuilder
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { orders, total };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'user', 'payments'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    await this.orderRepository.save(order);
    return order;
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number }> {
    return this.findAll(userId, page, limit);
  }
}