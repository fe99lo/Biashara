import { APIIntegration, Transaction, APIIntegrationSettings } from './types';

// Secure credential storage interface
interface SecureCredentials {
  encryptedData: string;
  iv: string;
  timestamp: number;
}

export class APIIntegrationService {
  private integrations: Map<string, APIIntegration> = new Map();
  private webhookHandlers: Map<string, (payload: any) => Promise<void>> = new Map();
  private readonly encryptionKey: CryptoKey | null = null;
  
  constructor() {}
  
  // Generate secure random ID using crypto API
  private generateSecureId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback with cryptographically secure random values
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Validate webhook signature for security
  // IMPORTANT: In production, this should receive the raw body string/bytes from the HTTP layer
  // NOT the parsed JSON object, as JSON.stringify can change whitespace/key order
  private async verifyWebhookSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
    if (!signature || !secret) {
      return false;
    }
    
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );
      
      const payloadData = encoder.encode(rawBody);
      const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
      
      const isValid = await crypto.subtle.verify(
        'HMAC',
        cryptoKey,
        signatureBuffer,
        payloadData
      );
      
      return isValid;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
  
  // Rate limiting state
  private rateLimitState: Map<string, { count: number; resetTime: number }> = new Map();
  
  // Check rate limit (requests per minute)
  private checkRateLimit(clientId: string, limit: number = 60): boolean {
    const now = Date.now();
    const state = this.rateLimitState.get(clientId);
    
    if (!state || now > state.resetTime) {
      this.rateLimitState.set(clientId, { count: 1, resetTime: now + 60000 });
      return true;
    }
    
    if (state.count >= limit) {
      return false;
    }
    
    state.count++;
    return true;
  }

  registerIntegration(integration: APIIntegration): void {
    this.integrations.set(integration.id, integration);
  }

  getIntegration(id: string): APIIntegration | null {
    return this.integrations.get(id) || null;
  }

  getAllIntegrations(): APIIntegration[] {
    return Array.from(this.integrations.values());
  }

  async connectMpesa(credentials: { apiKey: string; consumerKey: string; shortcode: string; passkey: string }): Promise<APIIntegration> {
    const integration: APIIntegration = {
      id: crypto.randomUUID(),
      provider: 'mpesa',
      name: 'M-Pesa Integration',
      status: 'active',
      credentials,
      settings: {
        autoImport: true,
        importFrequency: 60000,
        transactionMapping: {
          'TransactionID': 'id',
          'Amount': 'amount',
          'MSISDN': 'metadata.phone'
        },
        enabledFeatures: ['payments', 'refunds', 'balance_inquiry']
      }
    };
    
    this.registerIntegration(integration);
    return integration;
  }

  async connectPaypal(credentials: { clientId: string; clientSecret: string; sandbox?: boolean }): Promise<APIIntegration> {
    const integration: APIIntegration = {
      id: crypto.randomUUID(),
      provider: 'paypal',
      name: 'PayPal Integration',
      status: 'active',
      credentials,
      settings: {
        autoImport: true,
        importFrequency: 300000,
        transactionMapping: {
          'transaction_id': 'id',
          'amount.total': 'amount',
          'payer.email': 'metadata.email'
        },
        enabledFeatures: ['payments', 'subscriptions', 'invoicing']
      }
    };
    
    this.registerIntegration(integration);
    return integration;
  }

  async connectStripe(credentials: { apiKey: string; webhookSecret: string }): Promise<APIIntegration> {
    const integration: APIIntegration = {
      id: crypto.randomUUID(),
      provider: 'stripe',
      name: 'Stripe Integration',
      status: 'active',
      credentials,
      settings: {
        autoImport: true,
        importFrequency: 60000,
        transactionMapping: {
          'id': 'id',
          'amount': 'amount',
          'customer': 'metadata.customer'
        },
        enabledFeatures: ['payments', 'subscriptions', 'connect']
      }
    };
    
    this.registerIntegration(integration);
    return integration;
  }

  async connectFlutterwave(credentials: { publicKey: string; secretKey: string }): Promise<APIIntegration> {
    const integration: APIIntegration = {
      id: crypto.randomUUID(),
      provider: 'flutterwave',
      name: 'Flutterwave Integration',
      status: 'active',
      credentials,
      settings: {
        autoImport: true,
        importFrequency: 120000,
        transactionMapping: {
          'transaction_id': 'id',
          'amount': 'amount',
          'customer.email': 'metadata.email'
        },
        enabledFeatures: ['payments', 'transfers', 'virtual_accounts']
      }
    };
    
    this.registerIntegration(integration);
    return integration;
  }

  async connectPaystack(credentials: { publicKey: string; secretKey: string }): Promise<APIIntegration> {
    const integration: APIIntegration = {
      id: crypto.randomUUID(),
      provider: 'paystack',
      name: 'Paystack Integration',
      status: 'active',
      credentials,
      settings: {
        autoImport: true,
        importFrequency: 120000,
        transactionMapping: {
          'reference': 'id',
          'amount': 'amount',
          'customer.email': 'metadata.email'
        },
        enabledFeatures: ['payments', 'subscriptions', 'invoices']
      }
    };
    
    this.registerIntegration(integration);
    return integration;
  }

  async fetchTransactions(integrationId: string, options?: { startDate?: number; endDate?: number; limit?: number }): Promise<Transaction[]> {
    const integration = this.getIntegration(integrationId);
    if (!integration || integration.status !== 'active') {
      throw new Error('Integration not found or inactive');
    }

    // Simulate API call - in production, this would call the actual payment provider API
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTransactions: Transaction[] = [
          {
            id: `txn_${Date.now()}_1`,
            type: 'income',
            amount: 1000,
            currency: 'KES',
            description: 'Payment via ' + integration.provider,
            category: 'sales',
            date: Date.now(),
            status: 'completed',
            metadata: { source: integration.provider },
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ];
        resolve(mockTransactions);
      }, 100);
    });
  }

  async processWebhook(integrationId: string, rawBody: string, payload: any, signature?: string): Promise<void> {
    // Rate limit webhook processing
    if (!this.checkRateLimit(`webhook_${integrationId}`, 100)) {
      throw new Error('Rate limit exceeded');
    }
    
    const integration = this.getIntegration(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }
    
    // Verify webhook signature if secret is available
    const webhookSecret = (integration.credentials as any)?.webhookSecret;
    if (webhookSecret && signature) {
      const isValid = await this.verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    } else if (webhookSecret && !signature) {
      throw new Error('Missing webhook signature');
    }
    
    const handler = this.webhookHandlers.get(integrationId);
    if (handler) {
      await handler(payload);
    }
  }

  registerWebhookHandler(integrationId: string, handler: (payload: any) => Promise<void>): void {
    this.webhookHandlers.set(integrationId, handler);
  }

  async disconnect(integrationId: string): Promise<void> {
    const integration = this.getIntegration(integrationId);
    if (integration) {
      integration.status = 'inactive';
      this.integrations.set(integrationId, integration);
    }
  }

  validateCredentials(provider: string, credentials: Record<string, string>): Promise<boolean> {
    // Simulate validation - in production, this would make a test API call
    return Promise.resolve(Object.keys(credentials).length > 0);
  }

  async getBalance(integrationId: string): Promise<{ available: number; pending: number; currency: string }> {
    const integration = this.getIntegration(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // Simulate balance fetch
    return {
      available: 50000,
      pending: 5000,
      currency: 'KES'
    };
  }
}

export default APIIntegrationService;
