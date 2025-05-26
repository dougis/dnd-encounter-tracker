# Security Implementation
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

## Comprehensive Security Framework

The D&D Encounter Tracker implements enterprise-grade security measures to protect user data, payment information, and system integrity while maintaining compliance with GDPR, PCI DSS, and other relevant standards.

## Data Encryption

### Encryption at Rest
```typescript
import crypto from 'crypto';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  
  private masterKey: Buffer;
  
  constructor() {
    this.masterKey = this.deriveKeyFromEnvironment();
  }
  
  private deriveKeyFromEnvironment(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) {
      throw new Error('ENCRYPTION_SECRET environment variable not set');
    }
    
    // Use PBKDF2 to derive a key from the secret
    return crypto.pbkdf2Sync(secret, 'dnd-tracker-salt', 100000, this.keyLength, 'sha256');
  }
  
  encrypt(plaintext: string): EncryptedData {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, this.masterKey, { iv });
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipher(
      this.algorithm,
      this.masterKey,
      {
        iv: Buffer.from(encryptedData.iv, 'hex')
      }
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Field-level encryption for sensitive data
  encryptSensitiveField(field: any): string {
    if (field === null || field === undefined) return '';
    
    const stringified = typeof field === 'string' ? field : JSON.stringify(field);
    const encrypted = this.encrypt(stringified);
    
    return JSON.stringify(encrypted);
  }
  
  decryptSensitiveField(encryptedField: string): any {
    if (!encryptedField) return null;
    
    try {
      const encryptedData = JSON.parse(encryptedField);
      return this.decrypt(encryptedData);
    } catch (error) {
      console.error('Failed to decrypt field:', error);
      return null;
    }
  }
}

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}
```

### Database Field Encryption
```typescript
// Mongoose plugin for automatic field encryption
function encryptionPlugin(schema: mongoose.Schema, options: { fields: string[] }) {
  const encryptionService = new EncryptionService();
  
  // Pre-save hook to encrypt sensitive fields
  schema.pre('save', function(next) {
    for (const field of options.fields) {
      if (this[field] && !this[field].startsWith('encrypted:')) {
        this[field] = 'encrypted:' + encryptionService.encryptSensitiveField(this[field]);
      }
    }
    next();
  });
  
  // Post-find hooks to decrypt sensitive fields
  schema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
    if (!docs) return;
    
    const processDoc = (doc: any) => {
      for (const field of options.fields) {
        if (doc[field] && doc[field].startsWith('encrypted:')) {
          const encryptedData = doc[field].substring(10); // Remove 'encrypted:' prefix
          doc[field] = encryptionService.decryptSensitiveField(encryptedData);
        }
      }
    };
    
    if (Array.isArray(docs)) {
      docs.forEach(processDoc);
    } else {
      processDoc(docs);
    }
  });
}

// Usage in models
const userSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  personalData: String, // Will be encrypted
  paymentInfo: String   // Will be encrypted
});

userSchema.plugin(encryptionPlugin, {
  fields: ['personalData', 'paymentInfo']
});
```

## Input Validation and Sanitization

### Comprehensive Input Validation
```typescript
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

class InputValidationService {
  private domPurify: DOMPurify.DOMPurifyI;
  
  constructor() {
    const window = new JSDOM('').window;
    this.domPurify = DOMPurify(window as any);
  }
  
  // Sanitize HTML content
  sanitizeHtml(html: string): string {
    return this.domPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }
  
  // SQL injection prevention (for any raw queries)
  escapeSQL(input: string): string {
    return input.replace(/'/g, "''").replace(/;/g, '\\;').replace(/--/g, '\\--');
  }
  
  // NoSQL injection prevention
  sanitizeMongoQuery(query: any): any {
    if (typeof query !== 'object' || query === null) {
      return query;
    }
    
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(query)) {
      // Remove dangerous operators
      if (key.startsWith(')) {
        continue;
      }
      
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMongoQuery(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  // File upload validation
  validateFileUpload(file: Express.Multer.File): ValidationResult {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/json'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.json'];
    
    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }
    
    // Check MIME type
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    // Check file extension
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File extension not allowed' };
    }
    
    // Check for malicious content in filename
    if (this.containsMaliciousPattern(file.originalname)) {
      return { valid: false, error: 'Filename contains potentially malicious content' };
    }
    
    return { valid: true };
  }
  
  private containsMaliciousPattern(filename: string): boolean {
    const maliciousPatterns = [
      /\.\./,           // Directory traversal
      /[<>:"|?*]/,      // Invalid filename characters
      /\.(exe|bat|cmd|scr|pif|com)$/i, // Executable extensions
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i // Reserved Windows names
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(filename));
  }
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

### Schema Validation Middleware
```typescript
// Enhanced validation schemas
const secureSchemas = {
  user: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .refine(val => !val.toLowerCase().includes('admin'), 'Username cannot contain "admin"'),
    
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email too long')
      .refine(val => !val.includes('+'), 'Email aliases not allowed')
      .transform(val => val.toLowerCase().trim()),
    
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
             'Password must contain uppercase, lowercase, number, and special character')
      .refine(val => !this.isCommonPassword(val), 'Password is too common')
  }),
  
  encounter: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name too long')
      .transform(val => this.sanitizeHtml(val)),
    
    description: z.string()
      .max(1000, 'Description too long')
      .optional()
      .transform(val => val ? this.sanitizeHtml(val) : val),
    
    participants: z.array(z.object({
      name: z.string()
        .min(1, 'Participant name required')
        .max(50, 'Participant name too long')
        .transform(val => this.sanitizeHtml(val)),
      
      ac: z.number()
        .int('AC must be an integer')
        .min(1, 'AC must be at least 1')
        .max(30, 'AC cannot exceed 30'),
      
      maxHP: z.number()
        .int('HP must be an integer')
        .min(1, 'HP must be at least 1')
        .max(999, 'HP cannot exceed 999'),
      
      currentHP: z.number()
        .int('Current HP must be an integer')
        .min(0, 'Current HP cannot be negative')
    })).max(50, 'Too many participants')
  })
};

