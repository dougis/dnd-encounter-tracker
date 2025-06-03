import React from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { User, LogOut, Settings, Crown } from 'lucide-react'

const Header: React.FC = () => {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-foreground">
            D&D Encounter Tracker
          </h1>
          {user?.subscription && (
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium capitalize">
                {user.subscription.tier.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{user?.username}</span>
          </div>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
