import React from 'react';
import { Department, Doctor } from '../types';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Building2, 
  Calendar, 
  Stethoscope, 
  ArrowRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { DOCTORS_DATA, HOSPITAL_INFO } from '../data/hospitalData';
import { DoctorCard } from './DoctorCard';

interface DepartmentDetailModalProps {
  department: Department | null;
  onClose: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookWithDoctor: (doctor: Doctor) => void;
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  department,
  onClose,
  onSelectDoctor,
  onBookWithDoctor,
}) => {
  if (!department) return null;

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

  const departmentDoctors = DOCTORS_DATA.filter((d) => d.departmentId === department.id);

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
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh]"
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
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/80 active:bg-slate-900 text-white flex items-center justify-center transition-colors backdrop-blur-xs cursor-pointer shadow-md"
          aria-label="Close department details"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Banner */}
        <div className="relative h-48 sm:h-60 w-full overflow-hidden shrink-0">
          <img 
            src={department.imageUrl} 
            alt={department.name}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
              Center of Clinical Excellence • {department.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {department.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
              {department.tagline}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Department Overview */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Clinical Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {department.description}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-100 w-fit">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Department Head: {department.headOfDepartment}</span>
            </div>
          </div>

          {/* Procedures & Clinical Interventions */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Procedures & Surgical Treatments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {department.procedures.map((proc, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{proc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Medical Technologies */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Key Technology & Infrastructure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {department.technologies.map((tech, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-xs font-medium text-slate-800">
                  <Cpu className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Specialists */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Physicians & Surgeons ({departmentDoctors.length})</h3>
                <p className="text-xs text-slate-700">Specialist faculty available for consultation in this department</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departmentDoctors.map((doc) => (
                <DoctorCard 
                  key={doc.id}
                  doctor={doc}
                  onViewDetails={onSelectDoctor}
                  onBookNow={onBookWithDoctor}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-700 flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
            <span>Direct Desk: {HOSPITAL_INFO.generalInquiry}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Department
          </button>
        </div>
      </div>
    </div>
  );
};
