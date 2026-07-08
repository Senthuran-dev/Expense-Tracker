import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ExpenseService } from '../../../core/services/expense.service';

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './export-dialog.html'
})
export class ExportDialog implements OnInit {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private dialogRef = inject(MatDialogRef<ExportDialog>);

  exportForm: FormGroup;
  isGenerating = false;
  successMessage: string | null = null;

  constructor() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.exportForm = this.fb.group({
      startDate: [firstDay.toISOString().substring(0, 10)],
      endDate: [today.toISOString().substring(0, 10)],
      format: ['csv', Validators.required]
    });
  }

  ngOnInit(): void {}

  setFormat(format: 'csv' | 'pdf'): void {
    this.exportForm.get('format')?.setValue(format);
  }

  onDownload(): void {
    if (this.exportForm.invalid) return;

    this.isGenerating = true;
    const { startDate, endDate, format } = this.exportForm.value;

    const request$ = format === 'csv' 
      ? this.expenseService.exportCsv(startDate, endDate)
      : this.expenseService.exportPdf(startDate, endDate);

    request$.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${startDate}-to-${endDate}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.isGenerating = false;
        this.successMessage = `expenses-${startDate}-to-${endDate}.${format} downloaded successfully`;
        
        // Auto dismiss after 3 seconds
        setTimeout(() => this.dialogRef.close(), 3000);
      },
      error: (err) => {
        console.error('Export failed', err);
        this.isGenerating = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
