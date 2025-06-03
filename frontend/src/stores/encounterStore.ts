import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  Encounter, 
  EncounterParticipant, 
  CreateEncounterInput 
} from '@dnd-encounter-tracker/shared'

interface EncounterState {
  encounters: Encounter[]
  activeEncounter: Encounter | null
  isLoading: boolean
  error: string | null
}

interface EncounterActions {
  // Encounter management
  setEncounters: (encounters: Encounter[]) => void
  addEncounter: (encounter: Encounter) => void
  updateEncounter: (encounterId: string, updates: Partial<Encounter>) => void
  deleteEncounter: (encounterId: string) => void
  setActiveEncounter: (encounter: Encounter | null) => void
  
  // Participant management
  addParticipant: (encounterId: string, participant: EncounterParticipant) => void
  updateParticipant: (encounterId: string, participantId: string, updates: Partial<EncounterParticipant>) => void
  removeParticipant: (encounterId: string, participantId: string) => void
  
  // Combat management
  startEncounter: (encounterId: string) => void
  nextTurn: (encounterId: string) => void
  previousTurn: (encounterId: string) => void
  rollInitiative: (encounterId: string, participantId: string, initiative: number) => void
  updateHealth: (encounterId: string, participantId: string, currentHP: number, maxHP?: number) => void
  addCondition: (encounterId: string, participantId: string, condition: string) => void
  removeCondition: (encounterId: string, participantId: string, condition: string) => void
  
