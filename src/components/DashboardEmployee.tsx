import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db';
import { User, AttendanceRecord, LeaveRequest } from '../types';
import AttendanceSection from './AttendanceSection';
import { Award, Calendar, Timer, FileCheck, BookOpen, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardEmployeeProps {
  user: User;
  onRefresh: () => void;
}

export default function DashboardEmployee({ user, onRefresh }: DashboardEmployeeProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchEmployeeDashboardData = () => {
    const attRecords = dbOperations.getAttendanceForUser(user.id);
    const leaveRecords = dbOperations.getLeavesForUser(user.id);
    setAttendance(attRecords);
    setLeaves(leaveRecords);

    // Prepare chart data for the last 7 working days
    // Filter records with valid punchIns, sort chronologically, and take the last 7
    const regularShifts = attRecords
      .filter((r) => r.status !== 'On Leave' && r.totalHours !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    const formattedChartData = regularShifts.map((r) => {
      const dateObj = new Date(r.date);
      return {
        name: dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        hours: r.totalHours || 0,
      };
    });
    setChartData(formattedChartData);
  };

  useEffect(() => {
    fetchEmployeeDashboardData();
  }, [user.id]);

  const handleActionComplete = () => {
    fetchEmployeeDashboardData();
    onRefresh();
  };

  // Stats Calculations
  const presentDaysCount = attendance.filter((r) => r.status === 'Present').length;
  const halfDaysCount = attendance.filter((r) => r.status === 'Half Day').length;
  const onLeaveDaysCount = attendance.filter((r) => r.status === 'On Leave').length;
  const totalDaysWorked = presentDaysCount + (halfDaysCount * 0.5);

  const totalHoursWorked = attendance
    .filter((r) => r.totalHours !== undefined)
    .reduce((sum, r) => sum + (r.totalHours || 0), 0);

  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  // Build Recent Activity Feed
  const getActivityFeed = () => {
    const feed: { date: string; type: string; title: string; desc: string; color: string }[] = [];

    attendance.slice(-5).forEach((att) => {
      let desc = att.note || 'Shift checked in';
      if (att.punchIn && att.punchOut) {
        desc = `Worked ${att.totalHours} hours (Punched Out)`;
      }
      feed.push({
        date: att.date,
        type: 'attendance',
        title: `Attendance: ${att.status}`,
        desc,
        color: att.status === 'Present' ? 'bg-emerald-500' : 'bg-amber-500',
      });
    });

    leaves.slice(-5).forEach((lv) => {
      feed.push({
        date: lv.appliedDate,
        type: 'leave',
        title: `Leave request: ${lv.type}`,
        desc: `Status is currently ${lv.status}. Reason: ${lv.reason}`,
        color: lv.status === 'Approved' ? 'bg-indigo-500' : (lv.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'),
      });
    });

    // Sort newest first
    return feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  };

  const recentActivity = getActivityFeed();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Personal Card, Punch Widget, and Recent Log */}
      <div className="lg:col-span-1 space-y-6">
        {/* Profile Details Card - Styled in Premium Indigo Gradient */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl shadow-xl shadow-indigo-100 p-6 border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-display font-black text-xl shadow-inner">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-display font-black text-lg leading-tight tracking-tight">{user.name}</h3>
              <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mt-1">{user.designation}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/20 text-xs">
            <div>
              <span className="text-indigo-200 block font-bold text-[10px] uppercase tracking-widest">Department</span>
              <span className="font-black text-white mt-0.5 block">{user.department}</span>
            </div>
            <div>
              <span className="text-indigo-200 block font-bold text-[10px] uppercase tracking-widest">Join Date</span>
              <span className="font-mono font-black text-white mt-0.5 block">{user.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Punch In Widget */}
        <AttendanceSection user={user} onActionComplete={handleActionComplete} />
      </div>

      {/* Right Column: Statistics, Recharts graph, and Activity Logs */}
      <div className="lg:col-span-2 space-y-6">
        {/* Monthly Summary Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Days Logged</span>
              <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{totalDaysWorked} days</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hours Worked</span>
              <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{totalHoursWorked.toFixed(1)} hrs</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Approved Off</span>
              <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{onLeaveDaysCount} days</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Leaves</span>
              <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{pendingLeavesCount} reqs</span>
            </div>
          </div>
        </div>

        {/* Work Hour Analytics Graph */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
            <div>
              <h3 className="font-display font-black text-base text-slate-900">Weekly Shift Hours</h3>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Summary of work hours logged in your last 7 shifts</p>
            </div>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>

          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-medium italic">
              No recent shift logs to display graph. Punch in and complete your first shift to begin!
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#a5b4fc', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-50">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-display font-black text-base text-slate-900">Recent Activity Log</h3>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium italic text-center py-4">No recent activity found.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((act, index) => (
                <div key={index} className="flex items-start gap-3 text-xs border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${act.color} mt-1.5 shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{act.title}</span>
                      <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">{act.date}</span>
                    </div>
                    <p className="text-slate-500 mt-1 font-medium leading-relaxed">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
