import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Trash2, 
  Edit3, 
  Video, 
  Home, 
  DollarSign, 
  Pill,
  Save,
  Clock3
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';
import { useAppointments } from '../context/AppointmentContext';

interface AdminAppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReschedule?: (appt: Appointment) => void;
}

export const AdminAppointmentDetailsModal: React.FC<AdminAppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onOpenReschedule,
}) => {
  const { adminUpdateStatus, adminAddClinicalNotes, adminDeleteAppointment } = useAppointments();

  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus>(appointment?.status || 'confirmed');
  const [clinicalNotes, setClinicalNotes] = useState<string>(appointment?.notesFromDoctor || '');
  const [prescriptionIssued, setPrescriptionIssued] = useState<boolean>(appointment?.prescriptionIssued || false);
  const [statusRemark, setStatusRemark] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync state when appointment prop changes
  React.useEffect(() => {
    if (appointment) {
      setCurrentStatus(appointment.status);
      setClinicalNotes(appointment.notesFromDoctor || '');
      setPrescriptionIssued(appointment.prescriptionIssued || false);
      setConfirmDelete(false);
      setSaveSuccessMsg(null);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    setIsUpdatingStatus(true);
    setCurrentStatus(newStatus);
    try {
      await adminUpdateStatus(appointment.id, newStatus, statusRemark || undefined);
      setSaveSuccessMsg(`Status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await adminAddClinicalNotes(appointment.id, clinicalNotes, prescriptionIssued);
      setSaveSuccessMsg('Clinical notes & prescription status saved successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await adminDeleteAppointment(appointment.id);
    onClose();
  };

  const handlePrintPass = () => {
    window.print();
  };

  const getStatusBadge = (st: AppointmentStatus) => {
    switch (st) {
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'rescheduled':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Appointment Record Management</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
                  {appointment.appointmentCode}
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage patient booking status, clinical notes, and schedules</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Quick Status Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Current Booking Status
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(currentStatus)}`}>
                  {currentStatus}
                </span>
                <span className="text-xs text-slate-500">
                  Booked: {new Date(appointment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Change Status Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {currentStatus === 'pending' && (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange('confirmed')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Confirm</span>
                </button>
              )}

              <select
                disabled={isUpdatingStatus}
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as AppointmentStatus)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white shadow-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
              >
                <option value="pending">Mark as Pending</option>
                <option value="confirmed">Mark as Confirmed</option>
                <option value="scheduled">Mark as Scheduled</option>
                <option value="completed">Mark as Completed</option>
                <option value="rescheduled">Mark as Rescheduled</option>
                <option value="cancelled">Mark as Cancelled</option>
              </select>

              {onOpenReschedule && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenReschedule(appointment);
                  }}
                  className="px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock3 className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid Layout: Patient & Doctor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>Patient Information</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-medium capitalize">
                  {appointment.patientGender}, {appointment.patientAge} yrs
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name</span>
                  <p className="font-bold text-slate-900 text-sm">{appointment.patientName}</p>
                </div>
                <div className="grid grid-cols-1 gap-1 pt-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appointment.patientEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appointment.patientPhone}</span>
                  </div>
                </div>

                {appointment.pastMedicalHistory && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Past History / Allergies</span>
                    <p className="text-slate-700 mt-0.5">{appointment.pastMedicalHistory}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor & Schedule Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Consultant & Slot</span>
                </h3>
                <span className="text-xs font-bold text-teal-700">${appointment.consultationFee} Fee</span>
              </div>

              <div className="flex items-start gap-3">
                <img
                  src={appointment.doctorPhotoUrl}
                  alt={appointment.doctorName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{appointment.doctorName}</h4>
                  <p className="text-[11px] text-teal-700 truncate">{appointment.doctorSpecialty}</p>
                  <p className="text-[10px] text-slate-500">{appointment.departmentName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-semibold">{appointment.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-semibold">{appointment.timeSlot}</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                  {appointment.consultationType === 'video_call' ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      <span>Telehealth Online Video Consultation</span>
                    </>
                  ) : appointment.consultationType === 'home_visit' ? (
                    <>
                      <Home className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Home Healthcare Visit</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>In-Person Hospital OPD</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Primary Complaint / Symptoms</span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {appointment.reasonForVisit || 'No specific complaint registered.'}
            </p>
          </div>

          {/* Clinical Doctor Notes & Prescription Toggle */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                <span>Doctor Clinical Notes & Findings</span>
              </h4>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={prescriptionIssued}
                  onChange={(e) => setPrescriptionIssued(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prescription Issued</span>
                </span>
              </label>
            </div>

            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Enter diagnosis, clinical observations, prescribed medications, or follow-up advice..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none font-sans"
            />

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSavingNotes}
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? 'Saving Notes...' : 'Save Clinical Notes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintPass}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print OPD Slip</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                confirmDelete
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmDelete ? 'Confirm Delete Booking' : 'Delete'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
