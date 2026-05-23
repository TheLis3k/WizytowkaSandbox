export type ReservationStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface ReservationResponse {
  id: number;
  tableId: number;
  tableName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  partySize: number;
  startTime: string;
  durationMinutes: number;
  status: ReservationStatus;
  comments: string | null;
  createdAt: string;
}

export interface ReservationRequest {
  tableId: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  partySize: number;
  startTime: string;
  comments?: string;
}

export interface AdminReservationUpdateRequest {
  status?: ReservationStatus;
  comments?: string;
}

export interface AvailableTable {
  id: number;
  name: string;
  capacity: number;
}

export interface TimeSlotAvailability {
  time: string;
  available: boolean;
  tables: AvailableTable[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
