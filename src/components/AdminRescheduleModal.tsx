import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Clock3,
  User,
  Stethoscope
} from 'lucide-react';
import { Appointment } from '../types';
import { useAppointments } from '../context/AppointmentContext';
import { DOCTORS_DATA } from '../data/hospitalData';

interface AdminRescheduleModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminRescheduleModal: React.FC<AdminRescheduleModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { adminReschedule } = useAppointments();

  const [newDate, setNewDate] = useState<string>(() => {
    if (appointment?.date) return appointment.date;
    return new Date().toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState<string>(appointment?.timeSlot || '10:00 AM');
  const [reason, setReason] = useState<string>('Patient requested schedule adjustment');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (appointment) {
      setNewDate(appointment.date);
      setNewTime(appointment.timeSlot);
      setReason('');
      setErrorMsg(null);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const doctor = DOCTORS_DATA.find((d) => d.id === appointment.doctorId);
  const availableSlots = doctor?.availableSlots || [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:30 PM', '04:30 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      setErrorMsg('Please choose a valid new date.');
      return;
    }
    if (!newTime) {
      setErrorMsg('Please choose a valid time slot.');
      return;
    }

    setLoading(true);
    try {
      await adminReschedule(appointment.id, newDate, newTime, reason);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reschedule appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Clock3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Reschedule Appointment</h3>
              <p className="text-xs text-slate-400">Ref: {appointment.appointmentCode}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Booking Overview */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Patient:</span>
              <strong className="text-slate-900 font-bold">{appointment.patientName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Doctor:</span>
              <span className="text-slate-800 font-semibold">{appointment.doctorName} ({appointment.doctorSpecialty})</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-500">
              <span>Current Schedule:</span>
              <span className="font-mono font-bold text-slate-700">{appointment.date} at {appointment.timeSlot}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select New Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select New Time Slot
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              >
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reschedule Reason / Administrative Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Doctor emergency surgery shift, Patient requested morning slot"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
