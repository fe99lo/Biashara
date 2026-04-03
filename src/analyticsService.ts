import { FinancialReport, DashboardMetrics, Transaction, CategoryBreakdown, TrendData, ForecastData, Period, CurrencyCode, CurrencyExposure } from './types';

// Constants for performance
const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_MONTH = 30 * MS_PER_DAY;
const MS_PER_QUARTER = 90 * MS_PER_DAY;
const MS_PER_YEAR = 365 * MS_PER_DAY;

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
    
    // Single pass filtering and calculation
    const filteredTransactions = this.transactions.filter(
      t => t.date >= startDate && t.date <= endDate && t.status === 'completed'
    );

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = new Map<string, { amount: number; count: number }>();

    for (const t of filteredTransactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpenses += t.amount;
      }

      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      existing.amount += t.amount;
      existing.count++;
      categoryMap.set(t.category, existing);
    }

    const netBalance = totalIncome - totalExpenses;
    const breakdownByCategory = this.buildCategoryBreakdown(categoryMap);
    const trends = this.calculateTrends(filteredTransactions, period);

    return {
      period,
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netBalance,
      currency: currency as CurrencyCode,
      breakdownByCategory,
      trends,
      generatedAt: now
    };
  }

  getDashboardMetrics(): DashboardMetrics {
    const now = Date.now();
    const thirtyDaysAgo = now - MS_PER_MONTH;

    // Single pass for recent transactions and metrics
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let currentBalance = 0;
    const categoryMap = new Map<string, { amount: number; count: number }>();
    const recentTransactions: Transaction[] = [];

    for (const t of this.transactions) {
      if (t.status === 'completed') {
        if (t.type === 'income') {
          currentBalance += t.amount;
          if (t.date >= thirtyDaysAgo) monthlyIncome += t.amount;
        } else if (t.type === 'expense') {
          currentBalance -= t.amount;
          if (t.date >= thirtyDaysAgo) {
            monthlyExpenses += t.amount;
            const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
            existing.amount += t.amount;
            existing.count++;
            categoryMap.set(t.category, existing);
          }
        }
      }

      if (t.date >= thirtyDaysAgo && recentTransactions.length < 10) {
        recentTransactions.push(t);
      }
    }

    recentTransactions.sort((a, b) => b.date - a.date);

    const topCategories = this.buildCategoryBreakdown(categoryMap)
      .filter(t => t.category !== undefined)
      .slice(0, 5);

    return {
      currentBalance,
      monthlyIncome,
      monthlyExpenses,
      pendingDebts: 0,
      overdueDebts: 0,
      topCategories,
      recentTransactions,
      cashFlowForecast: this.generateCashFlowForecast(currentBalance),
      currencyExposure: []
    };
  }

  private getPeriodDates(period: Period, now: number): { startDate: number; endDate: number } {
    switch (period) {
      case 'WEEK': return { startDate: now - MS_PER_WEEK, endDate: now };
      case 'MONTH': return { startDate: now - MS_PER_MONTH, endDate: now };
      case 'QUARTER': return { startDate: now - MS_PER_QUARTER, endDate: now };
      case 'YEAR': return { startDate: now - MS_PER_YEAR, endDate: now };
      default: return { startDate: 0, endDate: now };
    }
  }

  private buildCategoryBreakdown(categoryMap: Map<string, { amount: number; count: number }>): CategoryBreakdown[] {
    let total = 0;
    for (const { amount } of categoryMap.values()) total += amount;

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
    const intervals = this.getTrendIntervals(period);

    return intervals.map(interval => {
      let income = 0;
      let expenses = 0;

      for (const t of transactions) {
        if (t.date >= interval.start && t.date < interval.end) {
          if (t.type === 'income') income += t.amount;
          else if (t.type === 'expense') expenses += t.amount;
        }
      }

      return { period: interval.label, income, expenses, balance: income - expenses };
    });
  }

  private getTrendIntervals(period: Period): Array<{ start: number; end: number; label: string }> {
    const now = Date.now();
    const intervals: Array<{ start: number; end: number; label: string }> = [];

    switch (period) {
      case 'WEEK':
        for (let i = 6; i >= 0; i--) {
          const end = now - (i * MS_PER_DAY);
          intervals.push({ start: end - MS_PER_DAY, end, label: new Date(end - MS_PER_DAY).toLocaleDateString('en-US', { weekday: 'short' }) });
        }
        break;
      case 'MONTH':
        for (let i = 3; i >= 0; i--) {
          const end = now - (i * MS_PER_WEEK);
          intervals.push({ start: end - MS_PER_WEEK, end, label: `Week ${4 - i}` });
        }
        break;
      case 'QUARTER':
        for (let i = 2; i >= 0; i--) {
          const end = now - (i * MS_PER_MONTH);
          intervals.push({ start: end - MS_PER_MONTH, end, label: new Date(end - MS_PER_MONTH).toLocaleDateString('en-US', { month: 'short' }) });
        }
        break;
      case 'YEAR':
        for (let i = 11; i >= 0; i--) {
          const end = now - (i * MS_PER_MONTH);
          intervals.push({ start: end - MS_PER_MONTH, end, label: new Date(end - MS_PER_MONTH).toLocaleDateString('en-US', { month: 'short' }) });
        }
        break;
    }

    return intervals;
  }

  private generateCashFlowForecast(currentBalance: number, days: number = 30): ForecastData[] {
    const forecast: ForecastData[] = [];
    const now = Date.now();
    const dailyAvg = this.calculateDailyAverage();
    let runningBalance = currentBalance;

    for (let i = 1; i <= days; i++) {
      runningBalance += dailyAvg.income - dailyAvg.expenses;
      forecast.push({ date: now + (i * MS_PER_DAY), projected: runningBalance });
    }

    return forecast;
  }

  private calculateDailyAverage(): { income: number; expenses: number } {
    if (this.transactions.length === 0) return { income: 0, expenses: 0 };

    let totalIncome = 0;
    let totalExpenses = 0;
    let minDate = Infinity;
    let maxDate = 0;

    for (const t of this.transactions) {
      if (t.type === 'income') totalIncome += t.amount;
      else if (t.type === 'expense') totalExpenses += t.amount;
      if (t.date < minDate) minDate = t.date;
      if (t.date > maxDate) maxDate = t.date;
    }

    const days = Math.max(1, Math.ceil((maxDate - minDate) / MS_PER_DAY));
    return { income: totalIncome / days, expenses: totalExpenses / days };
  }

  calculateGrowthRate(period: Period): number {
    const now = Date.now();
    const currentPeriodStart = this.getPeriodDates(period, now).startDate;
    const previousPeriodStart = currentPeriodStart - (currentPeriodStart - now);

    let currentNet = 0;
    let previousNet = 0;

    for (const t of this.transactions) {
      if (t.status !== 'completed') continue;
      
      const amount = t.type === 'income' ? t.amount : -t.amount;
      
      if (t.date >= currentPeriodStart && t.date <= now) {
        currentNet += amount;
      } else if (t.date >= previousPeriodStart && t.date < currentPeriodStart) {
        previousNet += amount;
      }
    }

    if (previousNet === 0) return currentNet > 0 ? 100 : 0;
    return ((currentNet - previousNet) / Math.abs(previousNet)) * 100;
  }

  getFinancialHealthScore(): number {
    const metrics = this.getDashboardMetrics();
    let score = 50;

    if (metrics.currentBalance > 0) score += 20;
    if (metrics.monthlyIncome > metrics.monthlyExpenses) score += 20;
    if (metrics.overdueDebts === 0) score += 10;

    const incomeCategories = new Set(
      this.transactions.filter(t => t.type === 'income').map(t => t.category)
    ).size;
    
    if (incomeCategories >= 3) score += 10;

    return Math.min(100, Math.max(0, score));
  }
}

export default AnalyticsService;
