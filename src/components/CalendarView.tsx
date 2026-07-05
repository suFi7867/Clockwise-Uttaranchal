import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db';
import { User, AttendanceRecord, LeaveRequest, CompanyHoliday } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, Users, Circle, Briefcase, HelpCircle } from 'lucide-react';

interface CalendarViewProps {
  currentUser: User;
}

export default function CalendarView({ currentUser }: CalendarViewProps) {
  const [selectedUser, setSelectedUser] = useState<User>(currentUser);
  const [users, setUsers] = useState<User[]>([]);
  const [holidays, setHolidays] = useState<CompanyHoliday[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  // Calendar State (Default to current July 2026 for easy testing of seeded data)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July

  useEffect(() => {
    // Refresh list of users if manager/admin
    if (currentUser.role === 'Manager' || currentUser.role === 'Admin') {
      const allUsers = dbOperations.getUsers();
      setUsers(allUsers);
    }
    setHolidays(dbOperations.getHolidays());
  }, [currentUser]);

  useEffect(() => {
    // Refresh calendar logs when selected user changes
    setAttendance(dbOperations.getAttendanceForUser(selectedUser.id));
    setLeaves(dbOperations.getLeavesForUser(selectedUser.id).filter(l => l.status === 'Approved'));
  }, [selectedUser]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Calendar cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null); // empty cells before start of month
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }

  const getDayData = (day: number) => {
    const paddedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');
    const dateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;

    const dayHoliday = holidays.find(h => h.date === dateStr);
    const dayAttendance = attendance.find(a => a.date === dateStr);
    const dayLeave = leaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate);

    return { dateStr, dayHoliday, dayAttendance, dayLeave };
  };

  const isWeekend = (year: number, month: number, day: number) => {
    const dayOfWeek = new Date(year, month, day).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      {/* Calendar Header with navigation and team toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5 mb-6">
        <div>
          <h2 className="font-display font-black text-xl text-slate-900">Calendar Log</h2>
          <p className="text-slate-500 font-medium text-xs mt-0.5">Track shifts, holidays, and leaves</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* User selector for Manager/Admin */}
          {(currentUser.role === 'Manager' || currentUser.role === 'Admin') && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-150">
              <Users className="w-4 h-4 text-indigo-500" />
              <select
                value={selectedUser.id}
                onChange={(e) => {
                  const target = users.find(u => u.id === e.target.value);
                  if (target) setSelectedUser(target);
                }}
                className="text-xs font-black uppercase text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              >
                <option value={currentUser.id}>My calendar</option>
                <optgroup label="Team Members">
                  {users
                    .filter(u => u.id !== currentUser.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Month Navigator */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-display font-black text-xs text-slate-800 min-w-28 text-center uppercase tracking-wider">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center font-sans">
        {/* Days of week */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
          <span key={d} className={`text-[10px] font-black uppercase tracking-wider mb-2 ${i >= 5 ? 'text-slate-400' : 'text-slate-300'}`}>
            {d}
          </span>
        ))}

        {/* Calendar Cells */}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-14 bg-slate-50 rounded-xl border border-transparent opacity-40" />;
          }

          const { dateStr, dayHoliday, dayAttendance, dayLeave } = getDayData(day);
          const weekend = isWeekend(currentYear, currentMonth, day);

          // Determine styles
          let cellStyle = 'bg-white border border-slate-100 hover:border-indigo-200 text-slate-700';
          let statusText = '';

          if (dayHoliday) {
            cellStyle = 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200';
            statusText = 'Holiday';
          } else if (dayLeave) {
            cellStyle = 'bg-orange-100 text-orange-700 border-2 border-orange-200';
            statusText = 'Leave';
          } else if (dayAttendance) {
            if (dayAttendance.status === 'Present') {
              cellStyle = 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200';
              statusText = 'Present';
            } else if (dayAttendance.status === 'Half Day') {
              cellStyle = 'bg-amber-100 text-amber-700 border-2 border-amber-200';
              statusText = 'Half Day';
            } else if (dayAttendance.status === 'Absent') {
              cellStyle = 'bg-rose-100 text-rose-700 border-2 border-rose-200';
              statusText = 'Absent';
            }
          } else if (weekend) {
            cellStyle = 'bg-slate-100 text-slate-400 border border-slate-150';
          }

          return (
            <div
              key={`day-${day}`}
              className={`h-14 rounded-xl flex flex-col items-center justify-center transition-all ${cellStyle}`}
            >
              <span className="text-xs font-black">{day.toString().padStart(2, '0')}</span>
              {statusText && (
                <span className="text-[7.5px] uppercase font-black tracking-widest mt-0.5 opacity-90 truncate max-w-full px-1">
                  {statusText}
                </span>
              )}
              {dayAttendance && dayAttendance.totalHours !== undefined && dayAttendance.status !== 'Absent' && (
                <span className="text-[7px] font-mono font-bold mt-0.5 opacity-85">
                  {dayAttendance.totalHours} hrs
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mt-8 pt-5 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest justify-center">
        <div className="flex items-center gap-1.5">
          <Circle className="w-3 h-3 text-emerald-500 fill-emerald-100 stroke-emerald-500 stroke-2" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-3 h-3 text-amber-500 fill-amber-100 stroke-amber-500 stroke-2" />
          <span>Half Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-3 h-3 text-orange-500 fill-orange-100 stroke-orange-500 stroke-2" />
          <span>Leave</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-3 h-3 text-indigo-500 fill-indigo-100 stroke-indigo-500 stroke-2" />
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-3 h-3 text-rose-500 fill-rose-100 stroke-rose-500 stroke-2" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-3 h-3 text-slate-400 fill-slate-100 stroke-slate-300 stroke-2" />
          <span>Weekend</span>
        </div>
      </div>
    </div>
  );
}
