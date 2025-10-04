import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
  // RawBody,
  // Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { PaymentStatus } from '../entities/payment.entity';
// import Stripe from 'stripe'; // Commented out for now

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  getAllPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.paymentsService.getAllPayments(page, limit, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('stats')
  getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Get('bank-transfer-instructions')
  getBankTransferInstructions() {
    return this.paymentsService.getBankTransferInstructions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/confirm-bank-transfer')
  confirmBankTransferPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    return this.paymentsService.confirmBankTransferPayment(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/mark-cod-completed')
  markCodPaymentCompleted(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.markCodPaymentCompleted(id);
  }

  // Commented out Stripe webhook for now
  // @Post('webhook')
  // async handleWebhook(
  //   @RawBody() body: Buffer,
  //   @Headers('stripe-signature') signature: string,
  // ) {
  //   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  //   if (!endpointSecret) {
  //     throw new Error('Stripe webhook secret not configured');
  //   }
  //   let event: Stripe.Event;
  //   try {
  //     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key', {
  //       apiVersion: '2025-08-27.basil',
  //     });
  //     event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  //   } catch (err) {
  //     console.log(`Webhook signature verification failed.`, err.message);
  //     throw new Error('Invalid signature');
  //   }
  //   await this.paymentsService.handleStripeWebhook(event);
  //   return { received: true };
  // }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.getPayment(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  getOrderPayments(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.getOrderPayments(orderId);
  }
}