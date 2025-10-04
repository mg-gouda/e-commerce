import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const existingUsers = await this.userRepository.count();
    const existingCategories = await this.categoryRepository.count();
    const existingProducts = await this.productRepository.count();

    if (existingUsers > 0 || existingCategories > 0 || existingProducts > 0) {
      console.log('📊 Database already has data, skipping seeding');
      return;
    }

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminUser = await this.userRepository.save({
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: adminPasswordHash,
      role: UserRole.ADMIN,
    });
    console.log('👤 Created admin user: admin@example.com / admin123');

    // Create customer user
    const customerPasswordHash = await bcrypt.hash('customer123', 10);
    const customerUser = await this.userRepository.save({
      name: 'John Doe',
      email: 'customer@example.com',
      password_hash: customerPasswordHash,
      role: UserRole.CUSTOMER,
    });
    console.log('👤 Created customer user: customer@example.com / customer123');

    // Create categories
    const electronicsCategory = await this.categoryRepository.save({
      id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Electronics'
    });

    const clothingCategory = await this.categoryRepository.save({
      id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Clothing'
    });

    const homeCategory = await this.categoryRepository.save({
      name: 'Home & Garden'
    });

    const booksCategory = await this.categoryRepository.save({
      name: 'Books'
    });

    console.log('📁 Created categories');

    // Create products
    const products = [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and travelers.',
        price: 129.99,
        stock: 50,
        category_id: electronicsCategory.id,
        average_rating: 4.5,
        image: '/uploads/1759404011360-380132679-4-870x555.webp',
      },
      {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Classic Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt available in multiple colors. Breathable fabric perfect for everyday wear.',
        price: 24.99,
        stock: 150,
        category_id: clothingCategory.id,
        average_rating: 4.2,
        image: '/uploads/1759404012083-683633941-4-Days-Luxor-Aswan-Abu-Simbel-Break-870x555.webp',
      },
      {
        name: 'Smart Watch Pro',
        description: 'Advanced fitness tracking, heart rate monitor, GPS, and smartphone notifications. Water resistant up to 50m.',
        price: 249.99,
        stock: 75,
        category_id: electronicsCategory.id,
        average_rating: 4.7,
      },
      {
        name: 'Designer Jeans',
        description: 'Premium denim jeans with a modern slim fit. Durable and stylish for any occasion.',
        price: 89.99,
        stock: 100,
        category_id: clothingCategory.id,
        average_rating: 4.3,
      },
      {
        name: 'Ceramic Plant Pot Set',
        description: 'Set of 3 elegant ceramic plant pots with drainage holes. Perfect for indoor plants and succulents.',
        price: 34.99,
        stock: 80,
        category_id: homeCategory.id,
        average_rating: 4.6,
      },
      {
        name: 'LED Desk Lamp',
        description: 'Adjustable LED desk lamp with touch controls and USB charging port. Energy efficient and eye-caring.',
        price: 39.99,
        stock: 60,
        category_id: homeCategory.id,
        average_rating: 4.4,
      },
      {
        name: 'The Complete Guide to Programming',
        description: 'Comprehensive programming guide covering modern languages and best practices. Perfect for beginners and intermediates.',
        price: 44.99,
        stock: 200,
        category_id: booksCategory.id,
        average_rating: 4.8,
      },
      {
        name: 'Wireless Gaming Mouse',
        description: 'High-precision gaming mouse with customizable RGB lighting and programmable buttons. 20,000 DPI sensor.',
        price: 79.99,
        stock: 45,
        category_id: electronicsCategory.id,
        average_rating: 4.5,
      },
    ];

    for (const product of products) {
      await this.productRepository.save(product);
    }

    console.log(`📦 Created ${products.length} products`);
    console.log('🌱 Database seeding completed!');
    console.log('');
    console.log('🔐 Test Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Customer: customer@example.com / customer123');
  }
}