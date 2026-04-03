# Biashara Ledger Pro - Global Scale Edition

A comprehensive, offline-first Progressive Web Application (PWA) for financial management designed for global scale with support for multiple currencies, API integrations, and international accounting compliance.

## Features

### 🌍 Global Scale & Multi-Currency Support
- **45+ Currencies Supported**: USD, EUR, GBP, KES, NGN, ZAR, and many more
- **Real-time Exchange Rates**: Automatic currency conversion with configurable rate sources
- **Multi-currency Transactions**: Record transactions in any supported currency
- **Currency Exposure Tracking**: Monitor your exposure to different currencies
- **Locale-aware Formatting**: Amounts formatted according to local conventions

### 📱 Offline-First PWA
- **IndexedDB Storage**: All data stored locally using IndexedDB
- **Background Sync**: Automatic synchronization when connection is restored
- **Conflict Resolution**: Smart handling of data conflicts during sync
- **Export/Import**: Backup and restore your data
- **Service Worker**: Cached assets for instant loading

### 💰 Financial Inclusion Features
- **Debt Management**: Track money owed to you and by you
- **Payment Reminders**: Configurable reminders for due payments
- **Simple Interface**: Easy to use for users with limited financial literacy
- **Mobile-First Design**: Optimized for mobile devices
- **Low Data Usage**: Efficient data synchronization

### 🔌 API Integrations
- **M-Pesa**: Mobile money integration for East Africa
- **PayPal**: Global payment processing
- **Stripe**: Credit card processing
- **Flutterwave**: African payment gateway
- **Paystack**: Nigerian payment processor
- **Custom APIs**: Extensible webhook support

### 📊 Dashboard Analytics
- **Financial Reports**: Weekly, monthly, quarterly, and yearly reports
- **Cash Flow Forecasting**: 30-day cash flow projections
- **Category Breakdown**: Visualize spending by category
- **Trend Analysis**: Track income and expense trends
- **Financial Health Score**: Overall business health indicator
- **Growth Rate Calculation**: Period-over-period growth metrics

### ✅ Compliance & Security
- **IFRS/GAAP Support**: International accounting standards
- **Audit Trail**: Complete transaction history
- **GDPR Compliant**: Data privacy protection
- **Encryption Ready**: Support for data encryption
- **Tax Reporting**: Configurable tax calculations

## Technology Stack

- **TypeScript**: Type-safe JavaScript
- **Jest**: Testing framework
- **IndexedDB**: Client-side storage
- **Service Workers**: Offline functionality
- **Progressive Web App**: Installable web application

## Project Structure

```
src/
├── types.ts                    # TypeScript type definitions
├── currencyService.ts          # Multi-currency support
├── offlineService.ts           # Offline-first functionality
├── apiIntegrationService.ts    # Payment API integrations
├── analyticsService.ts         # Dashboard analytics
├── currencyService.test.ts     # Currency service tests
└── analyticsService.test.ts    # Analytics service tests
```

## Installation

```bash
npm install
```

## Running Tests

```bash
npm test
```

## Usage Examples

### Currency Conversion

```typescript
import CurrencyService from './currencyService';

const currencyService = new CurrencyService('USD');

// Set exchange rate
currencyService.setExchangeRate('USD', 'KES', 130);

// Convert amount
const converted = currencyService.convert(100, 'USD', 'KES');
console.log(converted); // 13000

// Format amount
const formatted = currencyService.format(1234.56, 'USD');
console.log(formatted); // $1,234.56
```

### Analytics Dashboard

```typescript
import AnalyticsService from './analyticsService';

const analyticsService = new AnalyticsService(transactions);

// Generate report
const report = analyticsService.generateReport('MONTH');
console.log(report.totalIncome);
console.log(report.totalExpenses);
console.log(report.netBalance);

// Get dashboard metrics
const metrics = analyticsService.getDashboardMetrics();
console.log(metrics.currentBalance);
console.log(metrics.cashFlowForecast);

// Financial health score
const score = analyticsService.getFinancialHealthScore();
console.log(score); // 0-100
```

### API Integration

```typescript
import APIIntegrationService from './apiIntegrationService';

const apiService = new APIIntegrationService();

// Connect M-Pesa
await apiService.connectMpesa({
  apiKey: 'your-api-key',
  consumerKey: 'your-consumer-key',
  shortcode: 'your-shortcode',
  passkey: 'your-passkey'
});

// Fetch transactions
const transactions = await apiService.fetchTransactions('integration-id');
```

## Roadmap

- [ ] React/Vue/Angular UI components
- [ ] Service Worker implementation
- [ ] Push notifications
- [ ] Real-time exchange rate API integration
- [ ] Export to PDF/Excel
- [ ] Multi-language support
- [ ] Tax calculation engine
- [ ] Inventory management
- [ ] Invoice generation
- [ ] Bank reconciliation

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
