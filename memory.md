# E-Commerce Platform – Project Memory

## Purpose
This file serves as **persistent memory** for the coding agent. It stores important design decisions, architectural choices, and notes that must be remembered across tasks.

## Key Decisions
- **Backend**: Node.js + TypeScript (NestJS)
- **Frontend**: React + Next.js + Tailwind CSS
- **Database**: PostgreSQL (core), Redis (cache/sessions), Elasticsearch (search)
- **Infrastructure**: Docker + Kubernetes (AWS cloud services)
- **API Strategy**: REST for core services, GraphQL for catalog
- **Payments**: Stripe + PayPal
- **Auth**: JWT + OAuth2
- **Monitoring**: Prometheus, Grafana, ELK

## Naming Conventions
- Backend repo: `ecommerce-backend`
- Frontend repo: `ecommerce-frontend`
- Admin dashboard inside `ecommerce-frontend` (separate route `/admin`)
- Common API endpoint prefix: `/api/v1`

## Notes
- Always design for scalability (horizontal scaling first).
- Use feature-based modular structure in both backend and frontend.
- Security is a priority: enforce HTTPS, JWT validation, and Redis-based rate limiting.
- Elasticsearch is dedicated to product catalog search, not general storage.
- Redis handles:
  - Cart sessions
  - Inventory stock locks
  - Rate limiting
- Postgres handles:
  - Users
  - Orders
  - Payments
- CI/CD must auto-deploy to AWS EKS after tests pass.
- Monitoring and logging must always run in production.
