import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(@Query('timeRange') timeRange: string = '7d') {
    console.log(`🔥 Frontend requested /analytics endpoint with timeRange: ${timeRange}`);
    return await this.analyticsService.getAnalyticsData(timeRange);
  }
}