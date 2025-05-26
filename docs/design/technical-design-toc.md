# D&D Encounter Tracker - Technical Design Document

**Version:** 2.0  
**Date:** May 26, 2025  
**Technology Stack:** React 18 + TypeScript, Node.js 22 + Express, MongoDB Atlas
<details open>
  <summary>Table of Contents</summary>

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

## Quick Reference

- **Backend Port:** 3001
- **Frontend Port:** 3000  
- **API Base URL:** `/api/v1`
- **Database:** MongoDB Atlas
- **Primary Framework:** React 18 + Express.js
- **Authentication:** JWT with refresh tokens
- **Real-time:** Socket.IO
- **Payment Processing:** Stripe (primary), PayPal (secondary)