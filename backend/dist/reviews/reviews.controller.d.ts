import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(productId: string, createReviewDto: CreateReviewDto, req: any): Promise<import("../entities").Review>;
    findProductReviews(productId: string, page?: number, limit?: number): Promise<{
        reviews: import("../entities").Review[];
        total: number;
        averageRating: number;
    }>;
}
export declare class ReviewsManagementController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findOne(id: string): Promise<import("../entities").Review>;
    update(id: string, updateReviewDto: UpdateReviewDto, req: any): Promise<import("../entities").Review>;
    remove(id: string, req: any): Promise<void>;
}
