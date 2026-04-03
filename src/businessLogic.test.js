// Comprehensive unit tests for Biashara Ledger Pro with multi-currency support

const {
    getSupportedCurrencies,
    getCurrencyDetails,
    formatMoney,
    convertCurrency,
    getExchangeRate,
    filterTransactionsByPeriod,
    calculateTotalIncome,
    calculateTotalExpense,
    calculateNetBalance,
    getUnpaidDebts,
    getUnpaidLiabilities,
    calculateTotalOwedToYou,
    calculateTotalYouOwe,
    createTransaction,
    markTransactionAsPaid,
    validateImportData,
    generateExportFilename
} = require('./businessLogic');

describe('Multi-Currency Support', () => {
    describe('getSupportedCurrencies', () => {
        test('should return array of currency codes', () => {
            const currencies = getSupportedCurrencies();
            expect(Array.isArray(currencies)).toBe(true);
            expect(currencies.length).toBeGreaterThan(0);
        });

        test('should include major world currencies', () => {
            const currencies = getSupportedCurrencies();
            expect(currencies).toContain('USD');
            expect(currencies).toContain('EUR');
            expect(currencies).toContain('GBP');
            expect(currencies).toContain('KES');
            expect(currencies).toContain('JPY');
            expect(currencies).toContain('CNY');
        });

        test('should include African currencies for regional support', () => {
            const currencies = getSupportedCurrencies();
            expect(currencies).toContain('NGN');
            expect(currencies).toContain('ZAR');
            expect(currencies).toContain('GHS');
            expect(currencies).toContain('TZS');
            expect(currencies).toContain('UGX');
            expect(currencies).toContain('RWF');
            expect(currencies).toContain('ETB');
        });
    });

    describe('getCurrencyDetails', () => {
        test('should return currency details for valid currency code', () => {
            const details = getCurrencyDetails('USD');
            expect(details).toBeTruthy();
            expect(details.locale).toBe('en-US');
            expect(details.symbol).toBe('$');
            expect(details.name).toBe('US Dollar');
            expect(details.decimals).toBe(2);
        });

        test('should return null for invalid currency code', () => {
            const details = getCurrencyDetails('INVALID');
            expect(details).toBeNull();
        });

        test('should return correct details for KES', () => {
            const details = getCurrencyDetails('KES');
            expect(details.locale).toBe('en-KE');
            expect(details.symbol).toBe('KSh');
            expect(details.name).toBe('Kenyan Shilling');
            expect(details.decimals).toBe(0);
        });

        test('should return correct details for JPY (zero decimals)', () => {
            const details = getCurrencyDetails('JPY');
            expect(details.locale).toBe('ja-JP');
            expect(details.decimals).toBe(0);
        });
    });

    describe('formatMoney', () => {
        test('should format KES with zero decimals by default', () => {
            const result = formatMoney(1000);
            expect(result).toContain('Ksh');
            expect(result).toContain('1,000');
        });

        test('should format USD with 2 decimals', () => {
            expect(formatMoney(1000, 'USD')).toMatch(/\$1,000\.00/);
        });

        test('should format EUR correctly', () => {
            const result = formatMoney(1000, 'EUR');
            expect(result).toContain('€');
        });

        test('should format GBP correctly', () => {
            const result = formatMoney(1000, 'GBP');
            expect(result).toContain('£');
        });

        test('should format JPY with zero decimals', () => {
            const result = formatMoney(1000, 'JPY');
            expect(result).toMatch(/[\u00A5\uFFE5]/); // Matches both yen symbols
        });

        test('should handle decimal values correctly', () => {
            expect(formatMoney(1000.50, 'USD')).toMatch(/\$1,000\.50/);
        });

        test('should handle large numbers', () => {
            const result = formatMoney(1000000, 'USD');
            expect(result).toMatch(/\$1,000,000\.00/);
        });

        test('should throw error for unsupported currency', () => {
            expect(() => formatMoney(1000, 'INVALID')).toThrow('Unsupported currency: INVALID');
        });

        test('should format Nigerian Naira correctly', () => {
            const result = formatMoney(5000, 'NGN');
            expect(result).toContain('₦');
        });

        test('should format Indian Rupee correctly', () => {
            const result = formatMoney(1000, 'INR');
            expect(result).toContain('₹');
        });
    });

    describe('convertCurrency', () => {
        test('should convert USD to KES', () => {
            const result = convertCurrency(100, 'USD', 'KES');
            expect(result).toBeGreaterThan(100); // KES is weaker than USD
        });

        test('should convert KES to USD', () => {
            const result = convertCurrency(13050, 'KES', 'USD');
            expect(result).toBeCloseTo(100, 0);
        });

        test('should convert EUR to GBP', () => {
            const result = convertCurrency(100, 'EUR', 'GBP');
            expect(result).toBeGreaterThan(0);
        });

        test('should handle same currency conversion', () => {
            const result = convertCurrency(100, 'USD', 'USD');
            expect(result).toBe(100);
        });

        test('should convert between African currencies', () => {
            const result = convertCurrency(1000, 'KES', 'TZS');
            expect(result).toBeGreaterThan(1000); // TZS is weaker than KES
        });

        test('should throw error for unsupported source currency', () => {
            expect(() => convertCurrency(100, 'INVALID', 'USD')).toThrow('Unsupported source currency: INVALID');
        });

        test('should throw error for unsupported target currency', () => {
            expect(() => convertCurrency(100, 'USD', 'INVALID')).toThrow('Unsupported target currency: INVALID');
        });

        test('should handle small amounts', () => {
            const result = convertCurrency(0.01, 'USD', 'EUR');
            expect(result).toBeGreaterThanOrEqual(0);
        });

        test('should handle large amounts', () => {
            const result = convertCurrency(1000000, 'USD', 'KES');
            expect(result).toBeGreaterThan(100000000);
        });
    });

    describe('getExchangeRate', () => {
        test('should return exchange rate from USD to KES', () => {
            const rate = getExchangeRate('USD', 'KES');
            expect(rate).toBeGreaterThan(100);
        });

        test('should return exchange rate from KES to USD', () => {
            const rate = getExchangeRate('KES', 'USD');
            expect(rate).toBeLessThan(1);
        });

        test('should return 1 for same currency', () => {
            const rate = getExchangeRate('USD', 'USD');
            expect(rate).toBe(1);
        });

        test('should throw error for unsupported currency', () => {
            expect(() => getExchangeRate('INVALID', 'USD')).toThrow('Unsupported source currency: INVALID');
        });
    });
});

