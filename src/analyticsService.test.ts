import AnalyticsService from './analyticsService';
import { Transaction, Period } from './types';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      amount: 5000,
      currency: 'USD',
      description: 'Sale 1',
      category: 'sales',
      date: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'completed',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: '2',
      type: 'income',
      amount: 3000,
      currency: 'USD',
      description: 'Sale 2',
      category: 'services',
      date: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'completed',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: '3',
      type: 'expense',
      amount: 1500,
      currency: 'USD',
      description: 'Office supplies',
      category: 'operations',
      date: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'completed',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: '4',
      type: 'expense',
      amount: 800,
      currency: 'USD',
      description: 'Utilities',
      category: 'operations',
      date: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: 'completed',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: '5',
      type: 'income',
      amount: 2000,
      currency: 'USD',
      description: 'Pending sale',
      category: 'sales',
      date: Date.now(),
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];

  beforeEach(() => {
    analyticsService = new AnalyticsService(mockTransactions);
  });

  describe('Report Generation', () => {
    test('should generate weekly report', () => {
      const report = analyticsService.generateReport('WEEK');
      
      expect(report.period).toBe('WEEK');
      expect(report.totalIncome).toBe(8000); // Only completed transactions
      expect(report.totalExpenses).toBe(2300);
      expect(report.netBalance).toBe(5700);
      expect(report.breakdownByCategory.length).toBeGreaterThan(0);
    });

    test('should generate monthly report', () => {
      const report = analyticsService.generateReport('MONTH');
      
      expect(report.period).toBe('MONTH');
      expect(report.totalIncome).toBe(8000);
      expect(report.totalExpenses).toBe(2300);
    });

    test('should exclude pending transactions from reports', () => {
      const report = analyticsService.generateReport('WEEK');
      
      // Pending transaction should not be included
      expect(report.totalIncome).toBe(8000); // Not 10000
    });

    test('should calculate category breakdown', () => {
      const report = analyticsService.generateReport('WEEK');
      
      const operationsCategory = report.breakdownByCategory.find(c => c.category === 'operations');
      expect(operationsCategory).toBeDefined();
      expect(operationsCategory?.amount).toBe(2300);
      expect(operationsCategory?.percentage).toBeGreaterThan(0);
    });

    test('should generate trends data', () => {
      const report = analyticsService.generateReport('WEEK');
      
      expect(report.trends.length).toBe(7); // 7 days in a week
      expect(report.trends[0]).toHaveProperty('period');
      expect(report.trends[0]).toHaveProperty('income');
      expect(report.trends[0]).toHaveProperty('expenses');
      expect(report.trends[0]).toHaveProperty('balance');
    });
  });

  describe('Dashboard Metrics', () => {
    test('should get current balance', () => {
      const metrics = analyticsService.getDashboardMetrics();
      
      expect(metrics.currentBalance).toBe(5700); // 8000 - 2300
    });

    test('should get monthly income and expenses', () => {
      const metrics = analyticsService.getDashboardMetrics();
      
      expect(metrics.monthlyIncome).toBe(8000);
      expect(metrics.monthlyExpenses).toBe(2300);
    });

    test('should get recent transactions', () => {
      const metrics = analyticsService.getDashboardMetrics();
      
      expect(metrics.recentTransactions.length).toBeLessThanOrEqual(10);
      expect(metrics.recentTransactions[0]?.date).toBeGreaterThanOrEqual(Date.now() - (30 * 24 * 60 * 60 * 1000));
    });

    test('should get top categories', () => {
      const metrics = analyticsService.getDashboardMetrics();
      
      expect(metrics.topCategories.length).toBeLessThanOrEqual(5);
      expect(metrics.topCategories[0]?.amount).toBeGreaterThanOrEqual(
        metrics.topCategories[1]?.amount || 0
      );
    });

    test('should generate cash flow forecast', () => {
      const metrics = analyticsService.getDashboardMetrics();
      
      expect(metrics.cashFlowForecast.length).toBe(30); // 30 days forecast
      expect(metrics.cashFlowForecast[0]).toHaveProperty('date');
      expect(metrics.cashFlowForecast[0]).toHaveProperty('projected');
    });
  });

  describe('Growth Rate Calculation', () => {
    test('should calculate growth rate for week', () => {
      const growthRate = analyticsService.calculateGrowthRate('WEEK');
      
      expect(typeof growthRate).toBe('number');
      expect(growthRate).toBeGreaterThanOrEqual(-100);
    });

    test('should calculate growth rate for month', () => {
      const growthRate = analyticsService.calculateGrowthRate('MONTH');
      
      expect(typeof growthRate).toBe('number');
    });

    test('should handle zero previous period', () => {
      const emptyService = new AnalyticsService([]);
      const growthRate = emptyService.calculateGrowthRate('WEEK');
      
      expect(growthRate).toBe(0);
    });
  });

  describe('Financial Health Score', () => {
    test('should calculate health score', () => {
      const score = analyticsService.getFinancialHealthScore();
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should give higher score for positive balance', () => {
      const positiveTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 10000,
          currency: 'USD',
          description: 'Income',
          category: 'sales',
          date: Date.now(),
          status: 'completed',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];
      
      const service = new AnalyticsService(positiveTransactions);
      const score = service.getFinancialHealthScore();
      
      expect(score).toBeGreaterThan(50); // Base score is 50
    });

    test('should consider income vs expenses ratio', () => {
      const balancedTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 5000,
          currency: 'USD',
          description: 'Income',
          category: 'sales',
          date: Date.now(),
          status: 'completed',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: '2',
          type: 'expense',
          amount: 3000,
          currency: 'USD',
          description: 'Expense',
          category: 'operations',
          date: Date.now(),
          status: 'completed',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];
      
      const service = new AnalyticsService(balancedTransactions);
      const score = service.getFinancialHealthScore();
      
      expect(score).toBeGreaterThan(50);
    });
  });

  describe('Transaction Management', () => {
    test('should add transaction', () => {
      const initialCount = mockTransactions.length;
      
      const newTransaction: Transaction = {
        id: 'new',
        type: 'income',
        amount: 1000,
        currency: 'USD',
        description: 'New sale',
        category: 'sales',
        date: Date.now(),
        status: 'completed',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      analyticsService.addTransaction(newTransaction);
      const report = analyticsService.generateReport('WEEK');
      
      expect(report.totalIncome).toBe(9000); // 8000 + 1000
    });

    test('should set new transactions', () => {
      const newTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 10000,
          currency: 'USD',
          description: 'Big sale',
          category: 'sales',
          date: Date.now(),
          status: 'completed',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];
      
      analyticsService.setTransactions(newTransactions);
      const metrics = analyticsService.getDashboardMetrics();
      
      expect(metrics.currentBalance).toBe(10000);
    });
  });

  describe('Empty State', () => {
    test('should handle empty transactions', () => {
      const emptyService = new AnalyticsService([]);
      
      const report = emptyService.generateReport('WEEK');
      expect(report.totalIncome).toBe(0);
      expect(report.totalExpenses).toBe(0);
      expect(report.netBalance).toBe(0);
      
      const metrics = emptyService.getDashboardMetrics();
      expect(metrics.currentBalance).toBe(0);
      expect(metrics.monthlyIncome).toBe(0);
      expect(metrics.monthlyExpenses).toBe(0);
    });

    test('should return empty trends for no data', () => {
      const emptyService = new AnalyticsService([]);
      const report = emptyService.generateReport('WEEK');
      
      expect(report.trends.length).toBe(7);
      report.trends.forEach(trend => {
        expect(trend.income).toBe(0);
        expect(trend.expenses).toBe(0);
        expect(trend.balance).toBe(0);
      });
    });
  });
});
