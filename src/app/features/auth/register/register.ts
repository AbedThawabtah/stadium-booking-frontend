import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorResponse } from '../../../core/models/auth.model';

// تأكيد إن كلمة المرور وتأكيدها متطابقين
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword
    ? { passwordsMismatch: true }
    : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // UI-only: two-step visual flow, password visibility and terms acceptance.
  // None of these affect form structure, validators, or the submitted payload.
  currentStep = signal<1 | 2>(1);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  termsAccepted = signal(false);

  // نفس شرط الباسورد بالضبط اللي بالباك اند: حرف كابيتال واحد على الأقل + رقم واحد على الأقل + 8 أحرف
  private passwordPattern = /^(?=.*[A-Z])(?=.*\d).+$/;

  form = this.fb.group(
    {
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.passwordPattern)
      ]],
      confirmPassword: ['', [Validators.required]],
      role: ['CUSTOMER', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  selectRole(role: 'CUSTOMER' | 'STADIUM_OWNER'): void {
    this.form.controls.role.setValue(role);
  }

  goToStep(step: 1 | 2): void {
    this.currentStep.set(step);
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { confirmPassword, ...payload } = this.form.getRawValue();

    this.authService.register(payload as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/stadiums']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const body = err.error as ErrorResponse;

        if (body?.validationErrors) {
          const firstError = Object.values(body.validationErrors)[0];
          this.errorMessage.set(firstError ?? 'بيانات غير صحيحة');
        } else {
          this.errorMessage.set(body?.message ?? 'حدث خطأ أثناء إنشاء الحساب');
        }
      }
    });
  }
}