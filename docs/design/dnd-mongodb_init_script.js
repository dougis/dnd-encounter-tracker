// MongoDB Initialization Script for D&D Encounter Tracker
// This script sets up the database, collections, indexes, and initial data

// Database configuration
const DB_NAME = 'dnd_encounter_tracker';
const ENV = process.env.NODE_ENV || 'development';

print(`🎲 Initializing D&D Encounter Tracker Database: ${DB_NAME}`);
print(`📦 Environment: ${ENV}`);

// Switch to the application database
db = db.getSiblingDB(DB_NAME);

// Create collections with validation
print('📝 Creating collections with schema validation...');

// Users Collection
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'passwordHash'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30,
          pattern: '^[a-zA-Z0-9_]+$',
          description: 'Username must be 3-30 characters, alphanumeric and underscore only'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Must be a valid email address'
        },
        passwordHash: {
          bsonType: 'string',
          description: 'Hashed password using bcrypt'
        },
        isAdmin: {
          bsonType: 'bool',
          description: 'Admin flag for elevated privileges'
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
  },
  validationLevel: 'moderate',
  validationAction: 'warn'
});

// Parties Collection
db.createCollection('parties', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'name'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'Reference to the user who owns this party'
        },
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'Party name must be 1-100 characters'
        },
        characters: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['name', 'ac', 'maxHP', 'currentHP', 'dexterity'],
            properties: {
              name: { bsonType: 'string', minLength: 1 },
              ac: { bsonType: 'int', minimum: 1, maximum: 30 },
              maxHP: { bsonType: 'int', minimum: 1 },
              currentHP: { bsonType: 'int', minimum: 0 },
              dexterity: { bsonType: 'int', minimum: 1, maximum: 30 }
            }
          }
        }
      }
    }
  }
});

// Creatures Collection
db.createCollection('creatures', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'name', 'type', 'ac', 'maxHP', 'dexterity'],
      properties: {
        userId: { bsonType: 'objectId' },
        name: { bsonType: 'string', minLength: 1 },
        type: {
          bsonType: 'string',
          enum: ['monster', 'npc']
        },
        ac: { bsonType: 'int', minimum: 1, maximum: 30 },
        maxHP: { bsonType: 'int', minimum: 1 },
        dexterity: { bsonType: 'int', minimum: 1, maximum: 30 }
      }
    }
  }
});

// Encounters Collection
db.createCollection('encounters', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'name', 'status'],
      properties: {
        userId: { bsonType: 'objectId' },
        name: { bsonType: 'string', minLength: 1, maxLength: 100 },
        status: {
          bsonType: 'string',
          enum: ['planning', 'active', 'completed', 'paused']
        },
        currentTurn: { bsonType: 'int', minimum: 0 },
        round: { bsonType: 'int', minimum: 1 }
      }
    }
  }
});

// Subscription Tiers Collection
db.createCollection('subscriptiontiers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'displayName', 'pricing'],
      properties: {
        name: {
          bsonType: 'string',
          enum: ['free', 'basic', 'premium', 'dungeon_master', 'guild_master']
        },
        displayName: { bsonType: 'string' },
        pricing: {
          bsonType: 'object',
          properties: {
            monthly: { bsonType: 'number', minimum: 0 },
            yearly: { bsonType: 'number', minimum: 0 }
          }
        }
      }
    }
  }
});

// Payment Transactions Collection
db.createCollection('paymenttransactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'transactionId', 'amount', 'status', 'paymentProvider'],
      properties: {
        userId: { bsonType: 'objectId' },
        transactionId: { bsonType: 'string' },
        amount: { bsonType: 'number', minimum: 0 },
        status: {
          bsonType: 'string',
          enum: ['pending', 'completed', 'failed', 'refunded', 'disputed']
        },
        paymentProvider: {
          bsonType: 'string',
          enum: ['stripe', 'paypal', 'apple', 'google']
        }
      }
    }
  }
});

