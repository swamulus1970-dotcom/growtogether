import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Award, 
  Users, 
  HeartHandshake, 
  Activity, 
  CheckCircle2, 
  Cpu, 
  Clock, 
  Globe, 
  Calendar, 
  ArrowRight,
  Stethoscope,
  Microscope
} from 'lucide-react';
import { PageView } from '../types';
import { useAppointments } from '../context/AppointmentContext';
import { useHospitalData } from '../context/HospitalDataContext';

interface AboutPageProps {
  onNavigate: (page: PageView) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { setIsBookingModalOpen } = useAppointments();
  const { hospitalInfo } = useHospitalData();


  const values = [
    {
      title: 'Patient-First Compassion',
      desc: 'Every medical decision is centered on patient dignity, comfort, and informed consent.',
      icon: HeartHandshake,
    },
    {
      title: 'Evidence-Based Excellence',
      desc: 'Treatments backed by international clinical guidelines and continuous peer-reviewed research.',
      icon: ShieldCheck,
    },
    {
      title: 'Robotic & Precision Tech',
      desc: 'Harnessing MAKO robotic surgery and AI-guided diagnostics for faster recovery times.',
      icon: Cpu,
    },
    {
      title: 'Transparent Healthcare',
      desc: 'Clear clinical pathways, zero hidden consultation or procedure costs, and complete digital record access.',
      icon: Activity,
    },
  ];

  const milestones = [
    { year: '1998', title: 'Foundation', desc: 'Established as a 150-bed multi-specialty community hospital in Metro City.' },
    { year: '2008', title: 'JCI Accreditation', desc: 'Earned gold-standard Joint Commission International global accreditation.' },
    { year: '2016', title: 'Robotic Surgery Wing', desc: 'Inaugurated dedicated MAKO & Da Vinci robotic surgical suites.' },
    { year: '2022', title: 'Smart CCU & Neuro-ICU', desc: 'Expanded to 750 beds with AI-connected ICU telemetry and ECMO units.' },
    { year: '2026', title: 'Genomics & Precision Oncology', desc: 'Launched cellular immunotherapy and next-generation DNA sequencing laboratory.' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-teal-50/70 to-slate-50 py-12 sm:py-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
            About GrowTogether Hospitals
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Leading the Future of <br className="hidden sm:block" />
            <span className="text-teal-700">Compassionate Healthcare</span>
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Since 1998, GrowTogether Hospitals has stood as a beacon of clinical precision, technological innovation, and patient-centered healing.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Our Mission</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To deliver world-class medical outcomes and personalized patient care with unyielding integrity, clinical empathy, and affordability for every community we serve.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 pt-4 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Zero-compromise clinical quality and patient safety</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Transparent and ethical medical practices</span>
              </li>
            </ul>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Our Vision</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                To be the most trusted global healthcare institution recognized for transformative robotic surgery, preventive health education, and medical research breakthroughs.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Empowering patients through proactive health portals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Nurturing next-generation surgical and clinical leaders</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Guiding Principles</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The Pillars of GrowTogether
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{v.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* State of the art facilities & stats */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              World-Class Infrastructure
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Advanced Clinical Facilities
            </h2>
            <p className="text-sm text-slate-400">
              Designed for infection-free surgical environments, rapid recovery, and patient serenity.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-400">{hospitalInfo.bedCapacity}</div>
              <div className="text-xs text-slate-300 font-medium">In-Patient Bed Capacity</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-400">{hospitalInfo.icuBeds}</div>
              <div className="text-xs text-slate-300 font-medium">ICU & CCU Critical Beds</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-400">{hospitalInfo.operatingTheatres}</div>
              <div className="text-xs text-slate-300 font-medium">Laminar Flow Modular OTs</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-400">{hospitalInfo.roboticSurgerySuites}</div>
              <div className="text-xs text-slate-300 font-medium">Robotic Surgical Suites</div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Milestones Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Our Journey</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            28 Years of Healing Milestones
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {milestones.map((m, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 relative">
              <span className="text-xl font-extrabold text-teal-700 font-mono">{m.year}</span>
              <h3 className="font-bold text-slate-900 text-sm">{m.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-teal-50 border border-teal-200 max-w-3xl mx-auto space-y-4">
          <h3 className="text-2xl font-extrabold text-slate-900">Experience Patient-First Care Today</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Book an appointment with one of our department heads or consult with our emergency team anytime.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Book Appointment
            </button>
            <button
              onClick={() => onNavigate('doctors')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 transition-all"
            >
              View Specialists Directory
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
