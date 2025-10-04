# Project Memory & Context

## Key Information to Remember
- User wants progress saved in memory & progress files after any work
- Always start dev servers for both backend & frontend when starting new session
- Backend runs on port 3001 (NestJS with GraphQL)
- Frontend runs on port 3000 (Next.js)

## Project Structure
```
e-commerce/
├── backend/          # NestJS GraphQL API
├── frontend/         # Next.js React app
├── docker-compose.yml # Infrastructure setup
├── PROGRESS.md       # Session progress tracking
└── MEMORY.md         # This file - persistent context
```

## Development Workflow
1. Start Docker services: `docker-compose up -d`
2. Start backend dev: `cd backend && npm run start:dev`
3. Start frontend dev: `cd frontend && npm run dev`

## Important Notes
- Backend uses TypeORM with PostgreSQL
- Redis for caching
- Elasticsearch for search
- Frontend uses Apollo Client for GraphQL
- TailwindCSS for styling

---
*This file maintains context between sessions*