import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorResponse } from '../../../core/models/auth.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // UI-only: password visibility toggle, does not affect form value or validation.
  hidePassword = signal(true);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  togglePasswordVisibility(): void {
    this.hidePassword.update(v => !v);
  }

  onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading.set(true);
  this.errorMessage.set(null);

  this.authService.login(this.form.getRawValue() as { email: string; password: string }).subscribe({
//=====================================================
// NEEDS TO BE FIXED ===================================
//=====================================================
    next: () => {
      this.loading.set(false);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/stadiums';
      this.router.navigateByUrl(returnUrl);
    },
//======================================================
//======================================================
//=====================================================    
    error: (err: HttpErrorResponse) => {
      this.loading.set(false);
      const body = err.error as ErrorResponse;
      this.errorMessage.set(body?.message ?? 'Login failed. Please try again.');
    }
  });
}
}