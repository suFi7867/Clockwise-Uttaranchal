import React, { useState } from 'react';
import { dbOperations } from '../db';
import { User, UserRole } from '../types';
import { LogIn, UserPlus, Key, Mail, User as UserIcon, Briefcase, Award } from 'lucide-react';

interface LoginRegisterProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginRegister({ onLoginSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // Register Fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    const user = dbOperations.loginUser(email.trim());
    if (user) {
      onLoginSuccess(user);
    } else {
      setError('No active user found with this email. Note: Use quick login buttons below or register.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !regEmail.trim() || !designation.trim()) {
      setError('All fields are required.');
      return;
    }

    const registered = dbOperations.registerUser(
      name,
      regEmail,
      role,
      department,
      designation
    );

    if (registered) {
      onLoginSuccess(registered);
    } else {
      setError('An account with this email already exists.');
    }
  };

  const quickLogins = [
    { email: 'employee@clockwise.com', label: 'Employee (Alex)', bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { email: 'manager@clockwise.com', label: 'Manager (Sarah)', bg: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
    { email: 'sufiyan.shaikh.developer@gmail.com', label: 'Admin (Sufiyan)', bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl mb-4 shadow-lg">
            <span className="font-display font-black text-2xl text-indigo-600">CW</span>
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight">ClockWise</h1>
          <p className="text-indigo-100/80 text-sm mt-1">Attendance & Leave Management System</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-4 text-center text-sm font-semibold transition-colors duration-200 border-b-2 ${
              isLogin ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-4 text-center text-sm font-semibold transition-colors duration-200 border-b-2 ${
              !isLogin ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {error && (
            <div className="p-3 mb-4 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>

              <div className="relative my-6 text-center">
                <hr className="border-slate-100" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Quick Testing Accounts
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {quickLogins.map((ql) => (
                  <button
                    key={ql.email}
                    type="button"
                    onClick={() => {
                      setEmail(ql.email);
                      const user = dbOperations.loginUser(ql.email);
                      if (user) onLoginSuccess(user);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-left transition-all flex items-center justify-between border border-transparent hover:border-slate-200 ${ql.bg}`}
                  >
                    <span>{ql.label}</span>
                    <span className="font-mono text-[10px] opacity-80">{ql.email}</span>
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Alex Carter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="alex@clockwise.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all cursor-pointer"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="HR & Operations">HR & Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Designation / Title
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Senior Software Engineer"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer mt-2 active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4" /> Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
