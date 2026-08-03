import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StadiumService } from '../../../core/services/stadium.service';
import { WorkingHourService } from '../../../core/services/working-hour.service';
import { TimeSlotService } from '../../../core/services/time-slot.service';
import { StadiumImageService } from '../../../core/services/stadium-image.service';
import { Stadium } from '../../../core/models/stadium.model';
import { WorkingHour, DayOfWeek } from '../../../core/models/working-hour.model';
import { TimeSlot } from '../../../core/models/time-slot.model';
import { StadiumImage } from '../../../core/models/stadium-image.model';
import { ErrorResponse } from '../../../core/models/auth.model';

type Tab = 'hours' | 'slots' | 'images';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'SUNDAY', label: 'الأحد' },
  { key: 'MONDAY', label: 'الاثنين' },
  { key: 'TUESDAY', label: 'الثلاثاء' },
  { key: 'WEDNESDAY', label: 'الأربعاء' },
  { key: 'THURSDAY', label: 'الخميس' },
  { key: 'FRIDAY', label: 'الجمعة' },
  { key: 'SATURDAY', label: 'السبت' }
];

@Component({
  selector: 'app-stadium-manage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './stadium-manage.html',
  styleUrl: './stadium-manage.scss'
})
export class StadiumManageComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private stadiumService = inject(StadiumService);
  private workingHourService = inject(WorkingHourService);
  private timeSlotService = inject(TimeSlotService);
  private imageService = inject(StadiumImageService);

  stadiumId = signal<number>(0);
  stadium = signal<Stadium | null>(null);
  loading = signal(true);

  activeTab = signal<Tab>('hours');
  days = DAYS;

  // ── ساعات العمل ──
  hoursForm = this.fb.group({
    hours: this.fb.array(
      DAYS.map(() => this.fb.group({
        isClosed: [false],
        openTime: ['08:00'],
        closeTime: ['22:00']
      }))
    )
  });

  hoursSaving = signal(false);
  hoursMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  get hoursArray() {
    return this.hoursForm.get('hours') as import('@angular/forms').FormArray;
  }

  // ── توليد السلوتات ──
  slotGenForm = this.fb.group({
    mode: ['single' as 'single' | 'range'],
    date: [this.todayIso()],
    startDate: [this.todayIso()],
    endDate: [this.todayIso()],
    slotDurationMinutes: [60]
  });

  generating = signal(false);
  generateMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  previewDate = signal<string>(this.todayIso());
  previewSlots = signal<TimeSlot[]>([]);
  previewLoading = signal(false);

  // ── الصور ──
  images = signal<StadiumImage[]>([]);
  imagesLoading = signal(false);
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.stadiumId.set(id);
    this.loadStadium(id);
    this.loadWorkingHours(id);
    this.loadImages(id);
    this.loadPreviewSlots();
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  private loadStadium(id: number): void {
    this.stadiumService.getById(id).subscribe({
      next: (s) => { this.stadium.set(s); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  // ── ساعات العمل ──
  private loadWorkingHours(id: number): void {
    this.workingHourService.getWorkingHours(id).subscribe({
      next: (hours) => {
        if (hours.length === 0) return; // خليها بالقيم الافتراضية
        DAYS.forEach((day, index) => {
          const existing = hours.find(h => h.dayOfWeek === day.key);
          if (existing) {
            this.hoursArray.at(index).patchValue({
              isClosed: existing.isClosed,
              openTime: existing.openTime?.substring(0, 5) ?? '08:00',
              closeTime: existing.closeTime?.substring(0, 5) ?? '22:00'
            });
          }
        });
      },
      error: () => {}
    });
  }

  saveWorkingHours(): void {
    this.hoursSaving.set(true);
    this.hoursMessage.set(null);

    const requests = DAYS.map((day, index) => {
      const value = this.hoursArray.at(index).getRawValue();
      return {
        dayOfWeek: day.key,
        isClosed: value.isClosed,
        openTime: value.isClosed ? null : value.openTime,
        closeTime: value.isClosed ? null : value.closeTime
      };
    });

    this.workingHourService.setWorkingHours(this.stadiumId(), requests).subscribe({
      next: () => {
        this.hoursSaving.set(false);
        this.hoursMessage.set({ type: 'success', text: 'تم حفظ ساعات العمل بنجاح' });
      },
      error: (err: HttpErrorResponse) => {
        this.hoursSaving.set(false);
        const body = err.error as ErrorResponse;
        this.hoursMessage.set({ type: 'error', text: body?.message ?? 'تعذر حفظ ساعات العمل' });
      }
    });
  }

  // ── توليد السلوتات ──
  generateSlots(): void {
    this.generating.set(true);
    this.generateMessage.set(null);

    const value = this.slotGenForm.getRawValue();

    const request$ = value.mode === 'single'
      ? this.timeSlotService.generate(this.stadiumId(), {
          date: value.date!,
          slotDurationMinutes: value.slotDurationMinutes!
        })
      : this.timeSlotService.generateRange(this.stadiumId(), {
          startDate: value.startDate!,
          endDate: value.endDate!,
          slotDurationMinutes: value.slotDurationMinutes!
        });

    request$.subscribe({
      next: (slots) => {
        this.generating.set(false);
        this.generateMessage.set({
          type: 'success',
          text: `تم توليد ${slots.length} موعد بنجاح`
        });
        this.loadPreviewSlots();
      },
      error: (err: HttpErrorResponse) => {
        this.generating.set(false);
        const body = err.error as ErrorResponse;

        if (err.status === 409) {
  this.generateMessage.set({
    type: 'error',
    text: 'يوجد تعارض مع مواعيد موجودة مسبقًا لنفس التاريخ'
  });
} else if (err.status === 400) {
  this.generateMessage.set({
    type: 'error',
    text: 'لا يمكن توليد مواعيد لتاريخ في الماضي أو ببيانات غير صحيحة'
  });
} else {
  this.generateMessage.set({
    type: 'error',
    text: 'تعذر توليد المواعيد. حاول مرة أخرى'
  });
}
      }
    });
  }

  onPreviewDateChange(event: Event): void {
    this.previewDate.set((event.target as HTMLInputElement).value);
    this.loadPreviewSlots();
  }

  private loadPreviewSlots(): void {
    this.previewLoading.set(true);
    this.timeSlotService.getAvailableSlots(this.stadiumId(), this.previewDate()).subscribe({
      next: (slots) => { this.previewSlots.set(slots); this.previewLoading.set(false); },
      error: () => { this.previewSlots.set([]); this.previewLoading.set(false); }
    });
  }

  // ── الصور ──
  private loadImages(id: number): void {
    this.imagesLoading.set(true);
    this.imageService.getImages(id).subscribe({
      next: (imgs) => { this.images.set(imgs); this.imagesLoading.set(false); },
      error: () => { this.imagesLoading.set(false); }
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.uploading.set(true);
    this.uploadError.set(null);

    this.imageService.uploadImages(this.stadiumId(), files).subscribe({
      next: (newImages) => {
        this.uploading.set(false);
        this.images.update(list => [...list, ...newImages]);
        input.value = '';
      },
      error: (err: HttpErrorResponse) => {
        this.uploading.set(false);
        const body = err.error as ErrorResponse;
        this.uploadError.set(body?.message ?? 'تعذر رفع الصور. تأكد أنها JPEG أو PNG أو WEBP وأقل من 5MB.');
        input.value = '';
      }
    });
  }

  setPrimary(imageId: number): void {
    this.imageService.setPrimary(this.stadiumId(), imageId).subscribe({
      next: () => {
        this.images.update(list =>
          list.map(img => ({ ...img, isPrimary: img.id === imageId }))
        );
      },
      error: () => {}
    });
  }

  deleteImage(imageId: number): void {
    this.imageService.deleteImage(this.stadiumId(), imageId).subscribe({
      next: () => {
        this.images.update(list => list.filter(img => img.id !== imageId));
      },
      error: () => {}
    });
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}