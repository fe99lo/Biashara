import { FinancialReport, DashboardMetrics, Transaction, CategoryBreakdown, TrendData, ForecastData, Period, CurrencyCode, CurrencyExposure } from './types';

export class AnalyticsService {
  private transactions: Transaction[] = [];

  constructor(transactions: Transaction[] = []) {
    this.transactions = transactions;
  }

  setTransactions(transactions: Transaction[]): void {
    this.transactions = transactions;
  }

  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  generateReport(period: Period, currency: string = 'USD'): FinancialReport {
    const now = Date.now();
    const { startDate, endDate } = this.getPeriodDates(period, now);
    
    const filteredTransactions = this.transactions.filter(
      t => t.date >= startDate && t.date <= endDate && t.status === 'completed'
    );

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    const breakdownByCategory = this.calculateCategoryBreakdown(filteredTransactions);
    const trends = this.calculateTrends(filteredTransactions, period);

    return {
      period,
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netBalance,
      currency: currency as any,
      breakdownByCategory,
      trends,
      generatedAt: now
    };
  }

  getDashboardMetrics(): DashboardMetrics {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const recentTransactions = this.transactions
      .filter(t => t.date >= thirtyDaysAgo)
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    const monthlyTransactions = this.transactions.filter(
      t => t.date >= thirtyDaysAgo && t.status === 'completed'
    );

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = this.transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
      }, 0);

    const pendingDebts = 0; // Would calculate from debts
    const overdueDebts = 0;

    const topCategories = this.calculateCategoryBreakdown(
      monthlyTransactions.filter(t => t.type === 'expense')
    ).slice(0, 5);

    const cashFlowForecast = this.generateCashFlowForecast();
    const currencyExposure: CurrencyExposure[] = [];

    return {
      currentBalance,
      monthlyIncome,
      monthlyExpenses,
      pendingDebts,
      overdueDebts,
      topCategories,
      recentTransactions,
      cashFlowForecast,
      currencyExposure
    };
  }

  private getPeriodDates(period: Period, now: number): { startDate: number; endDate: number } {
    const today = new Date(now);
    let startDate: number;

    switch (period) {
      case 'WEEK':
        startDate = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'MONTH':
        startDate = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case 'QUARTER':
        startDate = now - (90 * 24 * 60 * 60 * 1000);
        break;
      case 'YEAR':
        startDate = now - (365 * 24 * 60 * 60 * 1000);
        break;
      case 'ALL':
      default:
        startDate = 0;
        break;
    }

    return { startDate, endDate: now };
  }

  private calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    transactions.forEach(t => {
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      existing.amount += t.amount;
      existing.count += 1;
      categoryMap.set(t.category, existing);
    });

    const total = Array.from(categoryMap.values()).reduce((sum, v) => sum + v.amount, 0);

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
        count: data.count
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateTrends(transactions: Transaction[], period: Period): TrendData[] {
    const trends: TrendData[] = [];
    const intervals = this.getTrendIntervals(period);

    for (const interval of intervals) {
      const intervalTransactions = transactions.filter(
        t => t.date >= interval.start && t.date < interval.end
      );

      const income = intervalTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = intervalTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      trends.push({
        period: interval.label,
        income,
        expenses,
        balance: income - expenses
      });
    }

    return trends;
  }

  private getTrendIntervals(period: Period): Array<{ start: number; end: number; label: string }> {
    const now = Date.now();
    const intervals: Array<{ start: number; end: number; label: string }> = [];

    switch (period) {
      case 'WEEK':
        for (let i = 6; i >= 0; i--) {
          const end = now - (i * 24 * 60 * 60 * 1000);
          const start = end - (24 * 60 * 60 * 1000);
          const date = new Date(start);
          intervals.push({
            start,
            end,
            label: date.toLocaleDateString('en-US', { weekday: 'short' })
          });
        }
        break;
      case 'MONTH':
        for (let i = 3; i >= 0; i--) {
          const end = now - (i * 7 * 24 * 60 * 60 * 1000);
          const start = end - (7 * 24 * 60 * 60 * 1000);
          intervals.push({
            start,
            end,
            label: `Week ${4 - i}`
          });
        }
        break;
      case 'QUARTER':
        for (let i = 2; i >= 0; i--) {
          const end = now - (i * 30 * 24 * 60 * 60 * 1000);
          const start = end - (30 * 24 * 60 * 60 * 1000);
          const date = new Date(start);
          intervals.push({
            start,
            end,
            label: date.toLocaleDateString('en-US', { month: 'short' })
          });
        }
        break;
      case 'YEAR':
        for (let i = 11; i >= 0; i--) {
          const end = now - (i * 30 * 24 * 60 * 60 * 1000);
          const start = end - (30 * 24 * 60 * 60 * 1000);
          const date = new Date(start);
          intervals.push({
            start,
            end,
            label: date.toLocaleDateString('en-US', { month: 'short' })
          });
        }
        break;
    }

    return intervals;
  }

  private generateCashFlowForecast(days: number = 30): ForecastData[] {
    const forecast: ForecastData[] = [];
    const now = Date.now();
    const dailyAverage = this.calculateDailyAverage();

    let runningBalance = this.transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
      }, 0);

    for (let i = 1; i <= days; i++) {
      const date = now + (i * 24 * 60 * 60 * 1000);
      runningBalance += dailyAverage.income - dailyAverage.expenses;
      
      forecast.push({
        date,
        projected: runningBalance
      });
    }

    return forecast;
  }

  private calculateDailyAverage(): { income: number; expenses: number } {
    if (this.transactions.length === 0) {
      return { income: 0, expenses: 0 };
    }

    const dates = this.transactions.map(t => t.date);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const days = Math.max(1, Math.ceil((maxDate - minDate) / (24 * 60 * 60 * 1000)));

    const totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income: totalIncome / days,
      expenses: totalExpenses / days
    };
  }

  calculateGrowthRate(period: Period): number {
    const now = Date.now();
    const currentPeriodStart = this.getPeriodDates(period, now).startDate;
    const previousPeriodStart = currentPeriodStart - (currentPeriodStart - now);

    const currentTransactions = this.transactions.filter(
      t => t.date >= currentPeriodStart && t.date <= now
    );

    const previousTransactions = this.transactions.filter(
      t => t.date >= previousPeriodStart && t.date < currentPeriodStart
    );

    const currentNet = currentTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
      }, 0);

    const previousNet = previousTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
      }, 0);

    if (previousNet === 0) return currentNet > 0 ? 100 : 0;
    
    return ((currentNet - previousNet) / Math.abs(previousNet)) * 100;
  }

  getFinancialHealthScore(): number {
    const metrics = this.getDashboardMetrics();
    
    let score = 50;

    // Positive balance
    if (metrics.currentBalance > 0) {
      score += 20;
    }

    // Income exceeds expenses
    if (metrics.monthlyIncome > metrics.monthlyExpenses) {
      score += 20;
    }

    // No overdue debts
    if (metrics.overdueDebts === 0) {
      score += 10;
    }

    // Diversified income (simplified check)
    const incomeCategories = new Set(
      this.transactions
        .filter(t => t.type === 'income')
        .map(t => t.category)
    ).size;
    
    if (incomeCategories >= 3) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }
}

export default AnalyticsService;
