# D&D Encounter Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)

A modern, real-time web application for Dungeon Masters to efficiently manage D&D combat encounters with a comprehensive freemium subscription model.

## 🎯 Overview

The D&D Encounter Tracker revolutionizes tabletop gaming by providing DMs with powerful tools to manage combat encounters seamlessly. Built with modern web technologies, it offers real-time collaboration, intelligent initiative tracking, and comprehensive character/creature management.

### Key Features

- **⚔️ Real-time Combat Tracking** - Live initiative order, HP management, and condition tracking
- **👥 Party Management** - Create and manage multiple adventuring parties with detailed character sheets
- **🐉 Creature Library** - Extensive creature database with templates and custom creature creation
- **🎲 Smart Initiative System** - Automated initiative rolling with Dexterity-based tie-breaking
- **🔄 Real-time Collaboration** - Multiple users can participate in encounters simultaneously
- **☁️ Cloud Synchronization** - Seamless data sync across devices (premium feature)
- **📊 Advanced Analytics** - Combat logs and session analytics (premium feature)
- **🎨 Customizable Themes** - Personalized UI themes and layouts (premium feature)
- **👑 Admin Dashboard** - Comprehensive user and subscription management

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Query for server state
- Socket.IO for real-time features
- Vite for build tooling

**Backend:**
- Node.js 22 with Express.js
- TypeScript throughout
- MongoDB with Mongoose ODM
- Redis for caching and sessions
- Socket.IO for real-time communication
- Stripe for payment processing

**Infrastructure:**
- Vercel (Frontend deployment)
- Railway (Backend deployment)
- MongoDB Atlas (Database)
- AWS S3 (File storage & backups)
- CloudFlare (CDN & Security)

## 💰 Subscription Tiers

| Feature | Free | Seasoned | Expert | Master | Guild |
|---------|------|----------|--------|--------|-------|
| **Price** | $0 | $4.99/mo | $9.99/mo | $19.99/mo | $39.99/mo |
| **Parties** | 1 | 3 | 10 | 25 | Unlimited |
| **Encounters** | 3 | 15 | 50 | 100 | Unlimited |
| **Creatures** | 10 | 50 | 200 | 500 | Unlimited |
| **Max Participants** | 6 | 10 | 20 | 30 | 50 |
| **Cloud Sync** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Advanced Combat Log** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Custom Themes** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Collaborative Mode** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Priority Support** | ❌ | ❌ | ✅ | ✅ | ✅ |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- MongoDB 7.0+
- Redis 7.0+
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/dnd-encounter-tracker.git
   cd dnd-encounter-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development environment**
   ```bash
   # Start all services with Docker Compose
   docker-compose up -d

   # Or start services individually
   npm run dev:backend
   npm run dev:frontend
   ```

5. **Initialize the database**
   ```bash
   npm run db:seed
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/docs

### Production Deployment

See [Deployment Guide](./docs/design/11-deployment-design.md) for detailed production setup instructions.

## 📚 Documentation

### Design Documentation
Comprehensive technical design documentation is available in the [`./docs/design`](./docs/design) directory:

- [**Technical Design Overview**](./docs/design/technical-design-toc.md) - Complete technical specification
- [System Architecture](./docs/design/01-system-architecture.md) - High-level system design
- [Database Design](./docs/design/03-database-design.md) - MongoDB schema and relationships
- [API Specification](./docs/design/04-backend-api-design.md) - RESTful API v1 documentation
- [Security Implementation](./docs/design/10-security-design.md) - Security measures and compliance
- [Performance Optimization](./docs/design/12-performance-design.md) - Scaling and optimization strategies

### API Documentation
- REST API documentation available at `/docs` endpoint
- WebSocket events documented in [Real-time Features](./docs/design/08-realtime-design.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend tests
npm run test:frontend

# Backend tests  
npm run test:backend

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🔧 Development

### Code Quality

- **TypeScript** - Full type safety across the application
- **ESLint & Prettier** - Automated code formatting and linting
- **Husky** - Pre-commit hooks for quality assurance
- **Jest** - Comprehensive testing suite
- **Cypress** - End-to-end testing

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for detailed information.

## 🔐 Security

Security is a top priority. The application implements:

- **Authentication** - JWT-based with refresh tokens
- **Authorization** - Role-based access control with admin overrides
- **Data Encryption** - AES-256 encryption for sensitive data
- **Input Validation** - Comprehensive validation and sanitization
- **Rate Limiting** - API protection against abuse
- **Security Headers** - OWASP recommended security headers
- **Audit Logging** - Comprehensive activity tracking

For security concerns, please email security@mydndtracker.com.

## 📊 Monitoring & Analytics

- **Application Monitoring** - Sentry for error tracking
- **Performance Monitoring** - Custom metrics and alerts
- **Business Analytics** - Subscription and usage analytics
- **Health Checks** - Automated system health monitoring
- **Alerting** - Slack, email, and PagerDuty integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation** - Check the [design docs](./docs/design)
- **Issues** - [GitHub Issues](https://github.com/your-org/dnd-encounter-tracker/issues)
- **Discussions** - [GitHub Discussions](https://github.com/your-org/dnd-encounter-tracker/discussions)
- **Discord** - [Community Discord Server](https://discord.gg/dndtracker)
- **Email** - support@mydndtracker.com

## 🗺️ Roadmap

### Phase 1: MVP (Months 1-3) ✅
- Core encounter tracking functionality
- User authentication and authorization
- Basic subscription system
- Local data storage

### Phase 2: Monetization (Months 4-6) 🔄
- Advanced subscription features
- Payment processing integration
- Cloud synchronization
- Advanced combat logging

### Phase 3: Growth (Months 7-9) 📋
- Real-time collaboration features
- Mobile application development
- Third-party integrations
- Advanced analytics

### Phase 4: Scale (Months 10-12) 🚀
- Enterprise features
- API for third-party developers
- Advanced customization options
- International expansion

## 🙏 Acknowledgments

- **D&D Community** - For inspiration and feedback
- **Open Source Contributors** - For the amazing tools and libraries
- **Beta Testers** - For helping refine the experience
- **Wizards of the Coast** - For creating the amazing D&D universe

---

**Happy Gaming! 🎲**

*Built with ❤️ for Dungeon Masters everywhere*