import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CategoryFormDialog } from '../category-form-dialog/category-form-dialog';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryList implements OnInit {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);

  systemCategories$: Observable<Category[]> | null = null;
  customCategories$: Observable<Category[]> | null = null;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    const allCategories$ = this.categoryService.getCategories();
    this.systemCategories$ = allCategories$.pipe(
      map(categories => categories.filter(c => !!(c.isDefault || c.default)))
    );
    this.customCategories$ = allCategories$.pipe(
      map(categories => categories.filter(c => !(c.isDefault || c.default)))
    );
  }

  openDialog(categoryId?: number): void {
    const dialogRef = this.dialog.open(CategoryFormDialog, {
      width: '500px',
      maxWidth: '100vw',
      panelClass: 'custom-dialog-container',
      data: { categoryId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this custom category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
}
