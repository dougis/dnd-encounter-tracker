# Technical Design Document (TDD)
**Project:** D&D Encounter Tracker Web Application  
**Version:** 1.0  
**Date:** May 24, 2025

## 1. System Overview

### 1.1 Architecture Summary
The D&D Encounter Tracker is a full-stack web application built with a React frontend and Node.js backend, following a RESTful API architecture. The system supports a freemium subscription model with multi-tier access controls and real-time combat tracking capabilities.

### 1.2 High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │    │   Node.js API    │    │   MongoDB       │
│   (/frontend)   │◄──►│   (/backend)     │◄──►│   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │
        │                       ▼
        │              ┌──────────────────┐
        │              │   External APIs  │
        │              │   - Stripe       │
        │              │   - Auth0        │
        └──────────────┤   - Email        │
                       └──────────────────┘
```

### 1.3 Project Structure
```
dnd-encounter-tracker/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                  # Node.js API server
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── shared/                   # Shared TypeScript types (optional)
│   └── types/
├── docs/
├── .github/workflows/
└── README.md
```

### 1.3 Technology Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **UI Components**: Headless UI + Custom Components

#### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Testing**: Jest + Supertest

#### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Database**: MongoDB Atlas
- **CDN**: Cloudflare
- **Monitoring**: Sentry

## 2. Frontend Architecture (/frontend)

### 2.1 Project Structure
```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (buttons, inputs)
│   │   ├── encounter/       # Encounter-specific components
│   │   ├── party/           # Party management components
│   │   └── subscription/    # Billing and subscription components
│   ├── pages/               # Page-level components
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state stores
│   ├── services/            # API service functions
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── styles/              # Global styles and Tailwind config
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 2.2 State Management Strategy

#### Global State (Zustand)
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  subscription: Subscription | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateSubscription: (subscription: Subscription) => void;
}

// stores/encounterStore.ts
interface EncounterState {
  currentEncounter: Encounter | null;
  participants: Participant[];
  currentTurn: number;
  round: number;
  combatLog: CombatLogEntry[];
  // Actions
  startCombat: () => void;
  nextTurn: () => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  addLogEntry: (entry: CombatLogEntry) => void;
}
```

#### Server State (React Query)
```typescript
// hooks/useEncounters.ts
export const useEncounters = () => {
  return useQuery({
    queryKey: ['encounters'],
    queryFn: () => encounterService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateEncounter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: encounterService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
    },
  });
};
```

### 2.3 Component Architecture

#### Feature-Based Component Organization
```typescript
// components/encounter/EncounterTracker.tsx
interface EncounterTrackerProps {
  encounterId: string;
}

