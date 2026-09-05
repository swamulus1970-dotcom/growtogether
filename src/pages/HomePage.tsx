import React from 'react';
import { 
  HeartPulse, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Award, 
  PhoneCall, 
  ArrowRight, 
  Star, 
  Users, 
  Activity, 
  Stethoscope, 
  Video, 
  Sparkles,
  CheckCircle2,
  Ambulance,
  Microscope,
  Building2
} from 'lucide-react';
import { HEALTH_PACKAGES, TESTIMONIALS_DATA } from '../data/hospitalData';
import { Department, Doctor, PageView } from '../types';
import { DoctorCard } from '../components/DoctorCard';
import { useAppointments } from '../context/AppointmentContext';
import { useHospitalData } from '../context/HospitalDataContext';

interface HomePageProps {
  onNavigate: (page: PageView) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectDepartment: (dept: Department) => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectDoctor,
  onSelectDepartment,
  onBookDoctor,
}) => {
  const { setIsBookingModalOpen } = useAppointments();
  const { hospitalInfo, doctors, departments } = useHospitalData();

  // Featured doctors (chief of departments)
  const featuredDoctors = doctors.slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-slate-50 to-white pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Emergency / Accreditation Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 text-teal-800 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                <span>JCI & NABH Gold Accredited Multi-Specialty Hospital</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                {hospitalInfo.heroHeadline || 'Compassionate Care, Advanced Medicine'}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {hospitalInfo.heroSubheadline || `At ${hospitalInfo.name}, we bring together world-renowned medical faculty, cutting-edge robotic surgery, 24/7 emergency trauma care, and patient-first healing.`}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  id="hero-book-appointment-btn"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-6 sm:px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Doctor Appointment</span>
                </button>

                <button
                  id="hero-find-specialist-btn"
                  onClick={() => onNavigate('doctors')}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Find a Specialist</span>
                  <ArrowRight className="w-4 h-4 text-teal-600" />
                </button>

                <button
                  onClick={() => onNavigate('portal')}
                  className="px-4 py-3.5 rounded-2xl text-teal-700 hover:bg-teal-50 font-semibold text-sm transition-colors flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4" />
                  <span>Patient Portal</span>
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{hospitalInfo.patientsTreatedAnnual}</div>
                  <div className="text-xs text-slate-700 font-medium">Patients Treated</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">{hospitalInfo.satisfactionRate}</div>
                  <div className="text-xs text-slate-700 font-medium">Patient Satisfaction</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">24/7</div>
                  <div className="text-xs text-slate-700 font-medium">Emergency Care</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80" 
                  alt={`${hospitalInfo.name} Interior`}
                  className="w-full h-[400px] sm:h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Level 1 Trauma Center</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Robotic Surgery & Precision Diagnostics</h3>
                  <p className="text-xs text-slate-200 mt-0.5">Equipped with MAKO Robotic Joint Replacement & 3T intraoperative MRI</p>
                </div>
              </div>

              {/* Floating Emergency Badge */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3.5 max-w-xs">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-rose-600">Emergency Helpline</div>
                  <a href={`tel:${hospitalInfo.emergencyPhone}`} className="text-sm font-extrabold text-slate-900 hover:text-rose-600 transition-colors">
                    {hospitalInfo.emergencyPhone}
                  </a>
                  <div className="text-[11px] text-slate-700">Immediate ER Triage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SERVICES & EMERGENCY ACTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setIsBookingModalOpen(true)}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors">Book OPD Visit</h3>
            <p className="text-xs text-slate-700">Schedule in-person or video consultation with leading specialists.</p>
          </div>

          <div 
            onClick={() => onNavigate('doctors')}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-cyan-700 transition-colors">Find a Doctor</h3>
            <p className="text-xs text-slate-700">Explore credentialed physicians across {departments.length} departments.</p>
          </div>

          <div 
            onClick={() => onNavigate('portal')}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-slate-900 transition-colors">Patient Portal</h3>
            <p className="text-xs text-slate-700">Access medical records, prescriptions, test reports, and track vitals.</p>
          </div>

          <div 
            className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 text-slate-900 space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center">
              <Ambulance className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="font-bold text-rose-950 text-base">24/7 Ambulance</h3>
            <p className="text-xs text-rose-800 font-medium">Call <a href={`tel:${hospitalInfo.ambulancePhone}`} className="font-bold underline">{hospitalInfo.ambulancePhone}</a> for rapid response.</p>
          </div>
        </div>
      </section>

      {/* CLINICAL DEPARTMENTS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Centers of Clinical Excellence
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Multi-Specialty Care Under One Roof
            </h2>
            <p className="text-sm text-slate-700 mt-1 max-w-xl">
              Each department is staffed by dedicated senior consultants, multidisciplinary tumor boards, and advanced diagnostics.
            </p>
          </div>
          <button
            onClick={() => onNavigate('departments')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>View All {departments.length} Departments</span>
            <ArrowRight className="w-4 h-4 text-teal-600" />
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.slice(0, 4).map((dept) => (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment(dept)}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-teal-300 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
            >
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img 
                  src={dept.imageUrl} 
                  alt={dept.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-[11px] font-semibold backdrop-blur-xs">
                  {dept.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-700 line-clamp-2 mt-1">
                    {dept.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold text-teal-800">{dept.doctorCount} Doctors</span>
                  <span className="font-semibold text-slate-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Explore <ArrowRight className="w-3 h-3 text-teal-600" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED SPECIALIST DOCTORS */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                World-Class Physicians
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Meet Our Department Heads & Specialists
              </h2>
              <p className="text-sm text-slate-700 mt-1 max-w-xl">
                Board-certified physicians trained at world-leading medical institutions, offering compassionate evidence-based care.
              </p>
            </div>
            <button
              onClick={() => onNavigate('doctors')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Explore All Doctors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc) => (
              <DoctorCard 
                key={doc.id}
                doctor={doc}
                onViewDetails={onSelectDoctor}
                onBookNow={onBookDoctor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PREVENTIVE HEALTH CHECKUP PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Preventive Diagnostics
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Health Packages
          </h2>
          <p className="text-sm text-slate-700">
            Early detection saves lives. Book an all-inclusive health check with same-day lab reports and specialist consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HEALTH_PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              className={`rounded-2xl bg-white border p-6 flex flex-col justify-between relative transition-all duration-300 hover:shadow-lg ${
                pkg.popular 
                  ? 'border-teal-500 shadow-md ring-1 ring-teal-500/30' 
                  : 'border-slate-200'
              }`}
            >
              {pkg.badge && (
                <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                  {pkg.badge}
                </span>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{pkg.title}</h3>
                  <p className="text-xs text-slate-700 mt-1">{pkg.tagline}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">${pkg.discountedPrice}</span>
                    <span className="text-xs text-slate-600 line-through">${pkg.originalPrice}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-teal-700">{pkg.testsCount} Lab & Diagnostic Parameters</span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  {pkg.includedTests.slice(0, 4).map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    pkg.popular
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Book Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PATIENT TESTIMONIALS */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Real Patient Stories
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Healing Journeys at GrowTogether
            </h2>
            <p className="text-sm text-slate-400">
              Read how our clinical teams transform lives every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS_DATA.map((t) => (
              <div 
                key={t.id}
                className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/80 flex items-center gap-3">
                  <img 
                    src={t.avatarUrl} 
                    alt={t.patientName}
                    className="w-10 h-10 rounded-full object-cover border border-teal-400/30 shrink-0" 
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs truncate">{t.patientName} ({t.age} yrs)</h4>
                    <p className="text-[11px] text-teal-300 truncate">{t.treatment}</p>
                    <p className="text-[10px] text-slate-400">{t.doctorName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-700 to-slate-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              GrowTogether Healthcare Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Consult with Our Specialists?
            </h2>
            <p className="text-xs sm:text-sm text-teal-100">
              Book your in-person or video consultation in less than a minute. Verified doctor slots and zero waiting queues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-teal-50 font-extrabold text-sm transition-all shadow-md active:scale-98"
            >
              Book an Appointment
            </button>
            <button
              onClick={() => onNavigate('portal')}
              className="px-5 py-3.5 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-white font-semibold text-sm border border-teal-600/50 transition-all"
            >
              Open Patient Portal
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
