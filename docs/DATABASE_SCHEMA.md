# Database Schema Documentation

**Project:** E-Commerce Multi-Vendor Platform
**Database:** PostgreSQL 15+
**ORM:** TypeORM 0.3.x
**Last Updated:** October 3, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Entities](#core-entities)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Migrations Strategy](#migrations-strategy)

---

## Overview

The database schema consists of **15 core entities** organized around e-commerce functionality with multi-vendor support. The schema is designed to support:

- Multi-vendor marketplace
- User authentication and authorization
- Product catalog with categories
- Shopping cart and orders
- Payments and loyalty programs
- Media asset management
- Site-wide configuration

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │────────▶│   Vendor    │────────▶│   Product   │
│             │  1:1    │             │  1:N    │             │
│  - id       │         │  - id       │         │  - id       │
│  - email    │         │  - user_id  │         │  - name     │
│  - role     │         │  - shop_name│         │  - price    │
└─────────────┘         │  - status   │         │  - stock    │
      │                 └─────────────┘         └─────────────┘
      │ 1:N                                            │
      │                                                │ N:M
      ▼                                                ▼
┌─────────────┐                              ┌─────────────┐
│    Cart     │                              │  Category   │
│             │                              │             │
│  - id       │                              │  - id       │
│  - user_id  │                              │  - name     │
└─────────────┘                              └─────────────┘
      │ 1:N                                        │
      │                                            │ N:M
      ▼                                            ▼
┌─────────────┐         ┌─────────────┐    ┌──────────────┐
│  CartItem   │         │    Order    │    │ProductCategory│
│             │         │             │    │  (join table) │
│  - id       │         │  - id       │    └──────────────┘
│  - cart_id  │         │  - user_id  │
│  - product  │         │  - status   │
└─────────────┘         │  - total    │
                        └─────────────┘
                              │ 1:N
                              ▼
                        ┌─────────────┐
                        │  OrderItem  │
                        │             │
                        │  - id       │
                        │  - order_id │
                        │  - product  │
                        └─────────────┘

┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Payment   │         │    Media    │         │SiteSettings │
│             │         │             │         │             │
│  - id       │         │  - id       │         │  - id       │
│  - order_id │         │  - url      │         │  - key      │
│  - method   │         │  - type     │         │  - value    │
└─────────────┘         └─────────────┘         └─────────────┘

┌─────────────┐         ┌─────────────┐
│   Review    │         │  Wishlist   │
│             │         │             │
│  - id       │         │  - id       │
│  - product  │         │  - user_id  │
│  - rating   │         └─────────────┘
└─────────────┘               │ 1:N
                              ▼
                        ┌─────────────┐
                        │WishlistItem │
                        │             │
                        │  - id       │
                        │  - product  │
                        └─────────────┘
```

---

## Core Entities

### 1. User Entity

**Table:** `users`

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  reset_token: string;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expiry: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Cart, cart => cart.user)
  cart: Cart;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToOne(() => Vendor, vendor => vendor.user)
  vendor: Vendor;

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToOne(() => Wishlist, wishlist => wishlist.user)
  wishlist: Wishlist;

  @OneToMany(() => LoyaltyPoint, point => point.user)
  loyalty_points: LoyaltyPoint[];
}
```

**Enums:**
```typescript
enum UserRole {
  USER = 'user',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}
```

**Indexes:**
- `email` (unique)
- `role`
- `created_at`

---

### 2. Vendor Entity

**Table:** `vendors`

```typescript
@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column({ unique: true })
  shop_name: string;

  @Column({ type: 'text', nullable: true })
  shop_description: string;

  @Column({ nullable: true })
  shop_logo: string;

  @Column({ type: 'enum', enum: BusinessType, default: BusinessType.INDIVIDUAL })
  business_type: BusinessType;

  @Column({ nullable: true })
  business_registration_number: string;

  @Column({ nullable: true })
  tax_id: string;

  @Column({ type: 'json', nullable: true })
  bank_details: {
    account_holder: string;
    bank_name: string;
    account_number: string;
    iban?: string;
    swift?: string;
  };

  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.PENDING })
  status: VendorStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.00 })
  commission_rate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sales: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pending_payout: number;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Product, product => product.vendor)
  products: Product[];
}
```

**Enums:**
```typescript
enum VendorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
  BANNED = 'banned',
}

enum BusinessType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  PARTNERSHIP = 'partnership',
}
```

**Indexes:**
- `user_id` (unique, foreign key)
- `shop_name` (unique)
- `status`
- `created_at`

---

### 3. Product Entity

**Table:** `products`

```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true })
  vendor_id: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ unique: true, nullable: true })
  sku: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'int', default: 0 })
  purchase_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations (Current - Single Category)
  @Column()
  category_id: string;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // TODO Phase 3: Replace with Many-to-Many
  // @ManyToMany(() => Category, category => category.products)
  // @JoinTable({ name: 'product_categories' })
  // categories: Category[];

  @ManyToOne(() => Vendor, vendor => vendor.products)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];

  @OneToMany(() => CartItem, item => item.product)
  cart_items: CartItem[];

  @OneToMany(() => OrderItem, item => item.product)
  order_items: OrderItem[];

  @OneToMany(() => WishlistItem, item => item.product)
  wishlist_items: WishlistItem[];
}
```

**Enums:**
```typescript
enum ProductStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived',
}
```

**Indexes:**
- `vendor_id` (foreign key)
- `category_id` (foreign key)
- `sku` (unique)
- `status`
- `price`
- `created_at`

---

### 4. Category Entity

**Table:** `categories`

```typescript
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  parent_id: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];
}
```

**Indexes:**
- `name` (unique)
- `parent_id` (foreign key)
- `sort_order`

---

### 5. Cart Entity

**Table:** `carts`

```typescript
@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  user_id: string;

  @Column({ nullable: true })
  session_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => CartItem, item => item.cart)
  items: CartItem[];
}
```

**Indexes:**
- `user_id` (unique, foreign key)
- `session_id`

---

### 6. CartItem Entity

**Table:** `cart_items`

```typescript
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cart_id: string;

  @Column()
  product_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Product, product => product.cart_items)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
```

**Indexes:**
- `cart_id` (foreign key)
- `product_id` (foreign key)
- Composite: `(cart_id, product_id)` (unique)

---

### 7. Order Entity

**Table:** `orders`

```typescript
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  vendor_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'text' })
  shipping_address: string;

  @Column({ nullable: true })
  tracking_number: string;

  @Column({ nullable: true })
  parent_order_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];
}
```

**Enums:**
```typescript
enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
```

**Indexes:**
- `user_id` (foreign key)
- `vendor_id` (foreign key)
- `status`
- `parent_order_id` (foreign key, for multi-vendor split orders)
- `created_at`

---

### 8. OrderItem Entity

**Table:** `order_items`

```typescript
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  order_id: string;

  @Column()
  product_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, product => product.order_items)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
```

**Indexes:**
- `order_id` (foreign key)
- `product_id` (foreign key)

---

### 9. Payment Entity

**Table:** `payments`

```typescript
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  order_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
```

**Enums:**
```typescript
enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}
```

**Indexes:**
- `order_id` (foreign key)
- `transaction_id`
- `status`
- `created_at`

---

### 10. Review Entity

**Table:** `reviews`

```typescript
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  product_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Product, product => product.reviews)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, user => user.reviews)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

**Indexes:**
- `product_id` (foreign key)
- `user_id` (foreign key)
- Composite: `(product_id, user_id)` (unique - one review per user per product)
- `rating`
- `created_at`

---

### 11. Wishlist Entity

**Table:** `wishlists`

```typescript
@Entity('wishlists')
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => WishlistItem, item => item.wishlist)
  items: WishlistItem[];
}
```

**Indexes:**
- `user_id` (unique, foreign key)

---

### 12. WishlistItem Entity

**Table:** `wishlist_items`

```typescript
@Entity('wishlist_items')
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  wishlist_id: string;

  @Column()
  product_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Wishlist, wishlist => wishlist.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist: Wishlist;

  @ManyToOne(() => Product, product => product.wishlist_items)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
