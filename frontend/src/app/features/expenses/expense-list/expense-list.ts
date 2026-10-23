import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExpenseService, Expense, Page } from '../../../core/services/expense.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseFormDialog } from '../expense-form-dialog/expense-form-dialog';
import { ExportDialog } from '../export-dialog/export-dialog';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.scss'
})
export class ExpenseList implements OnInit {
  private expenseService = inject(ExpenseService);
  private analyticsService = inject(AnalyticsService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  
  expensesPage$: Observable<Page<Expense>> | null = null;
  categories$: Observable<Category[]> = this.categoryService.getCategories();
  selectedCategoryId: number | null = null;
  currentMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  page = 0;
  size = 10;

  searchTerm: string = '';
  
  // Selection
  selectedIds = new Set<number>();
  currentItems: Expense[] = [];

  // Summaries
  totalSpent = 0;
  totalExpensesCount = 0;
  avgPerDay = 0;
  
  ngOnInit(): void {
    this.loadExpenses();
    this.loadSummaries();
  }
  
  loadExpenses(): void {
    const filters: any = { page: this.page, size: this.size };
    if (this.searchTerm) {
      filters['search'] = this.searchTerm;
    }
    if (this.selectedCategoryId) {
      filters['categoryId'] = this.selectedCategoryId;
    }
    
    this.expensesPage$ = this.expenseService.getExpenses(filters).pipe(
      tap(page => {
        this.currentItems = page.content;
        this.totalExpensesCount = page.totalElements;
        // Verify selection
        this.selectedIds.forEach(id => {
          if (!this.currentItems.find(e => e.id === id)) {
            this.selectedIds.delete(id);
          }
        });
      }),
      catchError(err => {
        console.error('Failed to load expenses:', err);
        return of({ content: [], totalElements: 0, totalPages: 0, size: this.size, number: this.page });
      })
    );
  }

  loadSummaries(): void {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    this.analyticsService.getCategoryBreakdown(currentMonth, currentYear).subscribe(breakdowns => {
      this.totalSpent = breakdowns.reduce((sum, b) => sum + b.total, 0);
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      this.avgPerDay = this.totalSpent / daysInMonth;
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadExpenses();
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.page = 0;
    this.loadExpenses();
  }

  loadPage(newPage: number): void {
    this.page = newPage;
    this.loadExpenses();
  }

  // Selection Logic
  toggleSelection(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  isAllSelected(): boolean {
    return this.currentItems.length > 0 && this.currentItems.every(e => this.selectedIds.has(e.id));
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectedIds.clear();
    } else {
      this.currentItems.forEach(e => this.selectedIds.add(e.id));
    }
  }

  deleteSelected(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedIds.size} expenses?`)) {
      const idsToDelete = Array.from(this.selectedIds);
      // Backend does not have batch delete, so we do it sequentially or just the first for now.
      // A better approach would be forkJoin, but let's just loop.
      idsToDelete.forEach(id => {
        this.expenseService.deleteExpense(id).subscribe({
          next: () => {
            this.selectedIds.delete(id);
            if (this.selectedIds.size === 0) {
              this.loadPage(0);
              this.loadSummaries();
            }
          }
        });
      });
    }
  }

  openDialog(expenseId?: number): void {
    const dialogRef = this.dialog.open(ExpenseFormDialog, {
      width: '520px',
      maxWidth: '100vw',
      panelClass: 'custom-dialog-container',
      data: { expenseId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadExpenses();
        this.loadSummaries();
      }
    });
  }

  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.loadPage(0);
          this.loadSummaries();
        },
        error: (err) => console.error('Error deleting expense', err)
      });
    }
  }

  openExportDialog(): void {
    this.dialog.open(ExportDialog, {
      width: '480px',
      maxWidth: '95vw',
      panelClass: 'modal-panel'
    });
  }
}
