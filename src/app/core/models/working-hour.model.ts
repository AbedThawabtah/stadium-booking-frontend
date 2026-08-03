export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface WorkingHour {
  id: number;
  dayOfWeek: DayOfWeek;
  openTime: string;  // "HH:mm:ss"
  closeTime: string;
  isClosed: boolean;
}

export interface WorkingHourRequest {
  dayOfWeek: DayOfWeek;
  openTime: string | null;  // "HH:mm"
  closeTime: string | null;
  isClosed: boolean;
}