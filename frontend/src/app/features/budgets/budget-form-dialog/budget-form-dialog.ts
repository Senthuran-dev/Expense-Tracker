import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-budget-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './budget-form-dialog.html'
})
export class BudgetFormDialog implements OnInit {
  private fb = inject(FormBuilder);
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);
  private dialogRef = inject(MatDialogRef<BudgetFormDialog>);

  budgetForm: FormGroup;
  categories$: Observable<Category[]> | null = null;
  
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  years = [this.currentYear, this.currentYear + 1, this.currentYear + 2];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.budgetForm = this.fb.group({
      categoryId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      month: [this.currentMonth, Validators.required],
      year: [this.currentYear, Validators.required]
    });
  }

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  onSubmit(): void {
    if (this.budgetForm.valid) {
      this.budgetService.upsertBudget(this.budgetForm.value).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error saving budget', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
