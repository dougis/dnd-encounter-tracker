import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEncounterStore } from '@/stores/encounterStore'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack,
  Heart,
  Shield,
  Sword,
  Users,
  Plus,
  Trash2,
  Settings,
  Dice6
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Condition } from '@dnd-encounter-tracker/shared'

const EncounterTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    activeEncounter, 
    setActiveEncounter, 
    startEncounter, 
    nextTurn, 
    previousTurn,
    updateHealth,
    addCondition,
    removeCondition,
    rollInitiative
  } = useEncounterStore()

  const [damageInputs, setDamageInputs] = useState<{ [key: string]: string }>({})
  const [healingInputs, setHealingInputs] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    // TODO: Fetch encounter from API if not in store
    if (id && !activeEncounter) {
      // Mock encounter for now
      const mockEncounter = {
        _id: id,
        userId: user?.id || '',
        name: 'Goblin Ambush',
        description: 'A surprise attack by goblins on the road',
        status: 'preparing' as const,
        currentRound: 1,
        currentTurn: 0,
        turnOrder: ['char1', 'goblin1', 'char2', 'goblin2'],
        participants: new Map([
          ['char1', {
            id: 'char1',
            type: 'character' as const,
            name: 'Aragorn',
            initiative: 18,
            dexterity: 16,
            isPlayerCharacter: true,
            conditions: [],
            status: 'alive' as const,
            health: { current: 45, max: 45, temporary: 0 },
            armorClass: 17,
            speed: 30,
            stats: {
              strength: 16,
              dexterity: 16,
              constitution: 14,
              intelligence: 12,
              wisdom: 13,
              charisma: 15
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          ['goblin1', {
            id: 'goblin1',
            type: 'creature' as const,
            name: 'Goblin Warrior',
            initiative: 15,
            dexterity: 14,
            isPlayerCharacter: false,
            conditions: [],
            status: 'alive' as const,
            health: { current: 7, max: 7, temporary: 0 },
            armorClass: 15,
            speed: 30,
            stats: {
              strength: 8,
              dexterity: 14,
              constitution: 10,
              intelligence: 10,
              wisdom: 8,
              charisma: 8
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          ['char2', {
            id: 'char2',
            type: 'character' as const,
            name: 'Legolas',
            initiative: 12,
            dexterity: 18,
            isPlayerCharacter: true,
            conditions: [],
            status: 'alive' as const,
            health: { current: 38, max: 38, temporary: 0 },
            armorClass: 16,
            speed: 30,
            stats: {
              strength: 13,
              dexterity: 18,
              constitution: 12,
              intelligence: 14,
              wisdom: 15,
              charisma: 12
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          ['goblin2', {
            id: 'goblin2',
            type: 'creature' as const,
            name: 'Goblin Archer',
            initiative: 10,
            dexterity: 16,
            isPlayerCharacter: false,
            conditions: ['prone'],
            status: 'alive' as const,
            health: { current: 4, max: 7, temporary: 0 },
            armorClass: 13,
            speed: 30,
            stats: {
              strength: 8,
              dexterity: 16,
              constitution: 10,
              intelligence: 10,
              wisdom: 8,
              charisma: 8
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        ]),
        id: id,
        environment: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setActiveEncounter(mockEncounter)
    }
  }, [id, activeEncounter, setActiveEncounter, user?.id])

  if (!activeEncounter) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sword className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">Encounter not found</p>
          <Button onClick={() => navigate('/encounters')} className="mt-4">
            Back to Encounters
          </Button>
        </div>
      </div>
    )
  }

  const currentParticipant = activeEncounter.turnOrder[activeEncounter.currentTurn]
  const participants = Array.from(activeEncounter.participants.values())

  const handleDamage = (participantId: string) => {
    const damage = parseInt(damageInputs[participantId] || '0')
    if (damage > 0) {
      const participant = activeEncounter.participants.get(participantId)
      if (participant) {
        const newHP = Math.max(0, participant.health.current - damage)
        updateHealth(activeEncounter._id, participantId, newHP)
        setDamageInputs({ ...damageInputs, [participantId]: '' })
      }
    }
  }

  const handleHealing = (participantId: string) => {
    const healing = parseInt(healingInputs[participantId] || '0')
    if (healing > 0) {
      const participant = activeEncounter.participants.get(participantId)
      if (participant) {
        const newHP = Math.min(participant.health.max, participant.health.current + healing)
        updateHealth(activeEncounter._id, participantId, newHP)
        setHealingInputs({ ...healingInputs, [participantId]: '' })
      }
    }
  }

  const rollInitiativeForAll = () => {
    participants.forEach(participant => {
      const roll = Math.floor(Math.random() * 20) + 1
      const modifier = Math.floor((participant.dexterity - 10) / 2)
      rollInitiative(activeEncounter._id, participant.id, roll + modifier)
    })
  }

  const getHealthPercentage = (current: number, max: number) => {
    return (current / max) * 100
  }

  const getHealthColor = (current: number, max: number) => {
    const percentage = getHealthPercentage(current, max)
    if (percentage > 75) return 'bg-green-500'
    if (percentage > 50) return 'bg-yellow-500'
    if (percentage > 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{activeEncounter.name}</h1>
          <p className="text-muted-foreground">{activeEncounter.description}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Round {activeEncounter.currentRound}
          </div>
          
          <div className="flex items-center space-x-1">
            {activeEncounter.status === 'preparing' ? (
              <Button onClick={() => startEncounter(activeEncounter._id)}>
                <Play className="h-4 w-4 mr-2" />
                Start Encounter
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previousTurn(activeEncounter._id)}
                  disabled={activeEncounter.currentTurn === 0 && activeEncounter.currentRound === 1}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => nextTurn(activeEncounter._id)}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Next Turn
                </Button>
                
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm">
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={rollInitiativeForAll}>
          <Dice6 className="h-4 w-4 mr-2" />
          Roll Initiative
        </Button>
        
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Add Participant
        </Button>
        
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Initiative Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sword className="h-5 w-5" />
            <span>Initiative Order</span>
          </CardTitle>
          <CardDescription>
            Combat turn order and participant status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeEncounter.turnOrder.map((participantId, index) => {
              const participant = activeEncounter.participants.get(participantId)
              if (!participant) return null

              const isCurrentTurn = activeEncounter.status === 'active' && index === activeEncounter.currentTurn
              const healthPercentage = getHealthPercentage(participant.health.current, participant.health.max)

              return (
                <div
                  key={participantId}
                  className={cn(
                    'p-4 rounded-lg border transition-all duration-200',
                    isCurrentTurn 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-border',
                    participant.status === 'unconscious' && 'opacity-60',
                    'initiative-item'
                  )}
                >
                  <div className="flex items-center justify-between">
                    {/* Participant Info */}
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-bold">
                          {participant.initiative}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Init
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{participant.name}</h3>
                          {participant.isPlayerCharacter && (
                            <Users className="h-4 w-4 text-blue-500" />
                          )}
                          {isCurrentTurn && (
                            <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                              Current Turn
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>AC {participant.armorClass}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Speed {participant.speed}ft</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>DEX {participant.dexterity}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Health and Actions */}
                    <div className="flex items-center space-x-6">
                      {/* Health */}
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="flex items-center space-x-1 text-sm font-medium">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>{participant.health.current} / {participant.health.max}</span>
                          </div>
                          
                          <div className="w-20 h-2 bg-secondary rounded-full mt-1 health-bar">
                            <div 
                              className={cn(
                                'h-full rounded-full transition-all duration-300 health-bar-fill',
                                getHealthColor(participant.health.current, participant.health.max)
                              )}
                              style={{ width: `${healthPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Damage/Heal Controls */}
                        <div className="flex items-center space-x-1">
                          <Input
                            type="number"
                            placeholder="Dmg"
                            className="w-16 h-8 text-xs"
                            value={damageInputs[participantId] || ''}
                            onChange={(e) => setDamageInputs({
                              ...damageInputs,
                              [participantId]: e.target.value
                            })}
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-2"
                            onClick={() => handleDamage(participantId)}
                          >
                            -
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Input
                            type="number"
                            placeholder="Heal"
                            className="w-16 h-8 text-xs"
                            value={healingInputs[participantId] || ''}
                            onChange={(e) => setHealingInputs({
                              ...healingInputs,
                              [participantId]: e.target.value
                            })}
                          />
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 px-2 bg-green-600 hover:bg-green-700"
                            onClick={() => handleHealing(participantId)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Conditions */}
                  {participant.conditions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {participant.conditions.map((condition) => (
                        <span
                          key={condition}
                          className={cn(
                            'px-2 py-1 rounded text-xs font-medium condition-badge',
                            condition
                          )}
                        >
                          {condition}
                          <button
                            className="ml-1 text-xs opacity-70 hover:opacity-100"
                            onClick={() => removeCondition(activeEncounter._id, participantId, condition)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Combat Log */}
      <Card>
        <CardHeader>
          <CardTitle>Combat Log</CardTitle>
          <CardDescription>
            Record of actions and events during combat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Combat log is empty. Actions will appear here as the encounter progresses.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EncounterTracker