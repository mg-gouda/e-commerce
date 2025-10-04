import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { LoyaltyPointsService } from './loyalty-points.service';
import { AddPointsDto } from './dto/add-points.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('loyalty-points')
export class LoyaltyPointsController {
  constructor(private readonly loyaltyPointsService: LoyaltyPointsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-points')
  async getMyPoints(@Request() req) {
    return this.loyaltyPointsService.getUserPoints(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  async getAllUserPoints() {
    const points = await this.loyaltyPointsService.getAllUserPoints();
    return { points };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('add/:userId')
  async addPoints(@Param('userId') userId: string, @Body() addPointsDto: AddPointsDto) {
    return this.loyaltyPointsService.addPoints(userId, addPointsDto.points);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('deduct/:userId')
  async deductPoints(@Param('userId') userId: string, @Body() addPointsDto: AddPointsDto) {
    return this.loyaltyPointsService.deductPoints(userId, addPointsDto.points);
  }
}