// Admin Actions Collection
db.createCollection('adminactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['adminUserId', 'targetUserId', 'action'],
      properties: {
        adminUserId: { bsonType: 'objectId' },
        targetUserId: { bsonType: 'objectId' },
        action: {
          bsonType: 'string',
          enum: [
            'subscription_tier_change',
            'custom_pricing_set',
            'custom_pricing_removed',
            'subscription_status_change',
            'admin_promotion',
            'admin_demotion',
            'account_suspension',
            'account_reactivation'
          ]
        }
      }
    }
  }
});

// Sessions Collection (for real-time tracking)
db.createCollection('sessions');

print('✅ Collections created successfully');

// Create indexes for performance
print('🔍 Creating database indexes...');

// User indexes
db.users.createIndex({ email: 1 }, { unique: true, name: 'email_unique' });
db.users.createIndex({ username: 1 }, { unique: true, name: 'username_unique' });
db.users.createIndex({ isAdmin: 1 }, { name: 'admin_lookup' });
db.users.createIndex({ 'subscription.tier': 1 }, { name: 'subscription_tier_lookup' });
db.users.createIndex({ 'subscription.status': 1 }, { name: 'subscription_status_lookup' });
db.users.createIndex({ createdAt: 1 }, { name: 'user_creation_date' });

// Party indexes
db.parties.createIndex({ userId: 1 }, { name: 'party_user_lookup' });
db.parties.createIndex({ userId: 1, name: 1 }, { name: 'party_user_name_lookup' });
db.parties.createIndex({ createdAt: 1 }, { name: 'party_creation_date' });

// Creature indexes
db.creatures.createIndex({ userId: 1 }, { name: 'creature_user_lookup' });
db.creatures.createIndex({ userId: 1, type: 1 }, { name: 'creature_user_type_lookup' });
db.creatures.createIndex({ isTemplate: 1 }, { name: 'creature_template_lookup' });
db.creatures.createIndex({ challengeRating: 1 }, { name: 'creature_cr_lookup' });

// Encounter indexes
db.encounters.createIndex({ userId: 1 }, { name: 'encounter_user_lookup' });
db.encounters.createIndex({ userId: 1, status: 1 }, { name: 'encounter_user_status_lookup' });
db.encounters.createIndex({ status: 1 }, { name: 'encounter_status_lookup' });
db.encounters.createIndex({ createdAt: 1 }, { name: 'encounter_creation_date' });
db.encounters.createIndex({ updatedAt: 1 }, { name: 'encounter_last_modified' });

// Payment transaction indexes
db.paymenttransactions.createIndex({ userId: 1 }, { name: 'payment_user_lookup' });
db.paymenttransactions.createIndex({ transactionId: 1 }, { unique: true, name: 'transaction_id_unique' });
db.paymenttransactions.createIndex({ providerTransactionId: 1 }, { name: 'provider_transaction_lookup' });
db.paymenttransactions.createIndex({ status: 1 }, { name: 'payment_status_lookup' });
db.paymenttransactions.createIndex({ createdAt: 1 }, { name: 'payment_date_lookup' });

// Admin action indexes
db.adminactions.createIndex({ adminUserId: 1, createdAt: -1 }, { name: 'admin_actions_by_admin' });
db.adminactions.createIndex({ targetUserId: 1, createdAt: -1 }, { name: 'admin_actions_by_target' });
db.adminactions.createIndex({ action: 1, createdAt: -1 }, { name: 'admin_actions_by_type' });
db.adminactions.createIndex({ createdAt: -1 }, { name: 'admin_actions_chronological' });

// Session indexes (with TTL for cleanup)
db.sessions.createIndex({ userId: 1, isActive: 1 }, { name: 'active_sessions_lookup' });
db.sessions.createIndex({ encounterId: 1 }, { name: 'encounter_sessions_lookup' });
db.sessions.createIndex({ lastActivity: 1 }, { 
  expireAfterSeconds: 86400, 
  name: 'session_ttl_cleanup' 
});

