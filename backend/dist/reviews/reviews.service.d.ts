import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
export declare class ReviewsService {
    private reviewsRepository;
    private productsRepository;
    private usersRepository;
    constructor(reviewsRepository: Repository<Review>, productsRepository: Repository<Product>, usersRepository: Repository<User>);
    createReview(productId: string, userId: string, createReviewDto: CreateReviewDto): Promise<Review>;
    findProductReviews(productId: string, page?: number, limit?: number): Promise<{
        reviews: Review[];
        total: number;
        averageRating: number;
    }>;
    findOne(id: string): Promise<Review>;
    updateReview(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review>;
    deleteReview(id: string, userId: string, isAdmin?: boolean): Promise<void>;
    private calculateAverageRating;
    private updateProductRating;
}
