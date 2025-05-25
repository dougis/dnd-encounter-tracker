# D&D Encounter Tracker - Product Requirements Document

## Executive Summary

The D&D Encounter Tracker is a web application designed to streamline combat management for Dungeons & Dragons game masters and players. The application will enable users to track initiative order, character health, armor class, and other combat-related statistics during encounters while persisting data between gaming sessions.

## Product Vision

To create an intuitive, reliable tool that reduces administrative overhead during D&D combat encounters, allowing game masters to focus on storytelling and players to focus on gameplay while maintaining accurate combat state across multiple gaming sessions.

## Target Users

**Primary Users:**
- Dungeon Masters (DMs) running D&D campaigns
- Players participating in D&D sessions

**Secondary Users:**
- Game organizers managing multiple campaigns
- New DMs seeking streamlined combat management tools

## Core Features

### 1. Party Management
- **Create and manage player parties**
  - Add/remove characters from party
  - Store character names and basic information
  - Support for multiple parties per user account

- **Character Data Storage**
  - Character name (required)
  - Armor Class (AC) - numeric value
  - Maximum Hit Points - numeric value
  - Current Hit Points - numeric value with real-time updates
  - Dexterity score - numeric value for initiative tiebreaking
  - Character class(es) with levels (support for multiclassing)
    - Primary class and level
    - Secondary class and level (if multiclassed)
    - Additional classes for complex multiclass builds
  - Character race (with subrace if applicable)
  - Player name (optional)

### 2. Encounter Management
- **Create new encounters**
  - Name/title for encounter
  - Add party members to encounter
  - Add monsters/NPCs with AC, HP, Dexterity, and special abilities
  - Configure legendary actions for applicable creatures
    - Number of legendary actions per turn
    - Individual legendary action descriptions and costs
    - Automatic legendary action tracking between turns
  - Set encounter difficulty/notes

- **Initiative Tracking**
  - Input initiative rolls for all participants
  - Automatic sorting by initiative order with intelligent tiebreaking:
    - Primary sort: Initiative roll (descending)
    - Secondary sort: Dexterity score (descending) for tied initiatives 
  - Manual reordering capabilities override automatic sorting
  - Current turn indicator
  - Next/previous turn navigation
  - Legendary action phase management
    - Track legendary actions between creature turns
    - Visual indicators for available legendary actions
    - Automatic reset of legendary actions at start of creature's turn

### 3. Combat State Management
- **Health Point Tracking**
  - Apply damage to characters/monsters
  - Apply healing to characters/monsters
  - Visual indicators for character status (healthy, bloodied, unconscious, dead)
  - Damage/healing history log

- **Status Effects**
  - Add temporary conditions (stunned, prone, etc.)
  - Duration tracking for timed effects
  - Visual status indicators

### 4. Data Persistence
- **Session Storage**
  - Save encounter state automatically
  - Resume encounters across browser sessions
  - Store party configurations permanently
  - Encounter history and archives

- **Export/Import**
  - Export encounter data (JSON format)
  - Import character data from common formats
  - Backup and restore functionality

## Technical Requirements

### Platform
- Web application (responsive design)
- Compatible with modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-friendly interface for tablet use

### Performance
- Load time under 3 seconds on standard broadband
- Real-time updates with minimal latency
- Offline functionality for core features

### Data Storage
- MongoDB database for persistent storage
- Local browser storage for offline capability and caching
- Cloud storage with MongoDB Atlas for cross-device synchronization
- Data encryption for user privacy

### Security
- User authentication system
- Secure data transmission (HTTPS)
- Privacy-compliant data handling

## User Interface Requirements

### Design Principles
- Clean, intuitive interface suitable for use during gameplay
- Large, easily clickable buttons for touch devices
- High contrast for visibility in various lighting conditions
- Minimal visual clutter to reduce cognitive load

### Key Screens

#### 1. Dashboard
- List of saved parties
- Recent encounters
- Quick start options
- Settings access

#### 2. Party Management
- Character roster with AC/HP display
- Add/edit character forms
- Import/export options
- Party sharing capabilities

#### 3. Encounter Screen
- Initiative order display (left sidebar)
  - Shows initiative roll and dexterity modifier for each participant
  - Visual indicators for tiebreaking resolution
  - Drag-and-drop manual reordering capability
- Character detail panel (main area)
- Quick action buttons (damage, heal, conditions)
- Legendary action tracker for applicable creatures
  - Available legendary actions counter
  - Quick legendary action buttons
  - Action cost indicators
- Turn progression controls
- Notes/log section

#### 4. Character Detail View
- Current/max HP with visual indicator
- AC display
- Dexterity score display
- Character class(es) and level(s) summary
- Character race display
- Active conditions list
- Legendary actions panel (for NPCs/monsters)
  - Individual action descriptions
  - Action costs and availability
  - Quick activation buttons
- Quick damage/heal input
- Character notes

## Functional Requirements

### Must Have Features
1. Create and store character parties with AC, HP, Dexterity, class(es), and race
2. Support multiclass character builds with level tracking
3. Track initiative order with automatic dexterity-based tiebreaking
4. Manual initiative reordering override capability
5. Apply damage and healing to characters
6. Legendary action tracking for monsters/NPCs
7. Persist data between sessions
8. Basic status effect tracking
9. Mobile-responsive design

