# Database Design
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

## MongoDB Schema Architecture

The database follows a document-oriented design optimized for the D&D Encounter Tracker's use cases, with embedded documents for related data and strategic denormalization for performance.

## Core Collections

### Users Collection

```typescript
interface User {
  _id: ObjectId;
  username: string;           // Unique, 3-30 chars, alphanumeric + underscore
  email: string;              // Unique, validated email format
  passwordHash: string;       // bcrypt hashed password
  isAdmin: boolean;           // Admin flag for elevated privileges
  
  subscription: {
    tier: 'free' | 'basic' | 'premium' | 'dungeon_master' | 'guild_master';
    status: 'active' | 'past_due' | 'canceled' | 'trial' | 'paused';
    startDate: Date;
    endDate?: Date;           // null for free tier
    trialEndDate?: Date;      // null if not in trial
    paymentProvider?: 'stripe' | 'paypal' | 'apple' | 'google';
    externalSubscriptionId?: string;
    autoRenew: boolean;
    customPricing?: {         // Admin-set custom pricing
      monthlyAmount: number;
      yearlyAmount: number;
      currency: string;
      reason: string;
      setBy: ObjectId;        // Admin user ID
      setAt: Date;
    };
  };
  
  usage: {
    partiesCreated: number;
    encountersCreated: number;
    creaturesCreated: number;
    sessionsThisMonth: number;
    storageUsedMB: number;
    lastUsageReset: Date;
  };
  
  features: {                 // Cached from subscription tier
    maxParties: number;       // -1 for unlimited
    maxEncounters: number;    // -1 for unlimited
    maxCreatures: number;     // -1 for unlimited
    maxParticipantsPerEncounter: number;
    cloudSync: boolean;
    advancedCombatLog: boolean;
    customThemes: boolean;
    exportFeatures: boolean;
    prioritySupport: boolean;
    betaAccess: boolean;
    collaborativeMode: boolean;
    automatedBackups: boolean;
  };
  
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    defaultDiceRoller: boolean;
    autoSave: boolean;
    notifications: {
      email: boolean;
      marketing: boolean;
      updates: boolean;
    };
  };
  
  adminNotes?: string;        // Admin-only notes
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ email: 1 }` (unique)
- `{ username: 1 }` (unique)
- `{ isAdmin: 1 }`
- `{ 'subscription.tier': 1 }`
- `{ 'subscription.status': 1 }`
- `{ createdAt: 1 }`

### Parties Collection

```typescript
interface Party {
  _id: ObjectId;
  userId: ObjectId;           // Owner reference
  name: string;               // 1-100 characters
  description?: string;
  
  characters: Array<{
    _id: ObjectId;            // Unique character ID
    name: string;
    ac: number;               // Armor Class (1-30)
    maxHP: number;            // Maximum Hit Points
    currentHP: number;        // Current Hit Points
    dexterity: number;        // Dexterity score (1-30)
    playerName?: string;      // Real player name
    classes: Array<{
      className: string;      // Fighter, Wizard, etc.
      level: number;
    }>;
    race: string;             // Character race
    subrace?: string;         // Character subrace
    notes?: string;           // Player/DM notes
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ userId: 1, name: 1 }`
- `{ createdAt: 1 }`

### Creatures Collection

```typescript
interface Creature {
  _id: ObjectId;
  userId?: ObjectId;          // null for global templates
  name: string;
  type: 'monster' | 'npc';
  ac: number;                 // Armor Class (1-30)
  maxHP: number;              // Maximum Hit Points
  dexterity: number;          // Dexterity score (1-30)
  challengeRating?: string;   // CR like "1/4", "1", "10"
  
  legendaryActions: Array<{
    name: string;
    description: string;
    cost: number;             // Action cost (1-3)
  }>;
  legendaryActionsPerTurn: number;
  
  isTemplate: boolean;        // Can be reused
  tags?: string[];            // Custom tags for organization
  source?: string;            // Monster Manual, etc.
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ userId: 1, type: 1 }`
- `{ isTemplate: 1 }`
- `{ challengeRating: 1 }`
- `{ tags: 1 }`

### Encounters Collection