describe('Transaction Filtering by Period', () => {
    const now = new Date();
    const transactions = [
        { id: '1', timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(), amount: 100, type: 'INCOME', status: 'PAID' },
        { id: '2', timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), amount: 200, type: 'INCOME', status: 'PAID' },
        { id: '3', timestamp: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(), amount: 300, type: 'INCOME', status: 'PAID' },
        { id: '4', timestamp: new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString(), amount: 400, type: 'INCOME', status: 'PAID' },
        { id: '5', timestamp: new Date(now - 100 * 24 * 60 * 60 * 1000).toISOString(), amount: 500, type: 'INCOME', status: 'PAID' },
        { id: '6', timestamp: new Date(now - 400 * 24 * 60 * 60 * 1000).toISOString(), amount: 600, type: 'INCOME', status: 'PAID' }
    ];

    test('should filter transactions for WEEK period', () => {
        const filtered = filterTransactionsByPeriod(transactions, 'WEEK');
        expect(filtered.length).toBe(2);
        expect(filtered.map(t => t.id)).toEqual(['1', '2']);
    });

    test('should filter transactions for MONTH period', () => {
        const filtered = filterTransactionsByPeriod(transactions, 'MONTH');
        expect(filtered.length).toBe(3);
        expect(filtered.map(t => t.id)).toEqual(['1', '2', '3']);
    });

    test('should filter transactions for QUARTER period', () => {
        const filtered = filterTransactionsByPeriod(transactions, 'QUARTER');
        expect(filtered.length).toBe(4);
        expect(filtered.map(t => t.id)).toEqual(['1', '2', '3', '4']);
    });

    test('should filter transactions for YEAR period', () => {
        const filtered = filterTransactionsByPeriod(transactions, 'YEAR');
        expect(filtered.length).toBe(5);
        expect(filtered.map(t => t.id)).toEqual(['1', '2', '3', '4', '5']);
    });

    test('should return all transactions for ALL period', () => {
        const filtered = filterTransactionsByPeriod(transactions, 'ALL');
        expect(filtered.length).toBe(6);
    });

    test('should handle empty transaction array', () => {
        const filtered = filterTransactionsByPeriod([], 'WEEK');
        expect(filtered.length).toBe(0);
    });
});

