# E-Commerce Platform – System Architecture

```mermaid
flowchart TD

%% FRONTEND
subgraph Frontend [Frontend: Next.js + React + Tailwind CSS]
    UI[User Interface]
    SEO[Server-Side Rendering (Next.js)]
end

%% BACKEND
subgraph Backend [Backend: NestJS (Node.js + TypeScript)]
    REST[REST API]
    GraphQL[GraphQL API]
    Auth[Auth Service (JWT + OAuth2)]
    Payments[Payment Service (Stripe/PayPal)]
end

%% DATABASES
subgraph DataLayer [Data Layer]
    Postgres[(PostgreSQL: Users, Orders, Payments)]
    Redis[(Redis: Sessions, Cart, Rate Limiting)]
    Elastic[(Elasticsearch: Product Search & Catalog)]
end

%% INFRASTRUCTURE
subgraph Infra [Infrastructure: AWS + Kubernetes]
    EKS[Kubernetes (EKS)]
    S3[(S3: Media Storage)]
    CDN[CloudFront CDN]
    Monitor[Prometheus + Grafana]
    Logs[ELK Stack]
    WAF[AWS WAF + HTTPS]
end

%% CONNECTIONS
UI --> SEO --> REST
UI --> GraphQL

REST --> Postgres
REST --> Redis
REST --> Payments
GraphQL --> Elastic

Auth --> Postgres
Payments --> Postgres

Backend --> EKS
Frontend --> CDN
CDN --> UI
EKS --> {Infra Services}

EKS --> Monitor
EKS --> Logs
EKS --> WAF
S3 --> CDN
