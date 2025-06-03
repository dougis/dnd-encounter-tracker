import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEncounterStore } from '@/stores/encounterStore'
import { usePartyStore } from '@/stores/partyStore'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Sword, 
  Plus, 
  Play, 
  Edit, 
  Trash2, 
  Users,
  Clock,
  Crown,
  Star,
  Calendar
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Encounter, CreateEncounterInput } from '@dnd-encounter-tracker/shared'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface CreateEncounterForm {
  name: string
  description: string
  partyId?: string
}

const EncountersPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { encounters, addEncounter, deleteEncounter, setActiveEncounter } = useEncounterStore()
  const { parties } = usePartyStore()
  const [showCreateEncounter, setShowCreateEncounter] = useState(false)

  const createEncounterForm = useForm<CreateEncounterForm>()

  const handleCreateEncounter = async (data: CreateEncounterForm) => {
    try {
      const newEncounter: Encounter = {
        _id: Date.now().toString(), // Mock ID
        userId: user?.id || '',
        name: data.name,
        description: data.description,
        status: 'preparing',
        currentRound: 1,
        currentTurn: 0,
        turnOrder: [],
        participants: new Map(),
        id: Date.now().toString(),
        environment: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        partyId: data.partyId
      }
      
      addEncounter(newEncounter)
      setShowCreateEncounter(false)
      createEncounterForm.reset()
      toast.success('Encounter created successfully!')
    } catch (error) {
      toast.error('Failed to create encounter')
    }
  }

  const handleDeleteEncounter = (encounterId: string) => {
    if (confirm('Are you sure you want to delete this encounter? This action cannot be undone.')) {
      deleteEncounter(encounterId)
      toast.success('Encounter deleted')
    }
  }

  const handleStartEncounter = (encounter: Encounter) => {
    setActiveEncounter(encounter)
    navigate(`/encounters/${encounter._id}`)
  }

  const canCreateMoreEncounters = () => {
    const maxEncounters = user?.features?.maxEncounters || 3
    return maxEncounters === -1 || encounters.length < maxEncounters
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'text-blue-600 bg-blue-50'
      case 'active': return 'text-green-600 bg-green-50'
      case 'paused': return 'text-yellow-600 bg-yellow-50'
      case 'completed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing': return <Clock className="h-4 w-4" />
      case 'active': return <Play className="h-4 w-4" />
      case 'paused': return <Clock className="h-4 w-4" />
      case 'completed': return <Star className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPartyName = (partyId?: string) => {
    if (!partyId) return null
    const party = parties.find(p => p._id === partyId)
    return party?.name
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Encounters</h1>
          <p className="text-muted-foreground">
            Track initiative and manage combat encounters
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateEncounter(true)}
          disabled={!canCreateMoreEncounters()}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Encounter
        </Button>
      </div>

      {/* Usage Info */}
      {user?.features && (
        <Card className="border-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Encounters: {encounters.length} / {user.features.maxEncounters === -1 ? '∞' : user.features.maxEncounters}
              </span>
              {user.subscription.tier === 'free' && (
                <Button variant="link" size="sm" className="h-auto p-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade for more encounters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Quick Start with Party
        </Button>
        <Button variant="outline" size="sm">
          <Sword className="h-4 w-4 mr-2" />
          Random Encounter
        </Button>
      </div>

      {/* Encounters List */}
      {encounters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Sword className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No encounters created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first encounter to start tracking combat!
            </p>
            <Button onClick={() => setShowCreateEncounter(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Encounter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {encounters.map((encounter) => (
            <Card key={encounter._id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{encounter.name}</CardTitle>
                    {encounter.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {encounter.description}
                      </CardDescription>
                    )}
                  </div>
                  
                  <div className={cn(
                    'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(encounter.status)
                  )}>
                    {getStatusIcon(encounter.status)}
                    <span className="capitalize">{encounter.status}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Participants:</span>
                      <div className="font-medium">{encounter.participants.size}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Round:</span>
                      <div className="font-medium">{encounter.currentRound}</div>
                    </div>
                  </div>

                  {/* Party Info */}
                  {encounter.partyId && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Party:</span>
                      <span className="font-medium">{getPartyName(encounter.partyId)}</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(encounter.createdAt)}</span>
                  </div>

                  {encounter.status === 'active' && encounter.startedAt && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Play className="h-4 w-4" />
                      <span>Started {formatDate(encounter.startedAt)}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    {encounter.status === 'preparing' ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStartEncounter(encounter)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStartEncounter(encounter)}
                      >
                        <Sword className="h-4 w-4 mr-1" />
                        {encounter.status === 'active' ? 'Continue' : 'View'}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Edit encounter
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteEncounter(encounter._id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Encounter Dialog */}
      <Dialog open={showCreateEncounter} onOpenChange={setShowCreateEncounter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Encounter</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={createEncounterForm.handleSubmit(handleCreateEncounter)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Encounter Name</label>
              <Input
                {...createEncounterForm.register('name', { required: 'Encounter name is required' })}
                placeholder="Goblin Ambush"
              />
              {createEncounterForm.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {createEncounterForm.formState.errors.name.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                {...createEncounterForm.register('description')}
                placeholder="A surprise attack on the road..."
              />
            </div>
            
            {parties.length > 0 && (
              <div>
                <label className="text-sm font-medium">Party (Optional)</label>
                <select
                  {...createEncounterForm.register('partyId')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="">No party selected</option>
                  {parties.map((party) => (
                    <option key={party._id} value={party._id}>
                      {party.name} ({party.characters.length} characters)
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateEncounter(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Encounter</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EncountersPage