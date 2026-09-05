import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  Printer, 
  Share2, 
  User, 
  Video, 
  Building2, 
  X, 
  ArrowRight,
  ShieldCheck,
  Clock3,
  AlertCircle
} from 'lucide-react';
import { Appointment } from '../types';
import { HOSPITAL_INFO } from '../data/hospitalData';

interface AppointmentSuccessModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onGoToPortal: () => void;
}

export const AppointmentSuccessModal: React.FC<AppointmentSuccessModalProps> = ({
  appointment,
  onClose,
  onGoToPortal,
}) => {
  if (!appointment) return null;

  const isPending = appointment.status === 'pending';

  // Keyboard Escape listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCalendar = () => {
    // Generate simple .ics calendar file
    const startDateFormatted = appointment.date.replace(/-/g, '') + 'T100000Z';
    const endDateFormatted = appointment.date.replace(/-/g, '') + 'T110000Z';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GrowTogether Hospitals//Medical Appointment//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Medical Consultation with ${appointment.doctorName}`,
      `DESCRIPTION:GrowTogether Hospitals Appointment Token: ${appointment.appointmentCode}. Specialty: ${appointment.doctorSpecialty}. Status: ${isPending ? 'Pending Confirmation' : 'Confirmed'}. Reason: ${appointment.reasonForVisit}`,
      `LOCATION:${HOSPITAL_INFO.name}, ${HOSPITAL_INFO.address}`,
      `DTSTART:${startDateFormatted}`,
      `DTEND:${endDateFormatted}`,
      `STATUS:${isPending ? 'TENTATIVE' : 'CONFIRMED'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${appointment.appointmentCode}-Appointment.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          aria-label="Close appointment confirmation"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Pass Container */}
        <div id="printable-appointment" className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            {isPending ? (
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs animate-bounce-subtle">
                <Clock3 className="w-9 h-9" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-xs animate-bounce-subtle">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            )}
            
            <div className="flex items-center justify-center gap-1.5">
              <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                isPending ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
              }`}>
                {isPending ? 'Request Submitted • Pending Confirmation' : 'Appointment Confirmed'}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              GrowTogether Digital Hospital Pass
            </h3>
            <p className="text-xs text-slate-700 max-w-sm mx-auto">
              {isPending 
                ? 'Your appointment request has been submitted to the hospital management system. Status is currently pending approval by hospital staff & OPD desk.'
                : 'Your appointment has been registered in the hospital management system. Please present this token code at the OPD reception.'}
            </p>
          </div>

          {/* Digital Boarding Pass Ticket */}
          <div className={`rounded-2xl border-2 border-dashed p-5 space-y-4 relative ${
            isPending ? 'border-amber-200 bg-amber-50/30' : 'border-teal-200 bg-teal-50/40'
          }`}>
            {/* Token Badge */}
            <div className={`flex items-center justify-between border-b pb-3 ${
              isPending ? 'border-amber-200/80' : 'border-teal-200/80'
            }`}>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-700">Token ID</div>
                <div className={`text-lg font-mono font-extrabold tracking-wider ${
                  isPending ? 'text-amber-900' : 'text-teal-800'
                }`}>
                  {appointment.appointmentCode}
                </div>
              </div>
              <div className="text-right">
                {isPending ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-500 text-white shadow-2xs">
                    <Clock3 className="w-3 h-3" />
                    Status: Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-600 text-white shadow-2xs">
                    <ShieldCheck className="w-3 h-3" />
                    Verified & Confirmed
                  </span>
                )}
              </div>
            </div>

            {/* Doctor & Patient Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-700 text-[11px] block">Physician</span>
                <strong className="text-slate-900 font-bold block text-sm">{appointment.doctorName}</strong>
                <span className="text-teal-700 text-[11px] font-medium">{appointment.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-700 text-[11px] block">Patient Name</span>
                <strong className="text-slate-900 font-bold block text-sm">{appointment.patientName}</strong>
                <span className="text-slate-700 text-[11px]">{appointment.patientGender}, {appointment.patientAge} yrs</span>
              </div>
            </div>

            {/* Date, Time & Format */}
            <div className={`grid grid-cols-2 gap-4 text-xs pt-2 border-t ${
              isPending ? 'border-amber-200/80' : 'border-teal-200/80'
            }`}>
              <div className="flex items-center gap-2 text-slate-800">
                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Date: <strong className="text-slate-950">{appointment.date}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Time: <strong className="text-slate-950">{appointment.timeSlot}</strong></span>
              </div>
            </div>

            <div className={`flex items-center justify-between text-xs pt-2 border-t text-slate-700 ${
              isPending ? 'border-amber-200/80' : 'border-teal-200/80'
            }`}>
              <div className="flex items-center gap-1.5">
                {appointment.consultationType === 'in_person' ? (
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                ) : (
                  <Video className="w-3.5 h-3.5 text-teal-600" />
                )}
                <span className="capitalize">{appointment.consultationType.replace('_', ' ')} Consultation</span>
              </div>
              <div className="font-bold text-slate-900">
                Fee: ${appointment.consultationFee}
              </div>
            </div>

            {/* Payment Info Row */}
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-slate-500">Payment:</span>
                <span className="capitalize font-bold text-slate-900">
                  {appointment.paymentMethod ? appointment.paymentMethod.replace('_', ' ') : 'Online Card'}
                  {appointment.paymentTransactionId && ` (${appointment.paymentTransactionId})`}
                </span>
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  appointment.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {appointment.paymentStatus || 'Paid'}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode / QR Simulation */}
          <div className="text-center space-y-1">
            <div className="h-9 w-48 mx-auto bg-slate-900 rounded-xs flex items-center justify-around px-2">
              <div className="w-1.5 h-7 bg-white"></div>
              <div className="w-0.5 h-7 bg-white"></div>
              <div className="w-2 h-7 bg-white"></div>
              <div className="w-1 h-7 bg-white"></div>
              <div className="w-0.5 h-7 bg-white"></div>
              <div className="w-2.5 h-7 bg-white"></div>
              <div className="w-1 h-7 bg-white"></div>
              <div className="w-1.5 h-7 bg-white"></div>
            </div>
            <div className="text-[10px] text-slate-600 font-mono">
              {isPending ? 'PRESENT TOKEN AT OPD DESK FOR CONFIRMATION' : 'SCAN UPON CHECK-IN AT RECEPTION'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-teal-600" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={handleDownloadCalendar}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Add to Calendar</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onGoToPortal();
            }}
            className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>View in Patient Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
