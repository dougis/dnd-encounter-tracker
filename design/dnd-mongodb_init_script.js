// MongoDB Initialization Script for D&D Encounter Tracker
// Run this script to set up the database with initial data and indexes

const mongoose = require('mongoose');
const { User, Party, Creature, Encounter, Session } = require('./schemas');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd-encounter-tracker';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Sample data for development/testing
const sampleData = {
  users: [
    {
      username: 'testdm',
      email: 'dm@example.com',
      passwordHash: 'password123', // Will be hashed by schema middleware
      preferences: {
        theme: 'dark',
        defaultDiceRoller: true,
        autoSave: true
      }
    }
  ],
  
  creatures: [
    {
      name: 'Ancient Red Dragon',
      type: 'monster',
      ac: 22,
      maxHP: 546,
      dexterity: 10,
      challengeRating: '24',
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
          description: 'The dragon beats its wings. Each creature within 15 feet must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone.',
          cost: 2
        }
      ],
      legendaryActionsPerTurn: 3,
      isTemplate: true
    },
    {
      name: 'Goblin',
      type: 'monster',
      ac: 15,
      maxHP: 7,
      dexterity: 14,
      challengeRating: '1/4',
      legendaryActions: [],
      legendaryActionsPerTurn: 0,
      isTemplate: true
    },
    {
      name: 'Orc',
      type: 'monster',
      ac: 13,
      maxHP: 15,
      dexterity: 12,
      challengeRating: '1/2',
      legendaryActions: [],
      legendaryActionsPerTurn: 0,
      isTemplate: true
    },
    {
      name: 'Lich',
      type: 'monster',
      ac: 17,
      maxHP: 135,
      dexterity: 16,
      challengeRating: '21',
      legendaryActions: [
        {
          name: 'Cantrip',
          description: 'The lich casts a cantrip.',
          cost: 1
        },
        {
          name: 'Paralyzing Touch',
          description: 'The lich uses its Paralyzing Touch.',
          cost: 2
        },
        {
          name: 'Frightening Gaze',
          description: 'The lich fixes its gaze on one creature it can see within 10 feet of it.',
          cost: 2
        },
        {
          name: 'Disrupt Life',
          description: 'Each non-undead creature within 20 feet of the lich must make a Constitution saving throw, taking 21 (6d6) necrotic damage on a failed save, or half as much on a successful one.',
          cost: 3
        }
      ],
      legendaryActionsPerTurn: 3,
      isTemplate: true
    }
  ],
  
  parties: [
    {
      name: 'The Brave Adventurers',
      description: 'A party of seasoned heroes',
      characters: [
        {
          name: 'Aragorn',
          ac: 18,
          maxHP: 58,
          currentHP: 58,
          dexterity: 16,
          playerName: 'John',
          classes: [{ className: 'Ranger', level: 8 }],
          race: 'Human',
          subrace: 'Variant',
          notes: 'Uses a longsword and longbow'
        },
        {
          name: 'Gandalf',
          ac: 15,
          maxHP: 45,
          currentHP: 45,
          dexterity: 12,
          playerName: 'Mike',
          classes: [{ className: 'Wizard', level: 9 }],
          race: 'Human',
          subrace: '',
          notes: 'Staff of Power wielder'
        },
        {
          name: 'Legolas',
          ac: 17,
          maxHP: 52,
          currentHP: 52,
          dexterity: 20,
          playerName: 'Sarah',
          classes: [
            { className: 'Fighter', level: 6 },
            { className: 'Ranger', level: 2 }
          ],
          race: 'Elf',
          subrace: 'Wood Elf',
          notes: 'Master archer with elven accuracy'
        },
        {
          name: 'Gimli',
          ac: 19,
          maxHP: 68,
          currentHP: 68,
          dexterity: 10,
          playerName: 'Dave',
          classes: [{ className: 'Fighter', level: 8 }],
          race: 'Dwarf',
          subrace: 'Mountain Dwarf',
          notes: 'Great axe specialist with heavy armor mastery'
        }
      ]
    }
  ]
};

// Database initialization function
async function initializeDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Create database indexes
    console.log('Creating database indexes...');
    await createIndexes();
    console.log('Database indexes created successfully');

    // Seed data for development environment
    if (NODE_ENV === 'development') {
      console.log('Seeding development data...');
      await seedDevelopmentData();
      console.log('Development data seeded successfully');
    }

    console.log('Database initialization completed successfully');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Create database indexes
async function createIndexes() {
  // User indexes
  await User.createIndexes();
  
  // Party indexes
  await Party.createIndexes();
  
  // Creature indexes
  await Creature.createIndexes();
  
  // Encounter indexes
  await Encounter.createIndexes();
  
  // Session indexes
  await Session.createIndexes();
  
  // Additional compound indexes for performance
  await Encounter.collection.createIndex(
    { userId: 1, status: 1, updatedAt: -1 },
    { name: 'user_status_updated_idx' }
  );
  
  await Party.collection.createIndex(
    { userId: 1, updatedAt: -1 },
    { name: 'user_party_updated_idx' }
  );
  
  await Creature.collection.createIndex(
    { userId: 1, isTemplate: 1, name: 1 },
    { name: 'user_template_name_idx' }
  );
}

// Seed development data
async function seedDevelopmentData() {
  // Clear existing data (development only)
  await User.deleteMany({});
  await Party.deleteMany({});
  await Creature.deleteMany({});
  await Encounter.deleteMany({});
  await Session.deleteMany({});
  
  // Create test user
  const testUser = await User.create(sampleData.users[0]);
  console.log(`Created test user: ${testUser.username}`);
  
  // Create creature templates
  const creaturePromises = sampleData.creatures.map(creature => 
    Creature.create({ ...creature, userId: testUser._id })
  );
  const creatures = await Promise.all(creaturePromises);
  console.log(`Created ${creatures.length} creature templates`);
  
  // Create test party
  const testParty = await Party.create({
    ...sampleData.parties[0],
    userId: testUser._id
  });
  console.log(`Created test party: ${testParty.name} with ${testParty.characters.length} characters`);
  
  // Create sample encounter
  const sampleEncounter = await Encounter.create({
    userId: testUser._id,