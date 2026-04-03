import { Currency, CurrencyCode, ExchangeRate } from './types';

export class CurrencyService {
  private static currencies: Record<CurrencyCode, Currency> = {
    USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, locale: 'en-US' },
    EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, locale: 'de-DE' },
    GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2, locale: 'en-GB' },
    JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0, locale: 'ja-JP' },
    CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2, locale: 'zh-CN' },
    KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimalPlaces: 2, locale: 'en-KE' },
    NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimalPlaces: 2, locale: 'en-NG' },
    ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalPlaces: 2, locale: 'en-ZA' },
    GHS: { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', decimalPlaces: 2, locale: 'en-GH' },
    TZS: { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimalPlaces: 2, locale: 'sw-TZ' },
    UGX: { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimalPlaces: 0, locale: 'en-UG' },
    RWF: { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', decimalPlaces: 0, locale: 'rw-RW' },
    ETB: { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', decimalPlaces: 2, locale: 'am-ET' },
    EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimalPlaces: 2, locale: 'ar-EG' },
    MAD: { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', decimalPlaces: 2, locale: 'ar-MA' },
    AOA: { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', decimalPlaces: 2, locale: 'pt-AO' },
    XOF: { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', decimalPlaces: 0, locale: 'fr-SN' },
    XAF: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', decimalPlaces: 0, locale: 'fr-CM' },
    BWP: { code: 'BWP', name: 'Botswana Pula', symbol: 'P', decimalPlaces: 2, locale: 'en-BW' },
    MWK: { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', decimalPlaces: 2, locale: 'en-MW' },
    ZMW: { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', decimalPlaces: 2, locale: 'en-ZM' },
    SZL: { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L', decimalPlaces: 2, locale: 'en-SZ' },
    LSL: { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', decimalPlaces: 2, locale: 'en-LS' },
    NAD: { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', decimalPlaces: 2, locale: 'en-NA' },
    INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, locale: 'en-IN' },
    PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimalPlaces: 2, locale: 'ur-PK' },
    BDT: { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimalPlaces: 2, locale: 'bn-BD' },
    LKR: { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', decimalPlaces: 2, locale: 'si-LK' },
    IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimalPlaces: 0, locale: 'id-ID' },
    MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimalPlaces: 2, locale: 'ms-MY' },
    PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalPlaces: 2, locale: 'fil-PH' },
    THV: { code: 'THV', name: 'Thai Baht', symbol: '฿', decimalPlaces: 2, locale: 'th-TH' },
    VND: { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimalPlaces: 0, locale: 'vi-VN' },
    SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2, locale: 'en-SG' },
    HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2, locale: 'zh-HK' },
    KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimalPlaces: 0, locale: 'ko-KR' },
    TWD: { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', decimalPlaces: 2, locale: 'zh-TW' },
    AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2, locale: 'en-AU' },
    NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimalPlaces: 2, locale: 'en-NZ' },
    CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2, locale: 'en-CA' },
    BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalPlaces: 2, locale: 'pt-BR' },
    MXN: { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimalPlaces: 2, locale: 'es-MX' },
    ARS: { code: 'ARS', name: 'Argentine Peso', symbol: '$', decimalPlaces: 2, locale: 'es-AR' },
    CLP: { code: 'CLP', name: 'Chilean Peso', symbol: '$', decimalPlaces: 0, locale: 'es-CL' },
    COP: { code: 'COP', name: 'Colombian Peso', symbol: '$', decimalPlaces: 0, locale: 'es-CO' },
    PEN: { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', decimalPlaces: 2, locale: 'es-PE' }
  };

  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private baseCurrency: CurrencyCode = 'USD';

  constructor(baseCurrency: CurrencyCode = 'USD') {
    this.baseCurrency = baseCurrency;
  }

  getCurrency(code: CurrencyCode): Currency | null {
    return CurrencyService.currencies[code] || null;
  }

  getAllCurrencies(): Currency[] {
    return Object.values(CurrencyService.currencies);
  }

  getSupportedCurrencies(): CurrencyCode[] {
    return Object.keys(CurrencyService.currencies) as CurrencyCode[];
  }

  isSupported(currency: string): boolean {
    return currency in CurrencyService.currencies;
  }

  format(amount: number, currency: CurrencyCode, locale?: string): string {
    const currencyInfo = this.getCurrency(currency);
    if (!currencyInfo) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const targetLocale = locale || currencyInfo.locale;
    
    try {
      return new Intl.NumberFormat(targetLocale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currencyInfo.decimalPlaces,
        maximumFractionDigits: currencyInfo.decimalPlaces
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      const symbol = currencyInfo.symbol;
      const formatted = amount.toFixed(currencyInfo.decimalPlaces);
      return `${symbol}${formatted}`;
    }
  }

  setExchangeRate(from: CurrencyCode, to: CurrencyCode, rate: number, source: string = 'manual'): void {
    const key = `${from}_${to}`;
    const exchangeRate: ExchangeRate = {
      from,
      to,
      rate,
      timestamp: Date.now(),
      source
    };
    this.exchangeRates.set(key, exchangeRate);
    
    // Also set reverse rate
    const reverseKey = `${to}_${from}`;
    const reverseRate: ExchangeRate = {
      from: to,
      to: from,
      rate: 1 / rate,
      timestamp: Date.now(),
      source
    };
    this.exchangeRates.set(reverseKey, reverseRate);
  }

  getExchangeRate(from: CurrencyCode, to: CurrencyCode): number | null {
    if (from === to) return 1;
    
    const key = `${from}_${to}`;
    const rate = this.exchangeRates.get(key);
    
    if (rate) {
      // Check if rate is older than 24 hours
      const isExpired = Date.now() - rate.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        return null;
      }
      return rate.rate;
    }

    // Try to calculate through base currency
    const fromToBase = this.exchangeRates.get(`${from}_${this.baseCurrency}`);
    const baseToTo = this.exchangeRates.get(`${this.baseCurrency}_${to}`);
    
    if (fromToBase && baseToTo) {
      return fromToBase.rate * baseToTo.rate;
    }

    return null;
  }

  convert(amount: number, from: CurrencyCode, to: CurrencyCode): number | null {
    if (from === to) return amount;
    
    const rate = this.getExchangeRate(from, to);
    if (rate === null) {
      return null;
    }
    
    return amount * rate;
  }

  convertWithFee(amount: number, from: CurrencyCode, to: CurrencyCode, feePercentage: number): { converted: number; fee: number; total: number } | null {
    const converted = this.convert(amount, from, to);
    if (converted === null) {
      return null;
    }
    
    const fee = converted * (feePercentage / 100);
    const total = converted - fee;
    
    return { converted, fee, total };
  }

  batchConvert(amounts: number[], from: CurrencyCode, to: CurrencyCode): (number | null)[] {
    return amounts.map(amount => this.convert(amount, from, to));
  }

  getCrossRate(currency1: CurrencyCode, currency2: CurrencyCode, baseCurrency?: CurrencyCode): number | null {
    const base = baseCurrency || this.baseCurrency;
    const rate1 = this.getExchangeRate(currency1, base);
    const rate2 = this.getExchangeRate(currency2, base);
    
    if (rate1 === null || rate2 === null) {
      return null;
    }
    
    return rate2 / rate1;
  }

  validateAmount(amount: number, currency: CurrencyCode): boolean {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return false;
    }
    
    const currencyInfo = this.getCurrency(currency);
    if (!currencyInfo) {
      return false;
    }
    
    // Check for negative zero
    if (Object.is(amount, -0)) {
      return false;
    }
    
    // Check precision
    const multiplier = Math.pow(10, currencyInfo.decimalPlaces);
    const rounded = Math.round(amount * multiplier) / multiplier;
    
    return Math.abs(amount - rounded) < 0.0000001;
  }

  roundToCurrency(amount: number, currency: CurrencyCode): number {
    const currencyInfo = this.getCurrency(currency);
    if (!currencyInfo) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
    
    const multiplier = Math.pow(10, currencyInfo.decimalPlaces);
    return Math.round(amount * multiplier) / multiplier;
  }

  parseAmount(formatted: string, currency: CurrencyCode): number | null {
    const currencyInfo = this.getCurrency(currency);
    if (!currencyInfo) {
      return null;
    }
    
    try {
      // Remove currency symbol and whitespace
      let cleaned = formatted.replace(/[^\d.,-]/g, '');
      
      // Handle different decimal separators
      if (cleaned.includes(',') && cleaned.includes('.')) {
        // Assume last separator is decimal
        const lastDot = cleaned.lastIndexOf('.');
        const lastComma = cleaned.lastIndexOf(',');
        
        if (lastDot > lastComma) {
          cleaned = cleaned.replace(/,/g, '');
        } else {
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        }
      } else if (cleaned.includes(',')) {
        // Could be decimal or thousands separator
        const parts = cleaned.split(',');
        if (parts.length === 2 && parts[1] && parts[1].length <= 2) {
          cleaned = cleaned.replace(',', '.');
        } else {
          cleaned = cleaned.replace(/,/g, '');
        }
      }
      
      const amount = parseFloat(cleaned);
      
      if (isNaN(amount)) {
        return null;
      }
      
      return this.validateAmount(amount, currency) ? amount : null;
    } catch {
      return null;
    }
  }

  getCurrencyExposure(balances: Record<CurrencyCode, number>, baseCurrency: CurrencyCode): Array<{ currency: CurrencyCode; amount: number; percentage: number; exchangeRateToBase: number }> {
    const totalInBase = Object.entries(balances).reduce((sum, [currency, amount]) => {
      const converted = this.convert(amount, currency as CurrencyCode, baseCurrency);
      return sum + (converted || 0);
    }, 0);
    
    return Object.entries(balances).map(([currency, amount]) => {
      const rate = this.getExchangeRate(currency as CurrencyCode, baseCurrency) || 1;
      const convertedAmount = this.convert(amount as number, currency as CurrencyCode, baseCurrency);
      const amountInBase = (convertedAmount !== null ? convertedAmount : 0);
      const percentage = totalInBase > 0 ? (amountInBase / totalInBase) * 100 : 0;
      
      return {
        currency: currency as CurrencyCode,
        amount: amount as number,
        percentage,
        exchangeRateToBase: rate
      };
    }).filter(item => item.amount !== 0);
  }

  updateRates(rates: Array<{ from: CurrencyCode; to: CurrencyCode; rate: number }>, source: string = 'api'): void {
    rates.forEach(({ from, to, rate }) => {
      this.setExchangeRate(from, to, rate, source);
    });
  }

  getRateAge(from: CurrencyCode, to: CurrencyCode): number | null {
    const key = `${from}_${to}`;
    const rate = this.exchangeRates.get(key);
    
    if (!rate) {
      return null;
    }
    
    return Date.now() - rate.timestamp;
  }

  areRatesExpired(threshold: number = 24 * 60 * 60 * 1000): boolean {
    for (const rate of this.exchangeRates.values()) {
      if (Date.now() - rate.timestamp < threshold) {
        return false;
      }
    }
    return true;
  }

  clearExpiredRates(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [key, rate] of this.exchangeRates.entries()) {
      if (now - rate.timestamp > maxAge) {
        this.exchangeRates.delete(key);
      }
    }
  }
}

export default CurrencyService;