### Should Have Features
1. Advanced monster/NPC management with legendary resistances
2. Encounter templates and presets with legendary creatures
3. Damage calculation assistance with dexterity-based AC calculations
4. Turn timer functionality
5. Combat log/history with legendary action tracking
6. Data export capabilities
7. Character sheet integration for class features
8. Race-specific trait reminders
9. Initiative roll assistance with dexterity modifier display

### Could Have Features
1. Integration with D&D Beyond API
2. Dice rolling functionality
3. Spell slot tracking
4. Advanced condition automation
5. Multi-user real-time collaboration
6. Campaign management tools

## Non-Functional Requirements

### Usability
- New users should be able to create their first encounter within 5 minutes
- Common actions (apply damage, advance turn) should require no more than 2 clicks
- Initiative tiebreaking should be automatic but easily overridable
- Interface should be usable with one hand on mobile devices

### Reliability
- 99.9% uptime for core functionality
- Automatic data backup every 30 seconds during active encounters
- Graceful error handling with user-friendly messages

### Scalability
- Support for parties up to 8 characters with complex multiclass builds
- Handle encounters with up to 20 total participants including legendary creatures
- Store unlimited number of saved parties per user
- Manage multiple legendary actions per creature efficiently

## Success Metrics

### Usage Metrics
- Monthly active users
- Sessions per user per month
- Average session duration
- Feature adoption rates

### Quality Metrics
- User satisfaction score (target: 4.5/5)
- Bug report frequency (target: <1% of sessions)
- Data loss incidents (target: 0%)
- Page load performance (target: <3 seconds)

## Technical Architecture

### Frontend
- Modern JavaScript framework (React/Vue.js)
- Responsive CSS framework
- Progressive Web App (PWA) capabilities
- Local storage management

### Backend (MongoDB Implementation)
- RESTful API architecture (Node.js/Express)
- MongoDB database with Mongoose ODM
- User authentication service (JWT-based)
- Real-time synchronization capabilities (Socket.io)
- Database indexing for performance optimization

### Data Model (MongoDB Collections)
```javascript
// Users Collection
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
  lastLogin: Date,
  preferences: {
    theme: String,
    defaultDiceRoller: Boolean,
    autoSave: Boolean
  }
}

// Parties Collection
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  name: String,
  description: String,
  characters: [{
    _id: ObjectId,
    name: String,
    ac: Number,
    maxHP: Number,
    currentHP: Number,
    dexterity: Number,
    playerName: String,
    classes: [{
      className: String,
      level: Number
    }],
    race: String,
    subrace: String,
    notes: String
  }],
  createdAt: Date,
  updatedAt: Date
}

// Creatures Collection (Monsters/NPCs)
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  name: String,
  type: String, // "monster", "npc"
  ac: Number,
  maxHP: Number,
  dexterity: Number,
  challengeRating: String,
  legendaryActions: [{
    name: String,
    description: String,
    cost: Number
  }],
  legendaryActionsPerTurn: Number,
  isTemplate: Boolean, // For reusable creatures
  createdAt: Date,
  updatedAt: Date
}

// Encounters Collection
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  name: String,
  description: String,
  status: String, // "planning", "active", "completed", "paused"
  participants: [{
    _id: ObjectId,
    type: String, // "character", "creature"
    referenceId: ObjectId, // Points to character in party or creature
    name: String, // Cached for performance
    ac: Number,
    maxHP: Number,
    currentHP: Number,
    dexterity: Number,
    initiativeRoll: Number,
    initiativeOrder: Number,
    isManuallyOrdered: Boolean,
    conditions: [{
      name: String,
      duration: Number,
      description: String
    }],
    legendaryActionsRemaining: Number,
    notes: String
  }],
  currentTurn: Number,
  round: Number,
  combatLog: [{
    timestamp: Date,
    action: String,
    participantId: ObjectId,
    description: String,
    damage: Number,
    healing: Number
  }],
  createdAt: Date,
  updatedAt: Date
}

// Sessions Collection (for active game sessions)
{
  _id: ObjectId,
  userId: ObjectId,
  encounterId: ObjectId,
  isActive: Boolean,
  lastActivity: Date,
  socketId: String, // For real-time updates
  createdAt: Date
}
```

## Development Phases

### Phase 1 (MVP - 10 weeks)
- Basic party and character management with class/race tracking
- Multiclass support with level tracking
- Simple encounter tracking with legendary action basics
- Initiative order management
- Local data persistence
- Core damage/healing functionality
- Basic legendary action tracking for monsters

### Phase 2 (Enhanced Features - 8 weeks)
- Advanced status effects with class/race specific considerations
- Complex legendary action management
- Encounter templates with legendary creatures
- Data export/import including character builds
- Mobile optimization
- User interface polish
- Class feature reminders and race trait integration

### Phase 3 (Advanced Features - 8 weeks)
- Cloud synchronization
- Multi-user support
- API integrations
- Advanced reporting
- Campaign management tools

## Risk Assessment

### Technical Risks
- Browser compatibility issues with local storage
- Data synchronization conflicts in multi-user scenarios
- Performance degradation with large encounter sizes

### Market Risks
- Competition from established D&D tools
- Changes in D&D rule systems affecting feature relevance
- Limited target market size

### Mitigation Strategies
- Comprehensive browser testing
- Gradual rollout of complex features
- Regular user feedback collection
- Flexible architecture to adapt to rule changes

## Conclusion

The D&D Encounter Tracker will fill a specific need in the tabletop gaming community by providing a focused, reliable tool for combat management. The phased development approach ensures core functionality is delivered quickly while allowing for feature expansion based on user feedback and market demand.