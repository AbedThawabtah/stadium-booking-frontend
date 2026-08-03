export type ReviewStatus = 'PENDING' | 'APPROVED' | 'DELETED';

export interface Review {
  id: number;
  customerId: number;
  customerName: string;
  stadiumId: number;
  stadiumName: string;
  reservationId: number;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}