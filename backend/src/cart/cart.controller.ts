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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
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
    return this.cartService.addToCart(userId, sessionId, addToCartDto);
  }

  @Patch(':itemId')
  updateCartItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Request() req,
    @Headers('session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.updateCartItem(userId, sessionId, itemId, updateCartItemDto);
  }

  @Delete(':itemId')
  removeFromCart(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Request() req,
    @Headers('session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.removeFromCart(userId, sessionId, itemId);
  }

  @Delete()
  clearCart(@Request() req, @Headers('session-id') sessionId?: string) {
    const userId = req.user?.id;
    return this.cartService.clearCart(userId, sessionId);
  }
}