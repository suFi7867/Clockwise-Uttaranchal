import { User, AttendanceRecord, LeaveRequest, CompanyHoliday, LeaveBalances } from './types';

// Storage Keys
const USERS_KEY = 'clockwise_users';
const ATTENDANCE_KEY = 'clockwise_attendance';
const LEAVES_KEY = 'clockwise_leaves';
const HOLIDAYS_KEY = 'clockwise_holidays';
const LOGGED_IN_USER_KEY = 'clockwise_current_user';

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Sufiyan Shaikh (Admin)',
    email: 'sufiyan.shaikh.developer@gmail.com',
    role: 'Admin',
    department: 'Executive',
    designation: 'Director of Operations',
    joinedDate: '2024-01-15',
    leaveBalances: { Annual: 25, Casual: 10, Medical: 15, Unpaid: 30 },
    isActive: true,
  },
  {
    id: 'usr_manager',
    name: 'Sarah Jenkins',
    email: 'manager@clockwise.com',
    role: 'Manager',
    department: 'Engineering',
    designation: 'Engineering Manager',
    joinedDate: '2024-03-10',
    leaveBalances: { Annual: 20, Casual: 8, Medical: 12, Unpaid: 30 },
    isActive: true,
  },
  {
    id: 'usr_employee',
    name: 'Alex Carter',
    email: 'employee@clockwise.com',
    role: 'Employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    joinedDate: '2025-01-10',
    leaveBalances: { Annual: 14, Casual: 6, Medical: 8, Unpaid: 30 },
    isActive: true,
  },
  {
    id: 'usr_designer',
    name: 'John Doe',
    email: 'john.doe@clockwise.com',
    role: 'Employee',
    department: 'Product & Design',
    designation: 'Senior UX Designer',
    joinedDate: '2024-08-01',
    leaveBalances: { Annual: 18, Casual: 7, Medical: 10, Unpaid: 30 },
    isActive: true,
  },
  {
    id: 'usr_qa',
    name: 'Jane Smith',
    email: 'jane.smith@clockwise.com',
    role: 'Employee',
    department: 'Engineering',
    designation: 'QA Engineer',
    joinedDate: '2025-02-15',
    leaveBalances: { Annual: 15, Casual: 8, Medical: 10, Unpaid: 30 },
    isActive: true,
  },
];

const DEFAULT_HOLIDAYS: CompanyHoliday[] = [
  { id: 'hol_1', date: '2026-01-01', name: "New Year's Day", type: 'National' },
  { id: 'hol_2', date: '2026-05-25', name: 'Memorial Day', type: 'National' },
  { id: 'hol_3', date: '2026-06-19', name: 'Juneteenth', type: 'National' },
  { id: 'hol_4', date: '2026-07-04', name: 'Independence Day', type: 'National' },
  { id: 'hol_5', date: '2026-09-07', name: 'Labor Day', type: 'National' },
  { id: 'hol_6', date: '2026-11-26', name: 'Thanksgiving', type: 'National' },
  { id: 'hol_7', date: '2026-12-25', name: 'Christmas Day', type: 'National' },
  { id: 'hol_8', date: '2026-10-30', name: 'Autumn Festival', type: 'Optional' },
];

// Seed attendance for June and early July 2026 for demonstration
const generateAttendanceSeedData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const usersToSeed = ['usr_manager', 'usr_employee', 'usr_designer', 'usr_qa'];
  
  // We will seed days between June 1st, 2026 and July 3rd, 2026 (excluding weekends)
  const start = new Date('2026-06-01');
  const end = new Date('2026-07-03');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const dateStr = d.toISOString().split('T')[0];

    // Skip Independence Day July 4th or its observed dates or special exclusions
    if (dateStr === '2026-06-19') continue; // Juneteenth Holiday

    usersToSeed.forEach((userId) => {
      // Alex Carter was on leave from June 15 to June 17
      if (userId === 'usr_employee' && dateStr >= '2026-06-15' && dateStr <= '2026-06-17') {
        records.push({
          id: `att_seed_${userId}_${dateStr}`,
          userId,
          date: dateStr,
          punchIn: `${dateStr}T09:00:00.000Z`,
          punchOut: `${dateStr}T17:00:00.000Z`,
          totalHours: 0,
          status: 'On Leave',
          note: 'Approved Annual Leave',
        });
        return;
      }

      // Randomize hours worked slightly (approx 8 hours)
      const randomOffsetIn = Math.floor(Math.random() * 45); // up to 45 mins late
      const randomOffsetOut = Math.floor(Math.random() * 30); // up to 30 mins early/late
      const inHour = 8;
      const inMinute = 30 + randomOffsetIn;
      const outHour = 17;
      const outMinute = randomOffsetOut;

      const punchInISO = `${dateStr}T0${inHour}:${inMinute < 10 ? '0' + inMinute : inMinute}:00.000Z`;
      const punchOutISO = `${dateStr}T${outHour}:${outMinute < 10 ? '0' + outMinute : outMinute}:00.000Z`;

      const diffMs = new Date(punchOutISO).getTime() - new Date(punchInISO).getTime();
      const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

      records.push({
        id: `att_seed_${userId}_${dateStr}`,
        userId,
        date: dateStr,
        punchIn: punchInISO,
        punchOut: punchOutISO,
        totalHours,
        status: totalHours >= 8 ? 'Present' : 'Half Day',
        note: 'Regular shift',
      });
    });
  }
  return records;
};

