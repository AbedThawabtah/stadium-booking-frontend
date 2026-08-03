export type StadiumStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';

export interface Stadium {
  id: number;
  name: string;
  description: string;
  location: string;
  city: string;
  sportType: string;
  capacity: number;
  pricePerHour: number;
  contactInfo: string;
  status: StadiumStatus;
  averageRating: number | null;
  totalReviews: number;
  createdAt: string;
  ownerId: number;
  ownerName: string;
}

// شكل الرد الافتراضي لـ Page<> بـ Spring Boot 3.3+/4.x
export interface PageMeta {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: PageMeta;
}

export interface StadiumSearchParams {
  keyword?: string;
  city?: string;
  sportType?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string; // yyyy-MM-dd
  page?: number;
  size?: number;
  sort?: string; // مثلاً 'pricePerHour,asc'
}

export interface MyStadium {
  id: number;
  name: string;
  city: string;
  sportType: string;
  pricePerHour: number;
  status: StadiumStatus;
  averageRating: number | null;
  totalReviews: number;
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  completedReservations: number;
}

export interface StadiumRequest {
  name: string;
  description: string;
  location: string;
  city: string;
  sportType: string;
  capacity: number;
  pricePerHour: number;
  contactInfo: string;
}