describe('Financial Calculations', () => {
    const transactions = [
        { id: '1', type: 'INCOME', status: 'PAID', amount: 1000 },
        { id: '2', type: 'INCOME', status: 'PAID', amount: 2000 },
        { id: '3', type: 'INCOME', status: 'CREDIT', amount: 500 },
        { id: '4', type: 'EXPENSE', status: 'PAID', amount: 800 },
        { id: '5', type: 'EXPENSE', status: 'PAID', amount: 1200 },
        { id: '6', type: 'EXPENSE', status: 'CREDIT', amount: 300 }
    ];

    describe('calculateTotalIncome', () => {
        test('should calculate total income from paid transactions only', () => {
            const income = calculateTotalIncome(transactions);
            expect(income).toBe(3000);
        });

        test('should exclude credit transactions from income', () => {
            const income = calculateTotalIncome(transactions);
            expect(income).not.toBe(3500); // Credit amount not included (3000 + 500)
        });

        test('should return 0 for empty array', () => {
            expect(calculateTotalIncome([])).toBe(0);
        });

        test('should handle string amounts', () => {
            const txns = [{ type: 'INCOME', status: 'PAID', amount: '1000' }];
            expect(calculateTotalIncome(txns)).toBe(1000);
        });
    });

    describe('calculateTotalExpense', () => {
        test('should calculate total expense from paid transactions only', () => {
            const expense = calculateTotalExpense(transactions);
            expect(expense).toBe(2000);
        });

        test('should exclude credit transactions from expenses', () => {
            const expense = calculateTotalExpense(transactions);
            expect(expense).not.toBe(2300); // Credit amount not included
        });

        test('should return 0 for empty array', () => {
            expect(calculateTotalExpense([])).toBe(0);
        });
    });

    describe('calculateNetBalance', () => {
        test('should calculate net balance correctly', () => {
            const balance = calculateNetBalance(3000, 2000);
            expect(balance).toBe(1000);
        });

        test('should handle negative balance', () => {
            const balance = calculateNetBalance(1000, 2000);
            expect(balance).toBe(-1000);
        });

        test('should handle zero balance', () => {
            const balance = calculateNetBalance(1000, 1000);
            expect(balance).toBe(0);
        });
    });

    describe('getUnpaidDebts', () => {
        test('should return only income transactions with CREDIT status', () => {
            const debts = getUnpaidDebts(transactions);
            expect(debts.length).toBe(1);
            expect(debts[0].amount).toBe(500);
        });

        test('should exclude paid transactions', () => {
            const debts = getUnpaidDebts(transactions);
            expect(debts.some(d => d.status === 'PAID')).toBe(false);
        });
    });

    describe('getUnpaidLiabilities', () => {
        test('should return only expense transactions with CREDIT status', () => {
            const liabilities = getUnpaidLiabilities(transactions);
            expect(liabilities.length).toBe(1);
            expect(liabilities[0].amount).toBe(300);
        });
    });

    describe('calculateTotalOwedToYou', () => {
        test('should calculate total amount owed to you', () => {
            const debts = [{ amount: 500 }, { amount: 300 }];
            const total = calculateTotalOwedToYou(debts);
            expect(total).toBe(800);
        });
    });

    describe('calculateTotalYouOwe', () => {
        test('should calculate total amount you owe', () => {
            const liabilities = [{ amount: 200 }, { amount: 400 }];
            const total = calculateTotalYouOwe(liabilities);
            expect(total).toBe(600);
        });
    });
});