export const EncounterTracker: React.FC<EncounterTrackerProps> = ({ encounterId }) => {
  const { data: encounter, isLoading } = useEncounter(encounterId);
  const { participants, currentTurn, nextTurn } = useEncounterStore();

  return (
    <div className="encounter-tracker">
      <InitiativeList participants={participants} currentTurn={currentTurn} />
      <CombatActions onNextTurn={nextTurn} />
      <ParticipantDetails />
    </div>
  );
};
```

#### Subscription-Gated Components
```typescript
// components/subscription/FeatureGate.tsx
interface FeatureGateProps {
  feature: keyof UserFeatures;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  fallback, 
  children 
}) => {
  const { user } = useAuth();
  const hasAccess = user?.features[feature];

  if (!hasAccess) {
    return fallback || <UpgradePrompt feature={feature} />;
  }

  return <>{children}</>;
};
```

### 2.4 Routing Strategy
```typescript
// App.tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "parties", element: <PartiesPage /> },
      { path: "encounters", element: <EncountersPage /> },
      { path: "encounters/:id", element: <EncounterDetailPage /> },
      { path: "subscription", element: <SubscriptionPage /> },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
]);
```

## 3. Backend Architecture (/backend)

### 3.1 Project Structure
```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── v1/             # Version 1 controllers
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── partyController.ts
│   │   │   ├── encounterController.ts
│   │   │   └── subscriptionController.ts
│   │   └── index.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── subscription.ts
│   │   └── errorHandler.ts
│   ├── models/              # Mongoose models
│   │   ├── User.ts
│   │   ├── Party.ts
│   │   ├── Encounter.ts
│   │   ├── Creature.ts
│   │   └── index.ts
│   ├── routes/              # API route definitions
│   │   ├── v1/             # Version 1 routes
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── parties.ts
│   │   │   ├── encounters.ts
│   │   │   ├── subscriptions.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── services/            # Business logic
│   │   ├── authService.ts
│   │   ├── encounterService.ts
│   │   ├── subscriptionService.ts
│   │   └── paymentService.ts
│   ├── utils/               # Utility functions
│   ├── validation/          # Request validation schemas
│   │   ├── v1/             # Version 1 validation schemas
│   │   │   ├── authValidation.ts
│   │   │   ├── encounterValidation.ts
│   │   │   └── partyValidation.ts
│   │   └── index.ts
│   ├── config/              # Configuration files
│   │   ├── database.ts
│   │   ├── environment.ts
│   │   └── swagger.ts
│   ├── types/               # TypeScript type definitions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/                   # Test files
│   ├── controllers/
│   ├── services/
│   └── integration/
├── package.json
├── tsconfig.json
├── jest.config.js
└── Dockerfile
```

### 3.2 API Design

#### RESTful Endpoint Structure (v1 API)
```
Base URL: /api/v1

Authentication
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

Users
GET    /api/v1/users/me
PUT    /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/me/usage

Parties
GET    /api/v1/parties
POST   /api/v1/parties
GET    /api/v1/parties/:id
PUT    /api/v1/parties/:id
DELETE /api/v1/parties/:id

Characters
GET    /api/v1/parties/:partyId/characters
POST   /api/v1/parties/:partyId/characters
PUT    /api/v1/characters/:id
DELETE /api/v1/characters/:id

Creatures
GET    /api/v1/creatures
POST   /api/v1/creatures
GET    /api/v1/creatures/:id
PUT    /api/v1/creatures/:id
DELETE /api/v1/creatures/:id

Encounters
GET    /api/v1/encounters
POST   /api/v1/encounters
GET    /api/v1/encounters/:id
PUT    /api/v1/encounters/:id
DELETE /api/v1/encounters/:id
POST   /api/v1/encounters/:id/start
POST   /api/v1/encounters/:id/next-turn
POST   /api/v1/encounters/:id/participants
PUT    /api/v1/encounters/:id/participants/:participantId

Subscriptions
GET    /api/v1/subscriptions/tiers
POST   /api/v1/subscriptions/checkout
POST   /api/v1/subscriptions/webhook
GET    /api/v1/subscriptions/billing-portal
```

#### Request/Response Examples (v1 API)
```typescript
// POST /api/v1/encounters
interface CreateEncounterRequest {
  name: string;
  description?: string;
  participants: {
    type: 'character' | 'creature';
    referenceId: string;
    initiativeRoll?: number;
  }[];
}

