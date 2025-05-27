// Subscription Tiers
export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ULTIMATE = 'ultimate',
  SEASONED = 'seasoned',
  EXPERT = 'expert',
  MASTER = 'master',
  GUILD_MASTER = 'guild_master',
}

// Subscription Statuses
export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  TRIAL = 'trial',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
  PAUSED = 'paused',
}

export interface UsageStats {
  // Basic usage metrics
  partiesCreated: number;
  encountersCreated: number;
  creaturesCreated: number;
  sessionsThisMonth: number;
  storageUsedMB: number;
  lastUsageReset: string;
  
  // Encounter usage tracking
  encounters: {
    current: number;
    max: number;
  };
  
  // Player usage tracking
  players: {
    current: number;
    max: number;
  };
  
  // Storage usage tracking (in MB)
  storage: {
    used: number;
    max: number;
  };
  
  // Timestamp of last update
  lastUpdated: string;
  
  // Legacy fields for backward compatibility
  [key: string]: any;
}

// Billing cycle for subscriptions
export enum SubscriptionBillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SubscriptionDetails {
  // Core subscription details
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: SubscriptionBillingCycle;
  
  // Billing period details
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  nextBillingDate?: string;
  daysUntilDue?: number;
  defaultPaymentMethod?: string;
  
  // Trial information
  isTrial: boolean;
  trialEnd?: number; // Timestamp for trial end
  trialStart?: number; // Timestamp for trial start
  trialSettings?: {
    endBehavior: {
      missingPaymentMethod: 'createInvoice' | 'pause' | 'deactivate' | 'cancel';
    };
  };
  
  // Subscription state
  isActive: boolean;
  canceledAt?: string | null;
  endedAt?: string | null;
  autoRenew: boolean;
  
  // Payment and billing
  paymentMethod?: PaymentMethod;
  paymentMethodId?: string;
  paymentProvider: 'stripe' | 'paypal' | 'apple' | 'google';
  billingAddress?: BillingAddress;
  lastPaymentDate?: string;
  
  // Subscription details
  quantity: number;
  externalSubscriptionId: string;
  features: string[];
  promoCode?: string;
  notes?: string;
  schedule?: string;
  
  // Custom pricing information (for special plans)
  customPricing?: {
    monthlyAmount: number;
    yearlyAmount: number;
    currency: string;
    reason: string;
    setBy: string; // User ID
    setAt: string;
  };
  
  // Invoice settings
  invoiceSettings?: {
    customFields?: Record<string, string>;
    defaultPaymentMethod?: string;
    footer?: string;
  };
  
  // Pending updates
  pendingSetupIntent?: string;
  pendingUpdate?: {
    billingCycleAnchor?: number;
    billingThresholds?: {
      amountGte?: number;
      resetBillingCycleAnchor?: boolean;
    };
    cancelAt?: number;
    cancelAtPeriodEnd?: boolean;
    collectionMethod?: 'chargeAutomatically' | 'sendInvoice';
    coupon?: string;
    daysUntilDue?: number;
    defaultPaymentMethod?: string;
    defaultSource?: string;
    defaultTaxRates?: string[];
    items?: Array<{
      id: string;
      price: string;
      quantity: number;
    }>;
    metadata?: Record<string, string>;
    offSession?: boolean;
    paymentBehavior?: 'allowIncomplete' | 'defaultIncomplete' | 'errorIfIncomplete' | 'pendingIfIncomplete';
    paymentSettings?: {
      paymentMethodOptions?: {
        acssDebit?: {
          mandateOptions?: {
            transactionType?: 'business' | 'personal';
          };
          verificationMethod?: 'automatic' | 'instant' | 'microdeposits';
        };
        bancontact?: {
          preferredLanguage?: 'de' | 'en' | 'fr' | 'nl';
        };
        card?: {
          installments?: {
            enabled?: boolean;
            plan?: {
              count: number;
              interval: 'month';
              type: 'fixed_count';
            };
          };
          requestThreeDSecure?: 'any' | 'automatic' | 'challenge';
        };
        cardPresent?: {
          requestExtendedAuthorization?: boolean;
          requestIncrementalAuthorizationSupport?: boolean;
        };
        customerBalance?: {
          bankTransfer?: {
            euBankTransfer?: {
              country: string;
            };
            requestedAddressTypes?: ('iban' | 'sortCode' | 'spei' | 'zengin')[];
            type: string;
          };
          fundingType?: 'bank_transfer';
        };
        ideal?: {
          setupFutureUsage?: 'none' | 'off_session';
        };
        sepaDebit?: {
          mandateOptions?: {
            reference: string;
            supportedTypes?: ('one_off' | 'recurring')[];
          };
        };
        sofort?: {
          preferredLanguage?: 'de' | 'en' | 'es' | 'fr' | 'it' | 'nl' | 'pl';
        };
        usBankAccount?: {
          financialConnections?: {
            permissions?: ('balances' | 'paymentMethod' | 'transactions')[];
          };
          verificationMethod?: 'automatic' | 'instant' | 'microdeposits';
        };
      };
      paymentMethodTypes?: string[];
      saveDefaultPaymentMethod?: 'off' | 'on_subscription';
    };
    pendingInvoiceItemInterval?: {
      interval: 'day' | 'month' | 'week' | 'year';
      intervalCount: number;
    };
    promotionCode?: string;
    transferData?: {
      amount?: number;
      destination: string;
    };
    trialFromPlan?: boolean;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Subscription features
export enum SubscriptionFeature {
  UNLIMITED_ENCOUNTERS = 'unlimited_encounters',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  CUSTOM_CONTENT = 'custom_content',
  PRIORITY_SUPPORT = 'priority_support',
}

export interface SubscriptionFeatureDetails {
  id: string;
  name: string;
  description: string;
  tiers: {
    [key in SubscriptionTier]?: {
      included: boolean;
      limit?: number;
      value?: string | number | boolean;
    };
  };
}

export interface SubscriptionTierDetails {
  id: SubscriptionTier;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: string[];
  mostPopular: boolean;
  cta: string;
  highlight?: string;
}

export interface UsageStats {
  encounters: {
    current: number;
    max: number;
  };
  players: {
    current: number;
    max: number;
  };
  storage: {
    used: number; // in MB
    max: number; // in MB
  };
  lastUpdated: string;
}

export interface BillingInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxIds?: {
    type: string;
    value: string;
  }[];
}

// Invoice statuses
export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  UNCOLLECTIBLE = 'uncollectible',
  VOID = 'void',
}

// Payment statuses
export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  NO_PAYMENT_REQUIRED = 'no_payment_required',
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paid: boolean;
  periodStart: string;
  periodEnd: string;
  hostedInvoiceUrl: string;
  invoicePdf: string;
  createdAt: string;
  amountDue?: number;
  amountPaid?: number;
  amountRemaining?: number;
  dueDate?: string;
  description?: string;
  lines: {
    id: string;
    amount: number;
    currency: string;
    description: string;
    period: {
      start: number;
      end: number;
    };
    plan?: {
      id: string;
      name: string;
      interval: 'day' | 'month' | 'week' | 'year';
      intervalCount: number;
    };
    price?: {
      id: string;
      nickname?: string;
      unitAmount: number;
      currency: string;
      type: 'one_time' | 'recurring';
      recurring?: {
        interval: 'day' | 'month' | 'week' | 'year';
        intervalCount: number;
      };
    };
    quantity: number;
    subscription?: string;
    subscriptionItem?: string;
    type: 'subscription' | 'invoiceitem' | 'subscription_threshold';
  }[];
}
