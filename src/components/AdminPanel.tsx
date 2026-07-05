import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db';
import { User, CompanyHoliday, HolidayType } from '../types';
import { Users, Calendar, Plus, Trash2, Edit2, Check, X, ShieldAlert, BadgeCheck, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'employees' | 'holidays'>('employees');
  const [users, setUsers] = useState<User[]>([]);
  const [holidays, setHolidays] = useState<CompanyHoliday[]>([]);

  // Add Holiday Form Fields
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayType, setHolidayType] = useState<HolidayType>('National');
  const [holidayError, setHolidayError] = useState('');
  const [holidaySuccess, setHolidaySuccess] = useState('');

  // Editing Leave Balance States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [annualBal, setAnnualBal] = useState(0);
  const [casualBal, setCasualBal] = useState(0);
  const [medicalBal, setMedicalBal] = useState(0);
  const [unpaidBal, setUnpaidBal] = useState(0);

  const fetchData = () => {
    setUsers(dbOperations.getUsers());
    setHolidays(dbOperations.getHolidays());
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Account Toggle Active
  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    dbOperations.updateEmployeeStatus(userId, !currentStatus);
    fetchData();
  };

  // Handle Edit Balance triggers
  const startEditingBalances = (user: User) => {
    setEditingUserId(user.id);
    setAnnualBal(user.leaveBalances.Annual);
    setCasualBal(user.leaveBalances.Casual);
    setMedicalBal(user.leaveBalances.Medical);
    setUnpaidBal(user.leaveBalances.Unpaid);
  };

  const handleSaveBalances = (userId: string) => {
    dbOperations.updateEmployeeBalances(userId, {
      Annual: annualBal,
      Casual: casualBal,
      Medical: medicalBal,
      Unpaid: unpaidBal,
    });
    setEditingUserId(null);
    fetchData();
  };

  // Handle Add Holiday
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    setHolidayError('');
    setHolidaySuccess('');

    if (!holidayName.trim() || !holidayDate) {
      setHolidayError('Please fill in both Holiday Name and Date.');
      return;
    }

    const res = dbOperations.addHoliday(holidayName.trim(), holidayDate, holidayType);
    if (res.success) {
      setHolidaySuccess('New holiday configured successfully!');
      setHolidayName('');
      setHolidayDate('');
      setHolidayType('National');
      fetchData();
    } else {
      setHolidayError(res.error || 'Failed to schedule holiday.');
    }
  };

  // Handle Delete Holiday
  const handleDeleteHoliday = (id: string) => {
    if (window.confirm('Are you sure you want to remove this company holiday?')) {
      dbOperations.deleteHoliday(id);
      fetchData();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-100 mb-6">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 py-3.5 px-5 font-black text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'employees'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" /> Manage Employees
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`flex items-center gap-2 py-3.5 px-5 font-black text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'holidays'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4" /> Company Holidays
        </button>
      </div>

      {/* Employees Directory Panel */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-50">
            <h3 className="font-display font-black text-base text-slate-900">Employee Directory & Leave Balance Adjustments</h3>
            <p className="text-slate-500 font-medium text-xs mt-0.5">Toggle active statuses or directly edit available leave balances</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[9px] tracking-widest uppercase">
                  <th className="py-3 px-3">Employee Details</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 text-center">Account Status</th>
                  <th className="py-3 px-3 text-center">Available Leave Balances</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-medium">{u.email}</div>
                      <div className="text-[10px] text-indigo-600 font-bold mt-0.5">{u.designation}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-700">{u.department}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        u.role === 'Admin' ? 'bg-rose-100 text-rose-700' : (u.role === 'Manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700')
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider border cursor-pointer transition-all ${
                          u.isActive
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200'
                            : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100 hover:border-rose-200'
                        }`}
                      >
                        {u.isActive ? <BadgeCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        <span>{u.isActive ? 'Active' : 'Locked'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {editingUserId === u.id ? (
                        <div className="flex items-center justify-center gap-2 font-semibold">
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Annual</span>
                            <input
                              type="number"
                              value={annualBal}
                              onChange={(e) => setAnnualBal(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-12 text-center p-1 border border-slate-200 rounded-lg font-mono text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-bold"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Casual</span>
                            <input
                              type="number"
                              value={casualBal}
                              onChange={(e) => setCasualBal(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-12 text-center p-1 border border-slate-200 rounded-lg font-mono text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-bold"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Medical</span>
                            <input
                              type="number"
                              value={medicalBal}
                              onChange={(e) => setMedicalBal(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-12 text-center p-1 border border-slate-200 rounded-lg font-mono text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-bold"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Unpaid</span>
                            <input
                              type="number"
                              value={unpaidBal}
                              onChange={(e) => setUnpaidBal(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-12 text-center p-1 border border-slate-200 rounded-lg font-mono text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-bold"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700">
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md" title="Annual">A: <strong className="font-mono text-slate-900">{u.leaveBalances.Annual}</strong></span>
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md" title="Casual">C: <strong className="font-mono text-slate-900">{u.leaveBalances.Casual}</strong></span>
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md" title="Medical">M: <strong className="font-mono text-slate-900">{u.leaveBalances.Medical}</strong></span>
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md" title="Unpaid">U: <strong className="font-mono text-slate-900">{u.leaveBalances.Unpaid}</strong></span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {editingUserId === u.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveBalances(u.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Save changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingBalances(u)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1 hover:scale-105"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Balances</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Holidays Schedule Management Panel */}
      {activeTab === 'holidays' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Holidays list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="pb-2 border-b border-slate-50">
              <h3 className="font-display font-black text-base text-slate-900">Corporate Holidays Schedule</h3>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Existing corporate holidays for employee attendance exclusion</p>
            </div>

            <div className="space-y-2.5">
              {holidays.map((h) => (
                <div key={h.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-black text-slate-900 text-sm">{h.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="font-mono text-indigo-600 font-bold">{h.date}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        h.type === 'National' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>{h.type} Category</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteHoliday(h.id)}
                    className="p-2.5 text-rose-600 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
                    title="Remove Holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Configure New Holiday Form */}
          <div className="lg:col-span-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
            <div>
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-slate-700">Configure New Holiday</h3>
              <p className="text-slate-500 font-medium text-[10px] mt-0.5">Schedule a new holiday and block attendance punching</p>
            </div>

            {holidayError && (
              <div className="p-2.5 mt-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl animate-shake">
                {holidayError}
              </div>
            )}

            {holidaySuccess && (
              <div className="p-2.5 mt-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl">
                {holidaySuccess}
              </div>
            )}

            <form onSubmit={handleAddHoliday} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Holiday Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Independence Day"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full bg-white px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full bg-white px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Holiday Category
                </label>
                <select
                  value={holidayType}
                  onChange={(e) => setHolidayType(e.target.value as HolidayType)}
                  className="w-full bg-white px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer text-slate-700"
                >
                  <option value="National">National Holiday</option>
                  <option value="Regional">Regional Holiday</option>
                  <option value="Optional">Optional Holiday</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-100 active:scale-95"
              >
                <Plus className="w-4 h-4 inline mr-1" /> Schedule Holiday
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