interface CreateEncounterResponse {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed';
  participants: Participant[];
  currentTurn: number;
  round: number;
  createdAt: string;
}
```

### 3.3 Controller Implementation (v1)
```typescript
// backend/src/controllers/v1/encounterController.ts
export class EncounterControllerV1 {
  static async createEncounter(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const encounterData = req.body as CreateEncounterRequest;
      
      // Validate subscription limits
      await subscriptionService.validateUsageLimit(userId, 'encounters');
      
      const encounter = await encounterService.create(userId, encounterData);
      
      res.status(201).json({
        success: true,
        data: encounter,
        apiVersion: 'v1',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateParticipant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: encounterId, participantId } = req.params;
      const updates = req.body;
      
      const encounter = await encounterService.updateParticipant(
        encounterId,
        participantId,
        updates
      );
      
      res.json({
        success: true,
        data: encounter,
        apiVersion: 'v1',
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### 3.4 Service Layer
```typescript
// backend/src/services/encounterService.ts
export class EncounterService {
  static async create(userId: string, data: CreateEncounterRequest): Promise<Encounter> {
    // Validate user owns referenced characters/creatures
    await this.validateParticipants(userId, data.participants);
    
    // Create encounter with populated participants
    const encounter = new Encounter({
      userId,
      name: data.name,
      description: data.description,
      participants: await this.buildParticipants(data.participants),
    });
    
    // Sort by initiative if rolls provided
    if (data.participants.some(p => p.initiativeRoll)) {
      encounter.sortInitiative();
    }
    
    await encounter.save();
    await this.incrementUsage(userId, 'encounters');
    
    return encounter.populate('participants.referenceId');
  }

  static async nextTurn(encounterId: string): Promise<Encounter> {
    const encounter = await Encounter.findById(encounterId);
    if (!encounter) throw new NotFoundError('Encounter not found');
    
    // Update legendary actions for current participant
    const currentParticipant = encounter.participants[encounter.currentTurn];
    if (currentParticipant?.legendaryActionsRemaining) {
      currentParticipant.legendaryActionsRemaining = 0;
    }
    
    // Advance turn
    encounter.currentTurn = (encounter.currentTurn + 1) % encounter.participants.length;
    
    // Increment round if back to first participant
    if (encounter.currentTurn === 0) {
      encounter.round += 1;
      this.processRoundEffects(encounter);
    }
    
    // Reset legendary actions for new participant
    const newParticipant = encounter.participants[encounter.currentTurn];
    if (newParticipant?.type === 'creature') {
      const creature = await Creature.findById(newParticipant.referenceId);
      if (creature?.legendaryActionsPerTurn) {
        newParticipant.legendaryActionsRemaining = creature.legendaryActionsPerTurn;
      }
    }
    
    await encounter.save();
    return encounter;
  }
}
```

### 3.5 Middleware Implementation

#### Authentication Middleware
```typescript
// backend/src/middleware/auth.ts
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        apiVersion: 'v1'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        apiVersion: 'v1'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid token',
      apiVersion: 'v1'
    });
  }
};
```

#### Subscription Validation Middleware
```typescript
// backend/src/middleware/subscription.ts
export const requireFeature = (feature: keyof UserFeatures) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    
    if (!user.hasFeature(feature)) {
      return res.status(403).json({
        error: 'Feature not available in your subscription tier',
        feature,
        currentTier: user.subscription.tier,
        apiVersion: 'v1',
      });
    }
    
    next();
  };
};

export const validateUsageLimit = (resourceType: 'parties' | 'encounters' | 'creatures') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    
    if (!user.canCreate(resourceType)) {
      return res.status(403).json({
        error: `${resourceType} limit exceeded`,
        currentUsage: user.usage[`${resourceType}Created`],
        limit: user.features[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`],
        apiVersion: 'v1',
      });
    }
    
    next();
  };
};
```

## 4. Database Design

### 4.1 Connection and Configuration
```typescript
// backend/src/config/database.ts
export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      retryWrites: true,
      w: 'majority',
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Database indexes for performance
export const createIndexes = async (): Promise<void> => {
  await User.createIndexes();
  await Encounter.createIndexes();
  await Party.createIndexes();
  await Creature.createIndexes();
};
```

### 4.2 Model Relationships
```typescript
// backend/src/models/Encounter.ts
const encounterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  participants: [{
    type: {
      type: String,
      enum: ['character', 'creature'],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.type',
    },
    // ... other participant fields
  }],
});

// Virtual populate for flexible references
encounterSchema.virtual('populatedParticipants', {
  ref: (doc: any, virtual: any) => {
    return virtual.parent().type === 'character' ? 'Character' : 'Creature';
  },
  localField: 'participants.referenceId',
  foreignField: '_id',
});
```

## 5. Security Implementation

### 5.1 Authentication Flow
```typescript
// backend/src/services/authService.ts
export class AuthService {
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Validate email uniqueness
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new ConflictError('Email already registered');
    
