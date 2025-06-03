# D&D Encounter Tracker

A comprehensive web application for managing D&D combat encounters with initiative tracking, party management, and creature databases. Built with React, Node.js, and MongoDB with a freemium subscription model.

## Features

### Core Features
- **Initiative Tracking**: Smart sorting by initiative, dexterity, and manual override
- **Party Management**: Create and manage adventuring parties with character details
- **Encounter Management**: Build and run combat encounters with real-time updates
- **Creature Database**: Create custom monsters and NPCs with full stat blocks
- **Real-time Collaboration**: Live updates across multiple devices using Socket.IO

### Subscription Tiers
- **Free Adventurer**: 1 party, 3 encounters, 10 creatures
- **Seasoned Adventurer**: 3 parties, 15 encounters, 50 creatures + cloud sync
- **Expert Dungeon Master**: 10 parties, 50 encounters, 200 creatures + advanced features
- **Master of Dungeons**: 25 parties, 100 encounters, 500 creatures + analytics
- **Guild Master**: Unlimited everything + enterprise features

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for server state
- **Socket.IO Client** for real-time features
- **Vite** for build tooling

### Backend
- **Node.js 22** with TypeScript
- **Express.js** web framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** authentication with refresh tokens
- **Stripe** for subscription management

### Infrastructure
- **MongoDB Atlas** for database hosting
- **Vercel** for frontend deployment
- **Railway/AWS** for backend deployment
- **CloudFlare** for CDN

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dnd-encounter-tracker
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install shared package dependencies
   cd shared && npm install && npm run build && cd ..
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   
   # Install backend dependencies
   cd backend && npm install && cd ..
   ```

3. **Environment Setup**
   
   **Backend** - Copy `.env.example` to `.env` in the backend directory:
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/dnd_encounter_tracker
   JWT_SECRET=your_jwt_secret_here_change_in_production
   JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   CORS_ORIGIN=http://localhost:3000
   ```
   
   **Frontend** - Copy `.env.example` to `.env.local` in the frontend directory:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   
   Edit the `.env.local` file:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api/v1
   VITE_SOCKET_URL=http://localhost:3001
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   ```

4. **Database Setup**
   
   If using local MongoDB:
   ```bash
   # Start MongoDB service
   mongod
   ```
   
   If using MongoDB Atlas, update the `MONGODB_URI` in your backend `.env` file.

5. **Start the development servers**
   
   From the root directory:
   ```bash
   # Start both frontend and backend
   npm run dev
   ```
   
   Or start them individually:
   ```bash
   # Start backend (from root or backend directory)
   npm run start:backend
   
   # Start frontend (from root or frontend directory)  
   npm run start:frontend
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/v1
   - Health Check: http://localhost:3001/health

## Project Structure

```
dnd-encounter-tracker/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature-based modules
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── stores/          # Zustand stores
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── sockets/         # Socket.IO handlers
│   └── package.json
├── shared/                   # Shared TypeScript types
│   ├── src/types/           # Type definitions
│   └── package.json
├── docs/                     # Documentation
└── package.json             # Root workspace configuration
```

## Development

### Available Scripts

**Root level:**
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint frontend code

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run db:seed` - Seed database with sample data

### Authentication

The application uses JWT-based authentication with refresh tokens:

1. Register or login to receive access and refresh tokens
2. Access tokens expire in 15 minutes
3. Refresh tokens expire in 7 days
4. Automatic token refresh on API calls

### Real-time Features

Socket.IO enables real-time collaboration:

- **Encounter Updates**: Live initiative, health, and condition changes
- **Turn Management**: Synchronized turn advancement
- **Chat**: In-encounter messaging
- **Dice Rolling**: Shared dice roll results

### Database

MongoDB collections:
- **users**: User accounts, subscriptions, and usage data
- **parties**: Adventure parties and characters
- **encounters**: Combat encounters and participants
- **creatures**: Monster and NPC stat blocks

## API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Core Endpoints
- `GET /api/v1/parties` - Get user's parties
- `POST /api/v1/parties` - Create new party
- `GET /api/v1/encounters` - Get user's encounters
- `POST /api/v1/encounters` - Create new encounter
- `GET /api/v1/creatures` - Get creatures
- `POST /api/v1/creatures` - Create new creature

### Subscription Endpoints
- `GET /api/v1/subscriptions/plans` - Get available plans
- `POST /api/v1/subscriptions/checkout` - Create Stripe checkout
- `GET /api/v1/subscriptions/usage` - Get usage statistics

## Deployment

### Frontend (Vercel)
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/AWS)
1. Set up database on MongoDB Atlas
2. Configure environment variables
3. Deploy using platform-specific instructions

### Environment Variables
See `.env.example` files in frontend and backend directories for required variables.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check the `/docs` directory
- **Issues**: Report bugs on GitHub Issues
- **Email**: support@dndencountertracker.com (for subscription customers)

## Roadmap

### Phase 1: MVP (Complete)
- ✅ User authentication and registration
- ✅ Basic party and encounter management
- ✅ Subscription system foundation
- ✅ Real-time updates

### Phase 2: Enhanced Features (In Progress)
- 🚧 Complete encounter tracking functionality
- 🚧 Advanced creature database
- 🚧 Stripe integration
- 🚧 Mobile optimization

### Phase 3: Advanced Features (Planned)
- 📋 Campaign management
- 📋 Advanced analytics
- 📋 Third-party integrations
- 📋 Mobile apps

### Phase 4: Enterprise (Future)
- 📋 White-label solutions
- 📋 API for developers
- 📋 Advanced collaboration tools