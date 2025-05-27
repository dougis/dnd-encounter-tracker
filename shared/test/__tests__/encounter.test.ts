import {
  Encounter,
  EncounterParticipant,
  Condition,
  Cover,
  ParticipantType,
} from '../../src/types/encounter';

// Mock enums for testing
const ParticipantStatus = {
  ALIVE: 'alive',
  UNCONSCIOUS: 'unconscious',
  STABLE: 'stable',
  DEAD: 'dead',
  PETRIFIED: 'petrified',
  INCAPACITATED: 'incapacitated',
} as const;

const EncounterStatus = {
  PREPARING: 'preparing',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

const LightLevel = {
  BRIGHT: 'bright',
  DIM: 'dim',
  DARK: 'dark',
} as const;

const TerrainType = {
  FOREST: 'forest',
  MOUNTAINS: 'mountains',
  URBAN: 'urban',
  UNDERDARK: 'underdark',
  UNDERWATER: 'underwater',
  ARCTIC: 'arctic',
  COASTAL: 'coastal',
  DESERT: 'desert',
  GRASSLAND: 'grassland',
  SWAMP: 'swamp',
} as const;

const Weather = {
  CLEAR: 'clear',
  LIGHT_RAIN: 'light_rain',
  HEAVY_RAIN: 'heavy_rain',
  STORM: 'storm',
  LIGHT_SNOW: 'light_snow',
  HEAVY_SNOW: 'heavy_snow',
  BLIZZARD: 'blizzard',
  FOG: 'fog',
  WINDY: 'windy',
  EXTREME_HEAT: 'extreme_heat',
  EXTREME_COLD: 'extreme_cold',
} as const;

const TimeOfDay = {
  DAWN: 'dawn',
  DAY: 'day',
  DUSK: 'dusk',
  NIGHT: 'night',
} as const;

const Visibility = {
  CLEAR: 'clear',
  LIGHT: 'light',
  MODERATE: 'moderate',
  HEAVY: 'heavy',
  OBSCURED: 'obscured',
} as const;

const Difficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  DEADLY: 'deadly',
  EXTREME: 'extreme',
} as const;

