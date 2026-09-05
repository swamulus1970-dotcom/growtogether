import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Download, 
  Printer, 
  Building2, 
  Video, 
  HeartPulse, 
  ShieldCheck, 
  Edit3, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  LogOut,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { Appointment, MedicalRecord, PageView, VitalSign } from '../types';

interface PatientPortalPageProps {
  onNavigate: (page: PageView) => void;
  onOpenAuth: () => void;
  onOpenPassModal: (appt: Appointment) => void;
}

export const PatientPortalPage: React.FC<PatientPortalPageProps> = ({
  onNavigate,
  onOpenAuth,
  onOpenPassModal,
}) => {
  const { user, profile, isGuest, logout, updatePatientProfile } = useAuth();
  const { 
    appointments, 
    loadingAppointments, 
    cancelAppointment, 
    rescheduleAppointment,
    vitals, 
    records, 
    addVitalReading,
    setIsBookingModalOpen 
  } = useAppointments();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'appointments' | 'records' | 'vitals' | 'profile'>('appointments');
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Reschedule State
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('10:00 AM');

  // Vitals Form State
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [bpSys, setBpSys] = useState<number>(120);
  const [bpDia, setBpDia] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [bloodSugar, setBloodSugar] = useState<number>(95);
  const [weightKg, setWeightKg] = useState<number>(68.5);
  const [temperatureF, setTemperatureF] = useState<number>(98.6);
  const [oxygenSaturation, setOxygenSaturation] = useState<number>(99);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(profile?.displayName || 'Eleanor Vance');
  const [profilePhone, setProfilePhone] = useState(profile?.phone || '+1 (555) 234-8901');
  const [profileBloodGroup, setProfileBloodGroup] = useState(profile?.bloodGroup || 'A+');
  const [profileInsurance, setProfileInsurance] = useState(profile?.insuranceProvider || 'BlueCross Anthem');
  const [profilePolicy, setProfilePolicy] = useState(profile?.insurancePolicyNumber || 'ANT-98420-GTH');
  const [profileEmergencyName, setProfileEmergencyName] = useState(profile?.emergencyContactName || 'Marcus Vance (Spouse)');
  const [profileEmergencyPhone, setProfileEmergencyPhone] = useState(profile?.emergencyContactPhone || '+1 (555) 890-4321');
  const [profileAllergies, setProfileAllergies] = useState((profile?.allergies || ['Penicillin']).join(', '));
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Selected Record View Modal
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Filter Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (appointmentFilter === 'upcoming') {
      return a.status === 'pending' || a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'rescheduled';
    }
    if (appointmentFilter === 'completed') {
      return a.status === 'completed';
    }
    if (appointmentFilter === 'cancelled') {
      return a.status === 'cancelled';
    }
    return true;
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePatientProfile({
      displayName: profileName,
      phone: profilePhone,
      bloodGroup: profileBloodGroup,
      insuranceProvider: profileInsurance,
      insurancePolicyNumber: profilePolicy,
      emergencyContactName: profileEmergencyName,
      emergencyContactPhone: profileEmergencyPhone,
      allergies: profileAllergies.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setIsEditingProfile(false);
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  const handleSaveVital = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVitalReading({
      date: new Date().toISOString().split('T')[0],
      bloodPressureSys: Number(bpSys),
      bloodPressureDia: Number(bpDia),
      heartRate: Number(heartRate),
      bloodSugar: Number(bloodSugar),
      weightKg: Number(weightKg),
      temperatureF: Number(temperatureF),
      oxygenSaturation: Number(oxygenSaturation),
    });
    setShowVitalForm(false);
  };

  const handleConfirmReschedule = async () => {
    if (reschedulingAppt && newDate && newTime) {
      await rescheduleAppointment(reschedulingAppt.id, newDate, newTime);
      setReschedulingAppt(null);
    }
  };

  const latestVital = vitals.length > 0 ? vitals[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Patient Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-md border-2 border-white/20">
            {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profile?.displayName || 'Eleanor Vance'}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Blood Group: {profile?.bloodGroup || 'A+'}
              </span>
              {isGuest && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Session
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              {profile?.email || 'patient@growtogether.com'} • {profile?.phone || '+1 (555) 234-8901'}
            </p>
            <p className="text-xs text-slate-400">
              Insurance: <strong className="text-teal-300">{profile?.insuranceProvider || 'BlueShield Premier'}</strong> ({profile?.insurancePolicyNumber || 'GTH-POL-88239'})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>

          {user || isGuest ? (
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
            >
              Sign In with Account
            </button>
          )}
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
            <span>Upcoming Visits</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {appointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'rescheduled').length}
          </div>
          <div className="text-[11px] text-teal-700 font-semibold">Active OPD Schedule</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
            <span>Prescriptions</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {records.filter((r) => r.recordType === 'Prescription').length}
          </div>
          <div className="text-[11px] text-slate-700">Digital Rx on file</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
            <span>Lab Test Reports</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {records.filter((r) => r.recordType === 'Lab Report' || r.recordType === 'Radiology / Scan').length}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">All Parameters Normal</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
            <span>Latest Blood Pressure</span>
            <HeartPulse className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {latestVital ? `${latestVital.bloodPressureSys}/${latestVital.bloodPressureDia}` : '120/80'}
            <span className="text-xs font-normal text-slate-600 ml-1">mmHg</span>
          </div>
          <div className="text-[11px] text-teal-700 font-semibold">SpO2: {latestVital?.oxygenSaturation || 99}% • Normal</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'appointments'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'records'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Health Records & Rx ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vitals')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'vitals'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Vitals & Biomarkers</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Patient Profile & Insurance</span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {/* Sub-filter chips */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAppointmentFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  appointmentFilter === 'upcoming'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setAppointmentFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  appointmentFilter === 'completed'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Past & Completed
              </button>
              <button
                onClick={() => setAppointmentFilter('cancelled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  appointmentFilter === 'cancelled'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Cancelled
              </button>
              <button
                onClick={() => setAppointmentFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  appointmentFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                All ({appointments.length})
              </button>
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Consultation</span>
            </button>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No appointments found in this category</h3>
              <p className="text-xs text-slate-700">Need medical care? Schedule a consultation with our specialist faculty.</p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
              >
                Book Appointment Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAppointments.map((appt) => {
                const isUpcoming = appt.status === 'pending' || appt.status === 'scheduled' || appt.status === 'confirmed' || appt.status === 'rescheduled';

                return (
                  <div
                    key={appt.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all shadow-2xs"
                  >
                    {/* Header: Token & Status */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-700">Token ID</div>
                        <div className="text-sm font-mono font-extrabold text-teal-800">{appt.appointmentCode}</div>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                        appt.status === 'pending'
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : appt.status === 'confirmed' || appt.status === 'scheduled'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : appt.status === 'completed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : appt.status === 'rescheduled'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {appt.status === 'pending' ? 'Pending Confirmation' : appt.status}
                      </span>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-start gap-3.5">
                      <img 
                        src={appt.doctorPhotoUrl} 
                        alt={appt.doctorName} 
                        className="w-14 h-14 rounded-2xl object-cover object-top border border-slate-200 shrink-0" 
                      />
                      <div className="min-w-0">
                        <div className="text-xs text-teal-800 font-semibold">{appt.departmentName}</div>
                        <h4 className="text-base font-extrabold text-slate-900 truncate">{appt.doctorName}</h4>
                        <p className="text-xs text-slate-700">{appt.doctorSpecialty}</p>
                      </div>
                    </div>

                    {/* Date, Time & Format */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl text-xs text-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Date: <strong className="text-slate-950 font-bold">{appt.date}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Time: <strong className="text-slate-950 font-bold">{appt.timeSlot}</strong></span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-800">Reason: </span>
                      <span>{appt.reasonForVisit}</span>
                    </div>

                    {appt.notesFromDoctor && (
                      <div className="text-xs text-teal-900 bg-teal-50 p-2.5 rounded-xl border border-teal-100">
                        <span className="font-bold">Doctor Notes: </span>
                        <span>{appt.notesFromDoctor}</span>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenPassModal(appt)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Digital Hospital Pass</span>
                      </button>

                      {isUpcoming && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setReschedulingAppt(appt);
                              setNewDate(appt.date);
                              setNewTime(appt.timeSlot);
                            }}
                            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => cancelAppointment(appt.id)}
                            className="px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HEALTH RECORDS & PRESCRIPTIONS */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Digital Health Records & Prescriptions</h2>
              <p className="text-xs text-slate-700">View outpatient prescriptions, discharge notes, and laboratory results.</p>
            </div>
          </div>

          <div className="space-y-4">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:border-teal-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0 border border-teal-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {rec.recordType}
                      </span>
                      <span className="text-xs text-slate-700">{rec.date}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{rec.title}</h3>
                    <p className="text-xs text-teal-800 font-semibold">{rec.doctorName} • {rec.department}</p>
                    <p className="text-xs text-slate-700">{rec.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold border border-teal-200 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VITALS TRACKER */}
      {activeTab === 'vitals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Biomarker & Vital Signs Tracker</h2>
              <p className="text-xs text-slate-700">Record and track your blood pressure, blood glucose, weight, and oxygen saturation.</p>
            </div>
            <button
              onClick={() => setShowVitalForm(!showVitalForm)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Today's Vitals</span>
            </button>
          </div>

          {/* New Vital Log Form */}
          {showVitalForm && (
            <form onSubmit={handleSaveVital} className="bg-white rounded-3xl border border-teal-200 p-6 shadow-md space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Log New Vital Reading</h3>
                <button
                  type="button"
                  onClick={() => setShowVitalForm(false)}
                  className="text-slate-600 hover:text-slate-900 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Fasting Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Oxygen Saturation (%)</label>
                  <input
                    type="number"
                    value={oxygenSaturation}
                    onChange={(e) => setOxygenSaturation(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Body Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureF}
                    onChange={(e) => setTemperatureF(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-xs"
                >
                  Save Biomarker Entry
                </button>
              </div>
            </form>
          )}

          {/* Vitals History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Blood Pressure</th>
                    <th className="py-3 px-4">Heart Rate</th>
                    <th className="py-3 px-4">Blood Glucose</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">SpO2</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vitals.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{v.date}</td>
                      <td className="py-3.5 px-4 font-mono font-medium">{v.bloodPressureSys}/{v.bloodPressureDia} mmHg</td>
                      <td className="py-3.5 px-4 font-mono">{v.heartRate} bpm</td>
                      <td className="py-3.5 px-4 font-mono">{v.bloodSugar} mg/dL</td>
                      <td className="py-3.5 px-4">{v.weightKg} kg</td>
                      <td className="py-3.5 px-4 font-bold text-teal-700">{v.oxygenSaturation}%</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Optimal
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE & INSURANCE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Health Profile & Insurance Information</h2>
              <p className="text-xs text-slate-700">Update emergency contacts, health insurance policy, and clinical allergies.</p>
            </div>
            {profileSavedMsg && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-fade-in">
                Profile Updated Successfully!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Blood Group</label>
                <select
                  value={profileBloodGroup}
                  onChange={(e) => setProfileBloodGroup(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none bg-white"
                >
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Insurance Provider</label>
                <input
                  type="text"
                  value={profileInsurance}
                  onChange={(e) => setProfileInsurance(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Policy / Member ID</label>
                <input
                  type="text"
                  value={profilePolicy}
                  onChange={(e) => setProfilePolicy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={profileEmergencyName}
                  onChange={(e) => setProfileEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={profileEmergencyPhone}
                  onChange={(e) => setProfileEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Known Drug & Environmental Allergies</label>
              <input
                type="text"
                value={profileAllergies}
                onChange={(e) => setProfileAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Patient Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900">Reschedule Appointment</h3>
            <p className="text-xs text-slate-700">
              Rescheduling appointment with <strong className="text-slate-900">{reschedulingAppt.doctorName}</strong>.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Time Slot</label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none bg-white"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReschedulingAppt(null)}
                className="px-4 py-2 rounded-xl text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
              >
                Confirm New Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record View Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  {selectedRecord.recordType}
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedRecord.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Doctor: <strong className="text-slate-900">{selectedRecord.doctorName}</strong></span>
                <span>Date: <strong className="text-slate-900">{selectedRecord.date}</strong></span>
              </div>
              <div>Department: <strong className="text-slate-900">{selectedRecord.department}</strong></div>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed border border-slate-100">
                {selectedRecord.summary}
              </div>

              {selectedRecord.medications && (
                <div className="space-y-2 pt-2">
                  <span className="font-bold text-slate-900 block">Prescribed Medicines:</span>
                  <div className="space-y-1.5">
                    {selectedRecord.medications.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-teal-950 block">{m.name} ({m.dosage})</strong>
                          <span className="text-slate-700 text-[11px]">{m.frequency}</span>
                        </div>
                        <span className="font-bold text-slate-900">{m.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
