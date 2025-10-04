import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { WishlistItem } from '../entities/wishlist-item.entity';
import { Product } from '../entities/product.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * Get or create wishlist for user
   */
  async getOrCreateWishlist(userId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { user_id: userId },
      relations: ['wishlistItems', 'wishlistItems.product', 'wishlistItems.product.categories'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({ user_id: userId });
      wishlist = await this.wishlistRepository.save(wishlist);
    }

    return wishlist;
  }

  /**
   * Get wishlist with all items
   */
  async getWishlist(userId: string): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);
    return wishlist;
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(userId: string, addToWishlistDto: AddToWishlistDto): Promise<Wishlist> {
    const { product_id } = addToWishlistDto;

    // Verify product exists
    const product = await this.productRepository.findOne({ where: { id: product_id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get or create wishlist
    const wishlist = await this.getOrCreateWishlist(userId);

    // Check if product already in wishlist
    const existingItem = await this.wishlistItemRepository.findOne({
      where: {
        wishlist_id: wishlist.id,
        product_id,
      },
    });

    if (existingItem) {
      throw new ConflictException('Product already in wishlist');
    }

    // Add new item
    const wishlistItem = this.wishlistItemRepository.create({
      wishlist_id: wishlist.id,
      product_id,
    });

    await this.wishlistItemRepository.save(wishlistItem);

    // Return updated wishlist
    return this.getWishlist(userId);
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(userId: string, productId: string): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);

    const wishlistItem = await this.wishlistItemRepository.findOne({
      where: {
        wishlist_id: wishlist.id,
        product_id: productId,
      },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Product not in wishlist');
    }

    await this.wishlistItemRepository.remove(wishlistItem);

    // Return updated wishlist
    return this.getWishlist(userId);
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(userId: string): Promise<void> {
    const wishlist = await this.getOrCreateWishlist(userId);

    await this.wishlistItemRepository.delete({ wishlist_id: wishlist.id });
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user_id: userId },
    });

    if (!wishlist) {
      return false;
    }

    const item = await this.wishlistItemRepository.findOne({
      where: {
        wishlist_id: wishlist.id,
        product_id: productId,
      },
    });

    return !!item;
  }

  /**
   * Get wishlist item count
   */
  async getWishlistCount(userId: string): Promise<number> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user_id: userId },
    });

    if (!wishlist) {
      return 0;
    }

    return this.wishlistItemRepository.count({
      where: { wishlist_id: wishlist.id },
    });
  }
}
