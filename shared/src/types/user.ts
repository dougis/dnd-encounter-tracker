import { SubscriptionDetails, UsageStats } from '.';

export interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  subscription: Omit<SubscriptionDetails, 
    'paymentMethodId' | 'lastPaymentDate' | 'nextBillingDate' | 
    'cancelAtPeriodEnd' | 'cancelAt' | 'canceledAt' | 
    'currentPeriodStart' | 'currentPeriodEnd' | 'daysUntilDue' | 
    'invoiceSettings' | 'pendingSetupIntent' | 'pendingUpdate' | 
    'quantity' | 'schedule' | 'transferData' | 'trialSettings'
  >;
  usage: Partial<UsageStats> & {
    // Keep the legacy fields for backward compatibility
    partiesCreated?: number;
    encountersCreated?: number;
    creaturesCreated?: number;
    sessionsThisMonth?: number;
    storageUsedMB?: number;
    lastUsageReset?: string;
  };
  features: FeatureFlags;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlags {
  maxParties: number; // -1 for unlimited
  maxEncounters: number; // -1 for unlimited
  maxCreatures: number; // -1 for unlimited
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

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultDiceRoller: boolean;
  autoSave: boolean;
  notifications: {
    email: boolean;
    marketing: boolean;
    updates: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  subscription: SubscriptionDetails;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}
