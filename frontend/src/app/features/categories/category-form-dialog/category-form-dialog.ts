import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './category-form-dialog.html'
})
export class CategoryFormDialog implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  
  availableIcons = [
    'restaurant', 'directions_car', 'home', 'bolt', 'movie', 
    'favorite', 'shopping_bag', 'school', 'flight_takeoff',
    'fitness_center', 'local_cafe', 'pets', 'work', 'devices',
    'face', 'redeem', 'local_gas_station', 'local_grocery_store'
  ];
  
  availableColors = [
    '#00897B', '#1976D2', '#1A237E', '#6A1B9A', '#AD1457', '#D32F2F',
    '#FF6F00', '#FF8F00', '#FBC02D', '#388E3C', '#AFB42B', '#616161'
  ];

  constructor(
    public dialogRef: MatDialogRef<CategoryFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { categoryId?: number }
  ) {
    this.isEditMode = !!data?.categoryId;
    
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      icon: ['local_cafe', Validators.required],
      color: ['#000000', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.categoryService.getCategory(this.data.categoryId!).subscribe(category => {
        this.categoryForm.patchValue({
          name: category.name,
          icon: category.icon,
          color: category.color
        });
      });
    }
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      
      const request$ = this.isEditMode
        ? this.categoryService.updateCategory(this.data.categoryId!, formValue)
        : this.categoryService.createCategory(formValue);
        
      request$.subscribe({
        next: (category) => this.dialogRef.close(category),
        error: (err) => console.error('Failed to save category', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  
  selectIcon(icon: string): void {
    this.categoryForm.get('icon')?.setValue(icon);
  }

  selectColor(color: string): void {
    this.categoryForm.get('color')?.setValue(color);
  }
}
