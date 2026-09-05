import React, { useState } from 'react';
import { Doctor } from '../types';
import { 
  X, 
  Star, 
  Award, 
  Calendar, 
  Video, 
  MapPin, 
  Clock, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  Globe, 
  Building2,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onSelectSlotAndBook?: (doctor: Doctor, selectedDate: string, selectedSlot: string) => void;
  onBookDoctor?: (doctor: Doctor) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({ 
  doctor, 
  onClose, 
  onSelectSlotAndBook,
  onBookDoctor,
}) => {
  if (!doctor) return null;

  // Selected date & slot within modal
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const [chosenDate, setChosenDate] = useState<string>(today);
  const [chosenSlot, setChosenSlot] = useState<string>(doctor.availableSlots[0] || '10:00 AM');

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

  const dateOptions = [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: tomorrow },
    { label: 'Next Day', date: dayAfter },
  ];

  const handleProceedBooking = () => {
    if (onSelectSlotAndBook) {
      onSelectSlotAndBook(doctor, chosenDate, chosenSlot);
    } else if (onBookDoctor) {
      onBookDoctor(doctor);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh]"
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
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 active:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          aria-label="Close doctor profile modal"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Doctor Header Banner */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative w-28 h-36 sm:w-36 sm:h-44 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm">
              <img 
                src={doctor.photoUrl} 
                alt={doctor.name} 
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                {doctor.experienceYears}+ Yrs Exp
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {doctor.departmentName}
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{doctor.rating.toFixed(2)}</span>
                  <span className="text-slate-600 font-normal text-xs">({doctor.reviewCount} verified reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {doctor.name}
              </h2>

              <p className="text-sm font-semibold text-teal-800">
                {doctor.title}
              </p>

              <p className="text-xs text-slate-700">
                {doctor.degrees.join(' • ')}
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>{doctor.roomNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>Languages: {doctor.languages.join(', ')}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Days: {doctor.availabilityDays.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div>
              <div className="text-xs text-slate-700 font-medium">Consultation Fee</div>
              <div className="text-lg font-extrabold text-slate-900">${doctor.consultationFee}</div>
            </div>
            <div className="border-x border-slate-200">
              <div className="text-xs text-slate-700 font-medium">Patient Trust</div>
              <div className="text-lg font-extrabold text-teal-700">{Math.round(doctor.rating * 20)}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-700 font-medium">Tele-Health</div>
              <div className="text-lg font-extrabold text-slate-900">{doctor.telehealthAvailable ? 'Supported' : 'In-Person Only'}</div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">About the Physician</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{doctor.bio}</p>
          </div>

          {/* Clinical Specializations */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Clinical Focus Areas</h4>
            <div className="flex flex-wrap gap-2">
              {doctor.specializations.map((spec, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-900 text-xs font-semibold border border-teal-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Fellowships */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Education & Training</h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {doctor.education.map((edu, i) => (
                <li key={i} className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Awards & Honors */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Awards & Distinctions</h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {doctor.awards.map((award, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{award}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Fast Slot Selection Box */}
          <div className="p-5 bg-gradient-to-br from-teal-50/70 to-slate-50 rounded-2xl border border-teal-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">Direct Slot Booking</h4>
                <p className="text-xs text-slate-700">Select date and preferred consultation time</p>
              </div>
              <span className="text-xs font-semibold text-teal-700 bg-white px-2.5 py-1 rounded-full border border-teal-200">
                Instant Confirmation
              </span>
            </div>

            {/* Date Selector */}
            <div className="flex gap-2">
              {dateOptions.map((opt) => (
                <button
                  key={opt.date}
                  type="button"
                  onClick={() => setChosenDate(opt.date)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    chosenDate === opt.date
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[10px] opacity-80">{opt.label}</div>
                  <div>{new Date(opt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </button>
              ))}
            </div>

            {/* Time Slot Chips */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">Available Slots ({chosenDate}):</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {doctor.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setChosenSlot(slot)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center border transition-all ${
                      chosenSlot === slot
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-700">
            <span>Selected: </span>
            <strong className="text-slate-900 font-semibold">{chosenDate} at {chosenSlot}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProceedBooking}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Proceed to Book (${doctor.consultationFee})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
