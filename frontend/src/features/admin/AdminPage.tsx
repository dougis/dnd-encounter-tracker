import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Users, 
  CreditCard, 
  Activity, 
  Database,
  Settings,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

const AdminPage: React.FC = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Active Subscriptions',
      value: '456',
      change: '+8%',
      changeType: 'positive' as const,
      icon: CreditCard,
    },
    {
      title: 'Monthly Revenue',
      value: '$12,345',
      change: '+15%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'Stable',
      changeType: 'neutral' as const,
      icon: Activity,
    },
  ]

  const quickActions = [
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: Users,
      color: 'bg-blue-500',
      action: () => console.log('User management'),
    },
    {
      title: 'Subscription Dashboard',
      description: 'Monitor subscription metrics',
      icon: CreditCard,
      color: 'bg-green-500',
      action: () => console.log('Subscription dashboard'),
    },
    {
      title: 'System Monitoring',
      description: 'Check system health and performance',
      icon: Activity,
      color: 'bg-orange-500',
      action: () => console.log('System monitoring'),
    },
    {
      title: 'Database Management',
      description: 'Database operations and backups',
      icon: Database,
      color: 'bg-purple-500',
      action: () => console.log('Database management'),
    },
    {
      title: 'Feature Flags',
      description: 'Enable/disable features globally',
      icon: Settings,
      color: 'bg-gray-500',
      action: () => console.log('Feature flags'),
    },
    {
      title: 'Support Tickets',
      description: 'Review and respond to user issues',
      icon: AlertTriangle,
      color: 'bg-red-500',
      action: () => console.log('Support tickets'),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            System administration and monitoring
          </p>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-muted-foreground'
                }`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          
          return (
            <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={action.action} className="w-full">
                  Open
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
            <CardDescription>Latest user registrations and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">user{i}@example.com</p>
                    <p className="text-xs text-muted-foreground">Registered 2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">System Healthy</p>
                  <p className="text-xs text-green-600">All services running normally</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Backup Scheduled</p>
                  <p className="text-xs text-yellow-600">Database backup in 2 hours</p>
                </div>
              </div>
              
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No critical alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminPage