import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db';
import { User, LeaveRequest, LeaveType } from '../types';
import { PlaneTakeoff, Plus, CalendarRange, Clock, CheckCircle, XCircle, ChevronRight, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaveSectionProps {
  user: User;
  onActionComplete: () => void;
}

export default function LeaveSection({ user, onActionComplete }: LeaveSectionProps) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [currentUserData, setCurrentUserData] = useState<User>(user);
  const [isApplying, setIsApplying] = useState(false);

  // Form Fields
  const [type, setType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLeaveData = () => {
    // Refresh user object from DB to get updated leave balances
    const allUsers = dbOperations.getUsers();
    const freshUser = allUsers.find((u) => u.id === user.id);
    if (freshUser) {
      setCurrentUserData(freshUser);
    }

    const history = dbOperations.getLeavesForUser(user.id);
    // Sort chronologically newest first
    history.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    setLeaves(history);
  };

  useEffect(() => {
    fetchLeaveData();
  }, [user.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!startDate || !endDate || !reason.trim()) {
      setErrorMsg('Please complete all form fields.');
      return;
    }

    const res = dbOperations.applyLeave(
      user.id,
      user.name,
      type,
      startDate,
      endDate,
      reason.trim()
    );

    if (res.success && res.request) {
      setSuccessMsg('Your leave request has been submitted successfully and is pending manager approval.');
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      setIsApplying(false);
      fetchLeaveData();
      onActionComplete();
    } else {
      setErrorMsg(res.error || 'Failed to submit leave request.');
    }
  };

  // Helper to calculate business days between two dates
  const calculateRequestedDays = (startStr: string, endStr: string): number => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (end < start) return 0;

    let days = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
    }
    return days;
  };

  const requestedDays = calculateRequestedDays(startDate, endDate);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Leave Balances Grid */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-black text-base text-slate-900">Leave Entitlements</h2>
            <p className="text-slate-500 font-medium text-xs mt-0.5">Your current available leave balances</p>
          </div>
          <button
            onClick={() => {
              setIsApplying(!isApplying);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-100 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Apply for Leave
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(currentUserData.leaveBalances).map(([type, val]) => {
            let colorClass = 'text-indigo-700 bg-indigo-100';
            if (type === 'Casual') colorClass = 'text-violet-700 bg-violet-100';
            if (type === 'Medical') colorClass = 'text-sky-700 bg-sky-100';
            if (type === 'Unpaid') colorClass = 'text-slate-600 bg-slate-100';

            return (
              <div key={type} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between hover:border-slate-200 transition-all">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type}</span>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-3xl font-black font-display text-slate-900 leading-none">{val}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${colorClass}`}>days</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Application Form Drawer/Modal-like area */}
      <AnimatePresence>
        {isApplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                <PlaneTakeoff className="w-5 h-5 text-indigo-600" />
                <h3 className="font-display font-black text-base text-slate-900">New Leave Application</h3>
              </div>

              {errorMsg && (
                <div className="p-3.5 mb-4 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Leave Category
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as LeaveType)}
                      className="w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
                    >
                      <option value="Annual">Annual Leave</option>
                      <option value="Casual">Casual Leave</option>
                      <option value="Medical">Medical Leave</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Start Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      End Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {startDate && endDate && requestedDays > 0 && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center justify-between font-semibold">
                    <span>Working days requested:</span>
                    <span className="font-black font-display text-sm">{requestedDays} working {requestedDays === 1 ? 'day' : 'days'}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Reason for Leave
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe the reason for your leave request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-3 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsApplying(false);
                      setErrorMsg('');
                    }}
                    className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-100 transition-all cursor-pointer"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Application History */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-50 pb-4">
          <CalendarRange className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="font-display font-black text-base text-slate-900">Application History</h3>
            <p className="text-slate-500 font-medium text-xs mt-0.5">Status of your past leave requests</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 mb-4 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl">
            {successMsg}
          </div>
        )}

        {leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
            <FileText className="w-10 h-10 mb-2 opacity-50 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No leave history found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[9px] tracking-widest">
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Dates</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Response / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.map((l) => {
                  const duration = calculateRequestedDays(l.startDate, l.endDate);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                      <td className="py-3.5 px-3 font-black text-slate-800">{l.type}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">
                          {new Date(l.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(l.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Applied on {l.appliedDate}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700">{duration} w-days</td>
                      <td className="py-3.5 px-3 italic truncate max-w-xs text-slate-500" title={l.reason}>" {l.reason} "</td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusStyle(l.status)}`}>
                          {getStatusIcon(l.status)}
                          <span>{l.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {l.status !== 'Pending' ? (
                          <div>
                            <span className="font-bold text-slate-800">{l.managerName}</span>
                            {l.managerNote && <span className="block text-[10px] text-slate-400 font-medium italic">"{l.managerNote}"</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-bold italic">Awaiting review</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
