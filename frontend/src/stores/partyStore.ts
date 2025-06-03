import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  Party, 
  Character, 
  CreatePartyInput, 
  UpdatePartyInput 
} from '@dnd-encounter-tracker/shared'

interface PartyState {
  parties: Party[]
  activeParty: Party | null
  isLoading: boolean
  error: string | null
}

interface PartyActions {
  // Party management
  setParties: (parties: Party[]) => void
  addParty: (party: Party) => void
  updateParty: (partyId: string, updates: Partial<Party>) => void
  deleteParty: (partyId: string) => void
  setActiveParty: (party: Party | null) => void
  
  // Character management
  addCharacter: (partyId: string, character: Character) => void
  updateCharacter: (partyId: string, characterId: string, updates: Partial<Character>) => void
  removeCharacter: (partyId: string, characterId: string) => void
  updateCharacterHealth: (partyId: string, characterId: string, currentHP: number, maxHP?: number) => void
  
  // Utility actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const usePartyStore = create<PartyState & PartyActions>()(
  persist(
    (set, get) => ({
      // State
      parties: [],
      activeParty: null,
      isLoading: false,
      error: null,

      // Party management actions
      setParties: (parties) => set({ parties }),
      
      addParty: (party) => set((state) => ({
        parties: [...state.parties, party]
      })),
      
      updateParty: (partyId, updates) => set((state) => ({
        parties: state.parties.map(party =>
          party._id === partyId ? { ...party, ...updates } : party
        ),
        activeParty: state.activeParty?._id === partyId 
          ? { ...state.activeParty, ...updates }
          : state.activeParty
      })),
      
      deleteParty: (partyId) => set((state) => ({
        parties: state.parties.filter(party => party._id !== partyId),
        activeParty: state.activeParty?._id === partyId ? null : state.activeParty
      })),
      
      setActiveParty: (party) => set({ activeParty: party }),

      // Character management actions
      addCharacter: (partyId, character) => set((state) => {
        const updateParty = (party: Party) => {
          if (party._id !== partyId) return party
          
          return {
            ...party,
            characters: [...party.characters, character]
          }
        }

        return {
          parties: state.parties.map(updateParty),
          activeParty: state.activeParty ? updateParty(state.activeParty) : null
        }
      }),
      
      updateCharacter: (partyId, characterId, updates) => set((state) => {
        const updateParty = (party: Party) => {
          if (party._id !== partyId) return party
          
          return {
            ...party,
            characters: party.characters.map(character =>
              character._id === characterId ? { ...character, ...updates } : character
            )
          }
        }

        return {
          parties: state.parties.map(updateParty),
          activeParty: state.activeParty ? updateParty(state.activeParty) : null
        }
      }),
      
      removeCharacter: (partyId, characterId) => set((state) => {
        const updateParty = (party: Party) => {
          if (party._id !== partyId) return party
          
          return {
            ...party,
            characters: party.characters.filter(character => character._id !== characterId)
          }
        }

        return {
          parties: state.parties.map(updateParty),
          activeParty: state.activeParty ? updateParty(state.activeParty) : null
        }
      }),
      
      updateCharacterHealth: (partyId, characterId, currentHP, maxHP) => {
        const updates: Partial<Character> = {
          currentHP,
          ...(maxHP && { maxHP })
        }
        
        get().updateCharacter(partyId, characterId, updates)
      },

      // Utility actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'party-storage',
      partialize: (state) => ({
        parties: state.parties,
        activeParty: state.activeParty
      }),
    }
  )
)