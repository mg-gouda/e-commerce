import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createReview(
    productId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewsRepository.findOne({
      where: { product: { id: productId }, user: { id: userId } },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    const review = this.reviewsRepository.create({
      ...createReviewDto,
      product,
      user,
    });

    const savedReview = await this.reviewsRepository.save(review);

    // Update product average rating
    await this.updateProductRating(productId);

    return this.findOne(savedReview.id);
  }

  async findProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ reviews: Review[]; total: number; averageRating: number }> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const [reviews, total] = await this.reviewsRepository.findAndCount({
      where: { product: { id: productId } },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
        },
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate average rating
    const averageRating = await this.calculateAverageRating(productId);

    return { reviews, total, averageRating };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
      select: {
        user: {
          id: true,
          name: true,
        },
        product: {
          id: true,
          name: true,
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async updateReview(
    id: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.findOne(id);

    if (review.user.id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    await this.reviewsRepository.update(id, updateReviewDto);

    // Update product average rating if rating changed
    if (updateReviewDto.rating !== undefined) {
      await this.updateProductRating(review.product.id);
    }

    return this.findOne(id);
  }

  async deleteReview(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const review = await this.findOne(id);

    if (!isAdmin && review.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const productId = review.product.id;
    await this.reviewsRepository.remove(review);

    // Update product average rating
    await this.updateProductRating(productId);
  }

  private async calculateAverageRating(productId: string): Promise<number> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.product_id = :productId', { productId })
      .getRawOne();

    return parseFloat(result.avg) || 0;
  }

  private async updateProductRating(productId: string): Promise<void> {
    const averageRating = await this.calculateAverageRating(productId);

    await this.productsRepository.update(productId, {
      average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    } as any);
  }
}