    // Create user with default free tier
    const user = new User({
      ...userData,
      subscription: { tier: 'free', status: 'active' },
    });
    
    // Initialize feature limits based on tier
    user.updateFeaturesByTier();
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);
    
    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      apiVersion: 'v1',
    };
  }

  static generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    );
    
    return { accessToken, refreshToken };
  }
}
```JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    );
    
    return { accessToken, refreshToken };
  }
}
```

### 5.2 Data Validation
```typescript
// validation/encounterValidation.ts
export const createEncounterSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  participants: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('character', 'creature').required(),
      referenceId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      initiativeRoll: Joi.number().min(1).max(20).optional(),
    })
  ).min(1).max(50).required(),
});

// middleware/validation.ts
export const validateRequest = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message),
      });
    }
    next();
  };
};
```

## 6. API Integration

### 6.1 Stripe Payment Integration
```typescript
// services/paymentService.ts
export class PaymentService {
  private static stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  static async createCheckoutSession(
    userId: string,
    tier: SubscriptionTier,
    billingPeriod: 'monthly' | 'yearly'
  ): Promise<string> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const session = await this.stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [{
        price: tier.stripePriceId[billingPeriod],
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: userId,
        tier: tier.name,
      },
    });

    return session.url!;
  }

  static async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;
    }
  }
}
```

### 6.2 Frontend API Service
```typescript
// services/apiService.ts
class ApiService {
  private baseURL = process.env.REACT_APP_API_URL;
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, response.status);
    }

    return response.json();
  }

  // Encounter methods
  async getEncounters(): Promise<Encounter[]> {
    const response = await this.request<{ data: Encounter[] }>('/api/encounters');
    return response.data;
  }

  async createEncounter(data: CreateEncounterRequest): Promise<Encounter> {
    const response = await this.request<{ data: Encounter }>('/api/encounters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }
}

export const apiService = new ApiService();
```

## 7. Performance Optimization

### 7.1 Database Optimization
```typescript
// Efficient queries with proper indexing
const getEncountersOptimized = async (userId: string, page = 1, limit = 10) => {
  return Encounter.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $sort: { updatedAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $lookup: {
        from: 'characters',
        localField: 'participants.referenceId',
        foreignField: '_id',
        as: 'participantDetails',
      },
    },
  ]);
};
```

### 7.2 Frontend Optimization
```typescript
// Lazy loading and code splitting
const EncounterDetailPage = lazy(() => import('../pages/EncounterDetailPage'));
const SubscriptionPage = lazy(() => import('../pages/SubscriptionPage'));

// Memoized components
const ParticipantCard = memo(({ participant, onUpdate }: ParticipantCardProps) => {
  return (
    <div className="participant-card">
      {/* Component content */}
    </div>
  );
});

// Optimistic updates
const useUpdateParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ encounterId, participantId, updates }) =>
      apiService.updateParticipant(encounterId, participantId, updates),
    onMutate: async ({ encounterId, participantId, updates }) => {
      // Optimistically update the cache
      const previousData = queryClient.getQueryData(['encounter', encounterId]);
      queryClient.setQueryData(['encounter', encounterId], (old: any) => ({
        ...old,
        participants: old.participants.map((p: any) =>
          p.id === participantId ? { ...p, ...updates } : p
        ),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert on error
      queryClient.setQueryData(['encounter', variables.encounterId], context?.previousData);
    },
  });
};
```

## 8. Error Handling

