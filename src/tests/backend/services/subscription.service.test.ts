import { subscriptionService } from '@/services/subscription.service';
import { User } from '@/models/User.model';
import { SubscriptionTier } from '@/models/SubscriptionTier.model';
import { PaymentTransaction } from '@/models/PaymentTransaction.model';
import { stripe } from '@/config/stripe.config';

// Mock dependencies
jest.mock('@/models/User.model', () => ({
  User: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('@/models/SubscriptionTier.model', () => ({
  SubscriptionTier: {
    findOne: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('@/models/PaymentTransaction.model', () => ({
  PaymentTransaction: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('@/config/stripe.config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    customers: {
      retrieve: jest.fn(),
      create: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}));

describe('Subscription Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionTiers', () => {
    test('should return all active subscription tiers', async () => {
      const mockTiers = [
        {
          name: 'free',
          displayName: 'Free Adventurer',
          pricing: { monthly: 0, yearly: 0 },
          features: {},
          isActive: true,
        },
        {
          name: 'premium',
          displayName: 'Premium',
          pricing: { monthly: 9.99, yearly: 99.99 },
          features: {},
          isActive: true,
        },
      ];

      (SubscriptionTier.find as jest.Mock).mockResolvedValue(mockTiers);

      const tiers = await subscriptionService.getSubscriptionTiers();

      expect(SubscriptionTier.find).toHaveBeenCalledWith({ isActive: true });
      expect(tiers).toEqual(mockTiers);
    });
  });

  describe('getCurrentSubscription', () => {
    test('should return user subscription details', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        subscription: {
          tier: 'premium',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(),
        },
        features: {
          maxParties: 10,
          cloudSync: true,
        },
      };

      const mockTier = {
        name: 'premium',
        displayName: 'Premium',
        pricing: { monthly: 9.99, yearly: 99.99 },
        features: {
          maxParties: 10,
          cloudSync: true,
        },
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (SubscriptionTier.findOne as jest.Mock).mockResolvedValue(mockTier);

      const subscription = await subscriptionService.getCurrentSubscription('user123');

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(SubscriptionTier.findOne).toHaveBeenCalledWith({ name: 'premium' });
      expect(subscription).toEqual({
        tier: 'premium',
        displayName: 'Premium',
        status: 'active',
        startDate: mockUser.subscription.startDate,
        endDate: mockUser.subscription.endDate,
        features: mockUser.features,
        pricing: mockTier.pricing,
      });
    });

    test('should return null when user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const subscription = await subscriptionService.getCurrentSubscription('user123');

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(subscription).toBeNull();
    });
  });

  describe('createCheckoutSession', () => {
    test('should create a Stripe checkout session', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        subscription: {
          stripeCustomerId: 'cus_123',
        },
      };

      const mockTier = {
        name: 'premium',
        displayName: 'Premium',
        pricing: { monthly: 9.99, yearly: 99.99 },
      };

      const mockSession = {
        id: 'cs_123',
        url: 'https://checkout.stripe.com/123',
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (SubscriptionTier.findOne as jest.Mock).mockResolvedValue(mockTier);
      (stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_123' });
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);

      const session = await subscriptionService.createCheckoutSession(
        'user123',
        'premium',
        'monthly',
        'https://success.com',
        'https://cancel.com'
      );

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(SubscriptionTier.findOne).toHaveBeenCalledWith({ name: 'premium' });
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_123',
          metadata: expect.objectContaining({
            userId: 'user123',
            tier: 'premium',
          }),
        })
      );
      expect(session).toEqual(mockSession);
    });

    test('should create a new Stripe customer if user does not have one', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        subscription: {},
      };

      const mockTier = {
        name: 'premium',
        displayName: 'Premium',
        pricing: { monthly: 9.99, yearly: 99.99 },
      };

      const mockCustomer = {
        id: 'cus_new',
      };

      const mockSession = {
        id: 'cs_123',
        url: 'https://checkout.stripe.com/123',
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (SubscriptionTier.findOne as jest.Mock).mockResolvedValue(mockTier);
      (stripe.customers.create as jest.Mock).mockResolvedValue(mockCustomer);
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const session = await subscriptionService.createCheckoutSession(
        'user123',
        'premium',
        'monthly',
        'https://success.com',
        'https://cancel.com'
      );

      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'testuser',
        metadata: {
          userId: 'user123',
        },
      });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { 'subscription.stripeCustomerId': 'cus_new' }
      );
      expect(session).toEqual(mockSession);
    });

    test('should throw error when user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        subscriptionService.createCheckoutSession(
          'user123',
          'premium',
          'monthly',
          'https://success.com',
          'https://cancel.com'
        )
      ).rejects.toThrow('User not found');
    });

    test('should throw error when tier not found', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        subscription: {},
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (SubscriptionTier.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        subscriptionService.createCheckoutSession(
          'user123',
          'nonexistent',
          'monthly',
          'https://success.com',
          'https://cancel.com'
        )
      ).rejects.toThrow('Invalid subscription tier');
    });
  });

  describe('createCustomerPortalSession', () => {
    test('should create a customer portal session', async () => {
      const mockUser = {
        _id: 'user123',
        subscription: {
          stripeCustomerId: 'cus_123',
        },
      };

      const mockSession = {
        id: 'bps_123',
        url: 'https://billing.stripe.com/123',
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue(mockSession);

      const session = await subscriptionService.createCustomerPortalSession(
        'user123',
        'https://return.com'
      );

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: 'https://return.com',
      });
      expect(session).toEqual(mockSession);
    });

    test('should throw error when user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        subscriptionService.createCustomerPortalSession('user123', 'https://return.com')
      ).rejects.toThrow('User not found');
    });

    test('should throw error when user does not have Stripe customer ID', async () => {
      const mockUser = {
        _id: 'user123',
        subscription: {},
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        subscriptionService.createCustomerPortalSession('user123', 'https://return.com')
      ).rejects.toThrow('User does not have a Stripe customer ID');
    });
  });

  describe('handleSubscriptionUpdated', () => {
    test('should update user subscription details', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        current_period_start: 1622505600, // Unix timestamp for June 1, 2021
        current_period_end: 1625097600, // Unix timestamp for July 1, 2021
        cancel_at_period_end: false,
        metadata: {
          userId: 'user123',
          tier: 'premium',
        },
      };

      const mockTier = {
        name: 'premium',
        features: {
          maxParties: 10,
          cloudSync: true,
        },
      };

      const mockUser = {
        _id: 'user123',
        subscription: {
          tier: 'basic',
          status: 'trial',
        },
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (SubscriptionTier.findOne as jest.Mock).mockResolvedValue(mockTier);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      await subscriptionService.handleSubscriptionUpdated(mockSubscription);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(SubscriptionTier.findOne).toHaveBeenCalledWith({ name: 'premium' });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          'subscription.tier': 'premium',
          'subscription.status': 'active',
          'subscription.startDate': new Date(1622505600 * 1000),
          'subscription.endDate': new Date(1625097600 * 1000),
          'subscription.autoRenew': true,
          'features': mockTier.features,
        })
      );
    });

    test('should handle missing user ID in metadata', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        metadata: {},
      };

      await subscriptionService.handleSubscriptionUpdated(mockSubscription);

      expect(User.findById).not.toHaveBeenCalled();
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should handle user not found', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        metadata: {
          userId: 'user123',
          tier: 'premium',
        },
      };

      (User.findById as jest.Mock).mockResolvedValue(null);

      await subscriptionService.handleSubscriptionUpdated(mockSubscription);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});
