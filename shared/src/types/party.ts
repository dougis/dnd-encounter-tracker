export interface Party {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  characters: Character[];
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  _id: string;
  name: string;
  ac: number; // Armor Class (1-30)
  maxHP: number;
  currentHP: number;
  dexterity: number; // Dexterity score (1-30)
  playerName?: string;
  classes: CharacterClass[];
  race: string;
  subrace?: string;
  notes?: string;
}

export interface CharacterClass {
  className: string;
  level: number;
}

export interface CreatePartyInput {
  name: string;
  description?: string;
  characters?: Omit<Character, '_id'>[];
}

export interface UpdatePartyInput {
  name?: string;
  description?: string | null;
  characters?: Character[];
}

export interface AddCharacterToPartyInput extends Omit<Character, '_id'> {}

export interface UpdateCharacterInPartyInput extends Partial<Omit<Character, '_id' | 'classes'>> {
  _id: string;
  classes?: CharacterClass[];
}
