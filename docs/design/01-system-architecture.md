# System Architecture Overview
<details>
  <summary>Project Design Table of Contents</summary>
  
- [Design Overview](./technical-design-toc.md) - Table of contents and summary
- [System Architecture Overview](./01-system-architecture.md) - High-level system design and component relationships
- [Project Structure](./02-project-structure.md) - Detailed folder organization and file layout
- [Database Design](./03-database-design.md) - MongoDB schema design and relationships
- [Backend API Design](./04-backend-api-design.md) - RESTful API v1 endpoints and specifications
- [Frontend Architecture](./05-frontend-architecture.md) - React component structure and state management
- [Authentication & Authorization](./06-auth-design.md) - JWT implementation and role-based access control
- [Subscription Management](./07-subscription-design.md) - Multi-tier subscription system and billing integration
- [Real-time Features](./08-realtime-design.md) - WebSocket implementation for live encounter tracking
- [Data Persistence Strategy](./09-data-persistence.md) - Cloud sync, offline storage, and backup systems
- [Security Implementation](./10-security-design.md) - Security measures, encryption, and compliance
- [Deployment Architecture](./11-deployment-design.md) - Infrastructure, CI/CD, and monitoring setup
- [Performance Optimization](./12-performance-design.md) - Caching, optimization, and scalability strategies
---
</details>


## High-Level Architecture

The D&D Encounter Tracker follows a modern three-tier architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React 18)    │◄──►│  (Node.js 22)   │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 3001    │    │     Atlas       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Components

### Frontend Layer (`/frontend`)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development and optimized builds
- **Styling:** Tailwind CSS with custom design system
- **State Management:** Zustand for client state, React Query for server state
- **Routing:** React Router v6
- **Real-time:** Socket.IO client

### Backend Layer (`/backend`)
- **Runtime:** Node.js 22 LTS
- **Framework:** Express.js with TypeScript
- **API Version:** v1 (RESTful)
- **Database ODM:** Mongoose
- **Authentication:** Custom JWT implementation with refresh tokens
- **Real-time:** Socket.IO server
- **File Storage:** AWS S3 for user uploads and backups

### Database Layer
- **Primary Database:** MongoDB Atlas with automated scaling
- **Schema Design:** Document-based with embedded relationships
- **Indexing:** Optimized indexes for performance
- **Backup:** Automated daily backups with point-in-time recovery

## External Service Integration

### Payment Processing
- **Primary:** Stripe for subscription billing
- **Secondary:** PayPal for alternative payment methods
- **Webhooks:** Real-time subscription status updates

### Infrastructure Services
- **Hosting:** Vercel (frontend), Railway/AWS (backend)
- **CDN:** CloudFlare for global content delivery
- **Monitoring:** Sentry for error tracking, Uptime Robot for availability
- **Analytics:** Mixpanel for user behavior, Stripe for subscription metrics

## Data Flow Architecture

### Synchronous Data Flow (REST API)
```
Frontend Request → Express Router → Controller → Service → Repository → MongoDB
                                                                           ↓
Frontend Response ← JSON Response ← Business Logic ← Data Validation ← Query Result
```

### Asynchronous Data Flow (Real-time)
```
User Action → Socket.IO Client → Socket.IO Server → Broadcast → Other Connected Clients
```

### Subscription Management Flow
```
User Upgrade → Stripe Webhook → Backend Validation → Database Update → Feature Unlock
```

## Security Architecture

### Authentication Flow
1. User credentials → Backend validation
2. JWT access token (15min) + Refresh token (7 days)
3. Token validation middleware on protected routes
4. Admin flag override for elevated permissions

### Data Protection
- **In Transit:** TLS 1.3 encryption
- **At Rest:** AES-256 encryption for sensitive data
- **Payment Security:** PCI DSS compliance through Stripe
- **GDPR Compliance:** Data export/deletion capabilities

## Scalability Considerations

### Horizontal Scaling
- **Frontend:** Static hosting with global CDN
- **Backend:** Load balancer with multiple Node.js instances
- **Database:** MongoDB sharding for large datasets

### Performance Optimization
- **Caching:** Redis for session storage and frequently accessed data
- **Database:** Indexes, aggregation pipelines, and connection pooling
- **Frontend:** Code splitting, lazy loading, and service worker caching

## Development Environment

### Local Development Stack
```
Frontend (localhost:3000) ↔ Backend (localhost:3001) ↔ MongoDB (localhost:27017)
```

### Environment Configuration
- **Development:** Local MongoDB, test Stripe keys
- **Staging:** MongoDB Atlas, Stripe test mode
- **Production:** MongoDB Atlas, Stripe live mode

## Monitoring & Observability

### Application Monitoring
- **Error Tracking:** Sentry integration across all services
- **Performance:** Custom metrics for API response times
- **Uptime:** Health check endpoints monitored by Uptime Robot

### Business Metrics
- **User Analytics:** Mixpanel for feature usage and conversion tracking
- **Subscription Metrics:** Stripe Dashboard for revenue and churn analysis
- **System Health:** Custom dashboard for technical KPIs