import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';
import { ErrorResponse } from '../../../core/models/auth.model';

type FilterTab = 'ALL' | ReservationStatus;

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
}