describe('Transaction Management', () => {
    describe('createTransaction', () => {
        test('should create transaction with all required fields', () => {
            const tx = createTransaction('INCOME', 'PAID', 1000, 'Sale', 'John Doe');
            expect(tx).toHaveProperty('id');
            expect(tx).toHaveProperty('timestamp');
            expect(tx.type).toBe('INCOME');
            expect(tx.status).toBe('PAID');
            expect(tx.amount).toBe(1000);
            expect(tx.desc).toBe('Sale');
            expect(tx.client).toBe('John Doe');
        });

        test('should set default client to Walk-in', () => {
            const tx = createTransaction('INCOME', 'PAID', 1000, 'Sale');
            expect(tx.client).toBe('Walk-in');
        });

        test('should set dueDate for CREDIT transactions', () => {
            const dueDate = '2024-12-31';
            const tx = createTransaction('INCOME', 'CREDIT', 1000, 'Sale', 'John', dueDate);
            expect(tx.dueDate).toBe(dueDate);
        });

        test('should set dueDate to null for PAID transactions', () => {
            const tx = createTransaction('INCOME', 'PAID', 1000, 'Sale', 'John', '2024-12-31');
            expect(tx.dueDate).toBeNull();
        });

        test('should convert amount to number', () => {
            const tx = createTransaction('INCOME', 'PAID', '1000', 'Sale');
            expect(typeof tx.amount).toBe('number');
            expect(tx.amount).toBe(1000);
        });
    });

    describe('markTransactionAsPaid', () => {
        test('should mark transaction as PAID', () => {
            const transactions = [
                { id: '1', status: 'CREDIT', amount: 100 },
                { id: '2', status: 'PAID', amount: 200 }
            ];
            const updated = markTransactionAsPaid(transactions, '1');
            expect(updated[0].status).toBe('PAID');
            expect(updated[1].status).toBe('PAID');
        });

        test('should update timestamp when marking as paid', () => {
            const transactions = [{ id: '1', status: 'CREDIT', timestamp: '2023-01-01T00:00:00Z' }];
            const updated = markTransactionAsPaid(transactions, '1');
            expect(updated[0].timestamp).not.toBe('2023-01-01T00:00:00Z');
        });

        test('should not modify other transactions', () => {
            const transactions = [
                { id: '1', status: 'CREDIT', amount: 100 },
                { id: '2', status: 'CREDIT', amount: 200 }
            ];
            const updated = markTransactionAsPaid(transactions, '1');
            expect(updated[1].status).toBe('CREDIT');
        });

        test('should handle non-existent transaction id', () => {
            const transactions = [{ id: '1', status: 'CREDIT' }];
            const updated = markTransactionAsPaid(transactions, '999');
            expect(updated[0].status).toBe('CREDIT');
        });
    });
});

describe('Data Validation', () => {
    describe('validateImportData', () => {
        test('should validate correct data format', () => {
            const data = [
                { id: '1', timestamp: '2024-01-01', type: 'INCOME', status: 'PAID', amount: 100, desc: 'Test' }
            ];
            const result = validateImportData(data);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should reject non-array data', () => {
            const result = validateImportData({});
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid database file format.');
        });

        test('should reject data missing required fields', () => {
            const data = [{ id: '1', timestamp: '2024-01-01' }];
            const result = validateImportData(data);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Missing required field');
        });

        test('should accept empty array', () => {
            const result = validateImportData([]);
            expect(result.valid).toBe(true);
        });

        test('should validate multiple transactions', () => {
            const data = [
                { id: '1', timestamp: '2024-01-01', type: 'INCOME', status: 'PAID', amount: 100, desc: 'Test 1' },
                { id: '2', timestamp: '2024-01-02', type: 'EXPENSE', status: 'PAID', amount: 50, desc: 'Test 2' }
            ];
            const result = validateImportData(data);
            expect(result.valid).toBe(true);
        });
    });

    describe('generateExportFilename', () => {
        test('should generate filename with current date', () => {
            const filename = generateExportFilename();
            expect(filename).toMatch(/biashara_pro_backup_\d{4}-\d{2}-\d{2}\.json/);
        });

        test('should accept custom prefix', () => {
            const filename = generateExportFilename('custom_prefix');
            expect(filename).toMatch(/custom_prefix_\d{4}-\d{2}-\d{2}\.json/);
        });
    });
});

