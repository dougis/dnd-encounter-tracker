import React, { useState } from 'react'
import { usePartyStore } from '@/stores/partyStore'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  User,
  Heart,
  Shield,
  Sword,
  Crown
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Character, Party } from '@dnd-encounter-tracker/shared'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface CreatePartyForm {
  name: string
  description: string
}

interface CreateCharacterForm {
  name: string
  race: string
  classes: Array<{ className: string; level: number }>
  playerName: string
  ac: number
  maxHP: number
  currentHP: number
  dexterity: number
  notes: string
}

const PartiesPage: React.FC = () => {
  const { user } = useAuthStore()
  const { parties, addParty, deleteParty, addCharacter, removeCharacter, updateCharacterHealth } = usePartyStore()
  const [showCreateParty, setShowCreateParty] = useState(false)
  const [showCreateCharacter, setShowCreateCharacter] = useState(false)
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [expandedParty, setExpandedParty] = useState<string | null>(null)

  const createPartyForm = useForm<CreatePartyForm>()
  const createCharacterForm = useForm<CreateCharacterForm>({
    defaultValues: {
      classes: [{ className: 'Fighter', level: 1 }],
      ac: 10,
      maxHP: 8,
      currentHP: 8,
      dexterity: 10
    }
  })

  const handleCreateParty = async (data: CreatePartyForm) => {
    try {
      const newParty: Party = {
        _id: Date.now().toString(), // Mock ID
        userId: user?.id || '',
        name: data.name,
        description: data.description,
        characters: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      addParty(newParty)
      setShowCreateParty(false)
      createPartyForm.reset()
      toast.success('Party created successfully!')
    } catch (error) {
      toast.error('Failed to create party')
    }
  }

  const handleCreateCharacter = async (data: CreateCharacterForm) => {
    if (!selectedParty) return

    try {
      const newCharacter: Character = {
        _id: Date.now().toString(), // Mock ID
        name: data.name,
        race: data.race,
        classes: data.classes,
        playerName: data.playerName,
        ac: data.ac,
        maxHP: data.maxHP,
        currentHP: data.currentHP,
        dexterity: data.dexterity,
        notes: data.notes
      }
      
      addCharacter(selectedParty._id, newCharacter)
      setShowCreateCharacter(false)
      setSelectedParty(null)
      createCharacterForm.reset()
      toast.success('Character added successfully!')
    } catch (error) {
      toast.error('Failed to add character')
    }
  }

  const handleDeleteParty = (partyId: string) => {
    if (confirm('Are you sure you want to delete this party? This action cannot be undone.')) {
      deleteParty(partyId)
      toast.success('Party deleted')
    }
  }

  const handleDeleteCharacter = (partyId: string, characterId: string) => {
    if (confirm('Are you sure you want to remove this character from the party?')) {
      removeCharacter(partyId, characterId)
      toast.success('Character removed')
    }
  }

  const getClassString = (classes: Character['classes']) => {
    return classes.map(c => `${c.className} ${c.level}`).join(', ')
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

  const canCreateMoreParties = () => {
    const maxParties = user?.features?.maxParties || 1
    return maxParties === -1 || parties.length < maxParties
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parties</h1>
          <p className="text-muted-foreground">
            Manage your adventuring parties and characters
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateParty(true)}
          disabled={!canCreateMoreParties()}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Party
        </Button>
      </div>

      {/* Usage Info */}
      {user?.features && (
        <Card className="border-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Parties: {parties.length} / {user.features.maxParties === -1 ? '∞' : user.features.maxParties}
              </span>
              {user.subscription.tier === 'free' && (
                <Button variant="link" size="sm" className="h-auto p-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade for more parties
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parties List */}
      {parties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No parties created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first adventuring party to get started!
            </p>
            <Button onClick={() => setShowCreateParty(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Party
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {parties.map((party) => (
            <Card key={party._id} className="overflow-hidden">
              <CardHeader className="cursor-pointer" onClick={() => 
                setExpandedParty(expandedParty === party._id ? null : party._id)
              }>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>{party.name}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        ({party.characters.length} characters)
                      </span>
                    </CardTitle>
                    {party.description && (
                      <CardDescription>{party.description}</CardDescription>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedParty(party)
                        setShowCreateCharacter(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Character
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Edit party
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteParty(party._id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedParty === party._id && (
                <CardContent className="pt-0">
                  {party.characters.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2" />
                      <p>No characters in this party yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSelectedParty(party)
                          setShowCreateCharacter(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Character
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {party.characters.map((character) => {
                        const healthPercentage = getHealthPercentage(character.currentHP, character.maxHP)
                        
                        return (
                          <div
                            key={character._id}
                            className="p-4 border rounded-lg space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{character.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {character.race} {getClassString(character.classes)}
                                </p>
                                {character.playerName && (
                                  <p className="text-xs text-muted-foreground">
                                    Player: {character.playerName}
                                  </p>
                                )}
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCharacter(party._id, character._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Shield className="h-4 w-4 text-blue-500" />
                                <span>AC {character.ac}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Sword className="h-4 w-4 text-orange-500" />
                                <span>DEX {character.dexterity}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span>{character.currentHP}/{character.maxHP}</span>
                              </div>
                            </div>

                            {/* Health Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Health</span>
                                <span>{Math.round(healthPercentage)}%</span>
                              </div>
                              <div className="w-full h-2 bg-secondary rounded-full">
                                <div 
                                  className={cn(
                                    'h-full rounded-full transition-all duration-300',
                                    getHealthColor(character.currentHP, character.maxHP)
                                  )}
                                  style={{ width: `${healthPercentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Health Controls */}
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const damage = prompt('Enter damage amount:')
                                  if (damage) {
                                    const newHP = Math.max(0, character.currentHP - parseInt(damage))
                                    updateCharacterHealth(party._id, character._id, newHP)
                                  }
                                }}
                              >
                                Damage
                              </Button>
                              
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  const healing = prompt('Enter healing amount:')
                                  if (healing) {
                                    const newHP = Math.min(character.maxHP, character.currentHP + parseInt(healing))
                                    updateCharacterHealth(party._id, character._id, newHP)
                                  }
                                }}
                              >
                                Heal
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  updateCharacterHealth(party._id, character._id, character.maxHP)
                                }}
                              >
                                Full Heal
                              </Button>
                            </div>

                            {character.notes && (
                              <div className="text-xs text-muted-foreground border-t pt-2">
                                <strong>Notes:</strong> {character.notes}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Party Dialog */}
      <Dialog open={showCreateParty} onOpenChange={setShowCreateParty}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Party</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={createPartyForm.handleSubmit(handleCreateParty)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Party Name</label>
              <Input
                {...createPartyForm.register('name', { required: 'Party name is required' })}
                placeholder="The Fellowship of the Ring"
              />
              {createPartyForm.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {createPartyForm.formState.errors.name.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                {...createPartyForm.register('description')}
                placeholder="A group of unlikely heroes..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateParty(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Party</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Character Dialog */}
      <Dialog open={showCreateCharacter} onOpenChange={setShowCreateCharacter}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Character to {selectedParty?.name}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={createCharacterForm.handleSubmit(handleCreateCharacter)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Character Name</label>
                <Input
                  {...createCharacterForm.register('name', { required: 'Character name is required' })}
                  placeholder="Aragorn"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Player Name</label>
                <Input
                  {...createCharacterForm.register('playerName')}
                  placeholder="John Smith"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Race</label>
                <Input
                  {...createCharacterForm.register('race', { required: 'Race is required' })}
                  placeholder="Human"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Class & Level</label>
                <Input
                  placeholder="Fighter 1"
                  onChange={(e) => {
                    const value = e.target.value
                    const match = value.match(/^(\w+)\s*(\d+)?$/)
                    if (match) {
                      createCharacterForm.setValue('classes', [{
                        className: match[1],
                        level: parseInt(match[2] || '1')
                      }])
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Armor Class</label>
                <Input
                  type="number"
                  {...createCharacterForm.register('ac', { 
                    required: 'AC is required',
                    min: { value: 1, message: 'AC must be at least 1' },
                    max: { value: 30, message: 'AC cannot exceed 30' }
                  })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Max HP</label>
                <Input
                  type="number"
                  {...createCharacterForm.register('maxHP', { 
                    required: 'Max HP is required',
                    min: { value: 1, message: 'Max HP must be at least 1' }
                  })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Current HP</label>
                <Input
                  type="number"
                  {...createCharacterForm.register('currentHP', { 
                    required: 'Current HP is required',
                    min: { value: 0, message: 'Current HP cannot be negative' }
                  })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Dexterity</label>
                <Input
                  type="number"
                  {...createCharacterForm.register('dexterity', { 
                    required: 'Dexterity is required',
                    min: { value: 1, message: 'Dexterity must be at least 1' },
                    max: { value: 30, message: 'Dexterity cannot exceed 30' }
                  })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input
                {...createCharacterForm.register('notes')}
                placeholder="Special abilities, equipment, etc."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateCharacter(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Character</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PartiesPage