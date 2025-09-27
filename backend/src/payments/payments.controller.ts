import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
  RawBody,
  Headers,
} from '@nestjs/common';
import { PaymentsService, CreatePaymentIntentDto } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-payment-intent')
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(createPaymentIntentDto);
  }

  @Post('webhook')
  async handleWebhook(
    @RawBody() body: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key', {
        apiVersion: '2025-08-27.basil',
      });

      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      throw new Error('Invalid signature');
    }

    await this.paymentsService.handleStripeWebhook(event);
    return { received: true };
  }

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