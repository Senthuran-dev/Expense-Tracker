import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, BudgetSummary, CategoryBreakdown } from '../../../core/services/analytics.service';
import { ExpenseService, Expense } from '../../../core/services/expense.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private expenseService = inject(ExpenseService);

  totalSpent$!: Observable<number>;
  totalBudget$!: Observable<number>;
  transactionsCount$!: Observable<number>;
  recentTransactions$!: Observable<Expense[]>;
  budgetVsActual$!: Observable<BudgetSummary[]>;
  categoryBreakdown$!: Observable<CategoryBreakdown[]>;

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    // Total spent from category breakdown
    this.categoryBreakdown$ = this.analyticsService.getCategoryBreakdown(this.currentMonth, this.currentYear);
    this.totalSpent$ = this.categoryBreakdown$.pipe(
      map(breakdowns => breakdowns.reduce((sum, b) => sum + b.total, 0))
    );

    // Recent transactions and count
    const expenses$ = this.expenseService.getExpenses({ size: 5, page: 0 });
    this.transactionsCount$ = expenses$.pipe(map(page => page.totalElements));
    this.recentTransactions$ = expenses$.pipe(map(page => page.content));

    // Budget vs Actual
    this.budgetVsActual$ = this.analyticsService.getBudgetVsActual(this.currentMonth, this.currentYear);
    this.totalBudget$ = this.budgetVsActual$.pipe(
      map(budgets => budgets.reduce((sum, b) => sum + b.budgetAmount, 0))
    );
  }

  getOverallPercentage(spent: number, budget: number): number {
    if (budget === 0) return 0;
    return Math.min(Math.round((spent / budget) * 100), 100);
  }

  getOverallRemaining(spent: number, budget: number): number {
    return Math.max(budget - spent, 0);
  }

  getCircumference(): number {
    return 2 * Math.PI * 15.9155; // For SVG circle
  }
}
