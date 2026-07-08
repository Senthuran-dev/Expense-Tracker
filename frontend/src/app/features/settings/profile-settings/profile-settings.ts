import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-settings.html'
})
export class ProfileSettings implements OnInit {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);

  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isEditingProfile = false;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({ name: user.name });
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.isEditingProfile) {
      this.authService.updateProfile(this.profileForm.value.name).subscribe({
        next: (user) => {
          this.successMessage = 'Profile updated successfully.';
          this.isEditingProfile = false;
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to update profile.';
          setTimeout(() => this.errorMessage = null, 3000);
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.authService.changePassword(this.passwordForm.value).subscribe({
        next: () => {
          this.successMessage = 'Password changed successfully.';
          this.passwordForm.reset();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to change password.';
          setTimeout(() => this.errorMessage = null, 3000);
        }
      });
    }
  }
}
