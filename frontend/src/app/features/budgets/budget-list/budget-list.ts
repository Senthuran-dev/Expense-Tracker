import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService, Budget } from '../../../core/services/budget.service';
import { DateFilterService } from '../../../core/services/date-filter.service';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BudgetFormDialog } from '../budget-form-dialog/budget-form-dialog';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './budget-list.html',
  styleUrl: './budget-list.scss'
})
export class BudgetList implements OnInit, OnDestroy {
  public dateFilterService = inject(DateFilterService);
  private budgetService = inject(BudgetService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  
  budgets$: Observable<Budget[]> | null = null;
  
  currentMonth = this.dateFilterService.currentMonth;
  currentYear = this.dateFilterService.currentYear;
  currentMonthName = this.dateFilterService.monthName;

  totalBudgeted = 0;
  totalSpent = 0;
  totalPercentage = 0;
  categoriesBudgeted = 0;

  private dateSub?: Subscription;

  ngOnInit(): void {
    this.dateSub = this.dateFilterService.selectedDate$.subscribe(({ month, year }) => {
      this.currentMonth = month;
      this.currentYear = year;
      this.currentMonthName = this.dateFilterService.monthName;
      this.loadBudgets(month, year);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.dateSub?.unsubscribe();
  }

  loadBudgets(month: number = this.currentMonth, year: number = this.currentYear): void {
    this.budgets$ = this.budgetService.getBudgetSummary(month, year).pipe(
      tap(budgets => {
        this.categoriesBudgeted = budgets.length;
        this.totalBudgeted = budgets.reduce((sum, b) => sum + (b.budgetAmount || 0), 0);
        this.totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
        this.totalPercentage = this.totalBudgeted > 0 ? (this.totalSpent / this.totalBudgeted) * 100 : 0;
        this.cdr.markForCheck();
      })
    );
  }

  openBudgetDialog(): void {
    const dialogRef = this.dialog.open(BudgetFormDialog, {
      width: '460px',
      maxWidth: '95vw',
      panelClass: 'modal-panel',
      data: {
        month: this.currentMonth,
        year: this.currentYear
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBudgets(this.currentMonth, this.currentYear);
      }
    });
  }
}
