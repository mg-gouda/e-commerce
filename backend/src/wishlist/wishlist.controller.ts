import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user.userId);
  }

  @Get('count')
  async getWishlistCount(@Request() req) {
    const count = await this.wishlistService.getWishlistCount(req.user.userId);
    return { count };
  }

  @Get('check/:productId')
  async checkIfInWishlist(@Request() req, @Param('productId') productId: string) {
    const inWishlist = await this.wishlistService.isInWishlist(req.user.userId, productId);
    return { inWishlist };
  }

  @Post()
  async addToWishlist(@Request() req, @Body() addToWishlistDto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(req.user.userId, addToWishlistDto);
  }

  @Delete(':productId')
  async removeFromWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.userId, productId);
  }

  @Delete()
  async clearWishlist(@Request() req) {
    await this.wishlistService.clearWishlist(req.user.userId);
    return { message: 'Wishlist cleared successfully' };
  }
}
