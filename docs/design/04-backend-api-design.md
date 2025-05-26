# Backend API Design
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

## RESTful API v1 Specification

Base URL: `http://localhost:3001/api/v1` (development)  
Production: `https://api.dndtracker.com/api/v1`

## API Architecture

### Request/Response Format
- **Content-Type**: `application/json`
- **Authentication**: Bearer JWT tokens
- **Error Format**: Consistent error response structure
- **Pagination**: Cursor-based pagination for large datasets

### Standard Response Structure
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      hasNext: boolean;
      hasPrev: boolean;
      cursor?: string;
      total?: number;
    };
    timestamp: string;
    version: string;
  };
}
```

## Authentication Endpoints

### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```typescript
{
  username: string;        // 3-30 chars, alphanumeric + underscore
  email: string;          // Valid email address
  password: string;       // Min 8 chars, complexity requirements
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      subscription: {
        tier: "free";
        status: "active";
      };
      isAdmin: false;
    };
    tokens: {
      accessToken: string;    // 15min expiry
      refreshToken: string;   // 7 day expiry
    };
  }
}
```

### POST /api/v1/auth/login
Authenticate user credentials.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    user: UserProfile;
    tokens: AuthTokens;
  }
}
```

### POST /api/v1/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    accessToken: string;
    refreshToken: string;   // New refresh token
  }
}
```

### POST /api/v1/auth/logout
Invalidate user session.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```typescript
{
  success: true,
  data: { message: "Logged out successfully" }
}
```

## User Management Endpoints

### GET /api/v1/users/profile
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```typescript
{
  success: true,
  data: {
    id: string;
    username: string;
    email: string;
    subscription: SubscriptionDetails;
    usage: UsageStats;
    features: FeatureFlags;
    preferences: UserPreferences;
    createdAt: string;
    updatedAt: string;
  }
}
```

### PUT /api/v1/users/profile
Update user profile.

**Request Body:**
```typescript
{
  username?: string;
  preferences?: {
    theme?: "light" | "dark" | "auto";
    defaultDiceRoller?: boolean;
    autoSave?: boolean;
    notifications?: {
      email?: boolean;
      marketing?: boolean;
      updates?: boolean;
    };
  };
}
```

### PUT /api/v1/users/password
Change user password.

**Request Body:**
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

### GET /api/v1/users/usage
Get current usage statistics.

**Response (200):**
```typescript
{
  success: true,
  data: {
    partiesCreated: number;
    encountersCreated: number;
    creaturesCreated: number;
    sessionsThisMonth: number;
    storageUsedMB: number;
    limits: {
      maxParties: number;
      maxEncounters: number;
      maxCreatures: number;
      maxParticipantsPerEncounter: number;
    };
    lastUsageReset: string;
  }
}
```

## Party Management Endpoints

### GET /api/v1/parties
Get user's parties with pagination.

**Query Parameters:**
- `cursor?: string` - Pagination cursor
- `limit?: number` - Items per page (default: 20, max: 100)
- `search?: string` - Search party names

**Response (200):**
```typescript
{
  success: true,
  data: {
    parties: Array<{
      id: string;
      name: string;
      description?: string;
      characterCount: number;
      createdAt: string;
      updatedAt: string;
    }>;
  },
  meta: {
    pagination: PaginationMeta;
  }
}
```

### POST /api/v1/parties
Create a new party.

**Request Body:**
```typescript
{
  name: string;           // 1-100 characters
  description?: string;
  characters?: Array<{
    name: string;
    ac: number;           // 1-30
    maxHP: number;        // > 0
    currentHP: number;    // 0 <= currentHP <= maxHP
    dexterity: number;    // 1-30
    playerName?: string;
    classes: Array<{
      className: string;
      level: number;      // 1-20
    }>;
    race: string;
    subrace?: string;
    notes?: string;
  }>;
}
```

### GET /api/v1/parties/:partyId
Get specific party details.

**Response (200):**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    description?: string;
    characters: Array<CharacterDetails>;
    createdAt: string;
    updatedAt: string;
  }
}
```

### PUT /api/v1/parties/:partyId
Update party details.

### DELETE /api/v1/parties/:partyId
Delete a party.

### POST /api/v1/parties/:partyId/characters
Add character to party.

### PUT /api/v1/parties/:partyId/characters/:characterId
Update character details.

### DELETE /api/v1/parties/:partyId/characters/:characterId
Remove character from party.

## Creature Management Endpoints

### GET /api/v1/creatures
Get user's creatures and templates.

**Query Parameters:**
- `type?: "monster" | "npc" | "template"`
- `search?: string`
- `challengeRating?: string`
- `cursor?: string`
- `limit?: number`

### POST /api/v1/creatures
Create a new creature.

**Request Body:**
```typescript
{
  name: string;
  type: "monster" | "npc";
  ac: number;             // 1-30
  maxHP: number;
  dexterity: number;      // 1-30
  challengeRating?: string;
  legendaryActions?: Array<{
    name: string;
    description: string;
    cost: number;         // 1-3
  }>;
  legendaryActionsPerTurn?: number;
  isTemplate?: boolean;
  tags?: string[];
  source?: string;
}
```

### GET /api/v1/creatures/templates
Get global creature templates.

### GET /api/v1/creatures/:creatureId
Get specific creature details.

### PUT /api/v1/creatures/:creatureId
Update creature details.

### DELETE /api/v1/creatures/:creatureId
Delete a creature.

## Encounter Management Endpoints

### GET /api/v1/encounters
Get user's encounters.

**Query Parameters:**
- `status?: "planning" | "active" | "completed" | "paused"`
- `cursor?: string`
- `limit?: number`

