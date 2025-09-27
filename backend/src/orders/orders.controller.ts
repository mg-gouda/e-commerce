import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  Headers,
} from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderStatus } from '../entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req,
    @Headers('session-id') sessionId?: string,
  ) {
    return this.ordersService.createOrder(req.user.id, sessionId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  getMyOrders(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.ordersService.getUserOrders(req.user.id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAllOrders(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    // TODO: Add admin role check
    return this.ordersService.findAll(undefined, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: OrderStatus,
  ) {
    // TODO: Add admin role check
    return this.ordersService.updateOrderStatus(id, status);
  }
}