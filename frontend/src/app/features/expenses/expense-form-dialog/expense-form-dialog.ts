import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ExpenseService } from '../../../core/services/expense.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './expense-form-dialog.html',
  styleUrl: './expense-form-dialog.scss'
})
export class ExpenseFormDialog implements OnInit {
  expenseForm: FormGroup;
  isEditMode = false;
  categories$: Observable<Category[]>;

  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private categoryService = inject(CategoryService);

  constructor(
    public dialogRef: MatDialogRef<ExpenseFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { expenseId?: number }
  ) {
    this.isEditMode = !!data?.expenseId;
    this.categories$ = this.categoryService.getCategories();
    
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      description: ['', Validators.maxLength(255)],
      receiptUrl: ['']
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.expenseService.getExpense(this.data.expenseId!).subscribe(expense => {
        this.expenseForm.patchValue({
          amount: expense.amount,
          categoryId: expense.categoryId,
          date: expense.expenseDate,
          description: expense.description,
          receiptUrl: expense.receiptUrl
        });
      });
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      
      const request$ = this.isEditMode
        ? this.expenseService.updateExpense(this.data.expenseId!, formValue)
        : this.expenseService.createExpense(formValue);
        
      request$.subscribe({
        next: (expense) => this.dialogRef.close(expense),
        error: (err) => console.error('Failed to save expense', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
