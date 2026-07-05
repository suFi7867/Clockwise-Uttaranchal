export type UserRole = 'Employee' | 'Manager' | 'Admin';

export interface LeaveBalances {
  Annual: number;
  Casual: number;
  Medical: number;
  Unpaid: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  joinedDate: string;
  leaveBalances: LeaveBalances;
  isActive: boolean;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  punchIn: string; // ISO string
  punchOut?: string; // ISO string
  totalHours?: number;
  status: AttendanceStatus;
  note?: string;
}

export type LeaveType = 'Annual' | 'Casual' | 'Medical' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  appliedDate: string; // YYYY-MM-DD
  managerId?: string;
  managerName?: string;
  managerNote?: string;
}

export type HolidayType = 'National' | 'Regional' | 'Optional';

export interface CompanyHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: HolidayType;
}
