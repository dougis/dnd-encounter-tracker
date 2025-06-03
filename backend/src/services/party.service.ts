import { Types } from 'mongoose'
import { Party, PartyDocument } from '../models/Party.model'
import { 
  Party as IParty,
  Character,
  CreatePartyInput,
  UpdatePartyInput,
  AddCharacterToPartyInput,
  UpdateCharacterInPartyInput
} from '@dnd-encounter-tracker/shared'
import { AppError } from '../middleware/error.middleware'
import { UserService } from './user.service'

export class PartyService {
  /**
   * Create a new party
   */
  static async create(userId: string, partyData: CreatePartyInput): Promise<PartyDocument> {
    try {
      // Check user's party limit
      const user = await UserService.findById(userId)
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      // Check party limit
      const maxParties = user.features?.maxParties || 1
      if (maxParties !== -1) {
        const currentCount = await Party.countDocuments({ userId })
        if (currentCount >= maxParties) {
          throw new AppError(
            `You have reached the maximum limit of ${maxParties} parties. Please upgrade your subscription to create more.`,
            403,
            'PARTY_LIMIT_EXCEEDED'
          )
        }
      }

      // Create party
      const party = new Party({
        userId,
        name: partyData.name,
        description: partyData.description,
        characters: partyData.characters?.map(char => ({
          ...char,
          _id: new Types.ObjectId().toString()
        })) || []
      })

      await party.save()

      // Update user usage
      await UserService.incrementUsage(userId, 'partiesCreated')

      return party
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to create party', 500, 'PARTY_CREATION_FAILED')
    }
  }