```typescript
interface Encounter {
  _id: ObjectId;
  userId: ObjectId;
  name: string;               // 1-100 characters
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  
  participants: Array<{
    _id: ObjectId;            // Unique participant ID
    type: 'character' | 'creature';
    referenceId: ObjectId;    // Reference to character or creature
    name: string;             // Cached name for performance
    ac: number;               // Current AC (may differ from base)
    maxHP: number;            // Current max HP
    currentHP: number;        // Current HP
    dexterity: number;        // Current Dexterity
    initiativeRoll: number;   // Rolled initiative
    initiativeOrder: number;  // Sorted order (0-based)
    isManuallyOrdered: boolean; // Override automatic sorting
    
    conditions: Array<{
      name: string;           // Condition name
      duration: number;       // Rounds remaining (-1 for indefinite)
      description?: string;   // Additional notes
    }>;
    
    legendaryActionsRemaining: number;
    notes?: string;           // Turn-specific notes
  }>;
  
  currentTurn: number;        // Index of current participant
  round: number;              // Current round number
  
  combatLog?: Array<{         // Premium feature
    _id: ObjectId;
    action: 'turn_start' | 'damage' | 'healing' | 'condition_added' | 
            'condition_removed' | 'legendary_action' | 'round_end';
    participantId?: ObjectId;
    description: string;
    damage?: number;
    healing?: number;
    timestamp: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ userId: 1, status: 1 }`
- `{ status: 1 }`
- `{ createdAt: 1 }`
- `{ updatedAt: 1 }`

### Subscription Tiers Collection

```typescript
interface SubscriptionTier {
  _id: ObjectId;
  name: 'free' | 'basic' | 'premium' | 'dungeon_master' | 'guild_master';
  displayName: string;        // "Free Adventurer", etc.
  description: string;
  
  pricing: {
    monthly: number;          // Price in USD
    yearly: number;           // Price in USD
    currency: string;         // Currency code
  };
  
  features: {
    maxParties: number;       // -1 for unlimited
    maxEncounters: number;    // -1 for unlimited
    maxCreatures: number;     // -1 for unlimited
    maxParticipantsPerEncounter: number;
    cloudSync: boolean;
    advancedCombatLog: boolean;
    customThemes: boolean;
    exportFeatures: boolean;
    prioritySupport: boolean;
    betaAccess: boolean;
    collaborativeMode: boolean;
    automatedBackups: boolean;
  };
  
  isActive: boolean;          // Can be subscribed to
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ name: 1 }` (unique)
- `{ isActive: 1 }`

### Payment Transactions Collection

```typescript
interface PaymentTransaction {
  _id: ObjectId;
  userId: ObjectId;
  transactionId: string;      // Internal transaction ID
  amount: number;             // Amount in cents
  currency: string;           // Currency code
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paymentProvider: 'stripe' | 'paypal' | 'apple' | 'google';
  providerTransactionId: string; // External transaction ID
  
  subscriptionTier: string;   // Tier being purchased
  billingPeriod: 'monthly' | 'yearly';
  
  metadata?: {
    couponCode?: string;
    discountAmount?: number;
    originalAmount?: number;
    isRenewal?: boolean;
    previousSubscriptionId?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ transactionId: 1 }` (unique)
- `{ providerTransactionId: 1 }`
- `{ status: 1 }`
- `{ createdAt: 1 }`

### Admin Actions Collection

```typescript
interface AdminAction {
  _id: ObjectId;
  adminUserId: ObjectId;      // Admin performing action
  targetUserId: ObjectId;     // User being affected
  action: 'subscription_tier_change' | 'custom_pricing_set' | 
          'custom_pricing_removed' | 'subscription_status_change' |
          'admin_promotion' | 'admin_demotion' | 'account_suspension' |
          'account_reactivation';
  
  details: {
    oldValue?: any;           // Previous state
    newValue?: any;           // New state
    reason?: string;          // Reason for action
  };
  
  ipAddress?: string;         // Admin's IP address
  userAgent?: string;         // Admin's user agent
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ adminUserId: 1, createdAt: -1 }`
- `{ targetUserId: 1, createdAt: -1 }`
- `{ action: 1, createdAt: -1 }`
- `{ createdAt: -1 }`

### Sessions Collection (Real-time tracking)

```typescript
interface Session {
  _id: ObjectId;
  userId: ObjectId;
  encounterId?: ObjectId;     // Current encounter if any
  socketId: string;           // Socket.IO session ID
  isActive: boolean;
  lastActivity: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ userId: 1, isActive: 1 }`
- `{ encounterId: 1 }`
- `{ lastActivity: 1 }` (TTL index, expires after 24 hours)

## Database Views

### User Statistics View
```javascript
db.createView('user_stats', 'users', [
  {
    $group: {
      _id: '$subscription.tier',
      count: { $sum: 1 },
      activeUsers: {
        $sum: {
          $cond: [{ $eq: ['$subscription.status', 'active'] }, 1, 0]
        }
      }
    }
  },
  { $sort: { _id: 1 } }
]);
```

## Data Relationships

### Primary Relationships
- **Users → Parties**: One-to-many (users own parties)
- **Users → Creatures**: One-to-many (users create creatures)
- **Users → Encounters**: One-to-many (users create encounters)
- **Encounters → Participants**: Embedded relationship
- **Admin Actions**: Reference admin user and target user
- **Payment Transactions**: Reference user and subscription tier
- **Sessions**: Reference user and optionally encounter

