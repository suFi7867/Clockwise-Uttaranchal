import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db';
import { User, LeaveRequest, AttendanceRecord } from '../types';
import { Users, FileClock, Check, X, ClipboardList, TrendingUp, AlertCircle, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardManagerProps {
  user: User;
  onRefresh: () => void;
}

export default function DashboardManager({ user, onRefresh }: DashboardManagerProps) {
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [teamAttendance, setTeamAttendance] = useState<AttendanceRecord[]>([]);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  
  // Action Feedback state
  const [notes, setNotes] = useState<{ [requestId: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState('');

  const fetchManagerData = () => {
    const allUsers = dbOperations.getUsers();
    // In our seed, managers manage members in "Engineering" or "Product & Design" or all non-manager/non-admin employees.
    // Let's filter to show all non-admin employees as their team members.
    const team = allUsers.filter((u) => u.role === 'Employee');
    setTeamUsers(team);

    // Get pending leave requests for team members
    const teamIds = team.map((t) => t.id);
    const leaves = dbOperations.getLeaves().filter((l) => teamIds.includes(l.userId) && l.status === 'Pending');
    setPendingRequests(leaves);

    // Get today's attendance for team
    const todayStr = new Date().toISOString().split('T')[0];
    const attendance = dbOperations.getAttendance().filter((a) => teamIds.includes(a.userId) && a.date === todayStr);
    setTeamAttendance(attendance);
  };

  useEffect(() => {
    fetchManagerData();
  }, [user.id]);

  const handleProcessLeave = (requestId: string, status: 'Approved' | 'Rejected') => {
    const feedbackNote = notes[requestId] || '';
    const res = dbOperations.processLeave(
      requestId,
      status,
      user.id,
      user.name,
      feedbackNote
    );

    if (res.success) {
      setSuccessMsg(`Leave request has been successfully ${status.toLowerCase()}!`);
      // Clear notes input
      setNotes((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
      fetchManagerData();
      onRefresh();
      
      // Auto-fade success message
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      alert(res.error || 'Failed to process leave request.');
    }
  };

  // Stats Calculations
  const totalTeamCount = teamUsers.length;
  const presentCount = teamAttendance.filter((a) => a.status === 'Present').length;
  const halfDayCount = teamAttendance.filter((a) => a.status === 'Half Day').length;
  const leaveCount = teamAttendance.filter((a) => a.status === 'On Leave').length;
  const absentCount = totalTeamCount - (presentCount + halfDayCount + leaveCount);

  const attendanceRate = totalTeamCount > 0 
    ? (((presentCount + (halfDayCount * 0.5)) / totalTeamCount) * 100).toFixed(0) 
    : '0';

  // Chart Data (Vibrant Palette Theme Slices)
  const pieData = [
    { name: 'Present', value: presentCount, color: '#4f46e5' },
    { name: 'Half Day', value: halfDayCount, color: '#818cf8' },
    { name: 'On Leave', value: leaveCount, color: '#fb923c' },
    { name: 'Absent', value: Math.max(0, absentCount), color: '#f87171' },
  ].filter(item => item.value > 0);

  // Fallback if no logs today
  const defaultPieData = [
    { name: 'Present', value: 3, color: '#4f46e5' },
    { name: 'On Leave', value: 1, color: '#fb923c' },
  ];

  const renderActivePieData = pieData.length > 0 ? pieData : defaultPieData;

  return (
    <div className="space-y-6">
      {/* Top Statistics summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Team Headcount</span>
            <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{totalTeamCount} employees</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Today's Attendance</span>
            <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{attendanceRate}% rate</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600 shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active On-Leave</span>
            <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{leaveCount} members</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
            <FileClock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Leaves</span>
            <span className="font-display font-black text-base text-rose-600 leading-none mt-1 block">{pendingRequests.length} pending</span>
          </div>
        </div>
      </div>

      {/* Main Layout Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team leave requests (takes 2 span) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <div>
                <h3 className="font-display font-black text-base text-slate-900">Team Leave Requests</h3>
                <p className="text-slate-500 font-medium text-xs mt-0.5">Approve or reject leave applications submitted by your team</p>
              </div>
            </div>

            {successMsg && (
              <div className="p-3.5 mb-4 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl">
                {successMsg}
              </div>
            )}

            {pendingRequests.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-slate-900">Inbox Clean!</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1 font-medium leading-relaxed">There are no pending leave requests awaiting your decision.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{req.employeeName}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700">
                          {req.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        <span className="text-slate-400">Dates: </span>
                        <span className="font-mono font-bold text-slate-800">{req.startDate}</span> <span className="text-slate-300">to</span> <span className="font-mono font-bold text-slate-800">{req.endDate}</span>
                      </div>
                      <p className="text-xs text-slate-500 italic leading-relaxed">" {req.reason} "</p>

                      {/* Optional manager note input */}
                      <div className="pt-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Add review feedback note (optional)..."
                          value={notes[req.id] || ''}
                          onChange={(e) => setNotes({ ...notes, [req.id]: e.target.value })}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-stretch gap-2 shrink-0">
                      <button
                        onClick={() => handleProcessLeave(req.id, 'Approved')}
                        className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-indigo-100 active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleProcessLeave(req.id, 'Rejected')}
                        className="flex-1 py-2 px-4 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance Pie Distribution (takes 1 span) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between h-full min-h-[400px]">
            <div>
              <h3 className="font-display font-black text-base text-slate-900">Attendance Distribution</h3>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Distribution of today's team shifts</p>
            </div>

            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={renderActivePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {renderActivePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              {pieData.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-black text-indigo-600 block uppercase tracking-widest">No Live Data</span>
                  <span className="text-[9px] text-slate-400 font-medium block">Showing demo layout</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2 mt-4">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-bold text-slate-500">Total Team Size:</span>
                <span className="font-mono font-black text-slate-900 text-sm">{totalTeamCount}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-bold text-slate-500">Punched In:</span>
                <span className="font-mono font-black text-indigo-600 text-sm">{presentCount + halfDayCount}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-bold text-slate-500">On Approved Off:</span>
                <span className="font-mono font-black text-orange-600 text-sm">{leaveCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