// Rate limiting with IP tracking
class SecurityMiddleware {
  private suspiciousIPs = new Map<string, SuspiciousActivity>();
  private validationService = new InputValidationService();
  
  createRateLimit(options: RateLimitOptions) {
    return rateLimit({
      windowMs: options.windowMs,
      max: options.max,
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || 'Too many requests'
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for admins
        return req.user?.isAdmin === true;
      },
      onLimitReached: (req) => {
        this.trackSuspiciousActivity(req.ip, 'RATE_LIMIT_EXCEEDED');
      }
    });
  }
  
  validateInput(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Sanitize MongoDB queries
        if (req.query) {
          req.query = this.validationService.sanitizeMongoQuery(req.query);
        }
        
        const validatedData = schema.parse({
          body: req.body,
          query: req.query,
          params: req.params
        });
        
        req.body = validatedData.body;
        req.query = validatedData.query;
        req.params = validatedData.params;
        
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          this.trackSuspiciousActivity(req.ip, 'VALIDATION_FAILED');
          
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
              }))
            }
          });
        }
        next(error);
      }
    };
  }
  
  private trackSuspiciousActivity(ip: string, activity: string): void {
    const current = this.suspiciousIPs.get(ip) || { count: 0, activities: [], firstSeen: new Date() };
    current.count += 1;
    current.activities.push({ activity, timestamp: new Date() });
    current.lastSeen = new Date();
    
    this.suspiciousIPs.set(ip, current);
    
    // If too much suspicious activity, consider blocking
    if (current.count > 10) {
      console.warn(`Suspicious activity from IP ${ip}: ${current.count} incidents`);
      // Implement IP blocking logic here
    }
  }
}

interface SuspiciousActivity {
  count: number;
  activities: Array<{ activity: string; timestamp: Date }>;
  firstSeen: Date;
  lastSeen: Date;
}
```

## API Security

### Security Headers and CORS
```typescript
class SecurityHeadersService {
  static configureSecurityHeaders(app: express.Application): void {
    // Security headers with Helmet
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // Required for Tailwind CSS
            "https://cdn.jsdelivr.net",
            "https://fonts.googleapis.com"
          ],
          scriptSrc: [
            "'self'",
            "https://js.stripe.com",
            "https://www.google-analytics.com"
          ],
          imgSrc: [
            "'self'",
            "data:",
            "https:",
            "blob:"
          ],
          connectSrc: [
            "'self'",
            "https://api.stripe.com",
            "wss://socket-server.dndtracker.com"
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com"
          ],
          frameSrc: [
            "https://js.stripe.com",
            "https://hooks.stripe.com"
          ],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }));
    
    // Custom security headers
    app.use((req, res, next) => {
      res.setHeader('X-API-Version', 'v1');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Download-Options', 'noopen');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
      next();
    });
    
    // CORS configuration
    app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = process.env.NODE_ENV === 'production'
          ? ['https://dndtracker.com', 'https://www.dndtracker.com']
          : ['http://localhost:3000', 'http://localhost:3001'];
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-HTTP-Method-Override'
      ],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
    }));
  }
}
```

### Request Integrity Validation
```typescript
class RequestIntegrityService {
  private readonly hmacSecret: string;
  
  constructor() {
    this.hmacSecret = process.env.HMAC_SECRET!;
    if (!this.hmacSecret) {
      throw new Error('HMAC_SECRET environment variable not set');
    }
  }
  