### 8.1 Backend Error Handling
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// middleware/errorHandler.ts
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
```

### 8.2 Frontend Error Handling
```typescript
// hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const handleError = useCallback((error: ApiError) => {
    switch (error.status) {
      case 401:
        // Redirect to login
        window.location.href = '/auth/login';
        break;
      case 403:
        if (error.message.includes('subscription')) {
          // Show upgrade modal
          useSubscriptionStore.getState().showUpgradeModal(error.feature);
        }
        break;
      case 429:
        toast.error('Rate limit exceeded. Please try again later.');
        break;
      default:
        toast.error(error.message || 'An unexpected error occurred');
    }
  }, []);

  return { handleError };
};

// Global error boundary
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
    Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}
```

## 9. Testing Strategy

### 9.1 Backend Testing
```typescript
// tests/controllers/encounter.test.ts
describe('EncounterController', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Encounter.deleteMany({});
  });

  describe('POST /api/encounters', () => {
    it('should create encounter for premium user', async () => {
      const user = await createTestUser({ tier: 'premium' });
      const token = generateTestToken(user._id);

      const response = await request(app)
        .post('/api/encounters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Encounter',
          participants: [
            { type: 'character', referenceId: testCharacterId },
          ],
        })
        .expect(201);

      expect(response.body.data.name).toBe('Test Encounter');
    });

    it('should reject creation when limit exceeded', async () => {
      const user = await createTestUser({ tier: 'free', encountersCreated: 3 });
      const token = generateTestToken(user._id);

      await request(app)
        .post('/api/encounters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', participants: [] })
        .expect(403);
    });
  });
});
```

### 9.2 Frontend Testing
```typescript
// components/EncounterTracker.test.tsx
describe('EncounterTracker', () => {
  const mockEncounter = createMockEncounter();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initiative list correctly', () => {
    render(
      <QueryClient>
        <EncounterTracker encounterId="test-id" />
      </QueryClient>
    );

    expect(screen.getByText('Initiative Order')).toBeInTheDocument();
    expect(screen.getByText(mockEncounter.participants[0].name)).toBeInTheDocument();
  });

  it('advances turn when next button clicked', async () => {
    const mockNextTurn = jest.fn();
    useEncounterStore.mockReturnValue({
      currentTurn: 0,
      nextTurn: mockNextTurn,
      participants: mockEncounter.participants,
    });

    render(<EncounterTracker encounterId="test-id" />);
    
    fireEvent.click(screen.getByText('Next Turn'));
    expect(mockNextTurn).toHaveBeenCalled();
  });
});
```

## 10. Deployment Strategy

### 10.1 Environment Configuration
```typescript
// config/environment.ts
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  redis: {
    url: process.env.REDIS_URL,
  },
};
```

### 10.2 Docker Configuration
```dockerfile
# Dockerfile (Backend)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 10.3 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railwayapp/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 11. Real-time Features

### 11.1 WebSocket Implementation (Optional Enhancement)
```typescript
// server/websocket.ts
import { Server as SocketIOServer } from 'socket.io';
import { authenticateSocketToken } from '../middleware/socketAuth';

export const initializeWebSocket = (server: any) => {
  const io = new SocketIOServer(server, {
    cors: { origin: process.env.CORS_ORIGIN },
  });

  io.use(authenticateSocketToken);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    // Join encounter room
    socket.on('join-encounter', async (encounterId: string) => {
      try {
        const encounter = await Encounter.findOne({
          _id: encounterId,
          $or: [
            { userId: socket.data.userId },
            { 'collaborators.userId': socket.data.userId }
          ]
        });

        if (!encounter) {
          socket.emit('error', { message: 'Encounter not found or access denied' });
          return;
        }

        socket.join(`encounter-${encounterId}`);
        socket.emit('encounter-joined', { encounterId });

        // Update session with socket ID
        await Session.findOneAndUpdate(
          { userId: socket.data.userId, encounterId },
          { socketId: socket.id, lastActivity: new Date() },
          { upsert: true }
        );
      } catch (error) {
        socket.emit('error', { message: 'Failed to join encounter' });
      }
    });

    // Handle participant updates
    socket.on('update-participant', async (data) => {
      try {
        const { encounterId, participantId, updates } = data;
        
        const encounter = await encounterService.updateParticipant(
          encounterId, 
          participantId, 
          updates
        );

        // Broadcast to all users in the encounter
        io.to(`encounter-${encounterId}`).emit('participant-updated', {
          participantId,
          updates,
          encounter: encounter.toJSON(),
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update participant' });
      }
    });

    // Handle turn advancement
    socket.on('next-turn', async (encounterId: string) => {
      try {
        const encounter = await encounterService.nextTurn(encounterId);
        
        io.to(`encounter-${encounterId}`).emit('turn-advanced', {
          currentTurn: encounter.currentTurn,
          round: encounter.round,
          encounter: encounter.toJSON(),
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to advance turn' });
      }
    });

    socket.on('disconnect', async () => {
      // Clean up session
      await Session.findOneAndUpdate(
        { socketId: socket.id },
        { $unset: { socketId: 1 }, lastActivity: new Date() }
      );
    });
  });

  return io;
};
```

