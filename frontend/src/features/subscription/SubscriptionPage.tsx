import React from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Check, Star, Zap } from 'lucide-react'
import { SubscriptionTier } from '@dnd-encounter-tracker/shared'

const SubscriptionPage: React.FC = () => {
  const { user } = useAuthStore()

  const plans = [
    {
      tier: SubscriptionTier.FREE,
      name: 'Free Adventurer',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for new DMs and casual games',
      features: [
        '1 party, 3 encounters, 10 creatures',
        '6 max participants per encounter',
        'Local storage only',
        'Basic combat tracking',
        'Community support'
      ],
      limitations: [
        'No cloud sync',
        'No advanced features',
        'Limited storage'
      ],
      popular: false,
      current: user?.subscription?.tier === SubscriptionTier.FREE
    },
    {
      tier: SubscriptionTier.SEASONED,
      name: 'Seasoned Adventurer',
      price: { monthly: 4.99, yearly: 49.99 },
      description: 'Great for regular DMs running ongoing campaigns',
      features: [
        '3 parties, 15 encounters, 50 creatures',
        '10 max participants per encounter',
        'Cloud sync and automated backups',
        'Advanced combat logging',
        'Export features (PDF, JSON)',
        'Email support'
      ],
      limitations: [],
      popular: true,
      current: user?.subscription?.tier === SubscriptionTier.SEASONED
    },
    {
      tier: SubscriptionTier.EXPERT,
      name: 'Expert Dungeon Master',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'Perfect for serious DMs with multiple campaigns',
      features: [
        '10 parties, 50 encounters, 200 creatures',
        '20 max participants per encounter',
        'Custom themes and UI customization',
        'Collaborative mode (shared campaigns)',
        'Priority email support',
        'Beta access to new features'
      ],
      limitations: [],
      popular: false,
      current: user?.subscription?.tier === SubscriptionTier.EXPERT
    },
    {
      tier: SubscriptionTier.MASTER,
      name: 'Master of Dungeons',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'For power users and content creators',
      features: [
        '25 parties, 100 encounters, 500 creatures',
        '30 max participants per encounter',
        'Advanced analytics and reporting',
        'White-label options',
        'API access for integrations',
        'Priority phone/chat support'
      ],
      limitations: [],
      popular: false,
      current: user?.subscription?.tier === SubscriptionTier.MASTER
    }
  ]

  const handleUpgrade = (tier: SubscriptionTier) => {
    // TODO: Implement Stripe checkout
    console.log('Upgrading to:', tier)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2">
          Choose the perfect plan for your D&D adventures
        </p>
      </div>

      {/* Current Plan Status */}
      {user?.subscription && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-primary" />
              <span>Current Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold capitalize">
                  {user.subscription.tier.replace('_', ' ')} Plan
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user.subscription.status === 'active' ? 'Active' : 'Inactive'} • 
                  Renews {user.subscription.currentPeriodEnd}
                </p>
              </div>
              <Button variant="outline">
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-lg">
          <Button variant="default" size="sm">
            Monthly
          </Button>
          <Button variant="ghost" size="sm">
            Yearly (Save 17%)
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.tier} 
            className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''} ${plan.current ? 'bg-primary/5' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}
            
            {plan.current && (
              <div className="absolute -top-3 right-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Current Plan
                </div>
              </div>
            )}

            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className={`h-5 w-5 ${plan.tier === SubscriptionTier.FREE ? 'text-gray-400' : 'text-yellow-500'}`} />
                <span>{plan.name}</span>
              </CardTitle>
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">
                    ${plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    /month
                  </span>
                </div>
                {plan.price.yearly > 0 && (
                  <p className="text-sm text-muted-foreground">
                    or ${plan.price.yearly}/year
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start space-x-2 text-xs text-muted-foreground">
                        <span className="text-red-400">×</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                className="w-full mt-6"
                variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                disabled={plan.current}
                onClick={() => handleUpgrade(plan.tier)}
              >
                {plan.current ? (
                  'Current Plan'
                ) : plan.tier === SubscriptionTier.FREE ? (
                  'Downgrade'
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Can I change my plan anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, 
              or at the end of your current billing period for downgrades.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">What happens to my data if I downgrade?</h4>
            <p className="text-sm text-muted-foreground">
              Your data is preserved, but you may lose access to features that exceed your new plan's limits. 
              We'll help you export any excess data before the change takes effect.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Do you offer refunds?</h4>
            <p className="text-sm text-muted-foreground">
              We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, 
              contact our support team for a full refund.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubscriptionPage