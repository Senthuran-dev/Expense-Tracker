import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ExpenseService, Expense, Page } from '../../../core/services/expense.service';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseFormDialog } from '../expense-form-dialog/expense-form-dialog';
import { ExportDialog } from '../export-dialog/export-dialog';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.scss'
})
export class ExpenseList implements OnInit {
  private expenseService = inject(ExpenseService);
  private dialog = inject(MatDialog);
  
  expensesPage$: Observable<Page<Expense>> | null = null;
  page = 0;
  size = 10;
  
  ngOnInit(): void {
    this.loadExpenses();
  }
  
  loadExpenses(): void {
    this.expensesPage$ = this.expenseService.getExpenses({ page: this.page, size: this.size });
  }

  loadPage(newPage: number): void {
    this.page = newPage;
    this.loadExpenses();
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
        this.loadExpenses(); // Refresh list if a change was made
      }
    });
  }

  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => this.loadPage(0),
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