### 11.2 Frontend WebSocket Integration
```typescript
// hooks/useWebSocket.ts
export const useWebSocket = (encounterId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !encounterId) return;

    const newSocket = io(process.env.REACT_APP_WS_URL!, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      newSocket.emit('join-encounter', encounterId);
    });

    newSocket.on('participant-updated', ({ participantId, updates }) => {
      // Update local cache optimistically
      queryClient.setQueryData(['encounter', encounterId], (old: any) => ({
        ...old,
        participants: old.participants.map((p: any) =>
          p.id === participantId ? { ...p, ...updates } : p
        ),
      }));
    });

    newSocket.on('turn-advanced', ({ currentTurn, round }) => {
      queryClient.setQueryData(['encounter', encounterId], (old: any) => ({
        ...old,
        currentTurn,
        round,
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, encounterId, queryClient]);

  return socket;
};
```

## 12. Monitoring and Analytics

### 12.1 Application Monitoring
```typescript
// middleware/monitoring.ts
import { Request, Response, NextFunction } from 'express';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;
    
    // Log performance metrics
    console.log({
      method: req.method,
      route,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    // Send to monitoring service (e.g., DataDog, New Relic)
    if (process.env.NODE_ENV === 'production') {
      // metrics.increment('api.requests', 1, [
      //   `method:${req.method}`,
      //   `route:${route}`,
      //   `status:${res.statusCode}`,
      // ]);
      // metrics.histogram('api.response_time', duration, [
      //   `route:${route}`,
      // ]);
    }
  });

  next();
};
```

### 12.2 User Analytics
```typescript
// services/analyticsService.ts
export class AnalyticsService {
  static async trackUserAction(
    userId: string,
    action: string,
    properties: Record<string, any> = {}
  ) {
    try {
      const event = {
        userId,
        action,
        properties: {
          ...properties,
          timestamp: new Date(),
          platform: 'web',
        },
      };

      // Send to analytics service (Mixpanel, Amplitude, etc.)
      if (process.env.MIXPANEL_TOKEN) {
        // await mixpanel.track(action, event);
      }

      // Store in database for internal analytics
      await UserAnalytics.create(event);
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  static async trackSubscriptionEvent(
    userId: string,
    event: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate',
    fromTier?: string,
    toTier?: string
  ) {
    await this.trackUserAction(userId, `subscription_${event}`, {
      fromTier,
      toTier,
      revenue: await this.calculateRevenueImpact(fromTier, toTier),
    });
  }

  static async generateUsageReport(userId: string): Promise<UsageReport> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const [parties, encounters, creatures, sessions] = await Promise.all([
      Party.countDocuments({ userId }),
      Encounter.countDocuments({ userId }),
      Creature.countDocuments({ userId }),
      Session.countDocuments({ 
        userId, 
        createdAt: { $gte: startOfMonth(new Date()) }
      }),
    ]);

    return {
      currentUsage: {
        parties,
        encounters,
        creatures,
        sessionsThisMonth: sessions,
      },
      limits: {
        parties: user.features.maxParties,
        encounters: user.features.maxEncounters,
        creatures: user.features.maxCreatures,
      },
      utilizationRates: {
        parties: user.features.maxParties === -1 ? 0 : parties / user.features.maxParties,
        encounters: user.features.maxEncounters === -1 ? 0 : encounters / user.features.maxEncounters,
        creatures: user.features.maxCreatures === -1 ? 0 : creatures / user.features.maxCreatures,
      },
    };
  }
}
```

