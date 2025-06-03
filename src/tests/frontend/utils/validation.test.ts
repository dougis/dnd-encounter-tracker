import { validateEncounter, validateParty, validateCharacter } from '@/utils/validation';

describe('Validation Utils', () => {
  describe('validateCharacter', () => {
    test('should validate a valid character', () => {
      const character = {
        name: 'Thorgrim',
        ac: 18,
        maxHP: 95,
        currentHP: 95,
        dexterity: 12,
        classes: [{ className: 'Fighter', level: 8 }],
        race: 'Dwarf',
      };
      
      const result = validateCharacter(character);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(character);
    });

    test('should return error for invalid character name', () => {
      const character = {
        name: '', // Empty name
        ac: 18,
        maxHP: 95,
        currentHP: 95,
        dexterity: 12,
        classes: [{ className: 'Fighter', level: 8 }],
        race: 'Dwarf',
      };
      
      const result = validateCharacter(character);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('name');
    });

    test('should return error for invalid AC value', () => {
      const character = {
        name: 'Thorgrim',
        ac: 31, // AC too high
        maxHP: 95,
        currentHP: 95,
        dexterity: 12,
        classes: [{ className: 'Fighter', level: 8 }],
        race: 'Dwarf',
      };
      
      const result = validateCharacter(character);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('ac');
    });

    test('should return error when currentHP > maxHP', () => {
      const character = {
        name: 'Thorgrim',
        ac: 18,
        maxHP: 95,
        currentHP: 100, // Higher than maxHP
        dexterity: 12,
        classes: [{ className: 'Fighter', level: 8 }],
        race: 'Dwarf',
      };
      
      const result = validateCharacter(character);
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('currentHP cannot exceed maxHP');
    });

    test('should return error for invalid class level', () => {
      const character = {
        name: 'Thorgrim',
        ac: 18,
        maxHP: 95,
        currentHP: 95,
        dexterity: 12,
        classes: [{ className: 'Fighter', level: 25 }], // Level too high
        race: 'Dwarf',
      };
      
      const result = validateCharacter(character);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('classes.0.level');
    });
  });

  describe('validateParty', () => {
    test('should validate a valid party', () => {
      const party = {
        name: 'The Crimson Companions',
        description: 'A band of heroes',
        characters: [
          {
            name: 'Thorgrim',
            ac: 18,
            maxHP: 95,
            currentHP: 95,
            dexterity: 12,
            classes: [{ className: 'Fighter', level: 8 }],
            race: 'Dwarf',
          }
        ]
      };
      
      const result = validateParty(party);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(party);
    });

    test('should return error for invalid party name', () => {
      const party = {
        name: '', // Empty name
        description: 'A band of heroes',
        characters: []
      };
      
      const result = validateParty(party);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('name');
    });

    test('should return error for invalid character in party', () => {
      const party = {
        name: 'The Crimson Companions',
        description: 'A band of heroes',
        characters: [
          {
            name: 'Thorgrim',
            ac: 0, // Invalid AC
            maxHP: 95,
            currentHP: 95,
            dexterity: 12,
            classes: [{ className: 'Fighter', level: 8 }],
            race: 'Dwarf',
          }
        ]
      };
      
      const result = validateParty(party);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('characters.0.ac');
    });
  });

  describe('validateEncounter', () => {
    test('should validate a valid encounter', () => {
      const encounter = {
        name: 'Dragon Lair Showdown',
        description: 'Final battle',
        status: 'planning',
        participants: []
      };
      
      const result = validateEncounter(encounter);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(encounter);
    });

    test('should return error for invalid encounter name', () => {
      const encounter = {
        name: '', // Empty name
        description: 'Final battle',
        status: 'planning',
        participants: []
      };
      
      const result = validateEncounter(encounter);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('name');
    });

    test('should return error for invalid encounter status', () => {
      const encounter = {
        name: 'Dragon Lair Showdown',
        description: 'Final battle',
        status: 'invalid', // Invalid status
        participants: []
      };
      
      const result = validateEncounter(encounter);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('status');
    });
  });
});
