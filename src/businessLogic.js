// Core business logic extracted from index.html for testing

/**
 * Currency configuration for worldwide support
 */
const CURRENCY_CONFIG = {
    KES: { locale: 'en-KE', symbol: 'KSh', name: 'Kenyan Shilling', decimals: 0 },
    USD: { locale: 'en-US', symbol: '$', name: 'US Dollar', decimals: 2 },
    EUR: { locale: 'de-DE', symbol: '€', name: 'Euro', decimals: 2 },
    GBP: { locale: 'en-GB', symbol: '£', name: 'British Pound', decimals: 2 },
    JPY: { locale: 'ja-JP', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
    CNY: { locale: 'zh-CN', symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
    INR: { locale: 'en-IN', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
    NGN: { locale: 'en-NG', symbol: '₦', name: 'Nigerian Naira', decimals: 2 },
    ZAR: { locale: 'en-ZA', symbol: 'R', name: 'South African Rand', decimals: 2 },
    GHS: { locale: 'en-GH', symbol: '₵', name: 'Ghanaian Cedi', decimals: 2 },
    TZS: { locale: 'sw-TZ', symbol: 'TSh', name: 'Tanzanian Shilling', decimals: 0 },
    UGX: { locale: 'en-UG', symbol: 'USh', name: 'Ugandan Shilling', decimals: 0 },
    RWF: { locale: 'rw-RW', symbol: 'FRw', name: 'Rwandan Franc', decimals: 0 },
    ETB: { locale: 'am-ET', symbol: 'Br', name: 'Ethiopian Birr', decimals: 2 },
    CAD: { locale: 'en-CA', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
    AUD: { locale: 'en-AU', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
    CHF: { locale: 'de-CH', symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
    BRL: { locale: 'pt-BR', symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
    MXN: { locale: 'es-MX', symbol: '$', name: 'Mexican Peso', decimals: 2 },
    SGD: { locale: 'en-SG', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 }
};

/**
 * Exchange rates relative to USD (base currency)
 * In production, these would be fetched from an API
 */
const EXCHANGE_RATES = {
    USD: 1.0,
    KES: 130.5,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.5,
    CNY: 7.19,
    INR: 83.12,
    NGN: 1545.0,
    ZAR: 18.95,
    GHS: 15.75,
    TZS: 2650.0,
    UGX: 3785.0,
    RWF: 1385.0,
    ETB: 112.5,
    CAD: 1.36,
    AUD: 1.53,
    CHF: 0.88,
    BRL: 4.97,
    MXN: 17.15,
    SGD: 1.34
};

/**
 * Gets list of all supported currencies
 */
function getSupportedCurrencies() {
    return Object.keys(CURRENCY_CONFIG);
}

/**
 * Gets currency details
 */
function getCurrencyDetails(currencyCode) {
    return CURRENCY_CONFIG[currencyCode] || null;
}

/**
 * Formats a value with specified currency
 */
function formatMoney(val, currency = 'KES') {
    const config = CURRENCY_CONFIG[currency];
    if (!config) {
        throw new Error(`Unsupported currency: ${currency}`);
    }
    
    return new Intl.NumberFormat(config.locale, { 
        style: 'currency', 
        currency: currency, 
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals
    }).format(val);
}

/**
 * Converts amount from one currency to another
 */
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (!EXCHANGE_RATES[fromCurrency]) {
        throw new Error(`Unsupported source currency: ${fromCurrency}`);
    }
    if (!EXCHANGE_RATES[toCurrency]) {
        throw new Error(`Unsupported target currency: ${toCurrency}`);
    }
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
    const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency];
    
    return Math.round(convertedAmount * 100) / 100;
}

/**
 * Calculates exchange rate between two currencies
 */
function getExchangeRate(fromCurrency, toCurrency) {
    if (!EXCHANGE_RATES[fromCurrency]) {
        throw new Error(`Unsupported source currency: ${fromCurrency}`);
    }
    if (!EXCHANGE_RATES[toCurrency]) {
        throw new Error(`Unsupported target currency: ${toCurrency}`);
    }
    
    return EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency];
}

/**
 * Filters transactions based on report period
 */
function filterTransactionsByPeriod(transactions, reportPeriod) {
    const now = new Date();
    return transactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        if (reportPeriod === 'ALL') return true;
        if (reportPeriod === 'WEEK') return (now - txDate) / (1000 * 60 * 60 * 24) <= 7;
        if (reportPeriod === 'MONTH') return (now - txDate) / (1000 * 60 * 60 * 24) <= 30;
        if (reportPeriod === 'QUARTER') return (now - txDate) / (1000 * 60 * 60 * 24) <= 90;
        if (reportPeriod === 'YEAR') return (now - txDate) / (1000 * 60 * 60 * 24) <= 365;
        return true;
    });
}

/**
 * Calculates total income from paid transactions
 */
function calculateTotalIncome(transactions) {
    return transactions
        .filter(t => t.type === 'INCOME' && t.status === 'PAID')
        .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculates total expense from paid transactions
 */
function calculateTotalExpense(transactions) {
    return transactions
        .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
        .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculates net balance (income - expense)
 */
function calculateNetBalance(totalIncome, totalExpense) {
    return totalIncome - totalExpense;
}

/**
 * Gets unpaid debts (income transactions with CREDIT status)
 */
function getUnpaidDebts(transactions) {
    return transactions.filter(t => t.type === 'INCOME' && t.status === 'CREDIT');
}

/**
 * Gets unpaid liabilities (expense transactions with CREDIT status)
 */
function getUnpaidLiabilities(transactions) {
    return transactions.filter(t => t.type === 'EXPENSE' && t.status === 'CREDIT');
}

/**
 * Calculates total amount owed to you
 */
function calculateTotalOwedToYou(unpaidDebts) {
    return unpaidDebts.reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculates total amount you owe
 */
function calculateTotalYouOwe(unpaidLiabilities) {
    return unpaidLiabilities.reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Creates a new transaction object
 */
function createTransaction(type, status, amount, desc, client, dueDate) {
    // Use cryptographically secure ID generation
    let id;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = crypto.randomUUID();
    } else if (typeof require !== 'undefined') {
        // Node.js environment fallback
        try {
            const cryptoModule = require('crypto');
            id = cryptoModule.randomUUID();
        } catch (e) {
            // Ultimate fallback using secure random bytes
            const array = new Uint8Array(16);
            if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
                crypto.getRandomValues(array);
            } else {
                // Last resort - use timestamp with random component
                for (let i = 0; i < 16; i++) {
                    array[i] = Math.floor(Math.random() * 256);
                }
            }
            id = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('-');
        }
    } else {
        // Browser fallback with better randomness
        const array = new Uint8Array(16);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(array);
        } else {
            for (let i = 0; i < 16; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        id = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('-');
    }
    
    return {
        id,
        timestamp: new Date().toISOString(),
        type,
        status,
        amount: Number(amount),
        desc: sanitizeInput(desc),
        client: sanitizeInput(client || 'Walk-in'),
        dueDate: status === 'CREDIT' ? dueDate : null
    };
}

/**
 * Sanitizes user input to prevent XSS attacks
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }
    // Remove potentially dangerous HTML/script tags
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Marks a transaction as paid
 */
function markTransactionAsPaid(transactions, id) {
    return transactions.map(tx => 
        tx.id === id 
            ? { ...tx, status: 'PAID', timestamp: new Date().toISOString() }
            : tx
    );
}

/**
 * Validates import data format with schema validation
 */
function validateImportData(data) {
    if (!Array.isArray(data)) {
        return { valid: false, error: 'Invalid database file format.' };
    }
    
    // Check if each item has required fields with proper types
    const requiredFields = [
        { name: 'id', type: 'string' },
        { name: 'timestamp', type: 'string' },
        { name: 'type', type: 'string', enum: ['INCOME', 'EXPENSE'] },
        { name: 'status', type: 'string', enum: ['PAID', 'CREDIT', 'PENDING'] },
        { name: 'amount', type: 'number' },
        { name: 'desc', type: 'string' }
    ];
    
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        
        // Check for prototype pollution attempts using safe hasOwnProperty
        if (Object.prototype.hasOwnProperty.call(item, '__proto__') || 
            Object.prototype.hasOwnProperty.call(item, 'constructor') || 
            Object.prototype.hasOwnProperty.call(item, 'prototype')) {
            return { valid: false, error: `Potential prototype pollution detected in transaction ${i}` };
        }
        
        for (const field of requiredFields) {
            if (!(field.name in item)) {
                return { valid: false, error: `Missing required field '${field.name}' in transaction ${i}` };
            }
            
            // Type validation
            if (typeof item[field.name] !== field.type) {
                return { valid: false, error: `Field '${field.name}' must be of type ${field.type} in transaction ${i}` };
            }
            
            // Enum validation
            if (field.enum && !field.enum.includes(item[field.name])) {
                return { valid: false, error: `Field '${field.name}' must be one of ${field.enum.join(', ')} in transaction ${i}` };
            }
            
            // Amount validation - must be positive number
            if (field.name === 'amount' && (item[field.name] < 0 || isNaN(item[field.name]))) {
                return { valid: false, error: `Amount must be a positive number in transaction ${i}` };
            }
        }
    }
    
    return { valid: true, error: null };
}

/**
 * Generates export filename with current date
 */
function generateExportFilename(prefix = 'biashara_pro_backup') {
    const date = new Date().toISOString().split('T')[0];
    return `${prefix}_${date}.json`;
}

module.exports = {
    // Currency functions
    getSupportedCurrencies,
    getCurrencyDetails,
    formatMoney,
    convertCurrency,
    getExchangeRate,
    // Transaction functions
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
    // Data utilities
    validateImportData,
    generateExportFilename
};
