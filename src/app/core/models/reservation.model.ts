export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: number;
  customerId: number;
  customerName: string;
  stadiumId: number;
  stadiumName: string;
  timeSlotId: number;
  status: ReservationStatus;
  totalPrice: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
}

export interface ReservationRequest {
  timeSlotId: number;
}