## 13. Data Migration and Versioning

### 13.1 Database Migrations
```typescript
// migrations/001_add_subscription_fields.ts
export const migration001 = {
  async up() {
    // Add subscription fields to existing users
    await User.updateMany(
      { subscription: { $exists: false } },
      {
        $set: {
          subscription: {
            tier: 'free',
            status: 'active',
            startDate: new Date(),
          },
          usage: {
            partiesCreated: 0,
            encountersCreated: 0,
            creaturesCreated: 0,
            sessionsThisMonth: 0,
            storageUsedMB: 0,
            lastUsageReset: new Date(),
          },
          features: {
            maxParties: 1,
            maxEncounters: 3,
            maxCreatures: 10,
            maxParticipantsPerEncounter: 6,
            cloudSync: false,
            advancedCombatLog: false,
            customThemes: false,
            exportFeatures: false,
            prioritySupport: false,
            betaAccess: false,
            collaborativeMode: false,
            automatedBackups: false,
          },
        },
      }
    );

    console.log('Migration 001 completed: Added subscription fields');
  },

  async down() {
    await User.updateMany(
      {},
      {
        $unset: {
          subscription: 1,
          usage: 1,
          features: 1,
        },
      }
    );
  },
};

// utils/migrationRunner.ts
export class MigrationRunner {
  static async runMigrations() {
    const migrations = [migration001];
    
    for (const migration of migrations) {
      try {
        await migration.up();
      } catch (error) {
        console.error('Migration failed:', error);
        throw error;
      }
    }
  }
}
```

### 13.2 API Versioning
```typescript
// routes/v1/index.ts
import express from 'express';
import { encounterRoutes } from './encounters';
import { partyRoutes } from './parties';
import { subscriptionRoutes } from './subscriptions';

const router = express.Router();

router.use('/encounters', encounterRoutes);
router.use('/parties', partyRoutes);
router.use('/subscriptions', subscriptionRoutes);

export { router as v1Routes };

// app.ts
app.use('/api/v1', v1Routes);

// Future version support
// app.use('/api/v2', v2Routes);
```

## 14. Backup and Disaster Recovery

### 14.1 Data Backup Strategy
```typescript
// services/backupService.ts
export class BackupService {
  static async createUserBackup(userId: string): Promise<string> {
    try {
      const [user, parties, encounters, creatures] = await Promise.all([
        User.findById(userId).select('-passwordHash'),
        Party.find({ userId }),
        Encounter.find({ userId }),
        Creature.find({ userId }),
      ]);

      const backup = {
        version: '1.0',
        timestamp: new Date(),
        user: user?.toJSON(),
        parties: parties.map(p => p.toJSON()),
        encounters: encounters.map(e => e.toJSON()),
        creatures: creatures.map(c => c.toJSON()),
      };

      // Upload to S3 or similar storage
      const backupKey = `backups/${userId}/${Date.now()}.json`;
      await this.uploadToStorage(backupKey, JSON.stringify(backup));

      return backupKey;
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw new Error('Failed to create backup');
    }
  }

  static async restoreUserData(userId: string, backupKey: string): Promise<void> {
    try {
      const backupData = await this.downloadFromStorage(backupKey);
      const backup = JSON.parse(backupData);

      // Validate backup format
      if (backup.version !== '1.0') {
        throw new Error('Unsupported backup version');
      }

      // Begin transaction
      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        // Clear existing data
        await Promise.all([
          Party.deleteMany({ userId }, { session }),
          Encounter.deleteMany({ userId }, { session }),
          Creature.deleteMany({ userId }, { session }),
        ]);

        // Restore data
        if (backup.parties.length > 0) {
          await Party.insertMany(backup.parties, { session });
        }
        if (backup.encounters.length > 0) {
          await Encounter.insertMany(backup.encounters, { session });
        }
        if (backup.creatures.length > 0) {
          await Creature.insertMany(backup.creatures, { session });
        }
      });

      await session.endSession();
    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error('Failed to restore data');
    }
  }
}
```

