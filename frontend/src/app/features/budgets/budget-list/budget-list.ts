import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService, Budget } from '../../../core/services/budget.service';
import { Observable } from 'rxjs';
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
export class BudgetList implements OnInit {
  private budgetService = inject(BudgetService);
  
  budgets$: Observable<Budget[]> | null = null;
  
  currentMonth = new Date().getMonth() + 1; // 1-12
  currentYear = new Date().getFullYear();

  totalBudgeted = 0;
  totalSpent = 0;
  totalPercentage = 0;
  categoriesBudgeted = 0;

  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.budgets$ = this.budgetService.getBudgetSummary(this.currentMonth, this.currentYear).pipe(
      tap(budgets => {
        this.categoriesBudgeted = budgets.length;
        this.totalBudgeted = budgets.reduce((sum, b) => sum + (b.budgetAmount || 0), 0);
        this.totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
        this.totalPercentage = this.totalBudgeted > 0 ? (this.totalSpent / this.totalBudgeted) * 100 : 0;
      })
    );
  }

  openBudgetDialog(): void {
    const dialogRef = this.dialog.open(BudgetFormDialog, {
      width: '460px',
      maxWidth: '95vw',
      panelClass: 'modal-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBudgets();
      }
    });
  }
}
