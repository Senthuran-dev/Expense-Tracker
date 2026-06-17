import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoryBreakdown {
  categoryName: string;
  categoryColor: string;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  total: number;
}

export interface DailyTrend {
  date: string;
  total: number;
}

export interface YearlySummary {
  ytdTotal: number;
  largestMonth: string;
  largestMonthTotal: number;
  mostOverspentCategory: string;
  projectedAnnualTotal: number;
}

export interface BudgetSummary {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/analytics`;

  getCategoryBreakdown(month: number, year: number): Observable<CategoryBreakdown[]> {
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<CategoryBreakdown[]>(`${this.apiUrl}/category-breakdown`, { params });
  }

  getMonthlyTrend(year: number): Observable<MonthlyTrend[]> {
    let params = new HttpParams().set('year', year);
    return this.http.get<MonthlyTrend[]>(`${this.apiUrl}/monthly-trend`, { params });
  }

  getDailyTrend(month: number, year: number): Observable<DailyTrend[]> {
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<DailyTrend[]>(`${this.apiUrl}/daily`, { params });
  }

  getYearlySummary(): Observable<YearlySummary> {
    return this.http.get<YearlySummary>(`${this.apiUrl}/yearly-summary`);
  }
  
  getBudgetVsActual(month: number, year: number): Observable<BudgetSummary[]> {
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<BudgetSummary[]>(`${environment.apiUrl}/budgets/summary`, { params });
  }
}