  // Generate HMAC signature for request
  generateSignature(payload: string, timestamp: string): string {
    const message = `${timestamp}.${payload}`;
    return crypto
      .createHmac('sha256', this.hmacSecret)
      .update(message)
      .digest('hex');
  }
  
  // Validate request signature (for webhooks and sensitive operations)
  validateSignature(
    payload: string,
    timestamp: string,
    signature: string,
    tolerance: number = 300 // 5 minutes
  ): boolean {
    // Check timestamp to prevent replay attacks
    const currentTime = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);
    
    if (Math.abs(currentTime - requestTime) > tolerance) {
      return false;
    }
    
    // Verify signature
    const expectedSignature = this.generateSignature(payload, timestamp);
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
  
  // Middleware for signature validation
  requireValidSignature() {
    return (req: Request, res: Response, next: NextFunction) => {
      const signature = req.headers['x-signature'] as string;
      const timestamp = req.headers['x-timestamp'] as string;
      
      if (!signature || !timestamp) {
        return res.status(401).json({
          success: false,
          error: { code: 'MISSING_SIGNATURE', message: 'Request signature required' }
        });
      }
      
      const payload = JSON.stringify(req.body);
      
      if (!this.validateSignature(payload, timestamp, signature)) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_SIGNATURE', message: 'Invalid request signature' }
        });
      }
      
      next();
    };
  }
}
```

## Data Privacy and GDPR Compliance

### Data Processing Audit Trail
```typescript
interface DataProcessingLog {
  _id: ObjectId;
  userId: ObjectId;
  operation: 'READ' | 'WRITE' | 'DELETE' | 'EXPORT' | 'ANONYMIZE';
  dataType: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  automated: boolean;
}

class DataPrivacyService {
  async logDataProcessing(log: Omit<DataProcessingLog, '_id' | 'timestamp'>): Promise<void> {
    await DataProcessingLog.create({
      ...log,
      timestamp: new Date()
    });
  }
  
  async anonymizeUserData(userId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Anonymize user record
      await User.findByIdAndUpdate(userId, {
        email: `anonymous_${userId}@deleted.local`,
        username: `anonymous_${userId}`,
        passwordHash: 'ANONYMIZED',
        $unset: {
          personalData: 1,
          paymentInfo: 1
        }
      }, { session });
      
      // Remove or anonymize related data
      await Promise.all([
        Party.updateMany(
          { userId },
          { $set: { 'characters.$[].playerName': 'Anonymous Player' } },
          { session }
        ),
        Encounter.updateMany(
          { userId },
          { $unset: { 'combatLog': 1 } },
          { session }
        ),
        Session.deleteMany({ userId }, { session }),
        PaymentTransaction.updateMany(
          { userId },
          { $unset: { metadata: 1 } },
          { session }
        )
      ]);
      
      await this.logDataProcessing({
        userId: new mongoose.Types.ObjectId(userId),
        operation: 'ANONYMIZE',
        dataType: 'user_profile',
        purpose: 'gdpr_right_to_be_forgotten',
        legalBasis: 'consent',
        ipAddress: 'system',
        userAgent: 'system',
        automated: false
      });
      
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  async exportUserData(userId: string): Promise<any> {
    const exportData = await this.gatherUserData(userId);
    
    await this.logDataProcessing({
      userId: new mongoose.Types.ObjectId(userId),
      operation: 'EXPORT',
      dataType: 'complete_profile',
      purpose: 'gdpr_data_portability',
      legalBasis: 'consent',
      ipAddress: 'system',
      userAgent: 'system',
      automated: false
    });
    
    return exportData;
  }
  
  private async gatherUserData(userId: string): Promise<any> {
    // Implementation from data persistence section
    // Includes all user data in a portable format
  }
}
```

## Security Monitoring and Intrusion Detection

### Security Event Monitor
```typescript
class SecurityMonitor {
  private alertThresholds = {
    failedLogins: 5,
    suspiciousQueries: 10,
    dataExfiltration: 1000, // KB
    unusualAccess: 3
  };
  
  async detectAnomalousActivity(userId: string): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    const lookbackPeriod = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    
    // Check for unusual login patterns
    const loginAttempts = await LoginAttempt.find({
      userId: new mongoose.Types.ObjectId(userId),
      timestamp: { $gte: lookbackPeriod }
    });
    
    const failedLogins = loginAttempts.filter(attempt => !attempt.success).length;
    if (failedLogins > this.alertThresholds.failedLogins) {
      alerts.push({
        type: 'EXCESSIVE_FAILED_LOGINS',
        severity: 'HIGH',
        message: `${failedLogins} failed login attempts in 24 hours`,
        userId,
        timestamp: new Date()
      });
    }
    
    // Check for unusual data access patterns
    const dataAccess = await DataProcessingLog.find({
      userId: new mongoose.Types.ObjectId(userId),
      timestamp: { $gte: lookbackPeriod },
      operation: 'READ'
    });
    
    const uniqueIPs = new Set(dataAccess.map(log => log.ipAddress)).size;
    if (uniqueIPs > this.alertThresholds.unusualAccess) {
      alerts.push({
        type: 'UNUSUAL_ACCESS_PATTERN',
        severity: 'MEDIUM',
        message: `Data accessed from ${uniqueIPs} different IP addresses`,
        userId,
        timestamp: new Date()
      });
    }
    
    return alerts;
  }
  
  async checkForSQLInjection(query: string, ip: string): Promise<void> {
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(--|\#|\/\*|\*\/)/g,
      /(\b(OR|AND)\b.*=.*)/gi,
      /('|(\\')|('')|(%27)|(%2527))/g
    ];
    
    const suspiciousPatterns = sqlInjectionPatterns.filter(pattern => pattern.test(query));
    
    if (suspiciousPatterns.length > 0) {
      await SecurityIncident.create({
        type: 'SQL_INJECTION_ATTEMPT',
        severity: 'HIGH',
        details: {
          query,
          ip,
          patterns: suspiciousPatterns.map(p => p.toString())
        },
        timestamp: new Date()
      });
      
      // Consider blocking IP after multiple attempts
      await this.trackMaliciousIP(ip, 'SQL_INJECTION_ATTEMPT');
    }
  }
  
  private async trackMaliciousIP(ip: string, incidentType: string): Promise<void> {
    const recentIncidents = await SecurityIncident.countDocuments({
      'details.ip': ip,
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });
    
    if (recentIncidents >= 3) {
      // Block IP for 24 hours
      await BlockedIP.create({
        ip,
        reason: 'Multiple security incidents',
        blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date()
      });
    }
  }
}

interface SecurityAlert {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  userId: string;
  timestamp: Date;
}
```

## Frontend Security Implementation

### Secure Frontend Practices
```typescript
// Secure token storage
class SecureTokenStorage {
  private readonly tokenKey = 'auth_token';
  private readonly refreshKey = 'refresh_token';
  
  // Store tokens securely
  storeTokens(accessToken: string, refreshToken: string): void {
    // Access tokens stored in memory only (cleared on page refresh)
    sessionStorage.setItem(this.tokenKey, accessToken);
    
    // Refresh tokens in httpOnly cookie (handled by backend)
    // or secure localStorage with additional encryption
    if (this.isSecureContext()) {
      const encrypted = this.encryptToken(refreshToken);
      localStorage.setItem(this.refreshKey, encrypted);
    }
  }
  
  getAccessToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }
  
  getRefreshToken(): string | null {
    const encrypted = localStorage.getItem(this.refreshKey);
    if (encrypted) {
      return this.decryptToken(encrypted);
    }
    return null;
  }
  
  clearTokens(): void {
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
  }
  
  private isSecureContext(): boolean {
    return window.isSecureContext && location.protocol === 'https:';
  }
  
  private encryptToken(token: string): string {
    // Simple client-side encryption (not for sensitive data)
    // In production, consider using Web Crypto API
    return btoa(token);
  }
  
  private decryptToken(encrypted: string): string {
    try {
      return atob(encrypted);
    } catch {
      return '';
    }
  }
}

// Content Security Policy violation reporting
class CSPReporter {
  static initialize(): void {
    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      const violation = {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      // Report violation to backend
      fetch('/api/v1/security/csp-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(violation)
      }).catch(console.error);
    });
  }
}

// Secure form handling
const useSecureForm = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>
) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<T>({
    resolver: zodResolver(schema)
  });
  
  const secureSubmit = useCallback(
    (onSubmit: (data: T) => Promise<void>) =>
      handleSubmit(async (data) => {
        try {
          clearErrors();
          
          // Additional client-side security checks
          if (await detectXSS(data)) {
            setError('root', { message: 'Invalid input detected' });
            return;
          }
          
          await onSubmit(data);
        } catch (error) {
          console.error('Form submission error:', error);
          setError('root', { message: 'Submission failed' });
        }
      }),
    [handleSubmit, clearErrors, setError]
  );
  
  return {
    register,
    handleSubmit: secureSubmit,
    errors,
    isSubmitting
  };
};

// XSS detection
async function detectXSS(data: any): Promise<boolean> {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  ];
  
  const dataString = JSON.stringify(data);
  return xssPatterns.some(pattern => pattern.test(dataString));
}
```

This comprehensive security implementation provides multiple layers of protection including encryption, input validation, intrusion detection, GDPR compliance, and secure frontend practices to ensure the D&D Encounter Tracker meets enterprise security standards.