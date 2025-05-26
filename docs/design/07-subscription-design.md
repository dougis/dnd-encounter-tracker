# Subscription Management
<details>
  <summary>Project Design Table of Contents</summary>
  
- [Design Overview](./technical-design-toc.md) - Table of contents and summary
- [System Architecture Overview](./01-system-architecture.md) - High-level system design and component relationships
- [Project Structure](./02-project-structure.md) - Detailed folder organization and file layout
- [Database Design](./03-database-design.md) - MongoDB schema design and relationships
- [Backend API Design](./04-backend-api-design.md) - RESTful API v1 endpoints and specifications
- [Frontend Architecture](./05-frontend-architecture.md) - React component structure and state management
- [Authentication & Authorization](./06-auth-design.md) - JWT implementation and role-based access control
- [Subscription Management](./07-subscription-design.md) - Multi-tier subscription system and billing integration
- [Real-time Features](./08-realtime-design.md) - WebSocket implementation for live encounter tracking
- [Data Persistence Strategy](./09-data-persistence.md) - Cloud sync, offline storage, and backup systems
- [Security Implementation](./10-security-design.md) - Security measures, encryption, and compliance
- [Deployment Architecture](./11-deployment-design.md) - Infrastructure, CI/CD, and monitoring setup
- [Performance Optimization](./12-performance-design.md) - Caching, optimization, and scalability strategies
---
</details>

## Multi-Tier Subscription System

The D&D Encounter Tracker implements a comprehensive freemium subscription model with five tiers, integrated with Stripe for payment processing and real-time feature access control.

## Subscription Tier Architecture

### Tier Configuration
```typescript
interface SubscriptionTier {
  name: 'free' | 'basic' | 'premium' | 'dungeon_master' | 'guild_master';
  displayName: string;
  description: string;
  pricing: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: FeatureSet;
  isActive: boolean;
}

interface FeatureSet {
  maxParties: number;                    // -1 for unlimited
  maxEncounters: number;                 // -1 for unlimited
  maxCreatures: number;                  // -1 for unlimited
  maxParticipantsPerEncounter: number;
  cloudSync: boolean;
  advancedCombatLog: boolean;
  customThemes: boolean;
  exportFeatures: boolean;
  prioritySupport: boolean;
  betaAccess: boolean;
  collaborativeMode: boolean;
  automatedBackups: boolean;
}
```

### Feature Access Control
```typescript
class FeatureAccessService {
  static canAccess(user: User, feature: string): boolean {
    // Admin override - full access to all features
    if (user.isAdmin) return true;
    
    return user.features[feature] || false;
  }
  
  static canCreate(user: User, resourceType: string, currentCount: number): boolean {
    // Admin override - no limits
    if (user.isAdmin) return true;
    
    const limit = user.features[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`];
    
    // -1 means unlimited
    if (limit === -1) return true;
    
    return currentCount < limit;
  }
  
  static getRemainingQuota(user: User, resourceType: string, currentCount: number): number {
    if (user.isAdmin) return -1; // Unlimited for admins
    
    const limit = user.features[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`];
    
    if (limit === -1) return -1; // Unlimited
    
    return Math.max(0, limit - currentCount);
  }
}
```

## Stripe Integration

### Stripe Configuration
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true
});

interface StripeConfig {
  priceIds: {
    basic: {
      monthly: string;
      yearly: string;
    };
    premium: {
      monthly: string;
      yearly: string;
    };
    dungeon_master: {
      monthly: string;
      yearly: string;
    };
    guild_master: {
      monthly: string;
      yearly: string;
    };
  };
}