describe('Encounter Types', () => {
  describe('EncounterParticipant', () => {
    const baseParticipant: EncounterParticipant = {
      id: '1',
      name: 'Goblin',
      type: ParticipantType.NPC,
      initiative: 12,
      dexterity: 14,
      isAlive: true,
      isActive: true,
      isFriendly: false,
      status: 'alive',
      conditions: [],
      health: {
        current: 7,
        max: 7,
        temporary: 0,
      },
      armorClass: 15,
      speed: 30,
      stats: {
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    it('should create a valid participant', () => {
      const participant: EncounterParticipant = {
        ...baseParticipant,
      };

      expect(participant.id).toBe('1');
      expect(participant.name).toBe('Goblin');
      expect(participant.type).toBe(ParticipantType.NPC);
      expect(participant.initiative).toBe(12);
      expect(participant.status).toBe('alive');
      expect(Array.isArray(participant.conditions)).toBe(true);
      expect(participant.health.current).toBe(7);
      expect(participant.health.max).toBe(7);
      expect(participant.armorClass).toBe(15);
      expect(participant.speed).toBe(30);
      expect(participant.isActive).toBe(true);
      expect(participant.isFriendly).toBe(false);
      expect(participant.isAlive).toBe(true);
    });

    it('should handle optional fields', () => {
      const participant: EncounterParticipant = {
        ...baseParticipant,
        description: 'A small, green humanoid',
        notes: 'Hates bright light',
        conditions: [Condition.PRONE, Condition.GRAPPLED],
        stats: {
          ...baseParticipant.stats,
          strength: 10,
        },
        health: {
          ...baseParticipant.health,
          current: 5,
          temporary: 3,
        },
      };

      expect(participant.description).toBe('A small, green humanoid');
      expect(participant.notes).toBe('Hates bright light');
      expect(participant.conditions).toEqual([
        Condition.PRONE,
        Condition.GRAPPLED,
      ]);
      expect(participant.stats.strength).toBe(10);
      expect(participant.health.current).toBe(5);
      expect(participant.health.temporary).toBe(3);
    });
  });

  describe('Encounter', () => {
    const baseEncounter: Encounter = {
      _id: 'enc-1',
      userId: 'user-1',
      id: 'enc-1',
      name: 'Goblin Ambush',
      description: 'A group of goblins ambushes the party',
      status: EncounterStatus.PREPARING,
      currentRound: 0,
      currentTurn: 0,
      turnOrder: [],
      participants: new Map([
        ['1', {
          id: '1',
          name: 'Goblin',
          type: ParticipantType.NPC,
          initiative: 12,
          dexterity: 14,
          isAlive: true,
          isActive: true,
          isFriendly: false,
          status: 'alive',
          conditions: [],
          health: {
            current: 7,
            max: 7,
            temporary: 0,
          },
          armorClass: 15,
          speed: 30,
          stats: {
            strength: 8,
            dexterity: 14,
            constitution: 10,
            intelligence: 10,
            wisdom: 8,
            charisma: 8,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      ]),
      environment: {
        lightLevel: LightLevel.DIM,
        terrain: [TerrainType.FOREST],
        weather: Weather.CLEAR,
        timeOfDay: TimeOfDay.DUSK,
        cover: {
          '1': 2, // Half cover
        },
        visibility: Visibility.MODERATE,
        difficulty: Difficulty.MEDIUM,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should create a valid encounter', () => {
      const encounter: Encounter = {
        ...baseEncounter,
      };

      expect(encounter.id).toBe('enc-1');
      expect(encounter.name).toBe('Goblin Ambush');
      expect(encounter.status).toBe(EncounterStatus.PREPARING);
      expect(encounter.currentRound).toBe(0);
      expect(encounter.currentTurn).toBe(0);
      expect(encounter.turnOrder).toEqual([]);
      expect(encounter.participants).toBeInstanceOf(Map);
      expect(encounter.environment.lightLevel).toBe(LightLevel.DIM);
      expect(encounter.environment.terrain).toEqual([TerrainType.FOREST]);
      expect(encounter.environment.weather).toBe(Weather.CLEAR);
      expect(encounter.environment.timeOfDay).toBe(TimeOfDay.DUSK);
      expect(Object.keys(encounter.environment.cover || {}).length).toBe(1);
      expect(encounter.environment.visibility).toBe(Visibility.MODERATE);
      expect(encounter.environment.difficulty).toBe(Difficulty.MEDIUM);
    });

    it('should handle optional fields', () => {
      const encounter: Encounter = {
        ...baseEncounter,
        notes: 'The goblins are led by a bugbear',
        status: EncounterStatus.ACTIVE,
        currentRound: 2,
        currentTurn: 1,
        turnOrder: ['1', '2', '3'],
        environment: {
          ...baseEncounter.environment,
          description: 'A narrow forest path',
          hazards: [
            {
              id: '1',
              name: 'Slippery rocks',
              type: 'environmental',
              description: 'Slippery rocks that are difficult to walk on',
              effect: 'Difficult terrain, DC 12 Acrobatics check or fall prone',
              isActive: true,
              isVisible: true
            },
            {
              id: '2',
              name: 'Hidden roots',
              type: 'environmental',
              description: 'Roots hidden under leaves',
              effect: 'DC 10 Perception check to spot, else Dexterity save or fall prone',
              isActive: true,
              isVisible: false
            }
          ],
        },
      };

      expect(encounter.notes).toBe('The goblins are led by a bugbear');
      expect(encounter.status).toBe(EncounterStatus.ACTIVE);
      expect(encounter.currentRound).toBe(2);
      expect(encounter.currentTurn).toBe(1);
      expect(encounter.turnOrder).toEqual(['1', '2', '3']);
      expect(encounter.environment.description).toBe('A narrow forest path');
      expect(encounter.environment.hazards).toEqual([
        {
          id: '1',
          name: 'Slippery rocks',
          type: 'environmental',
          description: 'Slippery rocks that are difficult to walk on',
          effect: 'Difficult terrain, DC 12 Acrobatics check or fall prone',
          isActive: true,
          isVisible: true
        },
        {
          id: '2',
          name: 'Hidden roots',
          type: 'environmental',
          description: 'Roots hidden under leaves',
          effect: 'DC 10 Perception check to spot, else Dexterity save or fall prone',
          isActive: true,
          isVisible: false
        }
      ]);
    });
  });

  describe('Enums', () => {
    it('should have correct ParticipantType values', () => {
      expect(ParticipantType.CHARACTER).toBe('character');
      expect(ParticipantType.NPC).toBe('npc');
      expect(ParticipantType.CREATURE).toBe('creature');
      expect(ParticipantType.HAZARD).toBe('hazard');
      expect(ParticipantType.TRAP).toBe('trap');
      expect(ParticipantType.OTHER).toBe('other');
    });

    it('should have correct EncounterStatus values', () => {
      expect(EncounterStatus.PREPARING).toBe('preparing');
      expect(EncounterStatus.ACTIVE).toBe('active');
      expect(EncounterStatus.PAUSED).toBe('paused');
      expect(EncounterStatus.COMPLETED).toBe('completed');
    });

    it('should have correct Condition values', () => {
      expect(Condition.BLINDED).toBe('blinded');
      expect(Condition.CHARMED).toBe('charmed');
      expect(Condition.DEAFENED).toBe('deafened');
      // Test a few more conditions
      expect(Condition.FRIGHTENED).toBe('frightened');
      expect(Condition.GRAPPLED).toBe('grappled');
      expect(Condition.INVISIBLE).toBe('invisible');
    });
  });
});
