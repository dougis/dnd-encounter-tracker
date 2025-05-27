import { Character } from './party';
import { Creature } from './creature';

export enum ParticipantType {
  CHARACTER = 'character',
  CREATURE = 'creature',
  NPC = 'npc',
  HAZARD = 'hazard',
  TRAP = 'trap',
  OTHER = 'other'
}

export enum Condition {
  BLINDED = 'blinded',
  CHARMED = 'charmed',
  DEAFENED = 'deafened',
  EXHAUSTION = 'exhaustion',
  FRIGHTENED = 'frightened',
  GRAPPLED = 'grappled',
  INCAPACITATED = 'incapacitated',
  INVISIBLE = 'invisible',
  PARALYZED = 'paralyzed',
  PETRIFIED = 'petrified',
  POISONED = 'poisoned',
  PRONE = 'prone',
  RESTRAINED = 'restrained',
  STUNNED = 'stunned',
  UNCONSCIOUS = 'unconscious'
}

export enum Cover {
  NONE = 'none',
  HALF = 'half',
  THREE_QUARTERS = 'three-quarters',
  FULL = 'full'
}

export interface ParticipantFeatures {
  [key: string]: any;
}

export interface ParticipantActions {
  [key: string]: {
    name: string;
    type: string;
    description: string;
    uses?: number;
    maxUses?: number;
    range?: number;
    attackBonus?: number;
    damageDice?: string;
    damageType?: string;
    dc?: number;
    saveType?: string;
  };
}

export interface ParticipantInventory {
  [key: string]: {
    name: string;
    quantity: number;
    weight: number;
    description?: string;
    attunement?: boolean;
    equipped?: boolean;
  };
}

export interface ParticipantSpells {
  [key: string]: {
    name: string;
    level: number;
    school: string;
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    description: string;
    prepared: boolean;
    used: boolean;
  };
}

export type ParticipantConditions = string[];

export interface ParticipantEffects {
  [key: string]: {
    name: string;
    description: string;
    duration: string;
    remaining?: number; // in rounds
    source?: string;
  };
}

export interface ParticipantNotes {
  [key: string]: string;
}

export interface ParticipantMetadata {
  [key: string]: any;
}

export interface ParticipantRelationships {
  [key: string]: {
    type: string;
    description: string;
  };
}

export interface ParticipantVisibility {
  [key: string]: boolean;
}

export enum ParticipantInitiativeStatus {
  READY = 'ready',
  DELAYED = 'delayed',
  HELD = 'held',
  SURPRISED = 'surprised'
}

export enum ParticipantTurnStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

export enum ParticipantActionStatus {
  AVAILABLE = 'available',
  USED = 'used',
  UNAVAILABLE = 'unavailable'
}

export enum ParticipantReactionStatus {
  AVAILABLE = 'available',
  USED = 'used'
}

export enum ParticipantConcentrationStatus {
  NONE = 'none',
  CONCENTRATING = 'concentrating',
  BROKEN = 'broken'
}

export interface ParticipantDeathSaves {
  successes: number;
  failures: number;
}

export interface Encounter {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'preparing' | 'active' | 'completed' | 'paused';
  currentRound: number;
  currentTurn: number;
  turnOrder: string[]; // Array of participant IDs in initiative order
  participants: Map<string, EncounterParticipant>;
  id: string;
  environment: {
    lighting?: 'bright' | 'dim' | 'darkness' | 'magical_darkness';
    lightLevel?: 'bright' | 'dim' | 'dark';
    timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';
    visibility?: 'clear' | 'light' | 'moderate' | 'heavy' | 'obscured';
    difficulty?: 'easy' | 'medium' | 'hard' | 'deadly' | 'extreme';
    terrain?: string[];
    weather?: string;
    elevation?: string;
    cover?: Record<string, number>; // Map of participant IDs to cover bonus
    notes?: string;
    description?: string;
    hazards?: Array<{
      id: string;
      name: string;
      type: string;
      description: string;
      effect: string;
      damage?: string;
      save?: {
        ability: string;
        dc: number;
        saveSuccess: string;
        saveFail: string;
      };
      isActive: boolean;
      isVisible: boolean;
      position?: {
        x: number;
        y: number;
      };
    }>;
  };
  mapUrl?: string;
  mapGridSize?: number; // Size of grid squares in feet
  mapDimensions?: {
    width: number; // in grid squares
    height: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  isFavorite?: boolean;
  tags?: string[];
  partyId?: string;
}

export interface EncounterParticipant {
  id: string;
  type: 'character' | 'creature' | 'npc' | 'hazard' | 'trap' | 'other';
  name: string;
  description?: string;
  referenceId?: string; // ID of the character or creature in their respective collections
  initiative: number;
  dexterity: number; // For tie-breaking
  isSurprised?: boolean;
  isHidden?: boolean;
  isPlayerCharacter?: boolean;
  isActive?: boolean;
  isFriendly?: boolean;
  isAlive?: boolean;
  isConcentrating?: boolean;
  concentrationSpell?: string;
  concentrationDC?: number;
  conditions: string[];
  status: 'alive' | 'unconscious' | 'dead' | 'stable' | 'dying';
  health: {
    current: number;
    max: number;
    temporary: number;
  };
  armorClass: number;
  speed: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  savingThrows?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  conditionImmunities?: string[];
  legendaryActions?: number;
  legendaryResistances?: number;
  reactions?: boolean;
  notes?: string;
  avatarUrl?: string;
  tokenUrl?: string;
  x?: number; // Position on map grid
  y?: number; // Position on map grid
  size?: number; // Size in grid squares (default 1)
  layer?: number; // For stacking tokens
  isLocked?: boolean; // Prevent accidental movement
  isVisible?: boolean; // GM visibility
  isPlayerVisible?: boolean; // Player visibility
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEncounterInput {
  name: string;
  description?: string;
  status?: 'preparing' | 'active' | 'completed' | 'paused';
  participants?: Record<string, Omit<EncounterParticipant, 'id' | 'createdAt' | 'updatedAt'>>;
  environment?: {
    lighting?: 'bright' | 'dim' | 'darkness' | 'magical_darkness';
    lightLevel?: 'bright' | 'dim' | 'dark';
    timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';
    visibility?: 'clear' | 'light' | 'moderate' | 'heavy' | 'obscured';
    difficulty?: 'easy' | 'medium' | 'hard' | 'deadly' | 'extreme';
    terrain?: string[];
    weather?: string;
    elevation?: string;
    cover?: Record<string, number>;
    notes?: string;
    description?: string;
    hazards?: Array<{
      id: string;
      name: string;
      type: string;
      description: string;
      effect: string;
      damage?: string;
      save?: {
        ability: string;
        dc: number;
        saveSuccess: string;
        saveFail: string;
      };
      isActive: boolean;
      isVisible: boolean;
      position?: {
        x: number;
        y: number;
      };
    }>;
  };
  mapUrl?: string;
  mapGridSize?: number;
  mapDimensions?: {
    width: number;
    height: number;
  };
  notes?: string;
  tags?: string[];
  partyId?: string;
}
