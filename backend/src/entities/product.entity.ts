import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, JoinTable, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { Vendor } from './vendor.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column({ nullable: true })
  vendor_id: string;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  average_rating: number;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  brand: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  length: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  width: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  height: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  video_url: string;

  @Column('simple-json', { nullable: true })
  attributes: Array<{ name: string; value: string }>;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  short_description: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => Category, category => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
  })
  categories: Category[];

  @ManyToOne(() => Vendor, vendor => vendor.products)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;
}