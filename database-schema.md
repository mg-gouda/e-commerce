# E-Commerce Platform – Database Schema

This document defines the PostgreSQL database schema for the e-commerce platform MVP.  
It includes an ERD diagram and table definitions with relationships.

---

## 📊 ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    USERS {
        uuid id PK
        text name
        text email UK
        text password_hash
        text role
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        uuid id PK
        text name
        text description
        numeric price
        int stock
        uuid category_id FK
        uuid vendor_id FK
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        uuid id PK
        text name
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        uuid id PK
        uuid user_id FK
        text status
        numeric total
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        numeric price
    }

    CARTS {
        uuid id PK
        uuid user_id FK
        timestamp created_at
        timestamp updated_at
    }

    CART_ITEMS {
        uuid id PK
        uuid cart_id FK
        uuid product_id FK
        int quantity
    }

    PAYMENTS {
        uuid id PK
        uuid order_id FK
        text provider
        text status
        numeric amount
        timestamp created_at
    }

    REVIEWS {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        int rating
        text comment
        timestamp created_at
    }

    WISHLISTS {
        uuid id PK
        uuid user_id FK
    }

    WISHLIST_ITEMS {
        uuid id PK
        uuid wishlist_id FK
        uuid product_id FK
    }

    COUPONS {
        uuid id PK
        text code UK
        numeric discount_amount
        text discount_type
        timestamp valid_from
        timestamp valid_to
    }

    LOYALTY_POINTS {
        uuid id PK
        uuid user_id FK
        int points
    }

    PAGES {
        uuid id PK
        text title
        text slug UK
        text content
        timestamp created_at
        timestamp updated_at
    }

    SEO_METADATA {
        uuid id PK
        text resource_type
        uuid resource_id
        text meta_title
        text meta_description
        text meta_keywords
    }

    VENDORS {
        uuid id PK
        uuid user_id FK
        text shop_name
        text status
        timestamp created_at
    }

    USERS ||--o{ ORDERS : places
    USERS ||--o{ CARTS : has
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ WISHLISTS : has
    USERS ||--o{ LOYALTY_POINTS : has
    USERS ||--o{ VENDORS : is_a
    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : included_in
    PRODUCTS ||--o{ CART_ITEMS : added_to
    PRODUCTS ||--o{ REVIEWS : has
    PRODUCTS ||--o{ WISHLIST_ITEMS : in
    VENDORS ||--o{ PRODUCTS : sells
    ORDERS ||--o{ ORDER_ITEMS : contains
    CARTS ||--o{ CART_ITEMS : contains
    ORDERS ||--o{ PAYMENTS : paid_by
    WISHLISTS ||--o{ WISHLIST_ITEMS : contains

Table Definitions
1. users

id UUID (PK)

name TEXT

email TEXT (unique)

password_hash TEXT

role TEXT (enum: customer, admin, vendor)

created_at TIMESTAMP

updated_at TIMESTAMP

2. categories

id UUID (PK)

name TEXT

created_at TIMESTAMP

updated_at TIMESTAMP

3. products

id UUID (PK)

name TEXT

description TEXT

price NUMERIC(10,2)

stock INT

category_id UUID (FK → categories.id)

vendor_id UUID (FK -> vendors.id, nullable)

created_at TIMESTAMP

updated_at TIMESTAMP

4. orders

id UUID (PK)

user_id UUID (FK → users.id)

status TEXT (enum: pending, processing, shipped, delivered, cancelled)

total NUMERIC(10,2)

created_at TIMESTAMP

updated_at TIMESTAMP

5. order_items

id UUID (PK)

order_id UUID (FK → orders.id)

product_id UUID (FK → products.id)

quantity INT

price NUMERIC(10,2)

6. carts

id UUID (PK)

user_id UUID (FK → users.id, nullable for guest session carts)

created_at TIMESTAMP

updated_at TIMESTAMP

7. cart_items

id UUID (PK)

cart_id UUID (FK → carts.id)

product_id UUID (FK → products.id)

quantity INT

8. payments

id UUID (PK)

order_id UUID (FK → orders.id)

provider TEXT (enum: stripe, paypal)

status TEXT (enum: pending, paid, failed)

amount NUMERIC(10,2)

created_at TIMESTAMP

9. reviews
id UUID (PK)
product_id UUID (FK -> products.id)
user_id UUID (FK -> users.id)
rating INT
comment TEXT
created_at TIMESTAMP

10. wishlists
id UUID (PK)
user_id UUID (FK -> users.id)

11. wishlist_items
id UUID (PK)
wishlist_id UUID (FK -> wishlists.id)
product_id UUID (FK -> products.id)

12. coupons
id UUID (PK)
code TEXT (unique)
discount_amount NUMERIC(10,2)
discount_type TEXT (enum: percentage, fixed)
valid_from TIMESTAMP
valid_to TIMESTAMP

13. loyalty_points
id UUID (PK)
user_id UUID (FK -> users.id)
points INT

14. pages
id UUID (PK)
title TEXT
slug TEXT (unique)
content TEXT
created_at TIMESTAMP
updated_at TIMESTAMP

15. seo_metadata
id UUID (PK)
resource_type TEXT (enum: product, page, category)
resource_id UUID
meta_title TEXT
meta_description TEXT
meta_keywords TEXT

16. vendors
id UUID (PK)
user_id UUID (FK -> users.id)
shop_name TEXT
status TEXT (enum: pending, approved, rejected)
created_at TIMESTAMP

✅ Notes

All UUIDs should be generated using uuid_generate_v4().

Timestamps use NOW() by default on insert.

Roles and statuses should use PostgreSQL enums for data integrity.

Carts can be linked to users or used for guests (nullable user_id).


---

Now you have:  
- `project-description.md`  
- `tasks.md`  
- `memory.md`  
- `architecture.md`  
- `mvp-scope.md`  
- `roadmap.md`  
- `user-stories.md`  
- `database-schema.md`  

⚡This is a **complete blueprint** for your coding agent.  

Would you like me to also prepare a **api-design.md** (with REST endpoints for Next.js API routes and FastAPI backend)?
