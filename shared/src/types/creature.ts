export interface Creature {
  _id: string;
  userId?: string; // null for global templates
  name: string;
  type: 'monster' | 'npc';
  size?: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
  alignment?: string;
  armorClass: number;
  armorType?: string;
  hitPoints: number;
  hitDice?: string;
  speed?: {
    walk?: string;
    burrow?: string;
    climb?: string;
    fly?: string;
    swim?: string;
  };
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
  skills?: {
    [key: string]: number;
  };
  damageVulnerabilities?: string[];
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  senses?: {
    darkvision?: string;
    blindsight?: string;
    tremorsense?: string;
    truesight?: string;
    passivePerception: number;
  };
  languages?: string[];
  challengeRating?: string;
  xp?: number;
  specialAbilities?: Ability[];
  actions?: Ability[];
  legendaryActions?: Ability[];
  legendaryActionPoints?: number;
  reactions?: Ability[];
  isLegendary?: boolean;
  isMythic?: boolean;
  isLair?: boolean;
  isSwarm?: boolean;
  swarmSize?: string;
  isTemplate?: boolean;
  source?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ability {
  name: string;
  description: string;
  attackBonus?: number;
  damageDice?: string;
  damageType?: string;
  dcType?: string;
  dcValue?: number;
  dcSuccess?: string;
  usage?: {
    type: 'rechargeOnRoll' | 'perDay' | 'rechargeAfterRest' | 'rechargeOnTick' | 'atWill';
    times?: number;
    minRoll?: number;
    restTypes?: ('short' | 'long')[];
  };
  isAttack?: boolean;
  isLegacy?: boolean;
  isMythic?: boolean;
  isLair?: boolean;
  isReaction?: boolean;
  isBonusAction?: boolean;
  isAction?: boolean;
  isMultiattack?: boolean;
  isLegendaryAction?: boolean;
  legendaryActionCost?: number;
}

export interface CreateCreatureInput extends Omit<Creature, '_id' | 'createdAt' | 'updatedAt' | 'userId'> {
  userId?: string;
}

export interface UpdateCreatureInput extends Partial<Omit<Creature, '_id' | 'createdAt' | 'updatedAt' | 'userId'>> {}

export interface CreatureFilter {
  search?: string;
  type?: 'monster' | 'npc';
  challengeRating?: string;
  size?: string;
  tags?: string[];
  isTemplate?: boolean;
  userId?: string | null; // null for global templates
}

export interface CreaturePagination {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
