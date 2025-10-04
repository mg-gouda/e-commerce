import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Cart } from '../entities/cart.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { CartItem } from '../entities/cart-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product, User, CartItem])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}