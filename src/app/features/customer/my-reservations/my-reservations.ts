import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';
import { ErrorResponse } from '../../../core/models/auth.model';

type FilterTab = 'ALL' | ReservationStatus;

// أسماء عربية ثابتة لعرض التاريخ داخل بطاقة الحجز — لا تعتمد على locale المتصفح
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];
const WEEKDAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss'
})
export class MyReservationsComponent implements OnInit {

  private reservationService = inject(ReservationService);

  reservations = signal<Reservation[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  activeTab = signal<FilterTab>('ALL');

  cancellingId = signal<number | null>(null);
  cancelReason = signal('');
  cancelError = signal<string | null>(null);
  cancelSubmitting = signal(false);

  filteredReservations = computed(() => {
    const tab = this.activeTab();
    const all = this.reservations();
    if (tab === 'ALL') return all;
    return all.filter(r => r.status === tab);
  });

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading.set(true);
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        // الأحدث أولاً
        const sorted = [...data].sort((a, b) =>
          new Date(b.reservationDate + 'T' + b.startTime).getTime() -
          new Date(a.reservationDate + 'T' + a.startTime).getTime()
        );
        this.reservations.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('تعذر تحميل حجوزاتك. حاول مرة أخرى.');
        this.loading.set(false);
      }
    });
  }

  setTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  // هل الموعد لسا قدام بساعتين على الأقل — تلميح واجهة فقط، القرار الفعلي عند الباك اند
  isCancellable(reservation: Reservation): boolean {
    if (reservation.status !== 'CONFIRMED') return false;
    const slotStart = new Date(`${reservation.reservationDate}T${reservation.startTime}`);
    const now = new Date();
    const diffMs = slotStart.getTime() - now.getTime();
    return diffMs >= 2 * 60 * 60 * 1000;
  }

  openCancelForm(reservationId: number): void {
    this.cancellingId.set(reservationId);
    this.cancelReason.set('');
    this.cancelError.set(null);
  }

  closeCancelForm(): void {
    this.cancellingId.set(null);
    this.cancelReason.set('');
    this.cancelError.set(null);
  }

  confirmCancel(reservationId: number): void {
    this.cancelSubmitting.set(true);
    this.cancelError.set(null);

    this.reservationService.cancel(reservationId, this.cancelReason() || undefined).subscribe({
      next: (updated) => {
        this.cancelSubmitting.set(false);
        this.reservations.update(list =>
          list.map(r => (r.id === updated.id ? updated : r))
        );
        this.closeCancelForm();
      },
      error: (err: HttpErrorResponse) => {
        this.cancelSubmitting.set(false);
        const body = err.error as ErrorResponse;
        this.cancelError.set(
          body?.message ?? 'تعذر إلغاء الحجز. قد يكون الموعد على وشك البدء (أقل من ساعتين).'
        );
      }
    });
  }

  statusLabel(status: ReservationStatus): string {
    switch (status) {
      case 'CONFIRMED': return 'مؤكد';
      case 'CANCELLED': return 'ملغى';
      case 'COMPLETED': return 'مكتمل';
    }
  }

  // ---------------------------------------------------------------------
  // UI-only derived views for the elevated presentation below. Pure reads
  // over the signals/computed above — no new data fetching, and nothing
  // above this point was changed.
  // ---------------------------------------------------------------------

  private isUpcoming(reservation: Reservation): boolean {
    const slotStart = new Date(`${reservation.reservationDate}T${reservation.startTime}`);
    return slotStart.getTime() > Date.now();
  }

  // حجوزات مؤكدة وقادمة — تُعرض تحت قسم "القادمة"
  upcomingReservations = computed(() =>
    this.filteredReservations().filter(r => r.status === 'CONFIRMED' && this.isUpcoming(r))
  );

  // كل شيء آخر ضمن التبويب الحالي (مكتملة/ملغاة/أو مؤكدة فات وقتها) — قسم "السابقة"
  pastReservations = computed(() =>
    this.filteredReservations().filter(r => !(r.status === 'CONFIRMED' && this.isUpcoming(r)))
  );

  // عدد الحجوزات لكل تبويب، بغض النظر عن التبويب النشط حاليًا
  tabCounts = computed(() => {
    const all = this.reservations();
    return {
      ALL: all.length,
      CONFIRMED: all.filter(r => r.status === 'CONFIRMED').length,
      COMPLETED: all.filter(r => r.status === 'COMPLETED').length,
      CANCELLED: all.filter(r => r.status === 'CANCELLED').length
    };
  });

  // نص الحالة الفارغة يتغيّر حسب التبويب النشط
  emptyStateCopy = computed(() => {
    switch (this.activeTab()) {
      case 'CONFIRMED':
        return { icon: '🗓️', title: 'لا توجد حجوزات مؤكدة حاليًا', text: 'احجز ملعبك القادم وستظهر تفاصيله هنا.' };
      case 'COMPLETED':
        return { icon: '✅', title: 'لا توجد حجوزات مكتملة بعد', text: 'الحجوزات التي تنتهي مواعيدها ستظهر هنا.' };
      case 'CANCELLED':
        return { icon: '🎉', title: 'لا توجد حجوزات ملغاة — رائع!', text: 'كل حجوزاتك سارية أو مكتملة دون أي إلغاء.' };
      default:
        return { icon: '📅', title: 'لا توجد حجوزات هنا', text: 'لم تقم بأي حجز بعد. تصفّح الملاعب وابدأ أول حجز لك.' };
    }
  });

  dateChipDay(reservation: Reservation): string {
    return String(new Date(`${reservation.reservationDate}T00:00:00`).getDate());
  }

  dateChipMonth(reservation: Reservation): string {
    return MONTHS_AR[new Date(`${reservation.reservationDate}T00:00:00`).getMonth()];
  }

  dateChipWeekday(reservation: Reservation): string {
    return WEEKDAYS_AR[new Date(`${reservation.reservationDate}T00:00:00`).getDay()];
  }

  // "اليوم" / "غدًا" / "بعد N أيام" — للحجوزات المؤكدة القادمة فقط
  relativeDayLabel(reservation: Reservation): string {
    if (reservation.status !== 'CONFIRMED' || !this.isUpcoming(reservation)) return '';
    const slotDay = new Date(`${reservation.reservationDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((slotDay.getTime() - today.getTime()) / 86400000);
    if (diffDays <= 0) return 'اليوم';
    if (diffDays === 1) return 'غدًا';
    if (diffDays === 2) return 'بعد يومين';
    return `بعد ${diffDays} أيام`;
  }

  // يعكس نفس نافذة الساعتين في isCancellable() — لعرض تلميح بصري فقط، لا قرار جديد
  cancelWindowStatus(reservation: Reservation): 'open' | 'closing' | null {
    if (reservation.status !== 'CONFIRMED' || !this.isUpcoming(reservation)) return null;
    return this.isCancellable(reservation) ? 'open' : 'closing';
  }
}