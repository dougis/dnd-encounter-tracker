import request from 'supertest';
import { app } from '@/app';
import { Encounter } from '@/models/Encounter.model';
import { Party } from '@/models/Party.model';
import { Creature } from '@/models/Creature.model';

// Mock models
jest.mock('@/models/Encounter.model', () => ({
  Encounter: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  }
}));

jest.mock('@/models/Party.model', () => ({
  Party: {
    findById: jest.fn(),
  }
}));

jest.mock('@/models/Creature.model', () => ({
  Creature: {
    findById: jest.fn(),
  }
}));

// Mock authentication middleware
jest.mock('@/middleware/auth.middleware', () => ({
  authenticateToken: (req, res, next) => {
    req.user = {
      _id: 'user123',
      username: 'testuser',
      subscription: {
        tier: 'premium',
        status: 'active'
      },
      features: {
        maxEncounters: 50,
        maxParticipantsPerEncounter: 20
      },
      usage: {
        encountersCreated: 10
      }
    };
    next();
  }
}));

describe('Encounter Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/encounters', () => {
    test('should return user encounters', async () => {
      const mockEncounters = [
        {
          _id: 'encounter1',
          name: 'Dragon Lair Showdown',
          status: 'active',
          participants: [],
          currentTurn: 0,
          round: 1
        },
        {
          _id: 'encounter2',
          name: 'Goblin Ambush',
          status: 'completed',
          participants: [],
          currentTurn: 0,
          round: 3
        }
      ];

      (Encounter.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockEncounters)
          })
        })
      });

      (Encounter.countDocuments as jest.Mock).mockResolvedValue(2);

      const res = await request(app)
        .get('/api/v1/encounters')
        .set('Authorization', 'Bearer mock_token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.encounters).toHaveLength(2);
      expect(res.body.data.encounters[0].name).toBe('Dragon Lair Showdown');
      expect(res.body.meta.pagination).toBeDefined();
    });

    test('should filter encounters by status', async () => {
      const mockEncounters = [
        {
          _id: 'encounter1',
          name: 'Dragon Lair Showdown',
          status: 'active',
          participants: [],
          currentTurn: 0,
          round: 1
        }
      ];

      (Encounter.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockEncounters)
          })
        })
      });

      (Encounter.countDocuments as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/encounters?status=active')
        .set('Authorization', 'Bearer mock_token');

      expect(res.status).toBe(200);
      expect(res.body.data.encounters).toHaveLength(1);
      expect(Encounter.find).toHaveBeenCalledWith(
        expect.objectContaining({ 
          userId: 'user123',
          status: 'active'
        })
      );
    });
  });

  describe('POST /api/v1/encounters', () => {
    test('should create a new encounter', async () => {
      const mockEncounter = {
        _id: 'encounter1',
        userId: 'user123',
        name: 'Dragon Lair Showdown',
        description: 'Final battle',
        status: 'planning',
        participants: [],
        currentTurn: 0,
        round: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (Encounter.create as jest.Mock).mockResolvedValue(mockEncounter);
      (Encounter.countDocuments as jest.Mock).mockResolvedValue(10); // Current count before adding

      const res = await request(app)
        .post('/api/v1/encounters')
        .set('Authorization', 'Bearer mock_token')
        .send({
          name: 'Dragon Lair Showdown',
          description: 'Final battle',
          status: 'planning'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.encounter).toBeDefined();
      expect(res.body.data.encounter.name).toBe('Dragon Lair Showdown');
    });

    test('should return 400 for invalid encounter data', async () => {
      const res = await request(app)
        .post('/api/v1/encounters')
        .set('Authorization', 'Bearer mock_token')
        .send({
          name: '', // Invalid name
          status: 'invalid_status' // Invalid status
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should return 403 when user has reached encounter limit', async () => {
      (Encounter.countDocuments as jest.Mock).mockResolvedValue(50); // Already at max

      const res = await request(app)
        .post('/api/v1/encounters')
        .set('Authorization', 'Bearer mock_token')
        .send({
          name: 'Dragon Lair Showdown',
          description: 'Final battle',
          status: 'planning'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USAGE_LIMIT_EXCEEDED');
    });
  });

  describe('GET /api/v1/encounters/:encounterId', () => {
    test('should return encounter details', async () => {
      const mockEncounter = {
        _id: 'encounter1',
        userId: 'user123',
        name: 'Dragon Lair Showdown',
        description: 'Final battle',
        status: 'active',
        participants: [
          {
            _id: 'participant1',
            name: 'Thorgrim',
            type: 'character',
            ac: 18,
            maxHP: 95,
            currentHP: 85,
            initiativeRoll: 15
          }
        ],
        currentTurn: 0,
        round: 1
      };

      (Encounter.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEncounter)
      });

      const res = await request(app)
        .get('/api/v1/encounters/encounter1')
        .set('Authorization', 'Bearer mock_token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.encounter).toBeDefined();
      expect(res.body.data.encounter.name).toBe('Dragon Lair Showdown');
      expect(res.body.data.encounter.participants).toHaveLength(1);
    });

    test('should return 404 when encounter not found', async () => {
      (Encounter.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app)
        .get('/api/v1/encounters/nonexistent')
        .set('Authorization', 'Bearer mock_token');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ENCOUNTER_NOT_FOUND');
    });
  });

  describe('POST /api/v1/encounters/:encounterId/start', () => {
    test('should start an encounter and roll initiative', async () => {
      const mockEncounter = {
        _id: 'encounter1',
        userId: 'user123',
        name: 'Dragon Lair Showdown',
        description: 'Final battle',
        status: 'planning',
        participants: [
          {
            _id: 'participant1',
            name: 'Thorgrim',
            type: 'character',
            ac: 18,
            maxHP: 95,
            currentHP: 85,
            dexterity: 12
          },
          {
            _id: 'participant2',
            name: 'Dragon',
            type: 'creature',
            ac: 22,
            maxHP: 546,
            currentHP: 546,
            dexterity: 10
          }
        ],
        currentTurn: 0,
        round: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      (Encounter.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEncounter)
      });

      const res = await request(app)
        .post('/api/v1/encounters/encounter1/start')
        .set('Authorization', 'Bearer mock_token')
        .send({ autoRoll: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockEncounter.status).toBe('active');
      expect(mockEncounter.round).toBe(1);
      expect(mockEncounter.participants[0].initiativeRoll).toBeDefined();
      expect(mockEncounter.participants[1].initiativeRoll).toBeDefined();
      expect(mockEncounter.save).toHaveBeenCalled();
    });

    test('should return 404 when encounter not found', async () => {
      (Encounter.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app)
        .post('/api/v1/encounters/nonexistent/start')
        .set('Authorization', 'Bearer mock_token')
        .send({ autoRoll: true });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/encounters/:encounterId/next-turn', () => {
    test('should advance to the next turn', async () => {
      const mockEncounter = {
        _id: 'encounter1',
        userId: 'user123',
        name: 'Dragon Lair Showdown',
        description: 'Final battle',
        status: 'active',
        participants: [
          {
            _id: 'participant1',
            name: 'Thorgrim',
            initiativeOrder: 0
          },
          {
            _id: 'participant2',
            name: 'Dragon',
            initiativeOrder: 1
          }
        ],
        currentTurn: 0,
        round: 1,
        save: jest.fn().mockResolvedValue(true)
      };

      (Encounter.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEncounter)
      });

      const res = await request(app)
        .post('/api/v1/encounters/encounter1/next-turn')
        .set('Authorization', 'Bearer mock_token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockEncounter.currentTurn).toBe(1); // Advanced to next turn
      expect(mockEncounter.round).toBe(1); // Round unchanged
      expect(mockEncounter.save).toHaveBeenCalled();
    });

    test('should advance to the next round when at the last participant', async () => {
      const mockEncounter = {
        _id: 'encounter1',
        userId: 'user123',
        name: 'Dragon Lair Showdown',
        description: 'Final battle',
        status: 'active',
        participants: [
          {
            _id: 'participant1',
            name: 'Thorgrim',
            initiativeOrder: 0
          },
          {
            _id: 'participant2',
            name: 'Dragon',
            initiativeOrder: 1
          }
        ],
        currentTurn: 1, // Last participant
        round: 1,
        save: jest.fn().mockResolvedValue(true)
      };

      (Encounter.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEncounter)
      });

      const res = await request(app)
        .post('/api/v1/encounters/encounter1/next-turn')
        .set('Authorization', 'Bearer mock_token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockEncounter.currentTurn).toBe(0); // Back to first participant
      expect(mockEncounter.round).toBe(2); // Advanced to next round
      expect(mockEncounter.save).toHaveBeenCalled();
    });
  });
});
