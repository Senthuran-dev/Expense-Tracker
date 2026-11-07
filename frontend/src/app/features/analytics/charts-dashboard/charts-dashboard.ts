import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, YearlySummary, CategoryBreakdown, MonthlyTrend, BudgetSummary } from '../../../core/services/analytics.service';
import { DateFilterService } from '../../../core/services/date-filter.service';
import { Observable, Subscription } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-charts-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './charts-dashboard.html',
  styleUrl: './charts-dashboard.scss'
})
export class ChartsDashboard implements OnInit, OnDestroy {
  public dateFilterService = inject(DateFilterService);
  private analyticsService = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);

  currentMonth = this.dateFilterService.currentMonth;
  currentYear = this.dateFilterService.currentYear;
  currentMonthName = this.dateFilterService.monthName;

  private dateSub?: Subscription;

  yearlySummary$: Observable<YearlySummary> | null = null;
  categoryBreakdown$: Observable<CategoryBreakdown[]> | null = null;
  budgetVsActual$: Observable<BudgetSummary[]> | null = null;

  // Chart properties
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { grid: { display: false } }, y: { display: false } },
    plugins: { legend: { display: false } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  
  public doughnutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: { legend: { display: false } }
  };
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4 },
      point: { radius: 0 }
    },
    scales: {
      x: { display: false },
      y: { display: false, min: 0 }
    },
    plugins: { legend: { display: false } }
  };
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  
  totalSpentThisMonth = 0;

  ngOnInit(): void {
    this.yearlySummary$ = this.analyticsService.getYearlySummary();

    this.dateSub = this.dateFilterService.selectedDate$.subscribe(({ month, year }) => {
      this.currentMonth = month;
      this.currentYear = year;
      this.currentMonthName = this.dateFilterService.monthName;
      this.loadData(month, year);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.dateSub?.unsubscribe();
  }

  loadData(month: number = this.currentMonth, year: number = this.currentYear): void {
    this.analyticsService.getMonthlyTrend(year).subscribe(trend => {
      this.barChartData = {
        labels: trend.map(t => this.getMonthName(t.month)),
        datasets: [{
          data: trend.map(t => t.total),
          backgroundColor: '#00897B',
          borderRadius: 4
        }]
      };
      this.cdr.markForCheck();
    });

    this.analyticsService.getDailyTrend(month, year).subscribe(trend => {
      this.lineChartData = {
        labels: trend.map(t => t.date),
        datasets: [{
          data: trend.map(t => t.total),
          borderColor: '#00897B',
          backgroundColor: 'rgba(0, 137, 123, 0.1)',
          fill: true,
          borderWidth: 2
        }]
      };
      this.cdr.markForCheck();
    });

    this.categoryBreakdown$ = this.analyticsService.getCategoryBreakdown(month, year);
    this.categoryBreakdown$.subscribe(breakdown => {
      this.totalSpentThisMonth = breakdown.reduce((sum, b) => sum + b.total, 0);
      
      this.doughnutChartData = {
        labels: breakdown.map(b => b.categoryName),
        datasets: [{
          data: breakdown.map(b => b.total),
          backgroundColor: breakdown.map(b => b.categoryColor),
          borderWidth: 0
        }]
      };
      this.cdr.markForCheck();
    });

    this.budgetVsActual$ = this.analyticsService.getBudgetVsActual(month, year);
  }

  private getMonthName(month: number): string {
    const names = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return names[month - 1] || '';
  }
}