## 15. Performance Benchmarks and Optimization

### 15.1 Database Query Optimization
```typescript
// Optimized queries for large datasets
export class OptimizedQueries {
  // Paginated encounters with aggregation
  static async getEncountersPaginated(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters: EncounterFilters = {}
  ) {
    const skip = (page - 1) * limit;
    
    const pipeline: any[] = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    ];

    // Add filters
    if (filters.status) {
      pipeline.push({ $match: { status: filters.status } });
    }

    if (filters.search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
          ],
        },
      });
    }

    // Add sorting, pagination, and participant count
    pipeline.push(
      { $sort: { updatedAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $addFields: {
                participantCount: { $size: '$participants' },
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      }
    );

    const result = await Encounter.aggregate(pipeline);
    const data = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return {
      encounters: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Efficient participant lookup with minimal data
  static async getEncounterParticipants(encounterId: string) {
    return Encounter.findById(encounterId)
      .select('participants currentTurn round')
      .populate({
        path: 'participants.referenceId',
        select: 'name ac maxHP dexterity classes race',
      })
      .lean(); // Returns plain JavaScript objects for better performance
  }
}
```

### 15.2 Caching Strategy
```typescript
// services/cacheService.ts
import Redis from 'ioredis';

export class CacheService {
  private static redis = new Redis(process.env.REDIS_URL);

  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Cache encounter data with smart invalidation
  static async cacheEncounter(encounterId: string, data: any): Promise<void> {
    await this.set(`encounter:${encounterId}`, data, 600); // 10 minutes
  }

  static async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidate(`user:${userId}:*`);
    await this.invalidate(`encounters:${userId}:*`);
  }
}

// Cached controller methods
export class CachedEncounterController {
  static async getEncounter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Try cache first
      const cached = await CacheService.get(`encounter:${id}`);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }

      // Fetch from database
      const encounter = await Encounter.findById(id)
        .populate('participants.referenceId');
      
      if (!encounter) {
        throw new NotFoundError('Encounter not found');
      }

      // Cache the result
      await CacheService.cacheEncounter(id, encounter);

      res.json({ success: true, data: encounter });
    } catch (error) {
      next(error);
    }
  }
}
```

## 16. Security Best Practices

### 16.1 Rate Limiting
```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit auth attempts
  skipSuccessfulRequests: true,
});

export const subscriptionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit subscription operations
});
```

### 16.2 Input Sanitization
```typescript
// middleware/sanitization.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize string fields
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [] });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  req.body = sanitizeObject(req.body);
  next();
};
```

This comprehensive Technical Design Document provides a complete blueprint for implementing the D&D Encounter Tracker with React frontend and Node.js backend. It covers all aspects from architecture and database design to security, performance optimization, and deployment strategies.

Key highlights:
- **Scalable Architecture**: Modular design with clear separation of concerns
- **Subscription Management**: Complete freemium implementation with feature gating
- **Performance Optimization**: Caching, query optimization, and real-time features
- **Security**: Authentication, authorization, rate limiting, and input sanitization
- **Monitoring**: Analytics, error tracking, and performance monitoring
- **Deployment**: CI/CD pipeline with automated testing and deployment

The document serves as a complete technical reference for development teams to implement a production-ready D&D encounter tracking application.