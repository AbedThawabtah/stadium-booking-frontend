export type SlotStatus = 'AVAILABLE' | 'BOOKED';

export interface TimeSlot {
  id: number;
  stadiumId: number;
  stadiumName: string;
  slotDate: string;   // "yyyy-MM-dd"
  startTime: string;  // "HH:mm:ss"
  endTime: string;
  status: SlotStatus;
  price: number;
}

export interface GenerateTimeSlotsRequest {
  date: string;                 // yyyy-MM-dd
  slotDurationMinutes: number;
}

export interface GenerateTimeSlotsRangeRequest {
  startDate: string;
  endDate: string;
  slotDurationMinutes: number;
}