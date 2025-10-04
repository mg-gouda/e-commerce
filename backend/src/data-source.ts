import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Review } from './entities/review.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { SiteSettings } from './entities/site-settings.entity';
import { Media } from './entities/media.entity';
import { Vendor } from './entities/vendor.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'ecommerce',
  entities: [User, Product, Category, Cart, CartItem, Review, Order, OrderItem, Payment, SiteSettings, Media, Vendor],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
