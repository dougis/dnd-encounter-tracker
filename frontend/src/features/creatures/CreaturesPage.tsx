import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CreaturesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creatures</h1>
          <p className="text-muted-foreground">
            Manage monsters, NPCs, and custom creatures
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Creature
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Your Creatures</span>
          </CardTitle>
          <CardDescription>
            Create and organize your bestiary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No creatures created yet.</p>
            <p className="text-sm">Add monsters and NPCs to populate your encounters!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreaturesPage
