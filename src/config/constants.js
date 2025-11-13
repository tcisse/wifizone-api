module.exports = {
  // User roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // KYC Status
  KYC_STATUS: {
    NOT_VERIFIED: 'not_verified',
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  },

  // Document types
  DOCUMENT_TYPES: {
    ID_FRONT: 'id_front',
    ID_BACK: 'id_back',
    SELFIE: 'selfie',
  },

  // Zone status
  ZONE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  // Plan status
  PLAN_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  // Ticket status
  TICKET_STATUS: {
    AVAILABLE: 'available',
    SOLD: 'sold',
    USED: 'used',
    EXPIRED: 'expired',
    INVALIDATED: 'invalidated',
  },

  // Transaction types
  TRANSACTION_TYPES: {
    SALE: 'sale',
    WITHDRAWAL: 'withdrawal',
    REFERRAL: 'referral',
    COMMISSION: 'commission',
  },

  // Transaction status
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },

  // Withdrawal status
  WITHDRAWAL_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REJECTED: 'rejected',
  },

  // Mobile Money providers
  MOBILE_MONEY_PROVIDERS: {
    MTN: 'mtn',
    ORANGE: 'orange',
    MOOV: 'moov',
    WAVE: 'wave',
  },

  // Notification types
  NOTIFICATION_TYPES: {
    SALE: 'sale',
    STOCK_ALERT: 'stock_alert',
    KYC_UPDATE: 'kyc_update',
    WITHDRAWAL: 'withdrawal',
    REFERRAL: 'referral',
    SYSTEM: 'system',
  },

  // Error codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    KYC_REQUIRED: 'KYC_REQUIRED',
    ZONE_LIMIT_REACHED: 'ZONE_LIMIT_REACHED',
    TICKET_NOT_AVAILABLE: 'TICKET_NOT_AVAILABLE',
    WITHDRAWAL_MIN_AMOUNT: 'WITHDRAWAL_MIN_AMOUNT',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PER_PAGE: 20,
    MAX_PER_PAGE: 100,
  },

  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],

  // Commission & Fees (from env)
  PLATFORM_COMMISSION: parseFloat(process.env.PLATFORM_COMMISSION || 0.05),
  REFERRAL_COMMISSION: parseFloat(process.env.REFERRAL_COMMISSION || 0.10),
  WITHDRAWAL_FEE: parseFloat(process.env.WITHDRAWAL_FEE || 0.02),
  MIN_WITHDRAWAL_AMOUNT: parseInt(process.env.MIN_WITHDRAWAL_AMOUNT || 5000),

  // Periods
  PERIODS: {
    TODAY: 'today',
    WEEK: '7d',
    MONTH: '30d',
    QUARTER: '90d',
    CUSTOM: 'custom',
  },

  // Report types
  REPORT_TYPES: {
    SALES: 'sales',
    TRANSACTIONS: 'transactions',
    ZONES: 'zones',
    TICKETS: 'tickets',
  },

  // Export formats
  EXPORT_FORMATS: {
    CSV: 'csv',
    XLSX: 'xlsx',
    PDF: 'pdf',
  },
};
