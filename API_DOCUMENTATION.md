# E-Commerce API Documentation

**Base URL:** http://localhost:3000
**Frontend:** http://localhost:3001

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

Guest users use session-id header:
```
session-id: <session-id>
```

### Auth Endpoints

#### POST /auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "access_token": "jwt_token",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### POST /auth/request-password-reset
Request password reset
```json
{
  "email": "john@example.com"
}
```

#### POST /auth/reset-password
Reset password with token
```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

#### GET /auth/profile
Get current user profile (requires auth)

#### PUT /auth/profile
Update user profile (requires auth)
```json
{
  "name": "John Updated",
  "email": "john.new@example.com"
}
```

#### PUT /auth/change-password
Change password (requires auth)
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Categories

#### GET /categories
Get all categories
```json
[
  {
    "id": "uuid",
    "name": "Electronics",
    "created_at": "2025-09-28T02:48:20.341Z",
    "updated_at": "2025-09-28T02:48:20.341Z"
  }
]
```

---

## Products

#### GET /products
Get products with pagination and filters
- Query params:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `category` (string)
  - `minPrice` (number)
  - `maxPrice` (number)
  - `search` (string)
  - `sort` (string: 'price_asc', 'price_desc', 'name_asc', 'name_desc')

#### GET /products/:id
Get single product by ID

#### POST /products
Create product (requires admin auth)
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 50,
  "categoryIds": ["uuid1", "uuid2"],
  "image": "image_url",
  "images": ["url1", "url2"]
}
```

#### PUT /products/:id
Update product (requires admin auth)

#### DELETE /products/:id
Delete product (requires admin auth)

### Product Inventory Management

#### PATCH /products/:id/stock
Update product stock (requires admin auth)
```json
{
  "stock": 100
}
```

#### PATCH /products/:id/stock/adjust
Adjust stock by amount (requires admin auth)
```json
{
  "adjustment": -5
}
```

#### GET /products/inventory/low-stock
Get low stock products (requires admin auth)
- Query params:
  - `threshold` (number, default: 10)

#### GET /products/inventory/out-of-stock
Get out of stock products (requires admin auth)

#### GET /products/inventory/stats
Get inventory statistics (requires admin auth)
```json
{
  "totalProducts": 150,
  "inStock": 140,
  "lowStock": 15,
  "outOfStock": 10,
  "totalValue": 45000.00
}
```

#### PATCH /products/inventory/bulk
Bulk update stock (requires admin auth)
```json
[
  { "id": "uuid1", "stock": 50 },
  { "id": "uuid2", "stock": 75 }
]
```

#### GET /products/:id/stock/check
Check stock availability (public)
- Query params:
  - `quantity` (number, required)
```json
{
  "available": true,
  "productId": "uuid",
  "requestedQuantity": 5
}
```

### Product Recommendations

#### GET /products/recommendations/related/:id
Get related products (same categories)
- Query params:
  - `limit` (number, default: 6)

#### GET /products/recommendations/trending
Get trending products (newest with stock)
- Query params:
  - `limit` (number, default: 10)

#### GET /products/recommendations/featured
Get featured products (highest stock)
- Query params:
  - `limit` (number, default: 8)

#### GET /products/recommendations/new-arrivals
Get new arrival products
- Query params:
  - `limit` (number, default: 12)

#### GET /products/recommendations/same-brand/:id
Get products from same brand
- Query params:
  - `limit` (number, default: 6)

#### GET /products/recommendations/similar-price/:id
Get products with similar price (±30%)
- Query params:
  - `limit` (number, default: 6)

#### GET /products/recommendations/frequently-bought-together/:id
Get frequently bought together products (based on order history)
- Query params:
  - `limit` (number, default: 4)

#### GET /products/recommendations/personalized
Get personalized recommendations (requires auth)
- Query params:
  - `limit` (number, default: 10)

---

## Media

#### GET /media
Get media library with pagination
- Query params:
  - `page` (number, default: 1)
  - `limit` (number, default: 24)
  - `folder` (string)
  - `search` (string)
  - `tags` (string, comma-separated)

Response:
```json
{
  "items": [
    {
      "id": "uuid",
      "filename": "image.webp",
      "original_name": "original.jpg",
      "url": "/uploads/image.webp",
      "thumbnail_url": "/uploads/thumb_image.webp",
      "mime_type": "image/webp",
      "size": 63384,
      "width": 870,
      "height": 555,
      "alt_text": null,
      "caption": null,
      "description": null,
      "tags": [],
      "folder": "products",
      "usage_count": 0,
      "created_at": "2025-10-02T18:47:38.599Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 24,
  "totalPages": 1
}
```

#### GET /media/folders
Get all media folders
```json
[
  "products",
  "uncategorized",
  "test"
]
```

#### GET /media/:id
Get single media item

#### POST /media/upload
Upload media file (multipart/form-data)
- `file` (file)
- `alt_text` (string, optional)
- `caption` (string, optional)
- `description` (string, optional)
- `tags` (string, comma-separated, optional)
- `folder` (string, optional)

#### PUT /media/:id
Update media metadata
```json
{
  "alt_text": "Image description",
  "caption": "Image caption",
  "description": "Detailed description",
  "tags": ["tag1", "tag2"],
  "folder": "products"
}
```

#### DELETE /media/:id
Delete media item

