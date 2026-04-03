// Core Types for Biashara Ledger Pro - Global Scale Edition

export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'KES' | 'NGN' | 'ZAR' 
  | 'GHS' | 'TZS' | 'UGX' | 'RWF' | 'ETB' | 'EGP' | 'MAD' | 'AOA'
  | 'XOF' | 'XAF' | 'BWP' | 'MWK' | 'ZMW' | 'SZL' | 'LSL' | 'NAD'
  | 'INR' | 'PKR' | 'BDT' | 'LKR' | 'IDR' | 'MYR' | 'PHP' | 'THV'
  | 'VND' | 'SGD' | 'HKD' | 'KRW' | 'TWD' | 'AUD' | 'NZD' | 'CAD'
  | 'BRL' | 'MXN' | 'ARS' | 'CLP' | 'COP' | 'PEN';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  decimalPlaces: number;
  locale: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'debt_payment' | 'debt_received';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type Period = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL';
export type DebtStatus = 'active' | 'paid' | 'overdue' | 'partial';

export interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  timestamp: number;
  source: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  description: string;
  category: string;
  date: number;
  status: TransactionStatus;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface Debt {
  id: string;
  type: 'owed_to_me' | 'owed_by_me';
  amount: number;
  originalAmount: number;
  currency: CurrencyCode;
  debtorName: string;
  creditorName: string;
  dueDate: number;
  status: DebtStatus;
  paidAmount: number;
  transactions: string[]; // Transaction IDs linked to this debt
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BusinessProfile {
  id: string;
  name: string;
  type: 'sole_proprietorship' | 'partnership' | 'llc' | 'corporation' | 'cooperative' | 'informal';
  industry: string;
  currency: CurrencyCode;
  fiscalYearStart: number; // Month (0-11)
  taxId?: string;
  registrationNumber?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  settings: BusinessSettings;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

export interface BusinessSettings {
  multiCurrency: boolean;
  autoConvertCurrency: boolean;
  defaultCurrency: CurrencyCode;
  enabledCurrencies: CurrencyCode[];
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  taxEnabled: boolean;
  taxRate?: number;
  inventoryTracking: boolean;
  debtReminders: boolean;
  reminderDaysBefore: number;
  offlineMode: boolean;
  syncInterval: number; // milliseconds
}

export interface FinancialReport {
  period: Period;
  startDate: number;
  endDate: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  currency: CurrencyCode;
  breakdownByCategory: CategoryBreakdown[];
  trends: TrendData[];
  generatedAt: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface TrendData {
  period: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardMetrics {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingDebts: number;
  overdueDebts: number;
  topCategories: CategoryBreakdown[];
  recentTransactions: Transaction[];
  cashFlowForecast: ForecastData[];
  currencyExposure: CurrencyExposure[];
}

export interface ForecastData {
  date: number;
  projected: number;
  actual?: number;
}

export interface CurrencyExposure {
  currency: CurrencyCode;
  amount: number;
  percentage: number;
  exchangeRateToBase: number;
}

export interface APIIntegration {
  id: string;
  provider: 'mpesa' | 'paypal' | 'stripe' | 'flutterwave' | 'paystack' | 'custom';
  name: string;
  status: 'active' | 'inactive' | 'error';
  credentials: Record<string, string>;
  webhookUrl?: string;
  lastSync?: number;
  settings: APIIntegrationSettings;
}

export interface APIIntegrationSettings {
  autoImport: boolean;
  importFrequency: number; // milliseconds
  transactionMapping: Record<string, string>;
  enabledFeatures: string[];
}

export interface ComplianceConfig {
  standard: 'IFRS' | 'GAAP' | 'local';
  country: string;
  taxReporting: boolean;
  auditTrail: boolean;
  dataRetention: number; // days
  encryptionEnabled: boolean;
  gdprCompliant: boolean;
}

export interface SyncState {
  lastSync: number;
  pendingChanges: PendingChange[];
  conflicts: Conflict[];
  status: 'synced' | 'syncing' | 'error' | 'offline';
}

export interface PendingChange {
  id: string;
  entity: 'transaction' | 'debt' | 'profile';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export interface Conflict {
  id: string;
  entity: string;
  entityId: string;
  localVersion: any;
  remoteVersion: any;
  timestamp: number;
  resolved: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  dashboardLayout: DashboardWidget[];
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  debtReminders: boolean;
  lowBalanceAlert: boolean;
  largeTransactionAlert: boolean;
  alertThreshold: number;
}

export interface DashboardWidget {
  id: string;
  type: 'balance' | 'chart' | 'transactions' | 'debts' | 'forecast' | 'currency';
  position: { x: number; y: number };
  size: { width: number; height: number };
  enabled: boolean;
}

export interface ServiceWorkerRegistration {
  registered: boolean;
  scope: string;
  updateAvailable: boolean;
  offlineReady: boolean;
}

export interface OfflineQueue {
  transactions: PendingChange[];
  debts: PendingChange[];
  profiles: PendingChange[];
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}
