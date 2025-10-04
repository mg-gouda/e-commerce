import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  link?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user_id: createNotificationDto.userId,
      type: createNotificationDto.type,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      data: createNotificationDto.data,
      link: createNotificationDto.link,
    });

    return this.notificationRepository.save(notification);
  }

  async findAllByUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });

    return { notifications, total, unreadCount };
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user_id: userId, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.is_read = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }

  async deleteAll(userId: string): Promise<void> {
    await this.notificationRepository.delete({ user_id: userId });
  }

  // Helper methods for creating specific notification types

  async notifyOrderCreated(userId: string, orderId: string, total: number): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.ORDER_CREATED,
      title: 'Order Placed Successfully',
      message: `Your order #${orderId.slice(0, 8)} has been placed. Total: $${total.toFixed(2)}`,
      data: { orderId, total },
      link: `/orders/${orderId}`,
    });
  }

  async notifyOrderStatusUpdate(
    userId: string,
    orderId: string,
    status: string,
  ): Promise<Notification> {
    const statusMessages = {
      processing: { title: 'Order Processing', message: 'Your order is now being processed.' },
      shipped: { title: 'Order Shipped', message: 'Your order has been shipped!' },
      delivered: { title: 'Order Delivered', message: 'Your order has been delivered.' },
      cancelled: { title: 'Order Cancelled', message: 'Your order has been cancelled.' },
    };

    const config = statusMessages[status] || statusMessages.processing;

    return this.create({
      userId,
      type: NotificationType.ORDER_UPDATED,
      title: config.title,
      message: `${config.message} Order #${orderId.slice(0, 8)}`,
      data: { orderId, status },
      link: `/orders/${orderId}`,
    });
  }

  async notifyPaymentSuccess(userId: string, orderId: string, amount: number): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: 'Payment Successful',
      message: `Payment of $${amount.toFixed(2)} for order #${orderId.slice(0, 8)} was successful.`,
      data: { orderId, amount },
      link: `/orders/${orderId}`,
    });
  }

  async notifyPaymentFailed(userId: string, orderId: string, reason?: string): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.PAYMENT_FAILED,
      title: 'Payment Failed',
      message: `Payment for order #${orderId.slice(0, 8)} failed. ${reason || 'Please try again.'}`,
      data: { orderId, reason },
      link: `/orders/${orderId}`,
    });
  }

  async notifyProductBackInStock(userId: string, productId: string, productName: string): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.PRODUCT_BACK_IN_STOCK,
      title: 'Product Back in Stock',
      message: `${productName} is now back in stock!`,
      data: { productId },
      link: `/products/${productId}`,
    });
  }

  async notifyLowStock(userId: string, productId: string, productName: string, stock: number): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.PRODUCT_LOW_STOCK,
      title: 'Low Stock Alert',
      message: `${productName} is running low on stock. Only ${stock} left!`,
      data: { productId, stock },
      link: `/admin/products/${productId}`,
    });
  }

  async notifyLoyaltyPointsEarned(userId: string, points: number, orderId: string): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.LOYALTY_POINTS_EARNED,
      title: 'Points Earned!',
      message: `You've earned ${points} loyalty points from your recent purchase!`,
      data: { points, orderId },
      link: `/profile/loyalty`,
    });
  }

  async notifyCouponExpiring(userId: string, couponCode: string, expiryDate: Date): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.COUPON_EXPIRING,
      title: 'Coupon Expiring Soon',
      message: `Your coupon "${couponCode}" expires on ${expiryDate.toLocaleDateString()}. Use it now!`,
      data: { couponCode, expiryDate },
      link: `/coupons`,
    });
  }
}
