# Project Structure

## Root Directory Layout

```
dnd-encounter-tracker/
├── frontend/                 # React frontend application
├── backend/                  # Node.js backend API
├── shared/                   # Shared TypeScript types and utilities
├── docs/                     # Documentation and design files
├── scripts/                  # Build and deployment scripts
├── .github/                  # GitHub Actions workflows
├── docker-compose.yml        # Local development environment
├── package.json              # Root package.json for workspace management
├── README.md                 # Project overview and setup instructions
└── .gitignore               # Git ignore rules
```

## Frontend Structure (`/frontend`)

```
frontend/
├── public/                   # Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   │   ├── layout/         # Layout components (header, sidebar, etc.)
│   │   ├── forms/          # Form components
│   │   └── common/         # Common components used across features
│   ├── features/           # Feature-based modules
│   │   ├── auth/           # Authentication components and logic
│   │   ├── parties/        # Party management
│   │   ├── encounters/     # Encounter tracking
│   │   ├── creatures/      # Creature management
│   │   ├── subscription/   # Subscription management
│   │   └── admin/          # Admin-only features
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── useSubscription.ts
│   │   └── useLocalStorage.ts
│   ├── services/           # API service layer
│   │   ├── api.ts          # Base API configuration
│   │   ├── auth.service.ts
│   │   ├── party.service.ts
│   │   ├── encounter.service.ts
│   │   └── subscription.service.ts
│   ├── stores/             # Zustand stores
│   │   ├── authStore.ts
│   │   ├── encounterStore.ts
│   │   ├── partyStore.ts
│   │   └── uiStore.ts
│   ├── utils/              # Utility functions
│   │   ├── dice.ts
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── encounter.ts
│   │   ├── party.ts
│   │   └── user.ts
│   ├── styles/             # Global styles and Tailwind config
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite type definitions
├── .env.example            # Environment variables template
├── .env.local              # Local environment variables (gitignored)
├── package.json            # Frontend dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
└── index.html              # HTML template
```

## Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── party.controller.ts
│   │   ├── encounter.controller.ts
│   │   ├── creature.controller.ts
│   │   ├── subscription.controller.ts
│   │   └── admin.controller.ts
│   ├── routes/             # API route definitions
│   │   ├── v1/             # Version 1 API routes
│   │   │   ├── index.ts    # Route aggregator
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── parties.routes.ts
│   │   │   ├── encounters.routes.ts
│   │   │   ├── creatures.routes.ts
│   │   │   ├── subscriptions.routes.ts
│   │   │   └── admin.routes.ts
│   │   └── index.ts        # Main router
│   ├── services/           # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── party.service.ts
│   │   ├── encounter.service.ts
│   │   ├── creature.service.ts
│   │   ├── subscription.service.ts
│   │   ├── payment.service.ts
│   │   └── email.service.ts
│   ├── repositories/       # Data access layer
│   │   ├── base.repository.ts
│   │   ├── user.repository.ts
│   │   ├── party.repository.ts
│   │   ├── encounter.repository.ts
│   │   ├── creature.repository.ts
│   │   └── subscription.repository.ts
│   ├── models/             # Mongoose models and schemas
│   │   ├── User.model.ts
│   │   ├── Party.model.ts
│   │   ├── Encounter.model.ts
│   │   ├── Creature.model.ts
│   │   ├── SubscriptionTier.model.ts
│   │   ├── PaymentTransaction.model.ts
│   │   └── AdminAction.model.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── subscription.middleware.ts
│   ├── validators/         # Request validation schemas
│   │   ├── auth.validator.ts
│   │   ├── party.validator.ts
│   │   ├── encounter.validator.ts
│   │   └── creature.validator.ts
│   ├── utils/              # Utility functions
│   │   ├── jwt.utils.ts
│   │   ├── password.utils.ts
│   │   ├── email.utils.ts
│   │   ├── subscription.utils.ts
│   │   └── constants.ts
│   ├── types/              # TypeScript interfaces
│   │   ├── express.d.ts    # Express type extensions
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── subscription.types.ts
│   ├── config/             # Configuration files
│   │   ├── database.config.ts
│   │   ├── stripe.config.ts
│   │   ├── email.config.ts
│   │   └── environment.config.ts
│   ├── sockets/            # Socket.IO handlers
│   │   ├── encounter.socket.ts
│   │   ├── party.socket.ts
│   │   └── index.ts
│   ├── jobs/               # Background job processors
│   │   ├── subscription.jobs.ts
│   │   ├── cleanup.jobs.ts
│   │   └── analytics.jobs.ts
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test data
├── scripts/                # Utility scripts
│   ├── seed-database.ts    # Database seeding
│   ├── migrate.ts          # Database migrations
│   └── cleanup.ts          # Cleanup utilities
├── .env.example            # Environment variables template
├── .env.local              # Local environment variables (gitignored)
├── package.json            # Backend dependencies
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Test configuration
└── nodemon.json            # Development server configuration
```

## Shared Structure (`/shared`)

```
shared/
├── types/                  # Shared TypeScript types
│   ├── user.types.ts
│   ├── party.types.ts
│   ├── encounter.types.ts
│   ├── creature.types.ts
│   ├── subscription.types.ts
│   └── api.types.ts
├── utils/                  # Shared utility functions
│   ├── validation.utils.ts
│   ├── formatting.utils.ts
│   └── constants.ts
├── schemas/                # Validation schemas (Zod)
│   ├── user.schema.ts
│   ├── party.schema.ts
│   ├── encounter.schema.ts
│   └── creature.schema.ts
├── package.json            # Shared package dependencies
└── tsconfig.json           # Shared TypeScript configuration
```

## Key Configuration Files

### Root Package.json (Workspace Management)
```json
{
  "name": "dnd-encounter-tracker",
  "private": true,
  "workspaces": ["frontend", "backend", "shared"],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:shared && npm run build:backend && npm run build:frontend",
    "test": "npm run test:backend && npm run test:frontend"
  }
}
```

### Environment Configuration

#### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_ENVIRONMENT=development
```

#### Backend (.env.local)
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/dnd_encounter_tracker
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_SERVICE_API_KEY=your_email_api_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=dnd-tracker-uploads
```

## Build and Deployment Structure

### Docker Support
```
docker-compose.yml          # Local development environment
├── frontend.dockerfile     # Frontend container
├── backend.dockerfile      # Backend container
└── mongodb.dockerfile      # MongoDB container (development only)
```

### CI/CD Pipeline
```
.github/workflows/
├── ci.yml                  # Continuous integration
├── deploy-staging.yml      # Staging deployment
└── deploy-production.yml   # Production deployment
```

This structure provides clear separation of concerns, follows TypeScript best practices, and supports both development and production workflows efficiently.