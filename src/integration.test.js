// Integration tests for Biashara Ledger Pro API
const http = require('http');

// Mock data for integration testing
const mockTransactions = [
    { id: '1', timestamp: new Date().toISOString(), type: 'INCOME', status: 'PAID', amount: 5000, currency: 'KES', desc: 'Sale 1', client: 'John' },
    { id: '2', timestamp: new Date().toISOString(), type: 'EXPENSE', status: 'PAID', amount: 2000, currency: 'KES', desc: 'Supplies', client: 'Vendor A' },
    { id: '3', timestamp: new Date().toISOString(), type: 'INCOME', status: 'CREDIT', amount: 3000, currency: 'USD', desc: 'Service', client: 'Company B' },
    { id: '4', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'INCOME', status: 'PAID', amount: 1500, currency: 'EUR', desc: 'Consulting', client: 'EU Client' }
];

const {
    formatMoney,
    convertCurrency,
    calculateTotalIncome,
    calculateTotalExpense,
    calculateNetBalance,
    filterTransactionsByPeriod,
    validateImportData
} = require('./businessLogic');

describe('Integration Tests - Multi-Currency Business Flow', () => {
    describe('Complete Transaction Lifecycle', () => {
        test('should process multi-currency transactions end-to-end', () => {
            // Filter paid income transactions
            const paidIncome = mockTransactions.filter(t => t.type === 'INCOME' && t.status === 'PAID');
            
            // Calculate totals in original currencies
            const kesIncome = paidIncome.filter(t => t.currency === 'KES').reduce((sum, t) => sum + t.amount, 0);
            const eurIncome = paidIncome.filter(t => t.currency === 'EUR').reduce((sum, t) => sum + t.amount, 0);
            
            // Convert all to base currency (USD)
            const totalInUSD = convertCurrency(kesIncome, 'KES', 'USD') + convertCurrency(eurIncome, 'EUR', 'USD');
            
            expect(totalInUSD).toBeGreaterThan(0);
            expect(typeof totalInUSD).toBe('number');
        });

        test('should generate multi-currency financial report', () => {
            const report = {
                generated: new Date().toISOString(),
                transactions: mockTransactions.length,
                byCurrency: {}
            };

            // Group by currency
            mockTransactions.forEach(tx => {
                if (!report.byCurrency[tx.currency]) {
                    report.byCurrency[tx.currency] = { income: 0, expense: 0 };
                }
                if (tx.type === 'INCOME' && tx.status === 'PAID') {
                    report.byCurrency[tx.currency].income += tx.amount;
                } else if (tx.type === 'EXPENSE' && tx.status === 'PAID') {
                    report.byCurrency[tx.currency].expense += tx.amount;
                }
            });

            expect(report.byCurrency).toHaveProperty('KES');
            expect(report.byCurrency).toHaveProperty('USD');
            expect(report.byCurrency).toHaveProperty('EUR');
            expect(report.byCurrency.KES.income).toBe(5000);
            expect(report.byCurrency.KES.expense).toBe(2000);
        });

        test('should calculate consolidated balance in base currency', () => {
            let totalIncomeUSD = 0;
            let totalExpenseUSD = 0;

            mockTransactions.forEach(tx => {
                if (tx.status === 'PAID') {
                    const amountUSD = convertCurrency(tx.amount, tx.currency, 'USD');
                    if (tx.type === 'INCOME') {
                        totalIncomeUSD += amountUSD;
                    } else {
                        totalExpenseUSD += amountUSD;
                    }
                }
            });

            const netBalance = calculateNetBalance(totalIncomeUSD, totalExpenseUSD);
            
            expect(netBalance).toBeGreaterThan(0);
            expect(Number.isFinite(netBalance)).toBe(true);
        });
    });

    describe('Data Import/Export Integration', () => {
        test('should validate and process imported transaction data', () => {
            const importData = [
                { id: '1', timestamp: '2024-01-01T00:00:00Z', type: 'INCOME', status: 'PAID', amount: 1000, desc: 'Test', currency: 'KES' },
                { id: '2', timestamp: '2024-01-02T00:00:00Z', type: 'EXPENSE', status: 'PAID', amount: 500, desc: 'Test', currency: 'KES' }
            ];

            const validation = validateImportData(importData);
            expect(validation.valid).toBe(true);

            const income = calculateTotalIncome(importData);
            const expense = calculateTotalExpense(importData);
            const balance = calculateNetBalance(income, expense);

            expect(income).toBe(1000);
            expect(expense).toBe(500);
            expect(balance).toBe(500);
        });

        test('should handle mixed currency import', () => {
            const importData = [
                { id: '1', timestamp: '2024-01-01T00:00:00Z', type: 'INCOME', status: 'PAID', amount: 10000, desc: 'KES Sale', currency: 'KES' },
                { id: '2', timestamp: '2024-01-02T00:00:00Z', type: 'INCOME', status: 'PAID', amount: 100, desc: 'USD Sale', currency: 'USD' },
                { id: '3', timestamp: '2024-01-03T00:00:00Z', type: 'INCOME', status: 'PAID', amount: 50, desc: 'EUR Sale', currency: 'EUR' }
            ];

            const validation = validateImportData(importData);
            expect(validation.valid).toBe(true);

            // Convert all to USD for consolidated reporting
            const totalUSD = importData.reduce((sum, tx) => {
                return sum + convertCurrency(tx.amount, tx.currency, 'USD');
            }, 0);

            expect(totalUSD).toBeGreaterThan(100);
        });
    });

    describe('Period-Based Reporting with Multi-Currency', () => {
        test('should filter and convert transactions for monthly report', () => {
            const now = new Date();
            const transactions = [
                { id: '1', timestamp: new Date(now - 5 * 86400000).toISOString(), type: 'INCOME', status: 'PAID', amount: 5000, currency: 'KES' },
                { id: '2', timestamp: new Date(now - 10 * 86400000).toISOString(), type: 'INCOME', status: 'PAID', amount: 100, currency: 'USD' },
                { id: '3', timestamp: new Date(now - 45 * 86400000).toISOString(), type: 'INCOME', status: 'PAID', amount: 2000, currency: 'KES' }
            ];

            const monthTransactions = filterTransactionsByPeriod(transactions, 'MONTH');
            expect(monthTransactions.length).toBe(2);

            const totalInUSD = monthTransactions.reduce((sum, tx) => {
                return sum + convertCurrency(tx.amount, tx.currency, 'USD');
            }, 0);

            expect(totalInUSD).toBeGreaterThan(0);
        });
    });

    describe('Formatting and Display Integration', () => {
        test('should format amounts correctly for different locales', () => {
            const amounts = [
                { value: 1000, currency: 'KES' },
                { value: 100, currency: 'USD' },
                { value: 50, currency: 'EUR' },
                { value: 10000, currency: 'JPY' }
            ];

            const formatted = amounts.map(a => ({
                original: a.value,
                currency: a.currency,
                formatted: formatMoney(a.value, a.currency)
            }));

            expect(formatted[0].formatted).toContain('Ksh');
            expect(formatted[1].formatted).toContain('$');
            expect(formatted[2].formatted).toContain('€');
            expect(formatted[3].formatted).toMatch(/[\u00A5\uFFE5]/);
        });

        test('should generate portfolio summary with multiple currencies', () => {
            const portfolio = [
                { currency: 'KES', balance: 50000 },
                { currency: 'USD', balance: 500 },
                { currency: 'EUR', balance: 300 },
                { currency: 'GBP', balance: 200 }
            ];

            const summary = portfolio.map(item => ({
                currency: item.currency,
                localAmount: item.balance,
                formattedLocal: formatMoney(item.balance, item.currency),
                usdEquivalent: convertCurrency(item.balance, item.currency, 'USD'),
                formattedUSD: formatMoney(convertCurrency(item.balance, item.currency, 'USD'), 'USD')
            }));

            expect(summary.length).toBe(4);
            summary.forEach(item => {
                expect(item.usdEquivalent).toBeGreaterThan(0);
                expect(item.formattedUSD).toContain('$');
            });
        });
    });

    describe('Error Handling in Integration Scenarios', () => {
        test('should handle invalid currency in transaction stream', () => {
            const transactions = [
                { id: '1', type: 'INCOME', status: 'PAID', amount: 1000, currency: 'KES' },
                { id: '2', type: 'INCOME', status: 'PAID', amount: 100, currency: 'INVALID' }
            ];

            expect(() => {
                transactions.forEach(tx => {
                    convertCurrency(tx.amount, tx.currency, 'USD');
                });
            }).toThrow();
        });

        test('should gracefully handle empty transaction sets', () => {
            const emptyTransactions = [];
            const income = calculateTotalIncome(emptyTransactions);
            const expense = calculateTotalExpense(emptyTransactions);
            const balance = calculateNetBalance(income, expense);

            expect(income).toBe(0);
            expect(expense).toBe(0);
            expect(balance).toBe(0);
        });
    });

    describe('Real-World Business Scenarios', () => {
        test('should handle Kenyan business with international clients', () => {
            // Simulate a Kenyan business with clients from different countries
            const invoices = [
                { client: 'Nairobi Client', amount: 50000, currency: 'KES' },
                { client: 'US Client', amount: 1000, currency: 'USD' },
                { client: 'UK Client', amount: 800, currency: 'GBP' },
                { client: 'EU Client', amount: 900, currency: 'EUR' }
            ];

            // Calculate total revenue in KES (base currency for Kenyan business)
            const totalKES = invoices.reduce((sum, inv) => {
                return sum + convertCurrency(inv.amount, inv.currency, 'KES');
            }, 0);

            expect(totalKES).toBeGreaterThan(50000);
            
            // Also calculate in USD for international reporting
            const totalUSD = invoices.reduce((sum, inv) => {
                return sum + convertCurrency(inv.amount, inv.currency, 'USD');
            }, 0);

            expect(totalUSD).toBeGreaterThan(1000);
        });

        test('should support East African Community regional trade', () => {
            // EAC countries: Kenya, Tanzania, Uganda, Rwanda, Burundi, DRC, South Sudan
            const regionalTransactions = [
                { country: 'Kenya', amount: 100000, currency: 'KES' },
                { country: 'Tanzania', amount: 500000, currency: 'TZS' },
                { country: 'Uganda', amount: 700000, currency: 'UGX' },
                { country: 'Rwanda', amount: 250000, currency: 'RWF' }
            ];

            // Consolidate to USD for regional reporting
            const totalUSD = regionalTransactions.reduce((sum, tx) => {
                return sum + convertCurrency(tx.amount, tx.currency, 'USD');
            }, 0);

            expect(totalUSD).toBeGreaterThan(0);

            // Each transaction should be convertible
            regionalTransactions.forEach(tx => {
                expect(() => convertCurrency(tx.amount, tx.currency, 'USD')).not.toThrow();
            });
        });
    });
});

describe('Performance and Scalability Integration', () => {
    test('should handle batch processing of multiple currencies', () => {
        const batchSize = 100;
        const transactions = [];

        for (let i = 0; i < batchSize; i++) {
            const currencies = ['KES', 'USD', 'EUR', 'GBP', 'TZS', 'UGX'];
            const currency = currencies[i % currencies.length];
            transactions.push({
                id: `tx-${i}`,
                type: i % 2 === 0 ? 'INCOME' : 'EXPENSE',
                status: 'PAID',
                amount: Math.floor(Math.random() * 10000) + 100,
                currency: currency
            });
        }

        const startTime = Date.now();

        // Process all transactions
        const results = transactions.map(tx => ({
            ...tx,
            usdAmount: convertCurrency(tx.amount, tx.currency, 'USD')
        }));

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        expect(results.length).toBe(batchSize);
        expect(processingTime).toBeLessThan(1000); // Should complete in under 1 second

        // Verify all conversions succeeded
        results.forEach(r => {
            expect(r.usdAmount).toBeGreaterThan(0);
        });
    });
});
