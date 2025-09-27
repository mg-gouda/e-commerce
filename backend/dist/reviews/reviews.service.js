"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../entities/review.entity");
const product_entity_1 = require("../entities/product.entity");
const user_entity_1 = require("../entities/user.entity");
let ReviewsService = class ReviewsService {
    reviewsRepository;
    productsRepository;
    usersRepository;
    constructor(reviewsRepository, productsRepository, usersRepository) {
        this.reviewsRepository = reviewsRepository;
        this.productsRepository = productsRepository;
        this.usersRepository = usersRepository;
    }
    async createReview(productId, userId, createReviewDto) {
        const product = await this.productsRepository.findOne({ where: { id: productId } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingReview = await this.reviewsRepository.findOne({
            where: { product: { id: productId }, user: { id: userId } },
        });
        if (existingReview) {
            throw new common_1.ForbiddenException('You have already reviewed this product');
        }
        const review = this.reviewsRepository.create({
            ...createReviewDto,
            product,
            user,
        });
        const savedReview = await this.reviewsRepository.save(review);
        await this.updateProductRating(productId);
        return this.findOne(savedReview.id);
    }
    async findProductReviews(productId, page = 1, limit = 10) {
        const product = await this.productsRepository.findOne({ where: { id: productId } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
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
        const averageRating = await this.calculateAverageRating(productId);
        return { reviews, total, averageRating };
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async updateReview(id, userId, updateReviewDto) {
        const review = await this.findOne(id);
        if (review.user.id !== userId) {
            throw new common_1.ForbiddenException('You can only update your own reviews');
        }
        await this.reviewsRepository.update(id, updateReviewDto);
        if (updateReviewDto.rating !== undefined) {
            await this.updateProductRating(review.product.id);
        }
        return this.findOne(id);
    }
    async deleteReview(id, userId, isAdmin = false) {
        const review = await this.findOne(id);
        if (!isAdmin && review.user.id !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        const productId = review.product.id;
        await this.reviewsRepository.remove(review);
        await this.updateProductRating(productId);
    }
    async calculateAverageRating(productId) {
        const result = await this.reviewsRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'avg')
            .where('review.productId = :productId', { productId })
            .getRawOne();
        return parseFloat(result.avg) || 0;
    }
    async updateProductRating(productId) {
        const averageRating = await this.calculateAverageRating(productId);
        await this.productsRepository.update(productId, {
            average_rating: Math.round(averageRating * 10) / 10,
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map