const DEFAULT_LEAVES: LeaveRequest[] = [
  {
    id: 'lv_1',
    userId: 'usr_employee',
    employeeName: 'Alex Carter',
    type: 'Annual',
    startDate: '2026-06-15',
    endDate: '2026-06-17',
    reason: 'Family trip',
    status: 'Approved',
    appliedDate: '2026-06-05',
    managerId: 'usr_manager',
    managerName: 'Sarah Jenkins',
    managerNote: 'Enjoy your trip!',
  },
  {
    id: 'lv_2',
    userId: 'usr_designer',
    employeeName: 'John Doe',
    type: 'Medical',
    startDate: '2026-07-06',
    endDate: '2026-07-07',
    reason: 'Dental surgery recovery',
    status: 'Approved',
    appliedDate: '2026-07-01',
    managerId: 'usr_manager',
    managerName: 'Sarah Jenkins',
    managerNote: 'Get well soon!',
  },
  {
    id: 'lv_3',
    userId: 'usr_qa',
    employeeName: 'Jane Smith',
    type: 'Casual',
    startDate: '2026-07-15',
    endDate: '2026-07-16',
    reason: 'Personal errands',
    status: 'Pending',
    appliedDate: '2026-07-04',
  },
  {
    id: 'lv_4',
    userId: 'usr_employee',
    employeeName: 'Alex Carter',
    type: 'Annual',
    startDate: '2026-07-20',
    endDate: '2026-07-24',
    reason: 'Summer vacation',
    status: 'Pending',
    appliedDate: '2026-07-04',
  },
];

// Helper to initialize localStorage
export function initializeDB() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(HOLIDAYS_KEY)) {
    localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(DEFAULT_HOLIDAYS));
  }
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(generateAttendanceSeedData()));
  }
  if (!localStorage.getItem(LEAVES_KEY)) {
    localStorage.setItem(LEAVES_KEY, JSON.stringify(DEFAULT_LEAVES));
  }
}

// Ensure database is initialized
initializeDB();

// API Database Operations

