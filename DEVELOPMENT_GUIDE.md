# Development Guide

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Initial Setup

1. **Clone and Install**
```bash
cd e-commerce
npm install  # Install root dependencies (if any)
cd backend && npm install
cd ../frontend && npm install
```

2. **Database Setup**
```bash
# Create database
createdb ecommerce

# Or using psql
psql -U postgres
CREATE DATABASE ecommerce;
\q
```

3. **Environment Variables**

Backend `.env`:
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

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Start Development Servers**

Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000

---

## Project Structure

### Backend (NestJS)
```
backend/
├── src/
│   ├── auth/              # Authentication & authorization
│   ├── users/             # User management
│   ├── products/          # Product CRUD
│   ├── categories/        # Categories
│   ├── cart/              # Shopping cart
│   ├── orders/            # Order management
│   ├── payments/          # Payment processing
│   ├── reviews/           # Product reviews
│   ├── media/             # Media library
│   ├── wishlist/          # User wishlists
│   ├── coupons/           # Discount coupons
│   ├── vendors/           # Vendor management
│   ├── loyalty-points/    # Loyalty program
│   ├── analytics/         # Analytics & reporting
│   ├── settings/          # Site settings
│   ├── entities/          # TypeORM entities
│   ├── common/            # Shared utilities
│   ├── app.module.ts      # Main app module
│   └── main.ts            # Entry point
├── uploads/               # Uploaded media files
├── dist/                  # Compiled output
└── package.json
```

### Frontend (Next.js)
```
frontend/
├── src/
│   ├── app/               # App router pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── products/      # Product pages
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Checkout flow
│   │   └── ...
│   ├── components/        # React components
│   │   ├── admin/         # Admin components
│   │   ├── products/      # Product components
│   │   ├── ui/            # UI components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities
│   │   ├── api.ts         # API client
│   │   ├── session.ts     # Session management
│   │   └── error-logger.ts
│   └── styles/            # Global styles
└── package.json
```

---

## Development Workflow

### Adding a New Feature

1. **Backend Module**
```bash
cd backend
nest g module feature-name
nest g controller feature-name
nest g service feature-name
```

2. **Create Entity**
```typescript
// src/entities/feature.entity.ts
@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: Date;
}
```

3. **Register in AppModule**
```typescript
// src/app.module.ts
imports: [
  TypeOrmModule.forFeature([Feature]),
  FeatureModule,
]
```

4. **Create Frontend Components**
```bash
cd frontend/src/components
mkdir feature-name
```

### Database Migrations

The project uses TypeORM with synchronize: true in development, which auto-updates the schema.

For production, create migrations:
```bash
cd backend
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

### Adding API Endpoints

1. **Define DTO**
```typescript
// src/feature/dto/create-feature.dto.ts
export class CreateFeatureDto {
  @IsString()
  name: string;
}
```

2. **Implement Service**
```typescript
// src/feature/feature.service.ts
@Injectable()
export class FeatureService {
  async create(dto: CreateFeatureDto) {
    return this.featureRepository.save(dto);
  }
}
```

3. **Create Controller**
```typescript
// src/feature/feature.controller.ts
@Controller('features')
export class FeatureController {
  @Post()
  create(@Body() dto: CreateFeatureDto) {
    return this.featureService.create(dto);
  }
}
```

### Frontend API Integration

```typescript
// Call from component
import api from '@/lib/api';

const createFeature = async (data) => {
  const response = await api.post('/features', data);
  return response.data;
};
```

---

## Testing

### Backend Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## Common Tasks

### Database Operations

**View tables:**
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d ecommerce -c "\dt"
```

**View data:**
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d ecommerce -c "SELECT * FROM categories;"
```

**Reset database:**
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d ecommerce -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### File Upload

Media files are stored in `backend/uploads/`:
- Original: `/uploads/filename.webp`
- Thumbnail: `/uploads/thumb_filename.webp`

Access via:
- Direct: http://localhost:3000/static/filename.webp
- API: http://localhost:3000/media/:id

### Authentication

**Get token:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Use token:**
```bash
curl http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Debugging

### Backend Debugging

1. **Enable logging:**
```typescript
// app.module.ts
TypeOrmModule.forRoot({
  logging: true,  // SQL queries
})
```

2. **VS Code launch.json:**
```json
{
  "type": "node",
  "request": "attach",
  "name": "Debug NestJS",
  "port": 9229,
  "restart": true
}
```

Run with debug:
```bash
npm run start:debug
```

### Frontend Debugging

1. **Console logging:**
```typescript
console.log('API Response:', data);
```

2. **React DevTools:** Install browser extension

3. **Network tab:** Monitor API calls

### Common Issues

**Port already in use:**
```bash
# Find process
lsof -i :3000
# Kill process
kill -9 PID
```

**Database connection error:**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check database exists

**CORS errors:**
- Verify FRONTEND_URL in backend `.env`
- Check CORS config in `main.ts`

**TypeScript errors:**
```bash
# Rebuild
npm run build

# Clear cache
rm -rf node_modules dist
npm install
```

---

## Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Environment Variables

Update for production:
- Change JWT_SECRET to strong random string
- Use production database credentials
- Set NODE_ENV=production
- Configure proper CORS origins

### Database Migrations

Before deploying:
```bash
# Generate migrations from entities
npm run typeorm migration:generate -- -n Production

# Run migrations
npm run typeorm migration:run
```

---

## Best Practices

1. **Type Safety:**
   - Always define DTOs for API inputs
   - Use TypeScript strict mode
   - Validate all user inputs

2. **Security:**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Implement rate limiting
   - Sanitize user inputs
   - Use HTTPS in production

3. **Code Quality:**
   - Follow consistent naming
   - Write unit tests
   - Document complex logic
   - Use ESLint/Prettier

4. **Performance:**
   - Index database columns
   - Implement caching (Redis)
   - Optimize images
   - Use pagination
   - Lazy load components

5. **Git Workflow:**
   - Feature branches
   - Meaningful commits
   - Pull request reviews
   - Semantic versioning

---

## Useful Commands

```bash
# Backend
npm run start:dev        # Development
npm run start:debug      # Debug mode
npm run start:prod       # Production
npm run lint             # Lint code
npm run format           # Format code

# Frontend
npm run dev              # Development
npm run build            # Build
npm run start            # Production
npm run lint             # Lint code

# Database
npm run typeorm migration:generate -- -n Name
npm run typeorm migration:run
npm run typeorm migration:revert
npm run typeorm schema:drop
```

---

## Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeORM Docs](https://typeorm.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
