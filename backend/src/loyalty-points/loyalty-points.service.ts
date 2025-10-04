import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyPoint } from '../entities/loyalty-point.entity';

@Injectable()
export class LoyaltyPointsService {
  constructor(
    @InjectRepository(LoyaltyPoint)
    private loyaltyPointRepository: Repository<LoyaltyPoint>,
  ) {}

  async getUserPoints(userId: string): Promise<{ total_points: number }> {
    const loyaltyRecord = await this.loyaltyPointRepository.findOne({
      where: { user_id: userId },
    });

    return {
      total_points: loyaltyRecord?.points || 0,
    };
  }

  async addPoints(userId: string, points: number): Promise<LoyaltyPoint> {
    let loyaltyRecord = await this.loyaltyPointRepository.findOne({
      where: { user_id: userId },
    });

    if (loyaltyRecord) {
      loyaltyRecord.points += points;
    } else {
      loyaltyRecord = this.loyaltyPointRepository.create({
        user_id: userId,
        points,
      });
    }

    return this.loyaltyPointRepository.save(loyaltyRecord);
  }

  async deductPoints(userId: string, points: number): Promise<LoyaltyPoint> {
    const loyaltyRecord = await this.loyaltyPointRepository.findOne({
      where: { user_id: userId },
    });

    if (!loyaltyRecord) {
      throw new NotFoundException('No loyalty points found for this user');
    }

    if (loyaltyRecord.points < points) {
      throw new Error('Insufficient points');
    }

    loyaltyRecord.points -= points;
    return this.loyaltyPointRepository.save(loyaltyRecord);
  }

  async getAllUserPoints(): Promise<Array<{ user: any; points: number }>> {
    const loyaltyRecords = await this.loyaltyPointRepository.find({
      relations: ['user'],
      order: { points: 'DESC' },
    });

    return loyaltyRecords.map((record) => ({
      user: {
        id: record.user.id,
        email: record.user.email,
        full_name: record.user.name,
      },
      points: record.points,
    }));
  }
}
