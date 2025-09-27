import { OrdersService, CreateOrderDto } from './orders.service';
import { OrderStatus } from '../entities/order.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(createOrderDto: CreateOrderDto, req: any, sessionId?: string): Promise<import("../entities/order.entity").Order>;
    getMyOrders(req: any, page?: number, limit?: number): Promise<{
        orders: import("../entities/order.entity").Order[];
        total: number;
    }>;
    getAllOrders(page?: number, limit?: number): Promise<{
        orders: import("../entities/order.entity").Order[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../entities/order.entity").Order>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<import("../entities/order.entity").Order>;
}