const stripeConfig: StripeConfig = {
  priceIds: {
    basic: {
      monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID!,
      yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID!
    },
    premium: {
      monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!
    },
    dungeon_master: {
      monthly: process.env.STRIPE_DM_MONTHLY_PRICE_ID!,
      yearly: process.env.STRIPE_DM_YEARLY_PRICE_ID!
    },
    guild_master: {
      monthly: process.env.STRIPE_GUILD_MONTHLY_PRICE_ID!,
      yearly: process.env.STRIPE_GUILD_YEARLY_PRICE_ID!
    }
  }
};
```

### Checkout Session Creation
```typescript
class SubscriptionService {
  async createCheckoutSession(
    userId: string,
    tier: string,
    billingPeriod: 'monthly' | 'yearly',
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Get or create Stripe customer
    let customer = await this.getOrCreateStripeCustomer(user);
    
    // Get price ID for the tier and billing period
    const priceId = stripeConfig.priceIds[tier]?.[billingPeriod];
    if (!priceId) throw new Error('Invalid subscription tier or billing period');
    
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        tier: tier,
        billingPeriod: billingPeriod
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tier: tier
        }
      }
    });
    
    return session;
  }
  
  private async getOrCreateStripeCustomer(user: User): Promise<Stripe.Customer> {
    // Check if user already has a Stripe customer ID
    if (user.subscription.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(user.subscription.stripeCustomerId);
        return customer as Stripe.Customer;
      } catch (error) {
        console.warn('Stripe customer not found, creating new one');
      }
    }
    
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
      metadata: {
        userId: user._id.toString()
      }
    });
    
    // Update user with Stripe customer ID
    await User.findByIdAndUpdate(user._id, {
      'subscription.stripeCustomerId': customer.id
    });
    
    return customer;
  }
}
```

### Customer Portal Integration
```typescript
class BillingPortalService {
  async createPortalSession(userId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    const user = await User.findById(userId);
    if (!user?.subscription.stripeCustomerId) {
      throw new Error('User does not have a Stripe customer ID');
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: returnUrl
    });
    
    return session;
  }
}
```

## Webhook Handling

### Stripe Webhook Processing
```typescript
class WebhookService {
  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      throw new Error('Invalid webhook signature');
    }
    
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
  
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;
    const billingPeriod = session.metadata?.billingPeriod;
    
    if (!userId || !tier) {
      console.error('Missing metadata in checkout session');
      return;
    }
    
    // Retrieve subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Update user subscription
    await this.updateUserSubscription(userId, {
      tier,
      status: 'active',
      stripeSubscriptionId: subscription.id,
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      autoRenew: !subscription.cancel_at_period_end
    });
    
    // Log transaction
    await this.logTransaction({
      userId,
      transactionId: `checkout_${session.id}`,
      amount: session.amount_total! / 100, // Convert from cents
      currency: session.currency!,
      status: 'completed',
      paymentProvider: 'stripe',
      providerTransactionId: session.payment_intent as string,
      subscriptionTier: tier,
      billingPeriod: billingPeriod as 'monthly' | 'yearly'
    });
  }
  
  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;
    
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }
    
    // Update subscription period
    await this.updateUserSubscription(userId, {
      status: 'active',
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000)
    });
    
    // Log successful payment
    await this.logTransaction({
      userId,
      transactionId: `invoice_${invoice.id}`,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'completed',
      paymentProvider: 'stripe',
      providerTransactionId: invoice.payment_intent as string,
      subscriptionTier: subscription.metadata.tier,
      billingPeriod: invoice.billing_reason === 'subscription_cycle' ? 'renewal' : 'initial'
    });
  }
  
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;
    
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata.userId;
    
    if (!userId) return;
    
    // Update subscription status to past due
    await this.updateUserSubscription(userId, {
      status: 'past_due'
    });
    
    // Send notification email about failed payment
    await this.sendPaymentFailedNotification(userId);
  }
  
  private async updateUserSubscription(userId: string, updates: Partial<any>): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Update subscription details
    Object.assign(user.subscription, updates);
    
    // Update features based on new tier
    if (updates.tier) {
      const tier = await SubscriptionTier.findOne({ name: updates.tier });
      if (tier) {
        user.features = tier.features;
      }
    }
    
    await user.save();
  }
}
```

## Custom Pricing for Admins

### Admin Pricing Management
```typescript
interface CustomPricing {
  monthlyAmount: number;
  yearlyAmount: number;
  currency: string;
  reason: string;
  setBy: ObjectId;    // Admin user ID
  setAt: Date;
}

class AdminSubscriptionService {
  async setCustomPricing(
    adminUserId: string,
    targetUserId: string,
    customPricing: Omit<CustomPricing, 'setBy' | 'setAt'>
  ): Promise<void> {
    const admin = await User.findById(adminUserId);
    if (!admin?.isAdmin) {
      throw new Error('Only admins can set custom pricing');
    }
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }
    
    // Store old pricing for audit log
    const oldPricing = targetUser.subscription.customPricing;
    
    // Set custom pricing
    targetUser.subscription.customPricing = {
      ...customPricing,
      setBy: new mongoose.Types.ObjectId(adminUserId),
      setAt: new Date()
    };
    
