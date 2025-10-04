import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { OrdersModule } from './orders/orders.module';
import { SettingsModule } from './settings/settings.module';
import { UploadModule } from './upload/upload.module';
import { MediaModule } from './media/media.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CouponsModule } from './coupons/coupons.module';
import { VendorsModule } from './vendors/vendors.module';
import { PaymentsModule } from './payments/payments.module';
import { LoyaltyPointsModule } from './loyalty-points/loyalty-points.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SeedService } from './seed.service';
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
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Coupon } from './entities/coupon.entity';
import { UserCoupon } from './entities/user-coupon.entity';
import { LoyaltyPoint } from './entities/loyalty-point.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/static',
      exclude: ['/api*'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'ecommerce',
      entities: [User, Vendor, Product, Category, Cart, CartItem, Review, Order, OrderItem, Payment, SiteSettings, Media, Wishlist, WishlistItem, Coupon, UserCoupon, LoyaltyPoint, Notification],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Product, Category, User]),
    AuthModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    ReviewsModule,
    AnalyticsModule,
    OrdersModule,
    SettingsModule,
    UploadModule,
    MediaModule,
    WishlistModule,
    CouponsModule,
    VendorsModule,
    PaymentsModule,
    LoyaltyPointsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
 
