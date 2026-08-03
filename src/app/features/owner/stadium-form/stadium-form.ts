import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StadiumService } from '../../../core/services/stadium.service';
import { StadiumRequest } from '../../../core/models/stadium.model';
import { ErrorResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-stadium-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stadium-form.html',
  styleUrl: './stadium-form.scss'
})
export class StadiumFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private stadiumService = inject(StadiumService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  stadiumId = signal<number | null>(null);
  isEditMode = signal(false);

  loading = signal(false);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    location: ['', [Validators.required]],
    city: ['', [Validators.required]],
    sportType: ['', [Validators.required]],
    capacity: [null as number | null, [Validators.required, Validators.min(1)]],
    pricePerHour: [null as number | null, [Validators.required, Validators.min(0.01)]],
    contactInfo: ['']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.stadiumId.set(id);
      this.isEditMode.set(true);
      this.loadStadium(id);
    }
  }

  private loadStadium(id: number): void {
    this.loading.set(true);
    this.stadiumService.getById(id).subscribe({
      next: (stadium) => {
        this.form.patchValue({
          name: stadium.name,
          description: stadium.description,
          location: stadium.location,
          city: stadium.city,
          sportType: stadium.sportType,
          capacity: stadium.capacity,
          pricePerHour: stadium.pricePerHour,
          contactInfo: stadium.contactInfo
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('تعذر تحميل بيانات الملعب.');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const payload = this.form.getRawValue() as StadiumRequest;
    const id = this.stadiumId();

    const request$ = this.isEditMode() && id
      ? this.stadiumService.updateStadium(id, payload)
      : this.stadiumService.createStadium(payload);

    request$.subscribe({
      next: (stadium) => {
        this.submitting.set(false);
        if (this.isEditMode()) {
          this.router.navigate(['/owner/my-stadiums']);
        } else {
          // بعد إنشاء الملعب، ننتقل مباشرة لصفحة الإدارة لإضافة ساعات العمل والصور
          this.router.navigate(['/owner/stadiums', stadium.id, 'manage']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        const body = err.error as ErrorResponse;

        if (body?.validationErrors) {
          const firstError = Object.values(body.validationErrors)[0];
          this.errorMessage.set(firstError ?? 'بيانات غير صحيحة');
        } else {
          this.errorMessage.set(body?.message ?? 'تعذر حفظ بيانات الملعب.');
        }
      }
    });
  }
}