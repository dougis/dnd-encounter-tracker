import {
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionBillingCycle,
  SubscriptionFeature,
  SubscriptionDetails,
  PaymentMethod,
  BillingAddress,
  Invoice,
  InvoiceStatus,
  PaymentStatus,
} from '../../src/types/subscription';

describe('Subscription Types', () => {
  describe('SubscriptionDetails', () => {
    const baseSubscription: SubscriptionDetails = {
      id: 'sub_123',
      userId: 'user_123',
      tier: SubscriptionTier.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: SubscriptionBillingCycle.MONTHLY,
      currentPeriodStart: '2023-01-01T00:00:00Z',
      currentPeriodEnd: '2023-02-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      isTrial: false,
      isActive: true,
      autoRenew: true,
      quantity: 1,
      paymentProvider: 'stripe',
      externalSubscriptionId: 'sub_123',
      features: [
        SubscriptionFeature.UNLIMITED_ENCOUNTERS,
        SubscriptionFeature.ADVANCED_ANALYTICS,
      ],
      paymentMethod: {
        id: 'pm_123',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expMonth: 12,
        expYear: 2025,
      },
      billingAddress: {
        line1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
      },
      nextBillingDate: '2023-02-01T00:00:00Z',
      createdAt: '2022-12-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    it('should create a valid subscription', () => {
      const subscription: SubscriptionDetails = {
        ...baseSubscription,
      };

      expect(subscription.id).toBe('sub_123');
      expect(subscription.userId).toBe('user_123');
      expect(subscription.tier).toBe(SubscriptionTier.PREMIUM);
      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);
      expect(subscription.billingCycle).toBe(SubscriptionBillingCycle.MONTHLY);
      expect(subscription.currentPeriodStart).toBe('2023-01-01T00:00:00Z');
      expect(subscription.currentPeriodEnd).toBe('2023-02-01T00:00:00Z');
      expect(subscription.cancelAtPeriodEnd).toBe(false);
      expect(subscription.features).toContain(SubscriptionFeature.UNLIMITED_ENCOUNTERS);
      expect(subscription.features).toContain(SubscriptionFeature.ADVANCED_ANALYTICS);
      expect(subscription.paymentMethod).toBeDefined();
      expect(subscription.billingAddress).toBeDefined();
      expect(subscription.nextBillingDate).toBe('2023-02-01T00:00:00Z');
      expect(subscription.createdAt).toBe('2022-12-01T00:00:00Z');
      expect(subscription.updatedAt).toBe('2023-01-01T00:00:00Z');
    });

    it('should handle optional fields', () => {
      const subscription: SubscriptionDetails = {
        ...baseSubscription,
        isTrial: true,
        trialEnd: Date.parse('2023-01-15T00:00:00Z'),
        trialStart: Date.parse('2023-01-01T00:00:00Z'),
        trialSettings: {
          endBehavior: {
            missingPaymentMethod: 'pause'
          }
        },
        canceledAt: null,
        endedAt: null,
        promoCode: 'WELCOME20',
        notes: 'Customer is on a special plan',
      };

      expect(subscription.trialEnd).toBe(Date.parse('2023-01-15T00:00:00Z'));
      expect(subscription.isTrial).toBe(true);
      expect(subscription.trialStart).toBeDefined();
      expect(subscription.canceledAt).toBeNull();
      expect(subscription.endedAt).toBeNull();
      expect(subscription.promoCode).toBe('WELCOME20');
      expect(subscription.notes).toBe('Customer is on a special plan');
    });
  });

  describe('Enums', () => {
    it('should have correct SubscriptionTier values', () => {
      expect(SubscriptionTier.FREE).toBe('free');
      expect(SubscriptionTier.BASIC).toBe('basic');
      expect(SubscriptionTier.PREMIUM).toBe('premium');
      expect(SubscriptionTier.ULTIMATE).toBe('ultimate');
      expect(SubscriptionTier.SEASONED).toBe('seasoned');
      expect(SubscriptionTier.EXPERT).toBe('expert');
      expect(SubscriptionTier.MASTER).toBe('master');
      expect(SubscriptionTier.GUILD_MASTER).toBe('guild_master');
    });

    it('should have correct SubscriptionStatus values', () => {
      expect(SubscriptionStatus.ACTIVE).toBe('active');
      expect(SubscriptionStatus.TRIALING).toBe('trialing');
      expect(SubscriptionStatus.TRIAL).toBe('trial');
      expect(SubscriptionStatus.PAST_DUE).toBe('past_due');
      expect(SubscriptionStatus.CANCELED).toBe('canceled');
      expect(SubscriptionStatus.UNPAID).toBe('unpaid');
      expect(SubscriptionStatus.PAUSED).toBe('paused');
    });

    it('should have correct SubscriptionBillingCycle values', () => {
      expect(SubscriptionBillingCycle.MONTHLY).toBe('monthly');
      expect(SubscriptionBillingCycle.YEARLY).toBe('yearly');
    });

    it('should have correct SubscriptionFeature values', () => {
      expect(SubscriptionFeature.UNLIMITED_ENCOUNTERS).toBe('unlimited_encounters');
      expect(SubscriptionFeature.ADVANCED_ANALYTICS).toBe('advanced_analytics');
      expect(SubscriptionFeature.CUSTOM_CONTENT).toBe('custom_content');
      expect(SubscriptionFeature.PRIORITY_SUPPORT).toBe('priority_support');
    });
  });

  describe('Related Types', () => {
    it('should create a valid PaymentMethod', () => {
      const paymentMethod: PaymentMethod = {
        id: 'pm_123',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expMonth: 12,
        expYear: 2025,
      };

      expect(paymentMethod.id).toBe('pm_123');
      expect(paymentMethod.type).toBe('card');
      expect(paymentMethod.last4).toBe('4242');
      expect(paymentMethod.brand).toBe('visa');
      expect(paymentMethod.expMonth).toBe(12);
      expect(paymentMethod.expYear).toBe(2025);
    });

    it('should create a valid BillingAddress', () => {
      const billingAddress: BillingAddress = {
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
      };

      expect(billingAddress.line1).toBe('123 Main St');
      expect(billingAddress.line2).toBe('Apt 4B');
      expect(billingAddress.city).toBe('Anytown');
      expect(billingAddress.state).toBe('CA');
      expect(billingAddress.postalCode).toBe('12345');
      expect(billingAddress.country).toBe('US');
    });

    it('should create a valid Invoice', () => {
      const invoice: Invoice = {
        id: 'in_123',
        number: 'INV-2023-001',
        status: InvoiceStatus.PAID,
        amount: 9.99,
        currency: 'usd',
        paymentStatus: PaymentStatus.PAID,
        paid: true,
        periodStart: '2023-01-01T00:00:00Z',
        periodEnd: '2023-02-01T00:00:00Z',
        hostedInvoiceUrl: 'https://example.com/invoices/in_123',
        invoicePdf: 'https://example.com/invoices/in_123/pdf',
        createdAt: '2023-01-01T00:00:00Z',
        lines: [{
          id: 'il_123',
          amount: 9.99,
          currency: 'usd',
          description: 'Premium Subscription',
          period: {
            start: Date.parse('2023-01-01T00:00:00Z') / 1000,
            end: Date.parse('2023-02-01T00:00:00Z') / 1000
          },
          quantity: 1,
          type: 'subscription',
          price: {
            id: 'price_123',
            unitAmount: 9.99,
            currency: 'usd',
            type: 'recurring',
            recurring: {
              interval: 'month',
              intervalCount: 1
            }
          }
        }]
      };

      expect(invoice.id).toBe('in_123');
      expect(invoice.status).toBe(InvoiceStatus.PAID);
      expect(invoice.amount).toBe(9.99);
      expect(invoice.paid).toBe(true);
      expect(invoice.lines).toHaveLength(1);
      expect(invoice.lines[0].type).toBe('subscription');
    });
  });
});
