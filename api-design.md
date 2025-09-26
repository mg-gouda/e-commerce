# E-Commerce Platform – API Design

This document defines the REST API endpoints for the e-commerce platform.  
The API will be implemented with **FastAPI (backend)**, consumed by **Next.js (frontend)** via API routes.

---

## 🌍 Base URL
- Backend: `https://api.example.com/v1/`
- Frontend (Next.js): `/api/*` (proxy to backend)

---

## 🔑 Authentication & Authorization
- JWT-based authentication
- Roles: `customer`, `admin`
- Public endpoints (no auth): browse products, categories
- Protected endpoints: cart, orders, payments, admin actions

---

## 📚 Endpoints

### 1. **Auth**
- **POST** `/auth/register` – Register new user  
  - Body: `{ name, email, password }`  
  - Response: `{ user, token }`

- **POST** `/auth/login` – Authenticate user  
  - Body: `{ email, password }`  
  - Response: `{ user, token }`

- **POST** `/auth/logout` – Invalidate token  

---

### 2. **Users**
- **GET** `/users/me` – Get current user profile (auth required)  
- **PATCH** `/users/me` – Update profile (name, password)  

- **Admin only**  
  - **GET** `/users` – List all users  
  - **PATCH** `/users/:id` – Update user (role, status)  
  - **DELETE** `/users/:id` – Delete user  

---

### 3. **Categories**
- **GET** `/categories` – List all categories  
- **POST** `/categories` (admin) – Create category  
- **PATCH** `/categories/:id` (admin) – Update category  
- **DELETE** `/categories/:id` (admin) – Delete category  

---

### 4. **Products**
- **GET** `/products` – List products (supports filters: `?search=`, `?category=`, `?price_min=`, `?price_max=`)  
- **GET** `/products/:id` – Get product details  
- **POST** `/products` (admin) – Add new product  
- **PATCH** `/products/:id` (admin) – Update product  
- **DELETE** `/products/:id` (admin) – Remove product  

---

### 5. **Cart**
- **GET** `/cart` – Get current user’s cart  
- **POST** `/cart` – Add product to cart  
  - Body: `{ product_id, quantity }`  
- **PATCH** `/cart/:item_id` – Update cart item quantity  
- **DELETE** `/cart/:item_id` – Remove item from cart  

---

### 6. **Orders**
- **GET** `/orders` – List my orders (customer)  
- **GET** `/orders/:id` – Get order details  
- **POST** `/orders` – Place new order (from cart)  

- **Admin only**  
  - **GET** `/admin/orders` – View all orders  
  - **PATCH** `/admin/orders/:id` – Update order status (`processing`, `shipped`, `delivered`, `cancelled`)  

---

### 7. **Payments**
- **POST** `/payments/checkout` – Create payment session (Stripe / PayPal)  
  - Body: `{ order_id, provider }`  
  - Response: payment URL or client secret  

- **GET** `/payments/status/:id` – Get payment status  
- **Webhook** `/payments/webhook` – Handle provider callback  

---

### 8. **Reviews**
- **GET** `/products/:productId/reviews` – Get reviews for a product
- **POST** `/products/:productId/reviews` – Add a review for a product (customer only)
- **DELETE** `/reviews/:reviewId` – Delete a review (admin or owner)

### 9. **Wishlist**
- **GET** `/wishlist` – Get the current user's wishlist
- **POST** `/wishlist` – Add a product to the wishlist
  - Body: `{ productId }`
- **DELETE** `/wishlist/:productId` – Remove a product from the wishlist

### 10. **Coupons & Loyalty**
- **GET** `/admin/coupons` – List all coupons (admin only)
- **POST** `/admin/coupons` – Create a new coupon (admin only)
- **PATCH** `/admin/coupons/:couponId` – Update a coupon (admin only)
- **DELETE** `/admin/coupons/:couponId` – Delete a coupon (admin only)
- **POST** `/cart/apply-coupon` – Apply a coupon to the cart
  - Body: `{ couponCode }`
- **GET** `/loyalty/points` – Get the current user's loyalty points

### 11. **Pages**
- **GET** `/pages` – List all pages
- **GET** `/pages/:slug` – Get a page by its slug
- **POST** `/admin/pages` – Create a new page (admin only)
- **PATCH** `/admin/pages/:pageId` – Update a page (admin only)
- **DELETE** `/admin/pages/:pageId` – Delete a page (admin only)

### 12. **SEO**
- **GET** `/admin/seo/settings` – Get global SEO settings (admin only)
- **PATCH** `/admin/seo/settings` – Update global SEO settings (admin only)
- **GET** `/admin/seo/metadata` – Get SEO metadata for a specific page or product (admin only)
- **PATCH** `/admin/seo/metadata` – Update SEO metadata for a specific page or product (admin only)

### 13. **Multi-Vendor**
- **POST** `/vendor/register` – Register as a new vendor
- **GET** `/admin/vendors` – List all vendors (admin only)
- **PATCH** `/admin/vendors/:vendorId/approve` – Approve a vendor (admin only)
- **GET** `/vendor/products` – List products for the current vendor
- **POST** `/vendor/products` – Create a new product for the current vendor

### 14. **Analytics**
- **GET** `/admin/analytics/sales` – Get sales analytics (admin only)
- **GET** `/admin/analytics/users` – Get user analytics (admin only)
- **GET** `/admin/analytics/products` – Get product analytics (admin only)