// Subscription tier indexes
db.subscriptiontiers.createIndex({ name: 1 }, { unique: true, name: 'tier_name_unique' });
db.subscriptiontiers.createIndex({ isActive: 1 }, { name: 'active_tiers_lookup' });

print('✅ Indexes created successfully');

// Insert initial subscription tier data
print('💰 Inserting subscription tier data...');

const subscriptionTiers = [
  {
    name: 'free',
    displayName: 'Free Adventurer',
    description: 'Perfect for trying out the basics of encounter management',
    pricing: { monthly: 0, yearly: 0, currency: 'USD' },
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
      automatedBackups: false
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'basic',
    displayName: 'Seasoned Adventurer',
    description: 'Great for regular DMs who want cloud sync and more content',
    pricing: { monthly: 4.99, yearly: 49.99, currency: 'USD' },
    features: {
      maxParties: 3,
      maxEncounters: 15,
      maxCreatures: 50,
      maxParticipantsPerEncounter: 10,
      cloudSync: true,
      advancedCombatLog: true,
      customThemes: false,
      exportFeatures: true,
      prioritySupport: false,
      betaAccess: false,
      collaborativeMode: false,
      automatedBackups: true
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'premium',
    displayName: 'Expert Dungeon Master',
    description: 'Advanced features for serious DMs running multiple campaigns',
    pricing: { monthly: 9.99, yearly: 99.99, currency: 'USD' },
    features: {
      maxParties: 10,
      maxEncounters: 50,
      maxCreatures: 200,
      maxParticipantsPerEncounter: 20,
      cloudSync: true,
      advancedCombatLog: true,
      customThemes: true,
      exportFeatures: true,
      prioritySupport: true,
      betaAccess: true,
      collaborativeMode: true,
      automatedBackups: true
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'dungeon_master',
    displayName: 'Master of Dungeons',
    description: 'Professional-grade tools for power users and content creators',
    pricing: { monthly: 19.99, yearly: 199.99, currency: 'USD' },
    features: {
      maxParties: 25,
      maxEncounters: 100,
      maxCreatures: 500,
      maxParticipantsPerEncounter: 30,
      cloudSync: true,
      advancedCombatLog: true,
      customThemes: true,
      exportFeatures: true,
      prioritySupport: true,
      betaAccess: true,
      collaborativeMode: true,
      automatedBackups: true
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'guild_master',
    displayName: 'Guild Master',
    description: 'Unlimited power for gaming communities and professional DMs',
    pricing: { monthly: 39.99, yearly: 399.99, currency: 'USD' },
    features: {
      maxParties: -1,
      maxEncounters: -1,
      maxCreatures: -1,
      maxParticipantsPerEncounter: 50,
      cloudSync: true,
      advancedCombatLog: true,
      customThemes: true,
      exportFeatures: true,
      prioritySupport: true,
      betaAccess: true,
      collaborativeMode: true,
      automatedBackups: true
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Insert subscription tiers
try {
  db.subscriptiontiers.insertMany(subscriptionTiers);
  print('✅ Subscription tiers inserted successfully');
} catch (error) {
  print('⚠️  Subscription tiers may already exist, skipping...');
}

// Create initial admin user (only in development)
if (ENV === 'development') {
  print('👑 Creating development admin user...');
  
  // Note: In production, this should be done through a secure process
  const adminUser = {
    username: 'admin',
    email: 'admin@localhost',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewds7koUiGy/VRoS', // 'password123'
    isAdmin: true,
    subscription: {
      tier: 'guild_master',
      status: 'active',
      startDate: new Date(),
      endDate: null,
      autoRenew: false
    },
    usage: {
      partiesCreated: 0,
      encountersCreated: 0,
      creaturesCreated: 0,
      sessionsThisMonth: 0,
      storageUsedMB: 0,
      lastUsageReset: new Date()
    },
    features: {
      maxParties: -1,
      maxEncounters: -1,
      maxCreatures: -1,
      maxParticipantsPerEncounter: 50,
      cloudSync: true,
      advancedCombatLog: true,
      customThemes: true,
      exportFeatures: true,
      prioritySupport: true,
      betaAccess: true,
      collaborativeMode: true,
      automatedBackups: true
    },
    preferences: {
      theme: 'dark',
      defaultDiceRoller: true,
      autoSave: true,
      notifications: {
        email: true,
        marketing: false,
        updates: true
      }
    },
    adminNotes: 'Development admin account - DO NOT USE IN PRODUCTION',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    db.users.insertOne(adminUser);
    print('✅ Development admin user created');
    print('   📧 Email: admin@localhost');
    print('   🔑 Password: password123');
    print('   ⚠️  CHANGE PASSWORD IMMEDIATELY IN PRODUCTION!');
  } catch (error) {
    print('⚠️  Admin user may already exist, skipping...');
  }
}

// Insert some sample creature templates
print('🐉 Creating sample creature templates...');

const sampleCreatures = [
  {
    userId: null, // Global templates
    name: 'Goblin',
    type: 'monster',
    ac: 15,
    maxHP: 7,
    dexterity: 14,
    challengeRating: '1/4',
    legendaryActions: [],
    legendaryActionsPerTurn: 0,
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: null,
    name: 'Orc',
    type: 'monster',
    ac: 13,
    maxHP: 15,
    dexterity: 12,
    challengeRating: '1/2',
    legendaryActions: [],
    legendaryActionsPerTurn: 0,
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: null,
    name: 'Adult Red Dragon',
    type: 'monster',
    ac: 19,
    maxHP: 256,
    dexterity: 10,
    challengeRating: '17',
    legendaryActions: [
      {
        name: 'Detect',
        description: 'The dragon makes a Wisdom (Perception) check.',
        cost: 1
      },
      {
        name: 'Tail Attack',
        description: 'The dragon makes a tail attack.',
        cost: 1
      },
      {
        name: 'Wing Attack',
        description: 'The dragon beats its wings. Each creature within 15 ft. must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone.',
        cost: 2
      }
    ],
    legendaryActionsPerTurn: 3,
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

try {
  db.creatures.insertMany(sampleCreatures);
  print('✅ Sample creature templates created');
} catch (error) {
  print('⚠️  Sample creatures may already exist, skipping...');
}

// Create database statistics view for admin dashboard
print('📊 Creating database views...');

// Create a view for user statistics
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
  {
    $sort: { _id: 1 }
  }
]);

print('✅ Database views created');

// Final database health check
print('🔍 Running database health check...');

const collections = db.getCollectionNames();
const expectedCollections = [
  'users', 'parties', 'creatures', 'encounters', 
  'subscriptiontiers', 'paymenttransactions', 
  'adminactions', 'sessions'
];

let healthCheck = true;

expectedCollections.forEach(collectionName => {
  if (collections.includes(collectionName)) {
    const count = db.getCollection(collectionName).countDocuments();
    print(`   ✅ ${collectionName}: ${count} documents`);
  } else {
    print(`   ❌ Missing collection: ${collectionName}`);
    healthCheck = false;
  }
});

// Check indexes
const userIndexes = db.users.getIndexes().length;
const encounterIndexes = db.encounters.getIndexes().length;

print(`   📊 User collection indexes: ${userIndexes}`);
print(`   📊 Encounter collection indexes: ${encounterIndexes}`);

if (healthCheck) {
  print('');
  print('🎉 Database initialization completed successfully!');
  print('💡 Database is ready for the D&D Encounter Tracker application');
  
  if (ENV === 'development') {
    print('');
    print('🚀 Quick Start Guide:');
    print('   1. Start your Node.js application');
    print('   2. Login with admin@localhost / password123 (DEV ONLY)');
    print('   3. Create your first party and encounter');
    print('   4. Roll for initiative and start tracking!');
  }
} else {
  print('');
  print('❌ Database initialization completed with warnings');
  print('⚠️  Please review the missing collections and recreate if necessary');
}

print('');
print('🎲 May your encounters be legendary!');
