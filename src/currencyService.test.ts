import CurrencyService from './currencyService';
import { CurrencyCode } from './types';

describe('CurrencyService', () => {
  let currencyService: CurrencyService;

  beforeEach(() => {
    currencyService = new CurrencyService('USD');
  });

  describe('Currency Information', () => {
    test('should get currency details for USD', () => {
      const currency = currencyService.getCurrency('USD');
      expect(currency).not.toBeNull();
      expect(currency?.code).toBe('USD');
      expect(currency?.symbol).toBe('$');
      expect(currency?.decimalPlaces).toBe(2);
    });

    test('should get currency details for KES', () => {
      const currency = currencyService.getCurrency('KES');
      expect(currency).not.toBeNull();
      expect(currency?.code).toBe('KES');
      expect(currency?.symbol).toBe('KSh');
    });

    test('should return null for unsupported currency', () => {
      const currency = currencyService.getCurrency('XXX' as CurrencyCode);
      expect(currency).toBeNull();
    });

    test('should get all supported currencies', () => {
      const currencies = currencyService.getAllCurrencies();
      expect(currencies.length).toBeGreaterThan(40);
    });

    test('should check if currency is supported', () => {
      expect(currencyService.isSupported('USD')).toBe(true);
      expect(currencyService.isSupported('EUR')).toBe(true);
      expect(currencyService.isSupported('INVALID')).toBe(false);
    });
  });

  describe('Currency Formatting', () => {
    test('should format USD amount correctly', () => {
      const formatted = currencyService.format(1234.56, 'USD');
      expect(formatted).toContain('$');
      expect(formatted).toContain('1,234.56');
    });

    test('should format KES amount correctly', () => {
      const formatted = currencyService.format(1234.56, 'KES');
      expect(formatted).toMatch(/Ksh|KSh/);
    });

    test('should format JPY without decimal places', () => {
      const formatted = currencyService.format(1234, 'JPY');
      expect(formatted).toMatch(/[¥￥]/);
      expect(formatted).not.toContain('.00');
    });

    test('should throw error for unsupported currency formatting', () => {
      expect(() => currencyService.format(100, 'XXX' as CurrencyCode)).toThrow('Unsupported currency');
    });
  });

  describe('Exchange Rates', () => {
    test('should set and get exchange rate', () => {
      currencyService.setExchangeRate('USD', 'KES', 130.5);
      const rate = currencyService.getExchangeRate('USD', 'KES');
      expect(rate).toBe(130.5);
    });

    test('should automatically calculate reverse rate', () => {
      currencyService.setExchangeRate('USD', 'KES', 130);
      const reverseRate = currencyService.getExchangeRate('KES', 'USD');
      expect(reverseRate).toBeCloseTo(1 / 130, 6);
    });

    test('should return 1 for same currency conversion', () => {
      const rate = currencyService.getExchangeRate('USD', 'USD');
      expect(rate).toBe(1);
    });

    test('should return null for non-existent rate', () => {
      const rate = currencyService.getExchangeRate('USD', 'EUR');
      expect(rate).toBeNull();
    });

    test('should expire rates older than 24 hours', () => {
      currencyService.setExchangeRate('USD', 'KES', 130);
      
      // Manually expire the rate by modifying timestamp
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + (25 * 60 * 60 * 1000));
      
      const rate = currencyService.getExchangeRate('USD', 'KES');
      expect(rate).toBeNull();
      
      jest.restoreAllMocks();
    });
  });

  describe('Currency Conversion', () => {
    beforeEach(() => {
      currencyService.setExchangeRate('USD', 'KES', 130);
      currencyService.setExchangeRate('USD', 'EUR', 0.92);
    });

    test('should convert USD to KES', () => {
      const converted = currencyService.convert(100, 'USD', 'KES');
      expect(converted).toBe(13000);
    });

    test('should convert same currency', () => {
      const converted = currencyService.convert(100, 'USD', 'USD');
      expect(converted).toBe(100);
    });

    test('should return null for missing rate', () => {
      const converted = currencyService.convert(100, 'GBP', 'JPY');
      expect(converted).toBeNull();
    });

    test('should convert with fee', () => {
      const result = currencyService.convertWithFee(100, 'USD', 'KES', 2);
      expect(result).not.toBeNull();
      expect(result?.converted).toBe(13000);
      expect(result?.fee).toBe(260);
      expect(result?.total).toBe(12740);
    });

    test('should batch convert amounts', () => {
      const amounts = [100, 200, 300];
      const converted = currencyService.batchConvert(amounts, 'USD', 'KES');
      expect(converted).toEqual([13000, 26000, 39000]);
    });

    test('should calculate cross rate', () => {
      const crossRate = currencyService.getCrossRate('KES', 'EUR');
      expect(crossRate).not.toBeNull();
    });
  });

  describe('Amount Validation', () => {
    test('should validate correct amount', () => {
      expect(currencyService.validateAmount(100.50, 'USD')).toBe(true);
      expect(currencyService.validateAmount(100, 'JPY')).toBe(true);
    });

    test('should reject NaN', () => {
      expect(currencyService.validateAmount(NaN, 'USD')).toBe(false);
    });

    test('should reject negative zero', () => {
      expect(currencyService.validateAmount(-0, 'USD')).toBe(false);
    });

    test('should round to currency precision', () => {
      const rounded = currencyService.roundToCurrency(100.5678, 'USD');
      expect(rounded).toBe(100.57);
    });

    test('should round JPY to integer', () => {
      const rounded = currencyService.roundToCurrency(100.9, 'JPY');
      expect(rounded).toBe(101);
    });
  });

  describe('Amount Parsing', () => {
    test('should parse US formatted amount', () => {
      const parsed = currencyService.parseAmount('$1,234.56', 'USD');
      expect(parsed).toBe(1234.56);
    });

    test('should parse European formatted amount', () => {
      const parsed = currencyService.parseAmount('1.234,56', 'EUR');
      expect(parsed).toBe(1234.56);
    });

    test('should parse amount without symbol', () => {
      const parsed = currencyService.parseAmount('1234.56', 'USD');
      expect(parsed).toBe(1234.56);
    });

    test('should return null for invalid format', () => {
      const parsed = currencyService.parseAmount('invalid', 'USD');
      expect(parsed).toBeNull();
    });
  });

  describe('Rate Management', () => {
    test('should update multiple rates at once', () => {
      const rates = [
        { from: 'USD' as CurrencyCode, to: 'KES' as CurrencyCode, rate: 130 },
        { from: 'USD' as CurrencyCode, to: 'EUR' as CurrencyCode, rate: 0.92 }
      ];
      
      currencyService.updateRates(rates, 'api');
      
      expect(currencyService.getExchangeRate('USD', 'KES')).toBe(130);
      expect(currencyService.getExchangeRate('USD', 'EUR')).toBe(0.92);
    });

    test('should get rate age', () => {
      currencyService.setExchangeRate('USD', 'KES', 130);
      const age = currencyService.getRateAge('USD', 'KES');
      expect(age).toBeLessThan(1000); // Less than 1 second
    });

    test('should check if rates are expired', () => {
      expect(currencyService.areRatesExpired()).toBe(true); // No rates set
      
      currencyService.setExchangeRate('USD', 'KES', 130);
      expect(currencyService.areRatesExpired()).toBe(false);
    });

    test('should clear expired rates', () => {
      currencyService.setExchangeRate('USD', 'KES', 130);
      
      // Mock Date.now to make the rate appear old
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + (25 * 60 * 60 * 1000));
      
      currencyService.clearExpiredRates(24 * 60 * 60 * 1000); // Clear rates older than 24 hours
      
      Date.now = originalNow;
      expect(currencyService.getExchangeRate('USD', 'KES')).toBeNull();
    });
  });
});
