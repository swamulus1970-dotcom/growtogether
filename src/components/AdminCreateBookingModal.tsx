import React, { useState, useEffect } from 'react';
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
  DollarSign, 
  AlertCircle,
  Video,
  Home,
  Plus
} from 'lucide-react';
import { DOCTORS_DATA, DEPARTMENTS_DATA } from '../data/hospitalData';
import { Doctor, ConsultationType, Appointment, AppointmentStatus } from '../types';
import { useAppointments } from '../context/AppointmentContext';

interface AdminCreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newAppt: Appointment) => void;
}

export const AdminCreateBookingModal: React.FC<AdminCreateBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { adminCreateBooking } = useAppointments();

  // Form State
  const [selectedDeptId, setSelectedDeptId] = useState<string>('cardiology');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-cardio-1');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(35);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('female');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM');
  const [consultationType, setConsultationType] = useState<ConsultationType>('in_person');
  const [consultationFee, setConsultationFee] = useState<number>(150);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');
  const [notesFromDoctor, setNotesFromDoctor] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('confirmed');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available doctors for selected department
  const filteredDoctors = DOCTORS_DATA.filter((d) => d.departmentId === selectedDeptId);
  const currentDoctor = DOCTORS_DATA.find((d) => d.id === selectedDoctorId) || filteredDoctors[0];

  // Auto-sync doctor when department changes
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      if (!filteredDoctors.some((d) => d.id === selectedDoctorId)) {
        const firstDoc = filteredDoctors[0];
        setSelectedDoctorId(firstDoc.id);
        setConsultationFee(firstDoc.consultationFee);
        if (firstDoc.availableSlots.length > 0) {
          setTimeSlot(firstDoc.availableSlots[0]);
        }
      }
    }
  }, [selectedDeptId]);

  // Update fee and slots when doctor changes
  useEffect(() => {
    if (currentDoctor) {
      setConsultationFee(currentDoctor.consultationFee);
      if (currentDoctor.availableSlots.length > 0 && !currentDoctor.availableSlots.includes(timeSlot)) {
        setTimeSlot(currentDoctor.availableSlots[0]);
      }
    }
  }, [selectedDoctorId]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!patientName.trim()) {
      setErrorMsg('Patient full name is required.');
      return;
    }
    if (!patientEmail.trim() || !patientEmail.includes('@')) {
      setErrorMsg('A valid patient email address is required.');
      return;
    }
    if (!patientPhone.trim()) {
      setErrorMsg('Patient contact phone number is required.');
      return;
    }
    if (!currentDoctor) {
      setErrorMsg('Please select an active physician.');
      return;
    }

    setLoading(true);
    try {
      const selectedDept = DEPARTMENTS_DATA.find((d) => d.id === selectedDeptId) || DEPARTMENTS_DATA[0];
      
      const newAppt = await adminCreateBooking({
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: Number(patientAge) || 30,
        patientGender,
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        doctorSpecialty: currentDoctor.specialty,
        doctorPhotoUrl: currentDoctor.photoUrl,
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        date,
        timeSlot,
        consultationType,
        consultationFee: Number(consultationFee) || currentDoctor.consultationFee,
        reasonForVisit: reasonForVisit.trim() || 'General OPD consultation request',
        pastMedicalHistory: pastMedicalHistory.trim() || undefined,
        notesFromDoctor: notesFromDoctor.trim() || undefined,
        status,
      });

      if (onSuccess) {
        onSuccess(newAppt);
      }
      onClose();
    } catch (err: any) {
      console.error('Error creating admin booking:', err);
      setErrorMsg(err.message || 'Failed to register appointment. Please check values.');
    } finally {
      setLoading(false);
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
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Admin Desk: New OPD Booking</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  RECEPTION DESK
                </span>
              </div>
              <p className="text-xs text-slate-400">Create walk-in, telephone, or priority appointments</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Patient Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <span>1. Patient Details</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">* Required for EHR sync</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Department & Doctor Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>2. Department & Consultant</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                >
                  {DEPARTMENTS_DATA.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.doctorCount} Doctors)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Consultant Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                >
                  {filteredDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} (${doc.consultationFee})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor Preview Badge */}
            {currentDoctor && (
              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center gap-3">
                <img
                  src={currentDoctor.photoUrl}
                  alt={currentDoctor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-teal-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{currentDoctor.name}</h4>
                  <p className="text-[11px] text-teal-700 truncate">{currentDoctor.title}</p>
                  <p className="text-[10px] text-slate-500">Room: {currentDoctor.roomNumber} • Rating: ⭐ {currentDoctor.rating}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">${currentDoctor.consultationFee}</span>
                  <p className="text-[10px] text-slate-500">OPD Standard</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Date, Time Slot, Mode & Fee */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>3. Schedule, Mode & Billing</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                >
                  {(currentDoctor?.availableSlots || [
                    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
                    '11:30 AM', '02:00 PM', '02:30 PM', '03:30 PM', '04:30 PM'
                  ]).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Fee ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={0}
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Mode selection buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Consultation Type
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setConsultationType('in_person')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    consultationType === 'in_person'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>In-Person OPD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType('video_call')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    consultationType === 'video_call'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Telehealth Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType('home_visit')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    consultationType === 'home_visit'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home Visit</span>
                </button>
              </div>
            </div>

            {/* Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Booking Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white font-medium"
                >
                  <option value="pending">Pending (Awaiting Verification & Confirmation)</option>
                  <option value="confirmed">Confirmed (Scheduled & Confirmed)</option>
                  <option value="scheduled">Scheduled (Calendar Reserved)</option>
                  <option value="completed">Completed (Already Consulted)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reception / Desk Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notesFromDoctor}
                  onChange={(e) => setNotesFromDoctor(e.target.value)}
                  placeholder="e.g. VIP patient, insurance pre-approved"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Clinical Complaint & Past Medical History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>4. Reason For Visit & Medical History</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Symptoms / Reason for Visit
                </label>
                <textarea
                  rows={2}
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  placeholder="e.g. Follow-up for chest tightness, second opinion on ECG report"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Past Medical History / Known Allergies
                </label>
                <textarea
                  rows={2}
                  value={pastMedicalHistory}
                  onChange={(e) => setPastMedicalHistory(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Penicillin allergy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>Estimated Fee: </span>
            <strong className="text-slate-900 font-bold">${consultationFee}</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Booking...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Register Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
