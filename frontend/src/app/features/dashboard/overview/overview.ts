import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, BudgetSummary, CategoryBreakdown } from '../../../core/services/analytics.service';
import { ExpenseService, Expense } from '../../../core/services/expense.service';
import { DateFilterService } from '../../../core/services/date-filter.service';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview implements OnInit, OnDestroy {
  public dateFilterService = inject(DateFilterService);
  private analyticsService = inject(AnalyticsService);
  private expenseService = inject(ExpenseService);
  private cdr = inject(ChangeDetectorRef);

  totalSpent$!: Observable<number>;
  totalBudget$!: Observable<number>;
  transactionsCount$!: Observable<number>;
  recentTransactions$!: Observable<Expense[]>;
  budgetVsActual$!: Observable<BudgetSummary[]>;
  categoryBreakdown$!: Observable<CategoryBreakdown[]>;

  currentMonth = this.dateFilterService.currentMonth;
  currentYear = this.dateFilterService.currentYear;
  currentMonthName = this.dateFilterService.monthName;

  private dateSub?: Subscription;

  ngOnInit(): void {
    this.dateSub = this.dateFilterService.selectedDate$.subscribe(({ month, year }) => {
      this.currentMonth = month;
      this.currentYear = year;
      this.currentMonthName = this.dateFilterService.monthName;
      this.loadDashboardData(month, year);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.dateSub?.unsubscribe();
  }

  loadDashboardData(month: number, year: number): void {
    // Total spent from category breakdown
    this.categoryBreakdown$ = this.analyticsService.getCategoryBreakdown(month, year);
    this.totalSpent$ = this.categoryBreakdown$.pipe(
      map(breakdowns => breakdowns.reduce((sum, b) => sum + b.total, 0))
    );

    // Filter transactions for the selected month
    const startDate = this.dateFilterService.getStartDateString(month, year);
    const endDate = this.dateFilterService.getEndDateString(month, year);
    const expenses$ = this.expenseService.getExpenses({ startDate, endDate, size: 5, page: 0 });
    this.transactionsCount$ = expenses$.pipe(map(page => page.totalElements));
    this.recentTransactions$ = expenses$.pipe(map(page => page.content));

    // Budget vs Actual
    this.budgetVsActual$ = this.analyticsService.getBudgetVsActual(month, year);
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