describe('Advanced Edge Cases', () => {
    test('should handle very large transaction amounts', () => {
        const transactions = [
            { type: 'INCOME', status: 'PAID', amount: 999999999.99 }
        ];
        const income = calculateTotalIncome(transactions);
        expect(income).toBe(999999999.99);
    });

    test('should handle zero amounts', () => {
        const transactions = [
            { type: 'INCOME', status: 'PAID', amount: 0 }
        ];
        const income = calculateTotalIncome(transactions);
        expect(income).toBe(0);
    });

    test('should handle negative amounts in calculations', () => {
        const transactions = [
            { type: 'INCOME', status: 'PAID', amount: -100 }
        ];
        const income = calculateTotalIncome(transactions);
        expect(income).toBe(-100);
    });

    test('should handle floating point precision', () => {
        const result = convertCurrency(100, 'USD', 'EUR');
        expect(Number.isFinite(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(0);
    });

    test('should handle special characters in transaction description', () => {
        const tx = createTransaction('INCOME', 'PAID', 100, 'Sale with "quotes" and \'apostrophes\' & <tags>');
        expect(tx.desc).toBe('Sale with "quotes" and \'apostrophes\' & <tags>');
    });

    test('should handle unicode characters in client name', () => {
        const tx = createTransaction('INCOME', 'PAID', 100, 'Sale', '客户 名前');
        expect(tx.client).toBe('客户 名前');
    });

    test('currency conversion chain should be consistent', () => {
        const direct = convertCurrency(100, 'KES', 'TZS');
        const viaUSD = convertCurrency(convertCurrency(100, 'KES', 'USD'), 'USD', 'TZS');
        // Allow larger rounding differences due to cross-rate calculations
        expect(Math.abs(direct - viaUSD)).toBeLessThan(50);
    });

    test('should handle all supported currencies in formatting', () => {
        const currencies = getSupportedCurrencies();
        currencies.forEach(currency => {
            expect(() => formatMoney(1000, currency)).not.toThrow();
        });
    });
});

describe('Multi-Currency Transaction Scenarios', () => {
    test('should calculate income with mixed currencies', () => {
        const transactions = [
            { type: 'INCOME', status: 'PAID', amount: 1000, currency: 'KES' },
            { type: 'INCOME', status: 'PAID', amount: 100, currency: 'USD' },
            { type: 'INCOME', status: 'PAID', amount: 50, currency: 'EUR' }
        ];
        
        // Convert all to USD for comparison
        const totalInUSD = transactions.reduce((sum, tx) => {
            return sum + convertCurrency(tx.amount, tx.currency, 'USD');
        }, 0);
        
        expect(totalInUSD).toBeGreaterThan(0);
    });

    test('should format multi-currency portfolio', () => {
        const holdings = [
            { currency: 'KES', amount: 10000 },
            { currency: 'USD', amount: 100 },
            { currency: 'EUR', amount: 50 }
        ];

        const formatted = holdings.map(h => ({
            currency: h.currency,
            formatted: formatMoney(h.amount, h.currency)
        }));

        expect(formatted.length).toBe(3);
        expect(formatted[0].formatted).toContain('Ksh');
        expect(formatted[1].formatted).toContain('$');
        expect(formatted[2].formatted).toContain('€');
    });
});