```

**Indexes:**
- `wishlist_id` (foreign key)
- `product_id` (foreign key)
- Composite: `(wishlist_id, product_id)` (unique)

---

### 13. LoyaltyPoint Entity

**Table:** `loyalty_points`

```typescript
@Entity('loyalty_points')
export class LoyaltyPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'enum', enum: PointType })
  type: PointType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  order_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.loyalty_points)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

**Enums:**
```typescript
enum PointType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
}
```

**Indexes:**
- `user_id` (foreign key)
- `type`
- `created_at`

---

### 14. Media Entity

**Table:** `media`

```typescript
@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  type: MediaType;

  @Column({ nullable: true })
  alt_text: string;

  @Column({ nullable: true })
  caption: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  folder: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @Column({ nullable: true })
  mime_type: string;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Enums:**
```typescript
enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}
```

**Indexes:**
- `type`
- `folder`
- `created_at`

---

### 15. SiteSettings Entity

**Table:** `site_settings`

```typescript
@Entity('site_settings')
export class SiteSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Indexes:**
- `key` (unique)

---

## Relationships

### One-to-One (1:1)
- `User` ↔ `Vendor`
- `User` ↔ `Cart`
- `User` ↔ `Wishlist`

### One-to-Many (1:N)
- `Vendor` → `Product[]`
- `Category` → `Product[]`
- `User` → `Order[]`
- `Order` → `OrderItem[]`
- `Order` → `Payment[]`
- `Product` → `Review[]`
- `Product` → `CartItem[]`
- `Product` → `OrderItem[]`
- `Cart` → `CartItem[]`
- `Wishlist` → `WishlistItem[]`
- `User` → `LoyaltyPoint[]`

### Many-to-Many (N:M)
- **Future (Phase 3):** `Product` ↔ `Category` (via `product_categories` join table)

---

## Indexes

### Performance-Critical Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Vendors
CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_status ON vendors(status);

-- Products
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sku ON products(sku);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Cart Items
CREATE UNIQUE INDEX idx_cart_items_cart_product ON cart_items(cart_id, product_id);

-- Reviews
CREATE UNIQUE INDEX idx_reviews_product_user ON reviews(product_id, user_id);
```

---

## Migrations Strategy

### Current State
- Using TypeORM `synchronize: true` (development only)
- Automatic schema sync on application start

### Phase 3 Migration Plan

1. **Disable synchronize** in production
2. **Generate initial migration** from current schema
3. **Create migrations** for:
   - Many-to-many products-categories
   - Vendor-product relationship enhancement
   - Product-media relationship
4. **Version control** all migrations
5. **Automated rollback** support

**Migration Commands:**
```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

---

## Data Integrity Rules

### Cascading Deletes
- Delete `Cart` → Delete all `CartItem`
- Delete `Order` → Delete all `OrderItem`
- Delete `Wishlist` → Delete all `WishlistItem`

### Soft Deletes (Future)
- `Product` (archive instead of delete)
- `User` (deactivate instead of delete)
- `Vendor` (suspend/ban instead of delete)

---

**Last Updated:** October 3, 2025
**Next Review:** After Phase 3 completion