    await targetUser.save();
    
    // Log admin action
    await AdminAction.create({
      adminUserId: new mongoose.Types.ObjectId(adminUserId),
      targetUserId: new mongoose.Types.ObjectId(targetUserId),
      action: 'custom_pricing_set',
      details: {
        oldValue: oldPricing,
        newValue: targetUser.subscription.customPricing,
        reason: customPricing.reason
      }
    });
  }
  
  async removeCustomPricing(adminUserId: string, targetUserId: string): Promise<void> {
    const admin = await User.findById(adminUserId);
    if (!admin?.isAdmin) {
      throw new Error('Only admins can remove custom pricing');
    }
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }
    
    const oldPricing = targetUser.subscription.customPricing;
    targetUser.subscription.customPricing = undefined;
    
    await targetUser.save();
    
    // Log admin action
    await AdminAction.create({
      adminUserId: new mongoose.Types.ObjectId(adminUserId),
      targetUserId: new mongoose.Types.ObjectId(targetUserId),
      action: 'custom_pricing_removed',
      details: {
        oldValue: oldPricing,
        newValue: null
      }
    });
  }
  
  async changeSubscriptionTier(
    adminUserId: string,
    targetUserId: string,
    newTier: string,
    reason?: string
  ): Promise<void> {
    const admin = await User.findById(adminUserId);
    if (!admin?.isAdmin) {
      throw new Error('Only admins can change subscription tiers');
    }
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }
    
    const tier = await SubscriptionTier.findOne({ name: newTier });
    if (!tier) {
      throw new Error('Invalid subscription tier');
    }
    
    const oldSubscription = { ...targetUser.subscription };
    
    // Update subscription and features
    targetUser.subscription.tier = newTier as any;
    targetUser.features = tier.features;
    
    await targetUser.save();
    
    // Log admin action
    await AdminAction.create({
      adminUserId: new mongoose.Types.ObjectId(adminUserId),
      targetUserId: new mongoose.Types.ObjectId(targetUserId),
      action: 'subscription_tier_change',
      details: {
        oldValue: {
          tier: oldSubscription.tier,
          features: oldSubscription
        },
        newValue: {
          tier: newTier,
          features: tier.features
        },
        reason
      }
    });
  }
}
```

## Usage Tracking and Limits

### Usage Monitoring Service
```typescript
class UsageTrackingService {
  async incrementUsage(userId: string, resourceType: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Don't track usage for admins
    if (user.isAdmin) return;
    
    const usageField = `usage.${resourceType}Created`;
    
    await User.findByIdAndUpdate(userId, {
      $inc: { [usageField]: 1 }
    });
  }
  
  async decrementUsage(userId: string, resourceType: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user || user.isAdmin) return;
    
    const usageField = `usage.${resourceType}Created`;
    
    await User.findByIdAndUpdate(userId, {
      $inc: { [usageField]: -1 }
    });
  }
  
  async getCurrentUsage(userId: string): Promise<UsageStats> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    return {
      partiesCreated: user.usage.partiesCreated,
      encountersCreated: user.usage.encountersCreated,
      creaturesCreated: user.usage.creaturesCreated,
      sessionsThisMonth: user.usage.sessionsThisMonth,
      storageUsedMB: user.usage.storageUsedMB,
      limits: {
        maxParties: user.features.maxParties,
        maxEncounters: user.features.maxEncounters,
        maxCreatures: user.features.maxCreatures,
        maxParticipantsPerEncounter: user.features.maxParticipantsPerEncounter
      },
      lastUsageReset: user.usage.lastUsageReset
    };
  }
  
  async resetMonthlyUsage(): Promise<void> {
    // Reset monthly counters for all users
    await User.updateMany({}, {
      $set: {
        'usage.sessionsThisMonth': 0,
        'usage.lastUsageReset': new Date()
      }
    });
  }
}
```

## Subscription Status Management

### Status Update Service
```typescript
class SubscriptionStatusService {
  async updateSubscriptionStatus(userId: string, status: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const oldStatus = user.subscription.status;
    user.subscription.status = status as any;
    
    // Handle status-specific logic
    switch (status) {
      case 'canceled':
        await this.handleSubscriptionCancellation(user);
        break;
      case 'past_due':
        await this.handlePastDueSubscription(user);
        break;
      case 'active':
        await this.handleActiveSubscription(user);
        break;
    }
    
    await user.save();
    
    // Send status change notification
    await this.sendStatusChangeNotification(user, oldStatus, status);
  }
  
