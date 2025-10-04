import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private productRepository;
    private cartService;
    private emailService;
    private notificationsService;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, productRepository: Repository<Product>, cartService: CartService, emailService: EmailService, notificationsService: NotificationsService);
    createOrder(userId: string, sessionId: string | undefined, createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(userId?: string, page?: number, limit?: number): Promise<{
        orders: Order[];
        total: number;
    }>;
    findOne(id: string): Promise<Order>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
    getUserOrders(userId: string, page?: number, limit?: number): Promise<{
        orders: Order[];
        total: number;
    }>;
}
