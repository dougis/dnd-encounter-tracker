import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/stores/authStore'
import { 
  LayoutDashboard, 
  Users, 
  Sword, 
  BookOpen, 
  Crown, 
  Shield 
} from 'lucide-react'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: 'Dashboard'
  },
  {
    to: '/parties',
    icon: <Users className="h-5 w-5" />,
    label: 'Parties'
  },
  {
    to: '/encounters',
    icon: <Sword className="h-5 w-5" />,
    label: 'Encounters'
  },
  {
    to: '/creatures',
    icon: <BookOpen className="h-5 w-5" />,
    label: 'Creatures'
  },
  {
    to: '/subscription',
    icon: <Crown className="h-5 w-5" />,
    label: 'Subscription'
  },
  {
    to: '/admin',
    icon: <Shield className="h-5 w-5" />,
    label: 'Admin',
    adminOnly: true
  }
]

const Sidebar: React.FC = () => {
  const location = useLocation()
  const { user } = useAuthStore()

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || user?.isAdmin
  )

  return (
    <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.to
            
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
