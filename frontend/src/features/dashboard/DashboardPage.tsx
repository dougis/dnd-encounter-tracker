import React from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Sword, 
  BookOpen, 
  Plus, 
  Activity,
  TrendingUp,
  Crown
} from 'lucide-react'

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()

  const stats = [
    {
      title: 'Active Parties',
      value: user?.usage?.partiesCreated || 0,
      limit: user?.features?.maxParties === -1 ? '∞' : user?.features?.maxParties || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Total Encounters',
      value: user?.usage?.encountersCreated || 0,
      limit: user?.features?.maxEncounters === -1 ? '∞' : user?.features?.maxEncounters || 0,
      icon: Sword,
      color: 'text-red-600',
    },
    {
      title: 'Creatures Created',
      value: user?.usage?.creaturesCreated || 0,
      limit: user?.features?.maxCreatures === -1 ? '∞' : user?.features?.maxCreatures || 0,
      icon: BookOpen,
      color: 'text-green-600',
    },
    {
      title: 'Sessions This Month',
      value: user?.usage?.sessionsThisMonth || 0,
      limit: null,
      icon: Activity,
      color: 'text-purple-600',
    },
  ]

  const quickActions = [
    {
      title: 'New Party',
      description: 'Create a new adventuring party',
      href: '/parties',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Start Encounter',
      description: 'Begin a new combat encounter',
      href: '/encounters',
      icon: Sword,
      color: 'bg-red-500',
    },
    {
      title: 'Add Creature',
      description: 'Create a new monster or NPC',
      href: '/creatures',
      icon: BookOpen,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}! Ready for your next adventure?
          </p>
        </div>
        
        {user?.subscription && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg text-white">
            <Crown className="h-5 w-5" />
            <span className="font-medium capitalize">
              {user.subscription.tier.replace('_', ' ')} Plan
            </span>
          </div>
        )}
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const percentage = stat.limit && stat.limit !== '∞' 
            ? (stat.value / Number(stat.limit)) * 100 
            : null

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  {stat.limit && (
                    <span className="text-lg text-muted-foreground">
                      / {stat.limit}
                    </span>
                  )}
                </div>
                {percentage !== null && (
                  <div className="mt-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          percentage > 80 ? 'bg-red-500' : 
                          percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {percentage.toFixed(1)}% used
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          
          return (
            <Card key={action.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={action.href}>
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Your latest encounters and party updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to display.</p>
            <p className="text-sm">Start creating parties and encounters to see your activity here!</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      {user?.subscription.tier === 'free' && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <Crown className="h-5 w-5" />
              <span>Upgrade Your Experience</span>
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Unlock advanced features with a premium subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-2">
                  Get unlimited encounters, cloud sync, and priority support
                </p>
                <ul className="text-xs text-yellow-600 space-y-1">
                  <li>• Unlimited parties and encounters</li>
                  <li>• Advanced combat logging</li>
                  <li>• Cloud synchronization</li>
                  <li>• Priority customer support</li>
                </ul>
              </div>
              <Button asChild variant="default">
                <Link to="/subscription">
                  View Plans
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DashboardPage