  // Utility actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useEncounterStore = create<EncounterState & EncounterActions>()(
  persist(
    (set, get) => ({
      // State
      encounters: [],
      activeEncounter: null,
      isLoading: false,
      error: null,

      // Encounter management actions
      setEncounters: (encounters) => set({ encounters }),
      
      addEncounter: (encounter) => set((state) => ({
        encounters: [...state.encounters, encounter]
      })),
      
      updateEncounter: (encounterId, updates) => set((state) => ({
        encounters: state.encounters.map(encounter =>
          encounter._id === encounterId ? { ...encounter, ...updates } : encounter
        ),
        activeEncounter: state.activeEncounter?._id === encounterId 
          ? { ...state.activeEncounter, ...updates }
          : state.activeEncounter
      })),
      
      deleteEncounter: (encounterId) => set((state) => ({
        encounters: state.encounters.filter(encounter => encounter._id !== encounterId),
        activeEncounter: state.activeEncounter?._id === encounterId ? null : state.activeEncounter
      })),
      
      setActiveEncounter: (encounter) => set({ activeEncounter: encounter }),

      // Participant management actions
      addParticipant: (encounterId, participant) => set((state) => {
        const updateEncounter = (encounter: Encounter) => {
          if (encounter._id !== encounterId) return encounter
          
          const newParticipants = new Map(encounter.participants)
          newParticipants.set(participant.id, participant)
          
          return {
            ...encounter,
            participants: newParticipants,
            turnOrder: [...encounter.turnOrder, participant.id]
          }
        }

        return {
          encounters: state.encounters.map(updateEncounter),
          activeEncounter: state.activeEncounter ? updateEncounter(state.activeEncounter) : null
        }
      }),
      
      updateParticipant: (encounterId, participantId, updates) => set((state) => {
        const updateEncounter = (encounter: Encounter) => {
          if (encounter._id !== encounterId) return encounter
          
          const participant = encounter.participants.get(participantId)
          if (!participant) return encounter
          
          const newParticipants = new Map(encounter.participants)
          newParticipants.set(participantId, { ...participant, ...updates })
          
          return {
            ...encounter,
            participants: newParticipants
          }
        }

        return {
          encounters: state.encounters.map(updateEncounter),
          activeEncounter: state.activeEncounter ? updateEncounter(state.activeEncounter) : null
        }
      }),
      
      removeParticipant: (encounterId, participantId) => set((state) => {
        const updateEncounter = (encounter: Encounter) => {
          if (encounter._id !== encounterId) return encounter
          
          const newParticipants = new Map(encounter.participants)
          newParticipants.delete(participantId)
          
          return {
            ...encounter,
            participants: newParticipants,
            turnOrder: encounter.turnOrder.filter(id => id !== participantId)
          }
        }

        return {
          encounters: state.encounters.map(updateEncounter),
          activeEncounter: state.activeEncounter ? updateEncounter(state.activeEncounter) : null
        }
      }),

      // Combat management actions
      startEncounter: (encounterId) => set((state) => {
        const updateEncounter = (encounter: Encounter) => {
          if (encounter._id !== encounterId) return encounter
          
          // Sort participants by initiative (descending), then by dexterity (descending)
          const sortedParticipants = Array.from(encounter.participants.values())
            .sort((a, b) => {
              if (a.initiative !== b.initiative) {
                return b.initiative - a.initiative
              }
              return b.dexterity - a.dexterity
            })
          
          return {
            ...encounter,
            status: 'active' as const,
            currentRound: 1,
            currentTurn: 0,
            turnOrder: sortedParticipants.map(p => p.id),
            startedAt: new Date().toISOString()
          }
        }

        return {
          encounters: state.encounters.map(updateEncounter),
          activeEncounter: state.activeEncounter ? updateEncounter(state.activeEncounter) : null
        }
      }),
      
      nextTurn: (encounterId) => set((state) => {
        const updateEncounter = (encounter: Encounter) => {
          if (encounter._id !== encounterId || encounter.status !== 'active') return encounter
          
          let nextTurn = encounter.currentTurn + 1
          let nextRound = encounter.currentRound
          
          if (nextTurn >= encounter.turnOrder.length) {
            nextTurn = 0
            nextRound += 1
          }
          
          return {
            ...encounter,
            currentTurn: nextTurn,
            currentRound: nextRound
          }
        }

        return {
          encounters: state.encounters.map(updateEncounter),
          activeEncounter: state.activeEncounter ? updateEncounter(state.activeEncounter) : null
        }
      }),
      
      previousTurn: (encounterId) => set((state) => {
        const updateEncounter = (encounter: Encounter) => {
          if (encounter._id !== encounterId || encounter.status !== 'active') return encounter
          
          let prevTurn = encounter.currentTurn - 1
          let prevRound = encounter.currentRound
          
          if (prevTurn < 0) {
            if (prevRound > 1) {
              prevTurn = encounter.turnOrder.length - 1
              prevRound -= 1
            } else {
              prevTurn = 0
            }
          }
          
          return {
            ...encounter,
            currentTurn: prevTurn,
            currentRound: prevRound
          }
        }

        return {
          encounters: state.encounters.map(updateEncounter),
          activeEncounter: state.activeEncounter ? updateEncounter(state.activeEncounter) : null
        }
      }),
      
      rollInitiative: (encounterId, participantId, initiative) => {
        get().updateParticipant(encounterId, participantId, { initiative })
      },
      
      updateHealth: (encounterId, participantId, currentHP, maxHP) => {
        const updates: Partial<EncounterParticipant> = {
          health: { 
            current: currentHP, 
            max: maxHP || get().activeEncounter?.participants.get(participantId)?.health.max || currentHP,
            temporary: 0
          }
        }
        
        // Update status based on health
        if (currentHP <= 0) {
          updates.status = 'unconscious'
        } else {
          updates.status = 'alive'
        }
        
        get().updateParticipant(encounterId, participantId, updates)
      },
      
      addCondition: (encounterId, participantId, condition) => set((state) => {
        const encounter = state.activeEncounter || state.encounters.find(e => e._id === encounterId)
        if (!encounter) return state
        
        const participant = encounter.participants.get(participantId)
        if (!participant) return state
        
        const newConditions = [...participant.conditions]
        if (!newConditions.includes(condition)) {
          newConditions.push(condition)
        }
        
        get().updateParticipant(encounterId, participantId, { conditions: newConditions })
        return state
      }),
      
      removeCondition: (encounterId, participantId, condition) => set((state) => {
        const encounter = state.activeEncounter || state.encounters.find(e => e._id === encounterId)
        if (!encounter) return state
        
        const participant = encounter.participants.get(participantId)
        if (!participant) return state
        
        const newConditions = participant.conditions.filter(c => c !== condition)
        
        get().updateParticipant(encounterId, participantId, { conditions: newConditions })
        return state
      }),

      // Utility actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'encounter-storage',
      partialize: (state) => ({
        encounters: state.encounters,
        activeEncounter: state.activeEncounter
      }),
    }
  )
)