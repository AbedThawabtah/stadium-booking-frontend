import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { StadiumService } from '../../../core/services/stadium.service';
import { StadiumImageService } from '../../../core/services/stadium-image.service';
import { TimeSlotService } from '../../../core/services/time-slot.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ReservationService } from '../../../core/services/reservation.service';
import { ErrorResponse } from '../../../core/models/auth.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Stadium } from '../../../core/models/stadium.model';
import { StadiumImage } from '../../../core/models/stadium-image.model';
import { WorkingHour } from '../../../core/models/working-hour.model';
import { TimeSlot } from '../../../core/models/time-slot.model';
import { Review } from '../../../core/models/review.model';
import { WorkingHourService } from '../../../core/services/working-hour.service';
import { ReviewService } from '../../../core/services/review.service';

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'الاثنين',
  TUESDAY: 'الثلاثاء',
  WEDNESDAY: 'الأربعاء',
  THURSDAY: 'الخميس',
  FRIDAY: 'الجمعة',
  SATURDAY: 'السبت',
  SUNDAY: 'الأحد'
};

@Component({
  selector: 'app-stadium-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stadium-detail.html',
  styleUrl: './stadium-detail.scss'
})
export class StadiumDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stadiumService = inject(StadiumService);
  private imageService = inject(StadiumImageService);
  private workingHourService = inject(WorkingHourService);
  private timeSlotService = inject(TimeSlotService);
  private reviewService = inject(ReviewService);
  private reservationService = inject(ReservationService);
  authService = inject(AuthService);

  stadiumId = signal<number>(0);
  stadium = signal<Stadium | null>(null);
  images = signal<StadiumImage[]>([]);
  workingHours = signal<WorkingHour[]>([]);
  reviews = signal<Review[]>([]);
  bookingLoading = signal(false);
  bookingError = signal<string | null>(null);
  bookingSuccess = signal(false);

  loading = signal(true);
  notFound = signal(false);

  selectedDate = signal<string>(this.todayIso());
  minDate = this.todayIso();

  slots = signal<TimeSlot[]>([]);
  slotsLoading = signal(false);
  selectedSlot = signal<TimeSlot | null>(null);

  activeImageIndex = signal(0);

  primaryImage = computed(() => {
    const imgs = this.images();
    if (imgs.length === 0) return null;
    return imgs[this.activeImageIndex()];
  });

  averageRatingRounded = computed(() => {
    const s = this.stadium();
    return s?.averageRating ? Math.round(s.averageRating * 10) / 10 : 0;
  });

  dayLabels = DAY_LABELS;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.stadiumId.set(id);
    this.loadStadiumData(id);
  }

  private loadStadiumData(id: number): void {
    this.loading.set(true);

    forkJoin({
      stadium: this.stadiumService.getById(id),
      images: this.imageService.getImages(id),
      workingHours: this.workingHourService.getWorkingHours(id),
      reviews: this.reviewService.getStadiumReviews(id)
    }).subscribe({
      next: (result) => {
        this.stadium.set(result.stadium);
        this.images.set(result.images);
        this.workingHours.set(result.workingHours);
        this.reviews.set(result.reviews);
        this.loading.set(false);
        this.loadSlots();
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }

  onDateChange(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.selectedDate.set(value);
  this.selectedSlot.set(null);
  this.bookingSuccess.set(false);
  this.bookingError.set(null);
  this.loadSlots();
}

  private loadSlots(): void {
    this.slotsLoading.set(true);
    this.timeSlotService.getAvailableSlots(this.stadiumId(), this.selectedDate()).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.slotsLoading.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.slotsLoading.set(false);
      }
    });
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.status !== 'AVAILABLE') return;
    this.selectedSlot.set(slot);
  }

  selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  proceedToBooking(): void {
  const slot = this.selectedSlot();
  if (!slot) return;

  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
    return;
  }

  this.bookingLoading.set(true);
  this.bookingError.set(null);

  this.reservationService.create({ timeSlotId: slot.id }).subscribe({
    next: () => {
      this.bookingLoading.set(false);
      this.bookingSuccess.set(true);
      this.selectedSlot.set(null);
      // نحدّث قائمة السلوتات حتى يختفي السلوت اللي انحجز للتو
      this.loadSlotsQuietly();
    },
    error: (err: HttpErrorResponse) => {
      this.bookingLoading.set(false);
      const body = err.error as ErrorResponse;

      if (err.status === 409) {
        this.bookingError.set('عذرًا، تم حجز هذا الموعد للتو من مستخدم آخر. الرجاء اختيار موعد مختلف.');
        this.selectedSlot.set(null);
        this.loadSlotsQuietly();
      } else {
        this.bookingError.set(body?.message ?? 'تعذر إتمام الحجز. حاول مرة أخرى.');
      }
    }
  });
}

private loadSlotsQuietly(): void {
  this.timeSlotService.getAvailableSlots(this.stadiumId(), this.selectedDate()).subscribe({
    next: (slots) => this.slots.set(slots),
    error: () => {}
  });
}

  private todayIso(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}