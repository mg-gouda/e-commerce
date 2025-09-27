import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController, ReviewsManagementController } from './reviews.controller';
import { Review } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Product, User])],
  controllers: [ReviewsController, ReviewsManagementController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}