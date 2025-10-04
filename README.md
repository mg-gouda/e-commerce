# E-Commerce Platform

A full-stack e-commerce platform built with NestJS and Next.js, featuring product management, shopping cart, orders, payments, media library, and comprehensive admin dashboard.

## 🚀 Features

### Core Features
- **Product Management**: Full CRUD with categories, images, inventory tracking
- **Shopping Cart**: Guest and authenticated user carts with session persistence
- **Orders**: Complete order workflow with status tracking
- **Authentication**: JWT-based auth with password reset functionality
- **Media Library**: Advanced media management with image processing
- **Reviews & Ratings**: Product reviews with rating system
- **Wishlist**: Save products for later
- **Coupons**: Discount codes with validation
- **Loyalty Points**: Reward system for customers
- **Vendor Management**: Multi-vendor support
- **Analytics**: Sales and user analytics dashboard
- **Payment Processing**: Stripe integration ready

### Technical Features
- **TypeScript** throughout for type safety
- **PostgreSQL** database with TypeORM
- **Image Processing** with Sharp (WebP conversion, thumbnails, cropping, resizing)
- **Error Handling** with comprehensive logging
- **API Retry Logic** for resilience
- **CORS** configured for frontend
- **Validation** with class-validator
- **Session Management** for guest users

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd e-commerce
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Database Setup
```bash
# Create database
createdb ecommerce

# Or with Docker
docker run -d \
  --name ecommerce-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ecommerce \
  -p 5432:5432 \
  postgres:15
```

### 4. Environment Configuration

**Backend** (`backend/.env`):
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ecommerce
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
FRONTEND_URL=http://localhost:3001
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 Access

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 📁 Project Structure

```
e-commerce/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── products/       # Products
│   │   ├── cart/           # Shopping cart
│   │   ├── orders/         # Orders
│   │   ├── media/          # Media library
│   │   ├── payments/       # Payment processing
│   │   └── ...
│   ├── uploads/            # Uploaded files
│   └── package.json
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   └── package.json
│
├── PROJECT_STATUS.md      # Current project status
├── API_DOCUMENTATION.md   # API endpoints
├── DEVELOPMENT_GUIDE.md   # Development guide
└── README.md             # This file
```

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run start:dev      # Development with watch
npm run start:debug    # Debug mode
npm run start:prod     # Production
npm run build          # Build
npm run test           # Run tests
npm run lint           # Lint code
```

**Frontend:**
```bash
npm run dev           # Development
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Lint code
```

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Development workflows and best practices
- [Project Status](./PROJECT_STATUS.md) - Current implementation status

## 🔐 Authentication

### Register a new user:
```bash
POST http://localhost:3000/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login:
```bash
POST http://localhost:3000/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes JWT token for authenticated requests.

## 🛒 Quick Start Guide

1. **Browse Products**: Visit http://localhost:3001/products
2. **Add to Cart**: Click "Add to Cart" on any product
3. **View Cart**: Navigate to http://localhost:3001/cart
4. **Checkout**: Complete order from cart
5. **Admin Panel**: Visit http://localhost:3001/admin

## 📦 Production Deployment

### Build
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Run
```bash
# Backend
npm run start:prod

# Frontend
npm start
```

### Environment Variables

Update for production:
- Set strong `JWT_SECRET`
- Configure production database
- Set `NODE_ENV=production`
- Update CORS origins
- Configure proper domains

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend e2e tests
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

### Database Connection
```bash
# Check PostgreSQL is running
pg_isready

# Check credentials in .env
cat backend/.env
```

### Clear Cache
```bash
rm -rf node_modules dist
npm install
npm run build
```

## 🔗 Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT, Passport
- **Validation**: class-validator
- **Image Processing**: Sharp
- **Payments**: Stripe

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React
- **HTTP Client**: Axios
- **Build Tool**: Turbopack

## 📊 Current Status

✅ **Completed:**
- User authentication & authorization
- Product management with categories
- Shopping cart (guest & authenticated)
- Media library with image processing
- Order management
- Payment integration structure
- Coupon system
- Wishlist
- Loyalty points
- Vendor management
- Analytics framework
- Error handling & logging

📋 **Documentation:**
- API documentation complete
- Development guide complete
- Project status tracked

🚀 **Ready for Development:**
- Both servers running
- Database seeded with sample data
- All modules tested and working

## 📞 Support

For issues and questions:
- Check [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- See [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

**Built with ❤️ using NestJS and Next.js**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd e-commerce

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run start:dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.local.example .env.local
# Configure your .env.local file
npm run dev
```

### Access Points
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Admin Panel:** http://localhost:3001/admin
- **Vendor Dashboard:** http://localhost:3001/vendor

## 📚 Documentation

Complete documentation is available in the `/docs` folder:

- **[PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)** - Project vision, current state, and technology stack
- **[REFACTORING_PLAN.md](./docs/REFACTORING_PLAN.md)** - Architecture refactoring strategy (5 phases)
- **[MULTI_VENDOR_SPECIFICATION.md](./docs/MULTI_VENDOR_SPECIFICATION.md)** - Multi-vendor marketplace features

## 🏗️ Tech Stack

### Backend
- **NestJS** - Node.js framework
- **PostgreSQL** - Database
- **TypeORM** - ORM
- **JWT** - Authentication
- **Sharp** - Image processing

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 📁 Project Structure

```
e-commerce/
├── backend/          # NestJS backend
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── products/ # Products module
│   │   ├── users/    # Users module
│   │   ├── vendors/  # Vendors module (coming soon)
│   │   └── ...
│   └── uploads/      # Media storage
├── frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/ # React components
│   │   ├── lib/      # Utilities
│   │   └── hooks/    # Custom hooks
│   └── public/       # Static files
└── docs/            # Documentation
```

## 🎯 Current Status

**Phase 1: Core E-Commerce** ✅ Complete
- User authentication
- Product management
- Shopping cart
- Checkout & orders
- Admin dashboard

**Phase 2: Multi-Vendor & Refactor** 🚧 In Progress
- Architecture refactoring
- Multi-vendor marketplace
- Media library enhancement
- Type safety improvements

## 🤝 Contributing

1. Review the documentation in `/docs`
2. Follow the refactoring plan
3. Maintain type safety (no `any` types)
4. Write tests for new features

## 📝 License

[Add your license here]

## 📧 Contact

- **Project Owner:** Mohamed Gouda
- **Organization:** Alpha Science Egypt

---

**Version:** 2.0.0-alpha
**Last Updated:** October 3, 2025
