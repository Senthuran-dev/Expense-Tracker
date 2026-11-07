import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { timeout } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    terms: [false, [Validators.requiredTrue]]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.cdr.markForCheck();
      
      const { name, email, password } = this.registerForm.value;
      
      this.authService.register({ name, email, password }).pipe(
        timeout(25000)
      ).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.name === 'TimeoutError') {
            this.error = 'Server took too long to respond. It may still be waking up on Render. Please try again in a moment.';
          } else if (err.status === 0) {
            this.error = 'Unable to connect to backend API. Please check your network or CORS.';
          } else {
            this.error = err.error?.message || 'Failed to register. Please try again.';
          }
          this.cdr.markForCheck();
        }
      });
    }
  }
}
