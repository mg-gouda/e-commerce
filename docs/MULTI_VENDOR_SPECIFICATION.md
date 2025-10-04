# Multi-Vendor Marketplace Specification

## Overview

This document defines the complete multi-vendor marketplace functionality that transforms the platform from a single-seller e-commerce site into a full marketplace where multiple vendors can sell their products.

**Target Completion:** Phase 2 (October 2025)
**Priority:** HIGH - Core differentiator for the platform

---

## Table of Contents

1. [Vendor Types & Roles](#vendor-types--roles) vendor types example (individual, Company)
2. [Vendor Registration & Onboarding](#vendor-registration--onboarding) needs approval from an admin
3. [Vendor Dashboard](#vendor-dashboard)
4. [Product Management](#product-management) & bulk product upload
5. [Order & Fulfillment](#order--fulfillment)
6. [Commission & Payouts](#commission--payouts) integrate multi vendor commission
7. [Analytics & Reporting](#analytics--reporting)
8. [Ratings & Reviews](#ratings--reviews)

---

## Vendor Types & Roles

### User Roles Hierarchy

```
Administrator (Super Admin)
    ├── Manage all vendors
    ├── Approve/reject vendor applications
    ├── Set platform commission rates
    ├── Access all analytics
    └── Manage platform settings

Vendor (Merchant/Seller)
    ├── Manage own products
    ├── Process orders
    ├── View own analytics
    ├── Manage store settings
    └── Communicate with customers

Customer (Buyer)
    ├── Browse all vendors' products
    ├── Purchase from multiple vendors
    ├── Review vendors & products
    └── Track orders from multiple vendors
```

### Vendor Status States

| Status | Description | Can Sell? | Dashboard Access? |
|--------|-------------|-----------|-------------------|
| **PENDING** | Application submitted, awaiting admin approval | ❌ | Limited (view only) |
| **APPROVED** | Active vendor, can sell products | ✅ | Full access |
| **SUSPENDED** | Temporarily disabled by admin | ❌ | View only |
| **REJECTED** | Application denied | ❌ | ❌ |
| **BANNED** | Permanently removed | ❌ | ❌ |

---

## Vendor Registration & Onboarding

### Registration Flow

```
1. User creates account (email, password)
    ↓
2. User applies to become vendor
    ├── Shop Name
    ├── Business Type (Individual / Company)
    ├── Business License (if company)
    ├── Tax ID / VAT Number
    ├── Bank Account Information
    ├── Address & Contact Info
    └── Product Categories (intended)
    ↓
3. Admin reviews application
    ├── Verify documents
    ├── Check business legitimacy
    └── Approve or Reject with reason
    ↓
4. Vendor receives notification
    ├── If APPROVED → Access vendor dashboard
    └── If REJECTED → Can reapply after fixing issues
```

### Required Information

#### Basic Information
- **Shop Name** (unique, 3-50 characters)
- **Business Type**: Individual, Sole Proprietorship, LLC, Corporation
- **Description** (100-500 words about the business)
- **Logo** (required, max 2MB, square format)
- **Banner Image** (optional, 1920x400px recommended)

#### Legal & Financial
- **Business License Number** (for companies)
- **Tax ID / VAT Number**
- **Bank Account Details**:
  - Account Holder Name
  - Bank Name
  - Account Number
  - IBAN (for international)
  - SWIFT/BIC Code (for international)

#### Contact Information
- **Primary Contact Person**
- **Phone Number** (verified via SMS)
- **Email** (verified)
- **Business Address**
- **Return Address** (if different)

#### Store Settings
- **Product Categories** (select up to 5 main categories)
- **Shipping Zones** (domestic, international)
- **Return Policy** (30-90 days, conditions)
- **Store Policies** (terms & conditions)

### Database Schema

```typescript
// backend/src/entities/vendor.entity.ts
@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column({ unique: true })
  shop_name: string;

  @Column({ nullable: true })
  shop_slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  banner_url: string;

  @Column({ type: 'enum', enum: BusinessType })
  business_type: BusinessType;

  @Column({ nullable: true })
  business_license: string;

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

  @Column({ type: 'json', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ type: 'simple-array', nullable: true })
  category_ids: string[];

  @Column({ type: 'text', nullable: true })
  return_policy: string;

  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.PENDING })
  status: VendorStatus;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.00 })
  commission_rate: number; // Platform commission %

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sales: number;

  @Column({ default: 0 })
  total_orders: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  review_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.vendor)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Product, product => product.vendor)
  products: Product[];

  @OneToMany(() => VendorPayout, payout => payout.vendor)
  payouts: VendorPayout[];
}
```

---

## Vendor Dashboard

### Dashboard Overview Page

**Key Metrics (Cards)**
- **Today's Sales**: Revenue from orders today
- **Pending Orders**: Orders needing action
- **Total Products**: Active product count
- **Store Rating**: Average rating from customers

**Charts & Graphs**
- **Sales Over Time**: Line chart (last 30 days)
- **Top Products**: Bar chart (by revenue)
- **Order Status**: Pie chart (pending/processing/shipped/delivered)
- **Revenue vs Commission**: Stacked bar chart

**Recent Activity**
- Latest orders (last 10)
- Recent reviews
- Low stock alerts
- Pending tasks

### Navigation Structure

```
Vendor Dashboard
├── Overview (home)
├── Products
│   ├── All Products
│   ├── Add New Product
│   ├── Categories
│   └── Inventory Management
├── Orders
│   ├── All Orders
│   ├── Pending
│   ├── Processing
│   ├── Shipped
│   └── Returns/Refunds
├── Customers
│   ├── Customer List
│   └── Reviews
├── Analytics
│   ├── Sales Report
│   ├── Product Performance
│   ├── Customer Insights
│   └── Traffic Sources
├── Payouts
│   ├── Transaction History
│   ├── Payout Schedule
│   └── Bank Details
├── Store Settings
│   ├── Store Information
│   ├── Shipping Settings
│   ├── Policies
│   └── Branding
└── Support
    ├── Help Center
    └── Contact Admin
```

---

## Product Management

### Vendor Product Lifecycle

```
1. DRAFT → Vendor creates product (saved, not visible)
2. PENDING_REVIEW → Vendor submits for admin review
3. APPROVED → Admin approves, product goes live
4. ACTIVE → Product is publicly visible and purchasable
5. OUT_OF_STOCK → No inventory, hidden from search
6. INACTIVE → Vendor temporarily hides product
7. REJECTED → Admin rejects with reason
```

### Product Ownership Rules

1. **Vendor Association**: Every product MUST have a `vendor_id`
2. **Admin Products**: Platform-owned products have `vendor_id = NULL`
3. **Edit Permissions**: Only vendor can edit their own products
4. **Admin Override**: Admins can edit any product
5. **Deletion**: Vendors can only deactivate, admins can hard delete

### Product Creation Form (Vendor)

**Required Fields:**
- Product Name
- Description (min 50 words)
- Price
- Stock Quantity
- At least 1 category
- At least 1 product image

**Optional but Recommended:**
- SKU (auto-generated if empty)
- Multiple images (up to 10)
- Product video
- Variations (size, color, etc.)
- Weight & dimensions (for shipping)
- Tags

### Inventory Management

**Stock Tracking:**
```typescript
interface InventoryUpdate {
  product_id: string;
  quantity_change: number; // +10 or -5
  reason: 'purchase' | 'restock' | 'return' | 'damage' | 'adjustment';
  notes?: string;
}
```

**Low Stock Alerts:**
- Notify vendor when stock < 10 units
- Configurable threshold per product
- Email + dashboard notification

**Bulk Operations:**
- Import products via CSV
- Export inventory report
- Bulk price update
- Bulk stock adjustment

---

## Order & Fulfillment

### Multi-Vendor Order Splitting

When a customer orders from multiple vendors:

```
Customer Order #12345
├── Sub-Order #12345-A (Vendor A)
│   ├── Product 1 (from Vendor A)
│   └── Product 2 (from Vendor A)
└── Sub-Order #12345-B (Vendor B)
    └── Product 3 (from Vendor B)
```

**Rules:**
1. Each vendor sees only their own sub-order
2. Customer sees complete order with items grouped by vendor
3. Each sub-order has independent tracking
4. Commission calculated per sub-order

### Order Status Flow (Vendor Perspective)

```
NEW → Vendor receives notification
  ↓
PROCESSING → Vendor prepares items
  ↓
READY_TO_SHIP → Items packed, awaiting pickup
  ↓
SHIPPED → Tracking number added, in transit
  ↓
DELIVERED → Customer receives order
  ↓
COMPLETED → Payment released to vendor (minus commission)
```

### Vendor Order Management

**Actions Vendors Can Take:**
- ✅ Mark as Processing
- ✅ Mark as Ready to Ship
- ✅ Add tracking number
- ✅ Mark as Shipped
- ✅ Print packing slip / invoice
- ✅ Communicate with customer (via platform messages)
- ✅ Issue partial refund
- ❌ Cannot cancel after shipped (must request admin)

### Return & Refund Management

**Return Request Flow:**
```
1. Customer initiates return
    ↓
2. Vendor receives return request
    ├── Accept → Customer ships back
    │      ↓
    │   Vendor receives item
    │      ↓
    │   Vendor processes refund
    │      ↓
    │   Commission reversed
    └── Reject → Dispute escalated to admin
```

---

## Commission & Payouts

### Commission Structure

**Platform Commission Models:**

1. **Percentage-Based** (Recommended)
   - Default: 10% of product price
   - Configurable per vendor (5% - 25%)
   - Applied to subtotal (before tax/shipping)

2. **Flat Fee Per Transaction**
   - Fixed amount per order (e.g., $2.00)
   - Good for low-value items

3. **Tiered Commission**
   - 0-100 orders: 15%
   - 101-500 orders: 12%
   - 500+ orders: 10%

**Commission Calculation:**

```typescript
interface CommissionCalculation {
  order_subtotal: number;
  commission_rate: number; // percentage
  commission_amount: number;
  vendor_payout: number;
  platform_fee: number;
}

Example:
Order Subtotal: $100
Commission Rate: 10%
Commission Amount: $10
Vendor Payout: $90
Platform Fee: $10
```

### Payout System

**Payout Schedule Options:**
- **Weekly**: Every Monday for previous week's completed orders
- **Bi-Weekly**: 1st and 15th of month
- **Monthly**: 1st of each month
- **On-Demand**: Vendor requests (min $50, max once per week)

**Payout Entity:**

```typescript
@Entity('vendor_payouts')
export class VendorPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vendor_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_sales: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  commission_deducted: number;

  @Column({ type: 'date' })
  period_start: Date;

  @Column({ type: 'date' })
  period_end: Date;

  @Column({ type: 'enum', enum: PayoutStatus })
  status: PayoutStatus; // PENDING, PROCESSING, COMPLETED, FAILED

  @Column({ nullable: true })
  transaction_id: string; // Bank transfer reference

  @Column({ type: 'json', nullable: true })
  order_ids: string[]; // Orders included in this payout

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @ManyToOne(() => Vendor, vendor => vendor.payouts)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;
}
```

**Payout Process:**
1. System calculates earnings for period
2. Deducts platform commission
3. Creates payout record (PENDING)
4. Admin reviews and approves
5. Payment processed to vendor's bank account
6. Status updated to COMPLETED
7. Vendor receives email notification

---

## Analytics & Reporting

### Vendor Analytics Dashboard

**Sales Metrics:**
- Total Revenue (daily, weekly, monthly, yearly)
- Average Order Value (AOV)
- Number of Orders
- Net Income (after commission)
- Growth rate (vs previous period)

**Product Performance:**
- Top Selling Products (by units sold)
- Top Revenue Products (by revenue)
- Products with most views
- Conversion rate by product
- Inventory turnover rate

**Customer Insights:**
- New vs Returning Customers
- Customer Lifetime Value
- Geographic distribution
- Customer acquisition sources

**Traffic & Conversion:**
- Store Visits
- Product Views
- Add to Cart Rate
- Purchase Conversion Rate
- Cart Abandonment Rate

### Exportable Reports

Vendors can export:
- Sales Report (CSV, Excel, PDF)
- Product Performance Report
- Inventory Report
- Customer List
- Tax Report (for accounting)
- Payout History

---

## Ratings & Reviews

### Vendor Rating System

**Two Types of Reviews:**

1. **Product Reviews** (existing)
   - Customer reviews specific products
   - 1-5 star rating
   - Written review
   - Photos (optional)
   - Verified purchase badge

2. **Vendor Reviews** (new)
   - Customer reviews overall vendor experience
   - Rated on:
     - Product Quality (1-5 stars)
     - Shipping Speed (1-5 stars)
     - Customer Service (1-5 stars)
     - Accuracy of Description (1-5 stars)
   - Overall vendor rating: average of 4 metrics

**Vendor Rating Calculation:**

```typescript
interface VendorRating {
  product_quality: number;    // avg of all ratings
  shipping_speed: number;      // avg of all ratings
  customer_service: number;    // avg of all ratings
  description_accuracy: number; // avg of all ratings
  overall_rating: number;      // average of above 4
  total_reviews: number;
}
```

**Display:**
- Vendor profile page shows overall rating
- Detailed breakdown visible on "Reviews" tab
- Recent reviews shown on vendor storefront

**Review Moderation:**
- Vendors can respond to reviews
- Vendors can report inappropriate reviews
- Admin can hide/delete reviews
- Customers can edit reviews within 30 days

---

## API Endpoints (Multi-Vendor)

### Vendor Management

```
POST   /api/vendors/apply                 - Apply to become vendor
GET    /api/vendors/me                    - Get current vendor profile
PUT    /api/vendors/me                    - Update vendor profile
GET    /api/vendors/:id/public            - Public vendor storefront
GET    /api/vendors/:id/products          - Get vendor's products
POST   /api/admin/vendors/:id/approve     - Admin approves vendor
POST   /api/admin/vendors/:id/reject      - Admin rejects vendor
PUT    /api/admin/vendors/:id/suspend     - Admin suspends vendor
```

### Vendor Products

```
GET    /api/vendor/products               - Get my products
POST   /api/vendor/products               - Create product
PUT    /api/vendor/products/:id           - Update my product
DELETE /api/vendor/products/:id           - Delete my product
GET    /api/vendor/products/:id/analytics - Product analytics
POST   /api/vendor/products/bulk-import   - Bulk import via CSV
```

### Vendor Orders

```
GET    /api/vendor/orders                 - Get my orders
GET    /api/vendor/orders/:id             - Get order details
PUT    /api/vendor/orders/:id/status      - Update order status
POST   /api/vendor/orders/:id/tracking    - Add tracking number
POST   /api/vendor/orders/:id/refund      - Process refund
```

### Vendor Analytics

```
GET    /api/vendor/analytics/sales        - Sales analytics
GET    /api/vendor/analytics/products     - Product performance
GET    /api/vendor/analytics/customers    - Customer insights
GET    /api/vendor/analytics/export       - Export report
```

### Vendor Payouts

```
GET    /api/vendor/payouts                - Get payout history
GET    /api/vendor/payouts/:id            - Get payout details
POST   /api/vendor/payouts/request        - Request on-demand payout
```

---

## Frontend Components

### Vendor Dashboard Layout

```typescript
// frontend/src/app/vendor/layout.tsx
<VendorDashboardLayout>
  <VendorSidebar />
  <div className="main-content">
    <VendorHeader />
    {children}
  </div>
</VendorDashboardLayout>
```

### Key Components to Build

1. **VendorApplicationForm** - Multi-step registration form
2. **VendorDashboard** - Overview with metrics
3. **VendorProductList** - Product management table
4. **VendorOrderList** - Order management with filters
5. **VendorAnalytics** - Charts and graphs
6. **VendorPayoutHistory** - Transaction list
7. **VendorSettings** - Store configuration
8. **VendorStorefront** - Public-facing vendor page
9. **VendorReviews** - Review management

---

## Implementation Priority

### Phase 1: Core Vendor Features (Week 3)
- [ ] Vendor entity and relationships
- [ ] Vendor registration flow
- [ ] Admin approval system
- [ ] Basic vendor dashboard
- [ ] Vendor product association

### Phase 2: Order Management (Week 3-4)
- [ ] Multi-vendor order splitting
- [ ] Vendor order dashboard
- [ ] Order status updates
- [ ] Tracking number integration

### Phase 3: Financial (Week 4)
- [ ] Commission calculation
- [ ] Payout system
- [ ] Payout scheduling
- [ ] Financial reports

### Phase 4: Analytics & Ratings (Week 4-5)
- [ ] Vendor analytics
- [ ] Vendor rating system
- [ ] Review management
- [ ] Performance reports

---

## Success Metrics

**Technical:**
- [ ] Zero data leakage (vendors only see own data)
- [ ] Commission calculations 100% accurate
- [ ] Order splitting works flawlessly
- [ ] Payout system processes correctly

**Business:**
- Target: 50+ vendors by end of Phase 2
- Average vendor rating > 4.0 stars
- Less than 5% dispute rate
- 90%+ vendor satisfaction

---

**Document Version:** 1.0
**Last Updated:** October 3, 2025
**Status:** Specification Complete, Ready for Implementation
