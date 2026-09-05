import React from 'react';
import { 
  HeartPulse, 
  PhoneCall, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Award, 
  ExternalLink,
  ChevronRight,
  Ambulance,
  Calendar
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { PageView } from '../types';
import { useAppointments } from '../context/AppointmentContext';

interface FooterProps {
  onNavigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { hospitalInfo } = useHospitalData();
  const { setIsBookingModalOpen } = useAppointments();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Banner: Emergency & Direct Action */}
      <div className="bg-gradient-to-r from-teal-900/60 to-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Ambulance className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">24/7 Rapid Emergency Response</div>
              <div className="text-2xl font-bold text-white tracking-tight">{hospitalInfo.emergencyPhone}</div>
              <p className="text-xs text-slate-400">Immediate dispatch • Trauma resuscitation • Level-1 Critical Care</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all shadow-md active:scale-98"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Online</span>
            </button>
            <button
              onClick={() => onNavigate('portal')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition-all"
            >
              <span>Patient Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">{hospitalInfo.name}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {hospitalInfo.aboutSummary || 'A premier multi-specialty healthcare institution dedicated to patient-centric healing, advanced robotic surgery, precision diagnostics, and world-class clinical excellence.'}
            </p>
            
            {/* Accreditation Badges */}
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Accreditations & Certifications</div>
              <div className="flex flex-wrap gap-2">
                {hospitalInfo.accreditations.map((acc, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800/90 text-teal-300 border border-slate-700">
                    <ShieldCheck className="w-3 h-3 text-teal-400" />
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>About {hospitalInfo.name}</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('departments')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Clinical Departments</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Our Specialists Directory</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('portal')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span>Patient Portal Dashboard</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5 cursor-pointer text-teal-300 font-semibold">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500" />
                  <span>Admin & Doctor Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Top Clinical Departments */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Specialties</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => onNavigate('departments')} className="hover:text-teal-400 transition-colors">Cardiology & Heart Care</button></li>
              <li><button onClick={() => onNavigate('departments')} className="hover:text-teal-400 transition-colors">Robotic Joint Replacement</button></li>
              <li><button onClick={() => onNavigate('departments')} className="hover:text-teal-400 transition-colors">Neurosurgery & Stroke Unit</button></li>
              <li><button onClick={() => onNavigate('departments')} className="hover:text-teal-400 transition-colors">Pediatric & Neonatal ICU</button></li>
              <li><button onClick={() => onNavigate('departments')} className="hover:text-teal-400 transition-colors">Comprehensive Cancer Care</button></li>
              <li><button onClick={() => onNavigate('departments')} className="hover:text-teal-400 transition-colors">Maternity & Women’s Health</button></li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Hospital Campus</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{hospitalInfo.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                <span>General: {hospitalInfo.generalInquiry}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{hospitalInfo.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>OPD: 8:00 AM – 8:00 PM (Emergency 24/7)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {hospitalInfo.name}. All rights reserved. Registered Healthcare Provider.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Patient Bill of Rights</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Clinical Ethics</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Emergency Triage Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