#### POST /media/bulk-delete
Delete multiple media items
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### POST /media/move
Move media items to folder
```json
{
  "ids": ["uuid1", "uuid2"],
  "folder": "new_folder"
}
```

#### POST /media/:id/crop
Crop image
```json
{
  "x": 0,
  "y": 0,
  "width": 500,
  "height": 500
}
```

#### POST /media/:id/resize
Resize image
```json
{
  "width": 800,
  "height": 600
}
```

---

## Cart

#### GET /cart
Get current user's cart (requires auth or session-id)

#### POST /cart/items
Add item to cart
```json
{
  "productId": "uuid",
  "quantity": 2
}
```

#### PUT /cart/items/:id
Update cart item quantity
```json
{
  "quantity": 5
}
```

#### DELETE /cart/items/:id
Remove item from cart

#### DELETE /cart
Clear entire cart

---

## Wishlist

#### GET /wishlist
Get user's wishlist (requires auth)

#### POST /wishlist
Add item to wishlist
```json
{
  "productId": "uuid"
}
```

#### DELETE /wishlist/:productId
Remove item from wishlist

---

## Orders

#### GET /orders
Get user's orders (requires auth)

#### GET /orders/:id
Get order details

#### POST /orders
Create order from cart
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  }
}
```

#### PUT /orders/:id/status
Update order status (requires admin auth)
```json
{
  "status": "shipped"
}
```

---

## Notifications

#### GET /notifications
Get user notifications (requires auth)
- Query params:
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "ORDER_CREATED",
      "title": "Order Placed",
      "message": "Your order has been placed successfully",
      "data": { "orderId": "uuid", "total": 99.99 },
      "is_read": false,
      "link": "/orders/uuid",
      "created_at": "2025-10-04T19:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

#### GET /notifications/unread
Get unread notifications (requires auth)

#### GET /notifications/unread/count
Get unread notification count (requires auth)
```json
{
  "count": 5
}
```

#### PATCH /notifications/:id/read
Mark notification as read (requires auth)

#### PATCH /notifications/read-all
Mark all notifications as read (requires auth)

#### DELETE /notifications/:id
Delete notification (requires auth)

#### DELETE /notifications
Delete all notifications (requires auth)

### Notification Types
- `ORDER_CREATED` - New order placed
- `ORDER_UPDATED` - Order status changed
- `ORDER_SHIPPED` - Order shipped
- `ORDER_DELIVERED` - Order delivered
- `ORDER_CANCELLED` - Order cancelled
- `PAYMENT_SUCCESS` - Payment successful
- `PAYMENT_FAILED` - Payment failed
- `PRODUCT_BACK_IN_STOCK` - Product restocked
- `PRODUCT_LOW_STOCK` - Low stock alert (admin)
- `REVIEW_REPLY` - Reply to review
- `COUPON_EXPIRING` - Coupon expiring soon
- `LOYALTY_POINTS_EARNED` - Loyalty points earned
- `SYSTEM` - System notification

---

## Reviews

#### GET /products/:productId/reviews
Get product reviews

#### POST /reviews
Create review (requires auth)
```json
{
  "productId": "uuid",
  "rating": 5,
  "comment": "Great product!"
}
```

#### PUT /reviews/:id
Update review (requires auth)

#### DELETE /reviews/:id
Delete review (requires auth or admin)

---

## Coupons

#### GET /coupons
Get available coupons

#### GET /coupons/:code
Get coupon by code

#### POST /coupons/validate
Validate coupon
```json
{
  "code": "SAVE10",
  "cartTotal": 100
}
```

#### POST /coupons
Create coupon (requires admin auth)
```json
{
  "code": "SAVE10",
  "type": "percentage",
  "value": 10,
  "minPurchase": 50,
  "maxDiscount": 20,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

---

## Payments

#### POST /payments/create-intent
Create payment intent
```json
{
  "amount": 99.99,
  "orderId": "uuid"
}
```

#### POST /payments/webhook
Stripe webhook handler

---

## Vendors

#### GET /vendors
Get all vendors

#### GET /vendors/:id
Get vendor details

#### POST /vendors
Create vendor (requires admin auth)
```json
{
  "name": "Vendor Name",
  "email": "vendor@example.com",
  "phone": "+1234567890",
  "address": "Vendor Address"
}
```

---

## Loyalty Points

#### GET /loyalty-points
Get user's loyalty points (requires auth)

#### POST /loyalty-points/redeem
Redeem points
```json
{
  "points": 100
}
```

---

## Analytics (Admin Only)

#### GET /analytics/sales
Get sales analytics
- Query params:
  - `startDate` (ISO date)
  - `endDate` (ISO date)
  - `groupBy` ('day', 'week', 'month')

#### GET /analytics/products
Get product analytics

#### GET /analytics/users
Get user analytics

---

## Settings (Admin Only)

#### GET /settings
Get site settings

#### PUT /settings
Update site settings
```json
{
  "siteName": "My Store",
  "siteDescription": "Best online store",
  "contactEmail": "contact@mystore.com",
  "logo": "logo_url",
  "primaryColor": "#3B82F6",
  "currency": "USD"
}
```

---

## Static Files

#### GET /static/:filename
Get uploaded media files
- Example: http://localhost:3000/static/image.webp

---

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error

Validation errors include details:
```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required", "Email must be valid"],
    "password": ["Password must be at least 8 characters"]
  }
}
```
