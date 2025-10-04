import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Headers,
} from '@nestjs/common';
import { CartService } from './cart.service';
import type { AddToCartDto, UpdateCartItemDto } from './cart.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('cart')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req, @Headers('session-id') sessionId?: string) {
    const userId = req.user?.id;
    return this.cartService.getCart(userId, sessionId);
  }

  @Post()
  addToCart(
    @Body() addToCartDto: AddToCartDto,
    @Request() req,
    @Headers('session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.addToCart(addToCartDto, userId, sessionId);
  }

  @Patch(':itemId')
  updateCartItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Request() req,
    @Headers('session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.updateCartItem(itemId, updateCartItemDto, userId, sessionId);
  }

  @Delete(':itemId')
  removeFromCart(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Request() req,
    @Headers('session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.removeFromCart(itemId, userId, sessionId);
  }

  @Delete()
  clearCart(@Request() req, @Headers('session-id') sessionId?: string) {
    const userId = req.user?.id;
    return this.cartService.clearCart(userId, sessionId);
  }
}