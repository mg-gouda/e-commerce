import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor, VendorStatus } from '../entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Check if user already has a vendor account
    const existing = await this.vendorRepository.findOne({
      where: { user_id: createVendorDto.user_id },
    });

    if (existing) {
      throw new BadRequestException('User already has a vendor account');
    }

    const vendor = this.vendorRepository.create(createVendorDto);
    return this.vendorRepository.save(vendor);
  }

  async findAll(page: number = 1, limit: number = 20, status?: VendorStatus) {
    const where = status ? { status } : {};

    const [vendors, total] = await this.vendorRepository.findAndCount({
      where,
      relations: ['user', 'products'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      vendors,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: ['user', 'products'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async findByUserId(userId: string): Promise<Vendor | null> {
    return this.vendorRepository.findOne({
      where: { user_id: userId },
      relations: ['products'],
    });
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);
    Object.assign(vendor, updateVendorDto);
    return this.vendorRepository.save(vendor);
  }

  async updateStatus(id: string, status: VendorStatus): Promise<Vendor> {
    const vendor = await this.findOne(id);
    vendor.status = status;
    return this.vendorRepository.save(vendor);
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.findOne(id);
    await this.vendorRepository.remove(vendor);
  }

  async getVendorStats(id: string) {
    const vendor = await this.findOne(id);

    const productCount = vendor.products?.length || 0;
    const activeProducts = vendor.products?.filter(p => p.status === 'active').length || 0;

    return {
      vendor,
      stats: {
        total_products: productCount,
        active_products: activeProducts,
        pending_products: productCount - activeProducts,
      },
    };
  }
}
