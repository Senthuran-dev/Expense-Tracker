import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, YearlySummary, CategoryBreakdown, MonthlyTrend, BudgetSummary } from '../../../core/services/analytics.service';
import { Observable } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-charts-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './charts-dashboard.html',
  styleUrl: './charts-dashboard.scss'
})
export class ChartsDashboard implements OnInit {
  private analyticsService = inject(AnalyticsService);

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

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
    this.loadData();
  }

  loadData(): void {
    this.yearlySummary$ = this.analyticsService.getYearlySummary();
    
    this.analyticsService.getMonthlyTrend(this.currentYear).subscribe(trend => {
      this.barChartData = {
        labels: trend.map(t => this.getMonthName(t.month)),
        datasets: [{
          data: trend.map(t => t.total),
          backgroundColor: '#00897B',
          borderRadius: 4
        }]
      };
    });

    this.analyticsService.getDailyTrend(this.currentMonth, this.currentYear).subscribe(trend => {
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
    });

    this.categoryBreakdown$ = this.analyticsService.getCategoryBreakdown(this.currentMonth, this.currentYear);
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
    });

    this.budgetVsActual$ = this.analyticsService.getBudgetVsActual(this.currentMonth, this.currentYear);
  }

  private getMonthName(month: number): string {
    const names = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return names[month - 1] || '';
  }
}
