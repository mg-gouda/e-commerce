import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  PRODUCT_BACK_IN_STOCK = 'product_back_in_stock',
  PRODUCT_LOW_STOCK = 'product_low_stock',
  REVIEW_REPLY = 'review_reply',
  COUPON_EXPIRING = 'coupon_expiring',
  LOYALTY_POINTS_EARNED = 'loyalty_points_earned',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any; // Additional data like order_id, product_id, etc.

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'varchar', nullable: true })
  link: string; // Deep link to related resource

  @CreateDateColumn()
  created_at: Date;
}