  /**
   * Get all parties for a user
   */
  static async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ parties: PartyDocument[], total: number, pages: number }> {
    try {
      if (search) {
        const parties = await Party.searchByUser(userId, search)
        return {
          parties,
          total: parties.length,
          pages: 1
        }
      }

      const skip = (page - 1) * limit
      const [parties, total] = await Promise.all([
        Party.findByUserWithPagination(userId, page, limit),
        Party.countDocuments({ userId })
      ])

      return {
        parties,
        total,
        pages: Math.ceil(total / limit)
      }
    } catch (error) {
      throw new AppError('Failed to fetch parties', 500, 'PARTIES_FETCH_FAILED')
    }
  }

  /**
   * Get party by ID
   */
  static async findById(partyId: string, userId: string): Promise<PartyDocument> {
    try {
      if (!Types.ObjectId.isValid(partyId)) {
        throw new AppError('Invalid party ID', 400, 'INVALID_PARTY_ID')
      }

      const party = await Party.findOne({ _id: partyId, userId })
      if (!party) {
        throw new AppError('Party not found', 404, 'PARTY_NOT_FOUND')
      }

      return party
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to find party', 500, 'PARTY_FIND_FAILED')
    }
  }

  /**
   * Update party
   */
  static async update(
    partyId: string,
    userId: string,
    updateData: UpdatePartyInput
  ): Promise<PartyDocument> {
    try {
      const party = await this.findById(partyId, userId)

      // Update party fields
      if (updateData.name !== undefined) {
        party.name = updateData.name
      }
      if (updateData.description !== undefined) {
        party.description = updateData.description
      }
      if (updateData.characters !== undefined) {
        party.characters = updateData.characters
      }

      await party.save()
      return party
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to update party', 500, 'PARTY_UPDATE_FAILED')
    }
  }

  /**
   * Delete party
   */
  static async delete(partyId: string, userId: string): Promise<void> {
    try {
      const party = await this.findById(partyId, userId)
      await Party.findByIdAndDelete(party._id)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to delete party', 500, 'PARTY_DELETE_FAILED')
    }
  }

  /**
   * Add character to party
   */
  static async addCharacter(
    partyId: string,
    userId: string,
    characterData: AddCharacterToPartyInput
  ): Promise<PartyDocument> {
    try {
      const party = await this.findById(partyId, userId)

      // Check character limit (reasonable limit)
      if (party.characters.length >= 20) {
        throw new AppError('Party cannot have more than 20 characters', 400, 'CHARACTER_LIMIT_EXCEEDED')
      }

      // Add character with new ID
      const character: Character = {
        ...characterData,
        _id: new Types.ObjectId().toString()
      }

      party.characters.push(character)
      await party.save()

      return party
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to add character', 500, 'CHARACTER_ADD_FAILED')
    }
  }

  /**
   * Update character in party
   */
  static async updateCharacter(
    partyId: string,
    userId: string,
    characterId: string,
    updateData: UpdateCharacterInPartyInput
  ): Promise<PartyDocument> {
    try {
      const party = await this.findById(partyId, userId)

      const characterIndex = party.characters.findIndex(char => char._id === characterId)
      if (characterIndex === -1) {
        throw new AppError('Character not found in party', 404, 'CHARACTER_NOT_FOUND')
      }

      // Update character
      Object.assign(party.characters[characterIndex], updateData)
      await party.save()

      return party
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to update character', 500, 'CHARACTER_UPDATE_FAILED')
    }
  }

  /**
   * Remove character from party
   */
  static async removeCharacter(
    partyId: string,
    userId: string,
    characterId: string
  ): Promise<PartyDocument> {
    try {
      const party = await this.findById(partyId, userId)

      const characterIndex = party.characters.findIndex(char => char._id === characterId)
      if (characterIndex === -1) {
        throw new AppError('Character not found in party', 404, 'CHARACTER_NOT_FOUND')
      }

      party.characters.splice(characterIndex, 1)
      await party.save()

      return party
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to remove character', 500, 'CHARACTER_REMOVE_FAILED')
    }
  }

  /**
   * Update character health
   */
  static async updateCharacterHealth(
    partyId: string,
    userId: string,
    characterId: string,
    currentHP: number,
    maxHP?: number
  ): Promise<PartyDocument> {
    try {
      const updateData: Partial<Character> = { currentHP }
      if (maxHP !== undefined) {
        updateData.maxHP = maxHP
      }

      return await this.updateCharacter(partyId, userId, characterId, updateData)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to update character health', 500, 'CHARACTER_HEALTH_UPDATE_FAILED')
    }
  }

  /**
   * Get party statistics
   */
  static async getPartyStats(partyId: string, userId: string): Promise<{
    characterCount: number
    totalLevel: number
    averageLevel: number
    averageAC: number
    totalHP: number
    averageHP: number
  }> {
    try {
      const party = await this.findById(partyId, userId)

      const stats = {
        characterCount: party.characters.length,
        totalLevel: 0,
        averageLevel: 0,
        averageAC: 0,
        totalHP: 0,
        averageHP: 0
      }

      if (party.characters.length === 0) {
        return stats
      }

      // Calculate statistics
      stats.totalLevel = party.characters.reduce((sum, char) => {
        return sum + char.classes.reduce((classSum, cls) => classSum + cls.level, 0)
      }, 0)

      stats.averageLevel = Math.round(stats.totalLevel / party.characters.length)

      stats.averageAC = Math.round(
        party.characters.reduce((sum, char) => sum + char.ac, 0) / party.characters.length
      )

      stats.totalHP = party.characters.reduce((sum, char) => sum + char.maxHP, 0)
      stats.averageHP = Math.round(stats.totalHP / party.characters.length)

      return stats
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to get party statistics', 500, 'PARTY_STATS_FAILED')
    }
  }

  /**
   * Search parties by name or description
   */
  static async search(
    userId: string,
    searchTerm: string,
    limit: number = 10
  ): Promise<PartyDocument[]> {
    try {
      const parties = await Party.searchByUser(userId, searchTerm).limit(limit)
      return parties
    } catch (error) {
      throw new AppError('Failed to search parties', 500, 'PARTY_SEARCH_FAILED')
    }
  }

  /**
   * Import characters from another party
   */
  static async importCharacters(
    targetPartyId: string,
    sourcePartyId: string,
    userId: string,
    characterIds: string[]
  ): Promise<PartyDocument> {
    try {
      const [targetParty, sourceParty] = await Promise.all([
        this.findById(targetPartyId, userId),
        this.findById(sourcePartyId, userId)
      ])

      // Find characters to import
      const charactersToImport = sourceParty.characters.filter(char =>
        characterIds.includes(char._id)
      )

      if (charactersToImport.length === 0) {
        throw new AppError('No valid characters found to import', 400, 'NO_CHARACTERS_TO_IMPORT')
      }

      // Check if importing would exceed character limit
      if (targetParty.characters.length + charactersToImport.length > 20) {
        throw new AppError(
          'Importing these characters would exceed the party size limit of 20',
          400,
          'CHARACTER_LIMIT_EXCEEDED'
        )
      }

      // Add characters with new IDs
      const newCharacters = charactersToImport.map(char => ({
        ...char.toObject(),
        _id: new Types.ObjectId().toString()
      }))

      targetParty.characters.push(...newCharacters)
      await targetParty.save()

      return targetParty
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to import characters', 500, 'CHARACTER_IMPORT_FAILED')
    }
  }

  /**
   * Export party data
   */
  static async exportParty(partyId: string, userId: string): Promise<any> {
    try {
      const party = await this.findById(partyId, userId)

      return {
        name: party.name,
        description: party.description,
        characters: party.characters.map(char => ({
          name: char.name,
          race: char.race,
          subrace: char.subrace,
          classes: char.classes,
          playerName: char.playerName,
          ac: char.ac,
          maxHP: char.maxHP,
          currentHP: char.currentHP,
          dexterity: char.dexterity,
          notes: char.notes
        })),
        exportedAt: new Date().toISOString(),
        exportedBy: userId
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to export party', 500, 'PARTY_EXPORT_FAILED')
    }
  }
}

export default PartyService