### Reference Patterns
```typescript
// Encounter participants reference party characters and creatures
participant: {
  type: 'character',
  referenceId: ObjectId('party_character_id'),
  // Cached data for performance
  name: 'Thorgrim Ironforge',
  ac: 18,
  // ... other cached fields
}

// Admin actions track changes
adminAction: {
  adminUserId: ObjectId('admin_user_id'),
  targetUserId: ObjectId('target_user_id'),
  action: 'custom_pricing_set',
  details: {
    oldValue: { monthlyAmount: 9.99 },
    newValue: { monthlyAmount: 5.99, reason: 'VIP discount' }
  }
}
```

## Data Validation Rules

### Schema Validation (MongoDB Level)
```javascript
// Users collection validation
{
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'passwordHash'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30,
          pattern: '^[a-zA-Z0-9_]+
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}
        },
        subscription: {
          bsonType: 'object',
          properties: {
            tier: {
              bsonType: 'string',
              enum: ['free', 'basic', 'premium', 'dungeon_master', 'guild_master']
            },
            status: {
              bsonType: 'string',
              enum: ['active', 'past_due', 'canceled', 'trial', 'paused']
            }
          }
        }
      }
    }
  }
}
```

### Application Level Validation
- **Username**: 3-30 characters, alphanumeric + underscore only
- **Email**: Valid email format, unique across system
- **HP Values**: currentHP ≤ maxHP, both ≥ 0
- **AC Values**: 1-30 range
- **Dexterity**: 1-30 range
- **Initiative Order**: 0-based, sequential within encounter

## Performance Optimization

### Indexing Strategy
```javascript
// Compound indexes for common queries
db.encounters.createIndex({ userId: 1, status: 1 });
db.parties.createIndex({ userId: 1, name: 1 });
db.creatures.createIndex({ userId: 1, type: 1 });

// Text indexes for search functionality
db.creatures.createIndex({ 
  name: "text", 
  "tags": "text" 
}, {
  weights: { name: 10, tags: 5 }
});
```

### Data Denormalization
- **Encounter Participants**: Cache character/creature data to avoid lookups during combat
- **User Features**: Cache subscription tier features to avoid tier lookup on every request
- **Subscription Status**: Cached in user document for quick access control

### Aggregation Pipelines
```javascript
// Get user's encounter statistics
[
  { $match: { userId: ObjectId('user_id') } },
  { $group: {
    _id: '$status',
    count: { $sum: 1 },
    avgParticipants: { $avg: { $size: '$participants' } }
  }},
  { $sort: { _id: 1 } }
]
```

## Data Migration Strategy

### Version Control
- **Schema Versions**: Track schema changes with migration scripts
- **Backward Compatibility**: Maintain compatibility during transitions
- **Feature Flags**: Use flags to enable new schema features gradually

### Migration Scripts
```typescript
// Example migration: Add new subscription features
async function migration_v2_1() {
  await db.users.updateMany(
    { 'features.automatedBackups': { $exists: false } },
    { $set: { 'features.automatedBackups': false } }
  );
}
```

## Backup and Recovery

### Automated Backups
- **Frequency**: Daily automated backups via MongoDB Atlas
- **Retention**: 7 days point-in-time recovery
- **Geographic Distribution**: Backups stored in multiple regions

### Data Export Capabilities
```typescript
// User data export for GDPR compliance
async function exportUserData(userId: string) {
  const userData = await User.findById(userId);
  const parties = await Party.find({ userId });
  const encounters = await Encounter.find({ userId });
  const creatures = await Creature.find({ userId });
  
  return {
    user: userData,
    parties,
    encounters,
    creatures,
    exportDate: new Date()
  };
}
```

## Security Considerations

### Data Protection
- **Sensitive Fields**: Password hashes, payment tokens encrypted
- **Access Control**: Row-level security via userId filtering
- **Audit Trail**: All admin actions logged with timestamps

### Compliance
- **GDPR**: Data export and deletion capabilities
- **PCI DSS**: Payment data handled by Stripe (no card data stored)
- **SOC 2**: MongoDB Atlas compliance for data security

## Database Monitoring

### Performance Metrics
- **Query Performance**: Monitor slow queries (>100ms)
- **Index Usage**: Track index hit ratios
- **Connection Pool**: Monitor connection utilization

### Business Metrics
```javascript
// Subscription conversion tracking
db.users.aggregate([
  { $match: { createdAt: { $gte: new Date('2024-01-01') } } },
  { $group: {
    _id: { 
      month: { $month: '$createdAt' },
      tier: '$subscription.tier'
    },
    count: { $sum: 1 }
  }}
]);
```

This database design provides a robust foundation for the D&D Encounter Tracker, balancing performance, scalability, and data integrity while supporting the freemium subscription model and real-time collaborative features.