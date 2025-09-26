# E-Commerce Platform – MVP Scope (v1.0)

## 🎯 Objective
Deliver a functional **e-commerce platform** with essential features that allow users to browse products, manage a cart, complete checkout, and process payments securely.  
The MVP should be production-ready, scalable, and provide the foundation for future features.

---

## 👤 User Roles (MVP)
1. **Customer**
   - Browse/search products
   - Add/remove items to cart
   - Checkout & pay
   - View order history
2. **Guest**
   - Browse/search products
   - Add to cart (session-based, stored in Redis)
   - Prompted to register at checkout
3. **Admin**
   - Manage products (add, edit, delete)
   - View/manage orders

---

## ✅ Core Features (Included in MVP)
### 1. Authentication & Accounts
- User registration, login, logout
- Password reset
- JWT-based authentication

### 2. Product Catalog
- Categories & product details
- Search & filtering (via Elasticsearch)
- Pagination for large product sets

### 3. Shopping Cart
- Add/remove/update items
- Cart persistence via Redis
- Guest cart support

### 4. Checkout & Payments
- Shipping address entry
- Payment via **Stripe** + **PayPal**
- Order confirmation & transaction log

### 5. Order Management
- Customers: view order history
- Admin: view & update order status

### 6. Admin Dashboard (basic)
- Product CRUD (Create, Read, Update, Delete)
- Order list view

### 7. Infrastructure & Security
- Deployed on AWS (EKS, RDS, Redis, Elasticsearch, S3, CloudFront)
- HTTPS enforced
- Basic rate limiting (via Redis)
- Logging & monitoring enabled (Prometheus, Grafana, ELK)

---

## ❌ Features NOT in MVP (Future Phases)
- **Loyalty Program & Coupons**: A feature to create and manage discounts and loyalty points.
- **Product Reviews & Ratings**: Functionality for customers to leave reviews and ratings on products.
- **Multi-Vendor Marketplace**: Support for third-party sellers.
- **Advanced Analytics & Dashboards**: Detailed analytics beyond basic sales numbers.
- **AI Recommendations**: AI-powered product suggestions for users.
- **Wishlist & Save-for-Later**: A feature for users to save items they're interested in.
- **Multi-Language & Multi-Currency**: Support for multiple languages and currencies.
- **Mobile App (Cross-Platform)**: A native mobile application for iOS and Android.
- **Pages (CRUD)**: Functionality for admins to create and manage static pages.
- **SEO Tool**: A tool for managing SEO metadata.

---

## 🚀 Success Criteria
- Page load time < 2 seconds (with CDN)  
- Checkout flow from cart → payment → confirmation works end-to-end  
- 99.9% uptime for backend services  
- Secure handling of user & payment data  

---