### POST /api/v1/encounters
Create a new encounter.

**Request Body:**
```typescript
{
  name: string;           // 1-100 characters
  description?: string;
  participants?: Array<{
    type: "character" | "creature";
    referenceId: string;  // Party character or creature ID
    customName?: string;  // Override default name
    customHP?: number;    // Override default HP
    customAC?: number;    // Override default AC
  }>;
}
```

### GET /api/v1/encounters/:encounterId
Get specific encounter details.

**Response (200):**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    description?: string;
    status: "planning" | "active" | "completed" | "paused";
    participants: Array<ParticipantDetails>;
    currentTurn: number;
    round: number;
    combatLog?: Array<CombatLogEntry>; // Premium feature
    createdAt: string;
    updatedAt: string;
  }
}
```

### PUT /api/v1/encounters/:encounterId
Update encounter details.

### DELETE /api/v1/encounters/:encounterId
Delete an encounter.

### POST /api/v1/encounters/:encounterId/start
Start the encounter (begin initiative tracking).

### POST /api/v1/encounters/:encounterId/next-turn
Advance to next participant's turn.

### POST /api/v1/encounters/:encounterId/previous-turn
Go back to previous participant's turn.

### POST /api/v1/encounters/:encounterId/next-round
Advance to next round.

### PUT /api/v1/encounters/:encounterId/participants/:participantId/hp
Update participant's HP.

**Request Body:**
```typescript
{
  damage?: number;        // Positive for damage
  healing?: number;       // Positive for healing
  setHP?: number;         // Set HP to specific value
  notes?: string;         // Action description
}
```

### POST /api/v1/encounters/:encounterId/participants/:participantId/conditions
Add condition to participant.

**Request Body:**
```typescript
{
  name: string;           // Condition name
  duration: number;       // Rounds (-1 for indefinite)
  description?: string;
}
```

### DELETE /api/v1/encounters/:encounterId/participants/:participantId/conditions/:conditionId
Remove condition from participant.

### POST /api/v1/encounters/:encounterId/roll-initiative
Roll initiative for all participants.

**Request Body:**
```typescript
{
  autoRoll?: boolean;     // Auto-roll for all (default: true)
  manualRolls?: Array<{
    participantId: string;
    roll: number;
  }>;
}
```

## Subscription Management Endpoints

### GET /api/v1/subscriptions/tiers
Get available subscription tiers.

**Response (200):**
```typescript
{
  success: true,
  data: {
    tiers: Array<{
      name: string;
      displayName: string;
      description: string;
      pricing: {
        monthly: number;
        yearly: number;
        currency: string;
      };
      features: FeatureSet;
      isActive: boolean;
    }>;
  }
}
```

### POST /api/v1/subscriptions/checkout
Create Stripe checkout session.

**Request Body:**
```typescript
{
  tier: string;           // Subscription tier name
  billingPeriod: "monthly" | "yearly";
  successUrl: string;
  cancelUrl: string;
}
```

### POST /api/v1/subscriptions/portal
Create Stripe customer portal session.

### POST /api/v1/subscriptions/webhooks/stripe
Stripe webhook endpoint (internal).

### GET /api/v1/subscriptions/current
Get current subscription details.

## Admin Endpoints (Admin Flag Required)

### GET /api/v1/admin/users
Get all users with filtering.

**Query Parameters:**
- `tier?: string`
- `status?: string`
- `search?: string`
- `cursor?: string`
- `limit?: number`

### PUT /api/v1/admin/users/:userId/subscription
Update user's subscription.

**Request Body:**
```typescript
{
  tier?: string;
  status?: string;
  customPricing?: {
    monthlyAmount: number;
    yearlyAmount: number;
    reason: string;
  } | null;
}
```

### GET /api/v1/admin/analytics
Get system analytics.

**Response (200):**
```typescript
{
  success: true,
  data: {
    userStats: {
      total: number;
      byTier: Record<string, number>;
      newThisMonth: number;
    };
    revenueStats: {
      mrr: number;
      totalRevenue: number;
      conversionRate: number;
    };
    usageStats: {
      activeEncounters: number;
      totalParties: number;
      totalCreatures: number;
    };
  }
}
```

### GET /api/v1/admin/actions
Get admin action log.

**Query Parameters:**
- `adminUserId?: string`
- `targetUserId?: string`
- `action?: string`
- `startDate?: string`
- `endDate?: string`

## Error Handling

### Standard Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Error Response Format
```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid request data",
    details: {
      field: "email",
      reason: "Invalid email format"
    }
  },
  meta: {
    timestamp: "2025-05-26T10:30:00Z",
    version: "v1"
  }
}
```

## Rate Limiting

### Limits by Endpoint Type
- **Authentication**: 5 requests/minute per IP
- **User Operations**: 100 requests/minute per user
- **Encounter Updates**: 300 requests/minute per user (real-time combat)
- **Admin Operations**: 1000 requests/minute per admin

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## WebSocket Events (Real-time)

### Connection Authentication
```typescript
// Client connects with JWT token
socket.emit('authenticate', { token: 'jwt_token_here' });
```

### Encounter Events
```typescript
// Join encounter room
socket.emit('join_encounter', { encounterId: 'encounter_id' });

// Real-time updates
socket.on('participant_hp_changed', (data) => {
  // Handle HP change
});

socket.on('turn_advanced', (data) => {
  // Handle turn change
});

socket.on('condition_added', (data) => {
  // Handle condition addition
});
```

This API design provides a comprehensive RESTful interface for the D&D Encounter Tracker, with clear separation of concerns, proper authentication/authorization, and support for real-time collaboration features.