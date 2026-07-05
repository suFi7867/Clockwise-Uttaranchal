import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db';
import { User, AttendanceRecord, LeaveRequest, CompanyHoliday } from '../types';
import { ShieldCheck, BarChart3, Download, RefreshCw, FileSpreadsheet, Building2, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardAdminProps {
  currentUser: User;
}

export default function DashboardAdmin({ currentUser }: DashboardAdminProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<CompanyHoliday[]>([]);

  // Report Generator States
  const [reportType, setReportType] = useState<'attendance' | 'leaves' | 'holidays'>('attendance');
  const [generatedReport, setGeneratedReport] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchAdminData = () => {
    setUsers(dbOperations.getUsers());
    setAttendance(dbOperations.getAttendance());
    setLeaves(dbOperations.getLeaves());
    setHolidays(dbOperations.getHolidays());
  };

  useEffect(() => {
    fetchAdminData();
  }, [currentUser.id]);

  // Calculations for Admin Analytics
  const totalEmployees = users.length;
  const activeEmployees = users.filter((u) => u.isActive).length;
  const inactiveEmployees = totalEmployees - activeEmployees;

  // Department counts for Chart
  const getDepartmentStats = () => {
    const deptMap: { [key: string]: number } = {};
    users.forEach((u) => {
      deptMap[u.department] = (deptMap[u.department] || 0) + 1;
    });
    return Object.entries(deptMap).map(([name, count]) => ({ name, count }));
  };

  const departmentStats = getDepartmentStats();

  // Shift logs totals
  const totalPunches = attendance.length;
  const averageHours = attendance.length > 0
    ? (attendance
        .filter((a) => a.totalHours !== undefined)
        .reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.filter((a) => a.totalHours !== undefined).length).toFixed(1)
    : '0.0';

  // Report Generation Logic
  const handleGenerateReport = () => {
    if (reportType === 'attendance') {
      const records = attendance.map((att) => {
        const emp = users.find((u) => u.id === att.userId);
        return {
          'Employee Name': emp?.name || 'Unknown',
          'Department': emp?.department || 'N/A',
          'Date': att.date,
          'Punch In': att.punchIn ? new Date(att.punchIn).toLocaleTimeString() : 'N/A',
          'Punch Out': att.punchOut ? new Date(att.punchOut).toLocaleTimeString() : 'N/A',
          'Hours Worked': att.totalHours !== undefined ? `${att.totalHours} hrs` : 'N/A',
          'Status': att.status,
        };
      });
      setGeneratedReport(records);
    } else if (reportType === 'leaves') {
      const records = leaves.map((lv) => ({
        'Employee Name': lv.employeeName,
        'Leave Category': lv.type,
        'Start Date': lv.startDate,
        'End Date': lv.endDate,
        'Applied Date': lv.appliedDate,
        'Decision Status': lv.status,
        'Reason': lv.reason,
      }));
      setGeneratedReport(records);
    } else if (reportType === 'holidays') {
      const records = holidays.map((hol) => ({
        'Holiday Name': hol.name,
        'Scheduled Date': hol.date,
        'Holiday Category': hol.type,
      }));
      setGeneratedReport(records);
    }
    setShowReportModal(true);
  };

  const handleCopyReport = () => {
    if (generatedReport.length === 0) return;
    const headers = Object.keys(generatedReport[0]).join('\t');
    const rows = generatedReport.map((row) => Object.values(row).join('\t')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    navigator.clipboard.writeText(csvContent);
    alert('Report data copied to clipboard in tab-separated format! You can easily paste this into Microsoft Excel or Google Sheets.');
  };

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Headcount</span>
            <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{totalEmployees} members</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Accounts</span>
            <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{activeEmployees} active</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Average Shift</span>
            <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{averageHours} hrs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Annual Holidays</span>
            <span className="font-display font-black text-base text-slate-900 leading-none mt-1 block">{holidays.length} holidays</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Department Headcounts Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-full min-h-[350px] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
              <div>
                <h3 className="font-display font-black text-base text-slate-900">Headcount by Department</h3>
                <p className="text-slate-500 font-medium text-xs mt-0.5">Distribution of company employees across divisions</p>
              </div>
              <Building2 className="w-5 h-5 text-indigo-500" />
            </div>

            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#a5b4fc', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Report Generator */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
                <div>
                  <h3 className="font-display font-black text-base text-slate-900">Generate Audit Reports</h3>
                  <p className="text-slate-500 font-medium text-xs mt-0.5">Export structured data for company audits</p>
                </div>
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              </div>

              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Report Category
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer text-slate-700"
                  >
                    <option value="attendance">Daily Attendance Log</option>
                    <option value="leaves">Leave Records Sheet</option>
                    <option value="holidays">Corporate Holiday Schedule</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 font-medium leading-relaxed">
                  Select a category above to assemble historical logs, status flags, and employee credentials compiled dynamically from LocalStorage.
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all text-xs uppercase tracking-wider cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" /> Assemble Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-base uppercase tracking-wider">Report Preview: {reportType}</h3>
                <p className="text-indigo-100 text-xs font-semibold mt-0.5">Showing {generatedReport.length} structured log rows</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCopyReport}
                  className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Copy For Excel
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-white/20 hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Content Table */}
            <div className="p-6 overflow-y-auto flex-1 font-sans">
              {generatedReport.length === 0 ? (
                <p className="text-center text-xs text-slate-400 italic py-8">No records found for this category.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse border border-slate-100">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-800 font-bold text-[9px] tracking-widest uppercase">
                        {Object.keys(generatedReport[0]).map((header) => (
                          <th key={header} className="py-3 px-4 border border-slate-100">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {generatedReport.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/20 font-medium">
                          {Object.values(row).map((val: any, cellIdx) => (
                            <td key={cellIdx} className="py-2.5 px-4 border border-slate-100 font-bold text-slate-700">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