export const dbOperations = {
  // === USER OPERATIONS ===
  getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  registerUser(name: string, email: string, role: 'Employee' | 'Manager' | 'Admin', department: string, designation: string): User | null {
    const users = this.getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return null; // Email already exists
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role,
      department,
      designation,
      joinedDate: new Date().toISOString().split('T')[0],
      leaveBalances: { Annual: 15, Casual: 10, Medical: 10, Unpaid: 30 },
      isActive: true,
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  loginUser(email: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.isActive) {
      localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(LOGGED_IN_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  logoutUser(): void {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
  },

  updateEmployeeStatus(userId: string, isActive: boolean): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.isActive = isActive;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  updateEmployeeBalances(userId: string, balances: LeaveBalances): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.leaveBalances = balances;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  // === ATTENDANCE OPERATIONS ===
  getAttendance(): AttendanceRecord[] {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getAttendanceForUser(userId: string): AttendanceRecord[] {
    return this.getAttendance().filter((a) => a.userId === userId);
  },

  punchIn(userId: string, note?: string): { success: boolean; error?: string; record?: AttendanceRecord } {
    const todayStr = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay();

    // Rule: No punching on weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { success: false, error: 'Punch-in is not permitted on weekends.' };
    }

    const attendance = this.getAttendance();
    const existing = attendance.find((a) => a.userId === userId && a.date === todayStr);

    if (existing) {
      return { success: false, error: 'You have already punched in for today.' };
    }

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      userId,
      date: todayStr,
      punchIn: new Date().toISOString(),
      status: 'Present',
      note: note || 'Checked in',
    };

    attendance.push(newRecord);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));

    return { success: true, record: newRecord };
  },

  punchOut(userId: string): { success: boolean; error?: string; record?: AttendanceRecord } {
    const todayStr = new Date().toISOString().split('T')[0];
    const attendance = this.getAttendance();
    const recordIndex = attendance.findIndex((a) => a.userId === userId && a.date === todayStr);

    if (recordIndex === -1) {
      return { success: false, error: 'No punch-in record found for today.' };
    }

    const record = attendance[recordIndex];
    if (record.punchOut) {
      return { success: false, error: 'You have already punched out for today.' };
    }

    record.punchOut = new Date().toISOString();
    
    // Calculate total hours
    const diffMs = new Date(record.punchOut).getTime() - new Date(record.punchIn).getTime();
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    record.totalHours = totalHours;
    record.status = totalHours >= 8 ? 'Present' : (totalHours >= 4 ? 'Half Day' : 'Absent');

    attendance[recordIndex] = record;
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));

    return { success: true, record };
  },

  // === LEAVE OPERATIONS ===
  getLeaves(): LeaveRequest[] {
    const data = localStorage.getItem(LEAVES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getLeavesForUser(userId: string): LeaveRequest[] {
    return this.getLeaves().filter((l) => l.userId === userId);
  },

  applyLeave(
    userId: string,
    employeeName: string,
    type: 'Annual' | 'Casual' | 'Medical' | 'Unpaid',
    startDate: string,
    endDate: string,
    reason: string
  ): { success: boolean; error?: string; request?: LeaveRequest } {
    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return { success: false, error: 'End date cannot be earlier than start date.' };
    }

    let durationDays = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        durationDays++; // Only count weekdays
      }
    }

    if (durationDays === 0) {
      return { success: false, error: 'Leaves must span at least one working day (Monday - Friday).' };
    }

    // Check balance
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    const currentBalance = user.leaveBalances[type];
    if (currentBalance < durationDays) {
      return { success: false, error: `Insufficient leave balance. Requested: ${durationDays} days. Available: ${currentBalance} days.` };
    }

    const leaves = this.getLeaves();
    const newRequest: LeaveRequest = {
      id: `lv_${Date.now()}`,
      userId,
      employeeName,
      type,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    leaves.push(newRequest);
    localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));

    return { success: true, request: newRequest };
  },

  processLeave(
    requestId: string,
    status: 'Approved' | 'Rejected',
    managerId: string,
    managerName: string,
    managerNote?: string
  ): { success: boolean; error?: string } {
    const leaves = this.getLeaves();
    const requestIndex = leaves.findIndex((l) => l.id === requestId);

    if (requestIndex === -1) {
      return { success: false, error: 'Leave request not found.' };
    }

    const request = leaves[requestIndex];
    if (request.status !== 'Pending') {
      return { success: false, error: `This leave request is already ${request.status.toLowerCase()}.` };
    }

    request.status = status;
    request.managerId = managerId;
    request.managerName = managerName;
    request.managerNote = managerNote;

    // If approved, deduct balance
    if (status === 'Approved') {
      const users = this.getUsers();
      const userIndex = users.findIndex((u) => u.id === request.userId);

      if (userIndex !== -1) {
        const user = users[userIndex];
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
        
        let durationDays = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            durationDays++;
          }
        }

        // Deduct from appropriate balance
        user.leaveBalances[request.type] = Math.max(0, user.leaveBalances[request.type] - durationDays);
        users[userIndex] = user;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Create virtual attendance records of type 'On Leave' for the leave days
        const attendance = this.getAttendance();
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;

          const dateStr = d.toISOString().split('T')[0];
          // Check if an attendance record already exists for this day
          if (!attendance.some((a) => a.userId === request.userId && a.date === dateStr)) {
            attendance.push({
              id: `att_leave_${request.id}_${dateStr}`,
              userId: request.userId,
              date: dateStr,
              punchIn: `${dateStr}T09:00:00.000Z`,
              punchOut: `${dateStr}T17:00:00.000Z`,
              totalHours: 0,
              status: 'On Leave',
              note: `Approved ${request.type} Leave`,
            });
          }
        }
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
      }
    }

    leaves[requestIndex] = request;
    localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));

    return { success: true };
  },

  // === HOLIDAY OPERATIONS ===
  getHolidays(): CompanyHoliday[] {
    const data = localStorage.getItem(HOLIDAYS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addHoliday(name: string, date: string, type: 'National' | 'Regional' | 'Optional'): { success: boolean; error?: string } {
    const holidays = this.getHolidays();
    if (holidays.some((h) => h.date === date)) {
      return { success: false, error: 'A holiday is already scheduled on this date.' };
    }

    const newHoliday: CompanyHoliday = {
      id: `hol_${Date.now()}`,
      name,
      date,
      type,
    };

    holidays.push(newHoliday);
    // Sort by date chronologically
    holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(holidays));

    return { success: true };
  },

  deleteHoliday(holidayId: string): void {
    const holidays = this.getHolidays();
    const filtered = holidays.filter((h) => h.id !== holidayId);
    localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(filtered));
  }
};