  private async handleSubscriptionCancellation(user: User): Promise<void> {
    // Downgrade to free tier features but keep data
    const freeTier = await SubscriptionTier.findOne({ name: 'free' });
    if (freeTier) {
      user.features = freeTier.features;
    }
    
    // Schedule data cleanup if over free tier limits
    await this.scheduleDataCleanup(user);
  }
  
  private async handlePastDueSubscription(user: User): Promise<void> {
    // Send payment reminder emails
    await this.sendPaymentReminder(user);
    
    // After 7 days past due, downgrade features
    const gracePeriodEnd = new Date(user.subscription.endDate!);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
    
    if (new Date() > gracePeriodEnd) {
      await this.handleSubscriptionCancellation(user);
    }
  }
  
  private async handleActiveSubscription(user: User): Promise<void> {
    // Restore full tier features
    const tier = await SubscriptionTier.findOne({ name: user.subscription.tier });
    if (tier) {
      user.features = tier.features;
    }
  }
  
  private async scheduleDataCleanup(user: User): Promise<void> {
    // Implementation for scheduling data cleanup
    // This could use a job queue like Bull or AWS SQS
    console.log(`Scheduling data cleanup for user ${user._id}`);
  }
}
```

## Frontend Subscription Components

### Subscription Status Component
```typescript
const SubscriptionStatus: React.FC = () => {
  const { user } = useAuth();
  const { subscription, canAccess, isAtLimit } = useSubscription();
  
  if (!subscription) return null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'trial': return 'blue';
      case 'past_due': return 'yellow';
      case 'canceled': return 'red';
      default: return 'gray';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'trial': return 'Trial';
      case 'past_due': return 'Past Due';
      case 'canceled': return 'Canceled';
      default: return 'Unknown';
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Subscription Status</h3>
        <span className={`px-2 py-1 rounded text-sm bg-${getStatusColor(subscription.status)}-100 text-${getStatusColor(subscription.status)}-800`}>
          {getStatusText(subscription.status)}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Current Plan</p>
          <p className="font-medium">{subscription.displayName}</p>
        </div>
        
        {subscription.endDate && (
          <div>
            <p className="text-sm text-gray-600">
              {subscription.status === 'canceled' ? 'Access ends' : 'Next billing date'}
            </p>
            <p className="font-medium">
              {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          </div>
        )}
        
        {subscription.customPricing && (
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-blue-800">Custom Pricing Active</p>
            <p className="text-xs text-blue-600">{subscription.customPricing.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

### Usage Dashboard Component
```typescript
const UsageDashboard: React.FC = () => {
  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: subscriptionService.getCurrentUsage
  });
  
  if (!usage) return <LoadingSpinner />;
  
  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };
  
  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'yellow';
    return 'green';
  };
  
  const usageItems = [
    {
      name: 'Parties',
      current: usage.partiesCreated,
      limit: usage.limits.maxParties,
      icon: '👥'
    },
    {
      name: 'Encounters',
      current: usage.encountersCreated,
      limit: usage.limits.maxEncounters,
      icon: '⚔️'
    },
    {
      name: 'Creatures',
      current: usage.creaturesCreated,
      limit: usage.limits.maxCreatures,
      icon: '🐉'
    }
  ];
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Usage Statistics</h3>
      
      <div className="space-y-4">
        {usageItems.map((item) => {
          const percentage = getUsagePercentage(item.current, item.limit);
          const color = getUsageColor(percentage);
          
          return (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span>{item.icon}</span>
                  {item.name}
                </span>
                <span className="text-sm text-gray-600">
                  {item.current} / {item.limit === -1 ? '∞' : item.limit}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${item.limit === -1 ? 0 : percentage}%` }}
                />
              </div>
              
              {percentage >= 90 && item.limit !== -1 && (
                <p className="text-xs text-red-600 mt-1">
                  You're approaching your limit. Consider upgrading.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### Plan Comparison Component
```typescript
const PlanComparison: React.FC = () => {
  const { data: tiers } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: subscriptionService.getAvailableTiers
  });
  
  const { subscription } = useSubscription();
  
  const createCheckoutSession = useMutation({
    mutationFn: ({ tier, billingPeriod }: { tier: string; billingPeriod: 'monthly' | 'yearly' }) =>
      subscriptionService.createCheckoutSession(tier, billingPeriod),
    onSuccess: (data) => {
      window.location.href = data.url;
    }
  });
  
  if (!tiers) return <LoadingSpinner />;
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-6">Available Plans</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`border rounded-lg p-6 ${
              tier.name === subscription?.tier
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold">{tier.displayName}</h4>
              <p className="text-gray-600 text-sm">{tier.description}</p>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold">
                ${tier.pricing.monthly}
                <span className="text-lg text-gray-600">/mo</span>
              </div>
              {tier.pricing.yearly > 0 && (
                <div className="text-sm text-gray-600">
                  or ${tier.pricing.yearly}/year (save{' '}
                  {Math.round((1 - tier.pricing.yearly / (tier.pricing.monthly * 12)) * 100)}%)
                </div>
              )}
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm">
                <span className="mr-2">👥</span>
                {tier.features.maxParties === -1 ? 'Unlimited' : tier.features.maxParties} parties
              </li>
              <li className="flex items-center text-sm">
                <span className="mr-2">⚔️</span>
                {tier.features.maxEncounters === -1 ? 'Unlimited' : tier.features.maxEncounters} encounters
              </li>
              <li className="flex items-center text-sm">
                <span className="mr-2">🐉</span>
                {tier.features.maxCreatures === -1 ? 'Unlimited' : tier.features.maxCreatures} creatures
              </li>
              {tier.features.cloudSync && (
                <li className="flex items-center text-sm">
                  <span className="mr-2">☁️</span>
                  Cloud sync
                </li>
              )}
              {tier.features.advancedCombatLog && (
                <li className="flex items-center text-sm">
                  <span className="mr-2">📊</span>
                  Advanced combat log
                </li>
              )}
            </ul>
            
            {tier.name === subscription?.tier ? (
              <Button variant="secondary" disabled className="w-full">
                Current Plan
              </Button>
            ) : tier.name === 'free' ? (
              <Button variant="ghost" disabled className="w-full">
                Free Forever
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => createCheckoutSession.mutate({ tier: tier.name, billingPeriod: 'monthly' })}
                  className="w-full"
                  loading={createCheckoutSession.isLoading}
                >
                  Subscribe Monthly
                </Button>
                {tier.pricing.yearly > 0 && (
                  <Button
                    onClick={() => createCheckoutSession.mutate({ tier: tier.name, billingPeriod: 'yearly' })}
                    variant="secondary"
                    className="w-full"
                    loading={createCheckoutSession.isLoading}
                  >
                    Subscribe Yearly
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Subscription Analytics

### Analytics Service
```typescript
class SubscriptionAnalyticsService {
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    const [
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      churnRate,
      conversionRate
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 'subscription.status': 'active', 'subscription.tier': { $ne: 'free' } }),
      this.calculateMonthlyRevenue(),
      this.calculateChurnRate(),
      this.calculateConversionRate()
    ]);
    
    return {
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      churnRate,
      conversionRate,
      averageRevenuePerUser: activeSubscriptions > 0 ? monthlyRevenue / activeSubscriptions : 0
    };
  }
  
  private async calculateMonthlyRevenue(): Promise<number> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const transactions = await PaymentTransaction.find({
      createdAt: { $gte: currentMonth },
      status: 'completed'
    });
    
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }
  
  private async calculateChurnRate(): Promise<number> {
    // Calculate monthly churn rate
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    
    const subscriptionsAtStart = await User.countDocuments({
      'subscription.status': 'active',
      'subscription.tier': { $ne: 'free' },
      'subscription.startDate': { $lt: startOfLastMonth }
    });
    
    const canceledDuringMonth = await User.countDocuments({
      'subscription.status': 'canceled',
      'subscription.endDate': {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth
      }
    });
    
    return subscriptionsAtStart > 0 ? (canceledDuringMonth / subscriptionsAtStart) * 100 : 0;
  }
  
  private async calculateConversionRate(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const convertedUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      'subscription.tier': { $ne: 'free' }
    });
    
    return newUsers > 0 ? (convertedUsers / newUsers) * 100 : 0;
  }
}
```

This subscription management system provides a comprehensive freemium model with Stripe integration, admin controls for custom pricing, usage tracking, and detailed analytics for business intelligence.