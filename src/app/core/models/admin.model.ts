export interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalStadiumOwners: number;
  totalStadiums: number;
  activeStadiums: number;
  pendingStadiums: number;
  suspendedStadiums: number;
  totalReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  totalReviews: number;
  pendingReviews: number;
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'STADIUM_OWNER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  eventType: string;
  entityType: string;
  entityId: number;
  description: string;
  ipAddress: string;
  createdAt: string;
}