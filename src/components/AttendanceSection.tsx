import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db';
import { User, AttendanceRecord } from '../types';
import { Clock, Play, Square, MessageSquare, CheckCircle, Calendar, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AttendanceSectionProps {
  user: User;
  onActionComplete: () => void;
}

export default function AttendanceSection({ user, onActionComplete }: AttendanceSectionProps) {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [note, setNote] = useState('');
  const [timeElapsed, setTimeElapsed] = useState('00:00:00');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isWeekend, setIsWeekend] = useState(false);

  // Check if today is a weekend
  useEffect(() => {
    const day = new Date().getDay();
    if (day === 0 || day === 6) {
      setIsWeekend(true);
    }
  }, []);

  const fetchTodayRecord = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const records = dbOperations.getAttendanceForUser(user.id);
    const todayRec = records.find((r) => r.date === todayStr);
    setTodayRecord(todayRec || null);
  };

  useEffect(() => {
    fetchTodayRecord();
  }, [user.id]);

  // Handle active running timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (todayRecord && todayRecord.punchIn && !todayRecord.punchOut) {
      const updateTimer = () => {
        const diffMs = Date.now() - new Date(todayRecord.punchIn).getTime();
        
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num: number) => num.toString().padStart(2, '0');
        setTimeElapsed(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      };

      updateTimer(); // run initially
      intervalId = setInterval(updateTimer, 1000);
    } else if (todayRecord?.punchOut) {
      // Calculate final duration
      const diffMs = new Date(todayRecord.punchOut).getTime() - new Date(todayRecord.punchIn).getTime();
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const pad = (num: number) => num.toString().padStart(2, '0');
      setTimeElapsed(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    } else {
      setTimeElapsed('00:00:00');
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [todayRecord]);

  const handlePunchIn = () => {
    setStatusMsg(null);
    const res = dbOperations.punchIn(user.id, note);
    if (res.success && res.record) {
      setTodayRecord(res.record);
      setNote('');
      setStatusMsg({ type: 'success', text: 'Punched in successfully! Welcome to work.' });
      onActionComplete();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to punch in.' });
    }
  };

  const handlePunchOut = () => {
    setStatusMsg(null);
    const res = dbOperations.punchOut(user.id);
    if (res.success && res.record) {
      setTodayRecord(res.record);
      setStatusMsg({ type: 'success', text: `Punched out successfully! Have a great evening. Work hours: ${res.record.totalHours} hrs` });
      onActionComplete();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to punch out.' });
    }
  };

  const isPunchedIn = todayRecord && !todayRecord.punchOut;
  const isPunchedOut = todayRecord && todayRecord.punchOut;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center gap-6">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-50">
        <div className="text-left">
          <h2 className="font-display font-black text-lg text-slate-900">Attendance Punch</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">Record and monitor your shift attendance</p>
        </div>
        <Clock className={`w-5 h-5 ${isPunchedIn ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
      </div>

      {isWeekend ? (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <p className="font-black text-sm text-slate-800">Weekend Clock-In Restricted</p>
          <p className="text-slate-400 text-xs max-w-xs leading-relaxed font-medium">
            ClockWise restrictions prevent punching in on weekends. Have a restful rest of your weekend!
          </p>
        </div>
      ) : (
        <div className="w-full space-y-6 flex flex-col items-center">
          {/* Status Message */}
          <AnimatePresence>
            {statusMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`w-full p-3 rounded-xl text-xs font-bold flex items-start gap-2 border ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                    : 'bg-rose-50 text-rose-800 border-rose-100'
                }`}
              >
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-left">{statusMsg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Large Live Timer in Circle Style (Matching Design HTML) */}
          <div className={`w-36 h-36 rounded-full border-[6px] flex flex-col items-center justify-center transition-all ${
            isPunchedIn ? 'border-indigo-50 border-t-indigo-500 animate-spin-slow-custom' : 'border-indigo-50'
          }`}>
            <div className="text-center">
              <p className="text-2xl font-black tabular-nums text-slate-900 tracking-tight">{timeElapsed}</p>
              <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-0.5">
                {isPunchedIn ? 'ACTIVE' : (isPunchedOut ? 'LOGGED' : 'STANDBY')}
              </p>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-black text-slate-900">
              {isPunchedIn ? 'You are Punched In' : (isPunchedOut ? 'Shift Logged' : 'Not Punched In')}
            </h3>
            <p className="text-slate-500 text-xs font-medium mt-1">
              {isPunchedIn ? 'Shift duration auto-calculating' : (isPunchedOut ? 'Good job completing today\'s shift!' : 'Your shift starts at 9:00 AM')}
            </p>
          </div>

          {/* Form Control */}
          {!todayRecord && (
            <div className="w-full space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Memo / Check-in Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Regular office shift, working on task #42"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />
              </div>

              <button
                onClick={handlePunchIn}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] cursor-pointer"
              >
                PUNCH IN
              </button>
            </div>
          )}

          {isPunchedIn && (
            <div className="w-full space-y-4">
              <div className="p-3.5 bg-indigo-50/50 rounded-2xl text-xs font-bold text-indigo-900 flex items-center justify-between border border-indigo-100/50">
                <span>PUNCHED IN AT:</span>
                <span className="font-mono">{new Date(todayRecord.punchIn).toLocaleTimeString()}</span>
              </div>

              <button
                onClick={handlePunchOut}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-base shadow-xl shadow-slate-200 transition-all active:scale-[0.98] cursor-pointer"
              >
                PUNCH OUT
              </button>
            </div>
          )}

          {isPunchedOut && (
            <div className="w-full space-y-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-left">
              <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Today's Attendance Summary</h3>
              <div className="grid grid-cols-2 gap-3 mt-2 text-xs text-slate-600">
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-wider">Punch In:</span>
                  <span className="font-mono font-bold text-slate-800">{new Date(todayRecord.punchIn).toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-wider">Punch Out:</span>
                  <span className="font-mono font-bold text-slate-800">{new Date(todayRecord.punchOut).toLocaleTimeString()}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-emerald-100/60">
                  <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-wider">Total Duration:</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">{todayRecord.totalHours} hours</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
