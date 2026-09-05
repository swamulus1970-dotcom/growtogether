import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock3, 
  Building2, 
  Stethoscope, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  Activity, 
  Video, 
  Home, 
  ChevronRight, 
  LogOut,
  Sparkles,
  Layers,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { useHospitalData } from '../context/HospitalDataContext';
import { Appointment, AppointmentStatus, PageView, Doctor } from '../types';
import { AdminCreateBookingModal } from '../components/AdminCreateBookingModal';
import { AdminAppointmentDetailsModal } from '../components/AdminAppointmentDetailsModal';
import { AdminRescheduleModal } from '../components/AdminRescheduleModal';
import { AdminEditDoctorModal } from '../components/AdminEditDoctorModal';
import { AdminCMSPanel } from '../components/AdminCMSPanel';

interface AdminPortalPageProps {
  onNavigate: (page: PageView) => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({ onNavigate }) => {
  const { 
    isAdmin, 
    adminSession, 
    loginAdminWithCredentials, 
    logoutAdmin,
    loading: authLoading 
  } = useAuth();

  const { 
    allHospitalAppointments, 
    loadingAppointments, 
    adminExportAppointmentsCSV, 
    refreshAppointments,
    adminUpdateStatus,
    adminDeleteAppointment
  } = useAppointments();

  const { doctors, departments, deleteDoctor } = useHospitalData();

  // Login Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<'bookings' | 'doctors' | 'cms' | 'analytics'>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedApptForDetails, setSelectedApptForDetails] = useState<Appointment | null>(null);
  const [selectedApptForReschedule, setSelectedApptForReschedule] = useState<Appointment | null>(null);
  const [isEditDoctorModalOpen, setIsEditDoctorModalOpen] = useState(false);
  const [selectedDoctorForEdit, setSelectedDoctorForEdit] = useState<Doctor | null>(null);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingLogin(true);

    try {
      await loginAdminWithCredentials(emailInput, passwordInput);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrative credentials');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Live Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAppointments();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return allHospitalAppointments.filter((appt) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = appt.patientName?.toLowerCase().includes(query);
        const matchesEmail = appt.patientEmail?.toLowerCase().includes(query);
        const matchesPhone = appt.patientPhone?.toLowerCase().includes(query);
        const matchesCode = appt.appointmentCode?.toLowerCase().includes(query);
        const matchesDoc = appt.doctorName?.toLowerCase().includes(query);
        const matchesDept = appt.departmentName?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCode && !matchesDoc && !matchesDept) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && appt.status !== statusFilter) {
        return false;
      }

      // Department filter
      if (deptFilter !== 'all' && appt.departmentId !== deptFilter) {
        return false;
      }

      // Consultation Type filter
      if (typeFilter !== 'all' && appt.consultationType !== typeFilter) {
        return false;
      }

      // Date filter
      if (dateFilter === 'today') {
        if (appt.date !== todayStr) return false;
      } else if (dateFilter === 'tomorrow') {
        if (appt.date !== tomorrowStr) return false;
      } else if (dateFilter === 'upcoming') {
        if (appt.date < todayStr) return false;
      }

      return true;
    });
  }, [allHospitalAppointments, searchTerm, statusFilter, deptFilter, dateFilter, typeFilter]);

  // Key Metrics calculations
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = allHospitalAppointments.length;
    const todayCount = allHospitalAppointments.filter((a) => a.date === todayStr).length;
    const pendingCount = allHospitalAppointments.filter((a) => a.status === 'pending').length;
    const confirmedCount = allHospitalAppointments.filter((a) => a.status === 'confirmed').length;
    const completedCount = allHospitalAppointments.filter((a) => a.status === 'completed').length;
    const revenue = allHospitalAppointments
      .filter((a) => a.status !== 'cancelled')
      .reduce((acc, curr) => acc + (curr.consultationFee || 0), 0);
    const cancelledCount = allHospitalAppointments.filter((a) => a.status === 'cancelled').length;

    return {
      total,
      todayCount,
      pendingCount,
      confirmedCount,
      completedCount,
      revenue,
      cancelledCount,
    };
  }, [allHospitalAppointments]);

  // Render Login View if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-xl shadow-teal-500/20 border border-teal-400/30">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            GrowTogether Admin Portal
          </h2>
          <p className="mt-2 text-center text-xs text-slate-400 max-w-sm mx-auto">
            Authorized administrative access for hospital staff, doctors & desk executives
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
          <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-700 space-y-6">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-center gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@growtogether.health"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Security Passcode
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingLogin}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmittingLogin ? 'Verifying Admin Access...' : 'Sign In as Administrator'}</span>
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-700/60">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Return to GrowTogether Public Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Authenticated View
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      {/* Top Admin Navigation Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    GrowTogether Admin Portal
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    SUPERADMIN
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Hospital OPD & Clinical Appointments Master Controller
                </p>
              </div>
            </div>

            {/* Quick Actions & Admin Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Booking</span>
                <span className="sm:hidden">Book</span>
              </button>

              <button
                type="button"
                onClick={adminExportAppointmentsCSV}
                title="Export Appointments CSV"
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Download className="w-4 h-4 text-teal-400" />
                <span className="hidden md:inline">Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh Live Data"
                className={`p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 ${
                  isRefreshing ? 'animate-spin text-teal-400' : ''
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Admin Avatar & Logout */}
              <div className="h-6 w-px bg-slate-700 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold text-white">{adminSession?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {adminSession?.email || 'SuperAdmin'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={logoutAdmin}
                  title="Logout from Admin Portal"
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{metrics.total}</p>
            <span className="text-[10px] text-teal-600 font-medium flex items-center gap-0.5 mt-1">
              <Activity className="w-3 h-3" /> Live Synced
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's OPD</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{metrics.todayCount}</p>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Scheduled today</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock3 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-600 mt-2">{metrics.pendingCount}</p>
            <span className="text-[10px] text-amber-700 font-medium mt-1 block">Awaiting confirmation</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirmed</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-2">{metrics.confirmedCount}</p>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Ready for consult</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-2">{metrics.completedCount}</p>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Prescriptions issued</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">${metrics.revenue}</p>
            <span className="text-[10px] text-amber-700 font-medium mt-1 block">OPD Collections</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cancelled</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-rose-600 mt-2">{metrics.cancelledCount}</p>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Slot released</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>All Bookings Management</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'bookings' ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-700 font-bold'
              }`}>
                {filteredAppointments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'doctors'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Physicians & OPD CMS</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold">
                {doctors.length} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cms')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'cms'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-4 h-4 text-teal-500" />
              <span>Website CMS & Content</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Department Analytics</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              View Public Website →
            </button>
          </div>
        </div>

        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search Bar */}
                <div className="relative lg:col-span-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by patient, email, doctor, code..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Approval</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today's Schedule</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="upcoming">All Upcoming</option>
                  </select>
                </div>
              </div>

              {/* Secondary filter chips & view toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Mode:</span>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      typeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Modes
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('in_person')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      typeFilter === 'in_person' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('video_call')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      typeFilter === 'video_call' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Telehealth Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('home_visit')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      typeFilter === 'home_visit' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Home Visit
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    Showing <strong>{filteredAppointments.length}</strong> records
                  </span>
                </div>
              </div>
            </div>

            {/* Bookings Table / List */}
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No appointments match the chosen filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing the search query or changing your status/date filters, or register a new booking directly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDeptFilter('all');
                    setDateFilter('all');
                    setTypeFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white border-b border-slate-800">
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Appointment Code</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Patient Details</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Department & Consultant</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Date & Time</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Type / Fee</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAppointments.map((appt) => {
                        const isPending = appt.status === 'pending';
                        const isConfirmed = appt.status === 'confirmed';
                        const isCompleted = appt.status === 'completed';
                        const isCancelled = appt.status === 'cancelled';
                        const isRescheduled = appt.status === 'rescheduled';

                        return (
                          <tr 
                            key={appt.id}
                            className={`hover:bg-slate-50/80 transition-colors group ${
                              isPending ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            {/* Code */}
                            <td className="py-3.5 px-4 font-mono font-bold text-teal-800 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-md bg-teal-50 border border-teal-200">
                                {appt.appointmentCode}
                              </span>
                            </td>

                            {/* Patient */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{appt.patientName}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>{appt.patientPhone}</span>
                                <span>•</span>
                                <span className="capitalize">{appt.patientGender}, {appt.patientAge}y</span>
                              </div>
                            </td>

                            {/* Doctor & Dept */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={appt.doctorPhotoUrl}
                                  alt={appt.doctorName}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-slate-800 truncate max-w-[180px]">
                                    {appt.doctorName}
                                  </div>
                                  <div className="text-[11px] text-teal-700 truncate max-w-[180px]">
                                    {appt.departmentName}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Date & Time */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{appt.date}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{appt.timeSlot}</span>
                              </div>
                            </td>

                            {/* Type & Fee */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">${appt.consultationFee}</div>
                              <div className="text-[11px] text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                                {appt.consultationType === 'video_call' ? (
                                  <>
                                    <Video className="w-3 h-3 text-blue-500" />
                                    <span>Telehealth</span>
                                  </>
                                ) : appt.consultationType === 'home_visit' ? (
                                  <>
                                    <Home className="w-3 h-3 text-indigo-500" />
                                    <span>Home Visit</span>
                                  </>
                                ) : (
                                  <>
                                    <Building2 className="w-3 h-3 text-teal-600" />
                                    <span>In-Person OPD</span>
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Status with Inline Quick Change */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <select
                                value={appt.status}
                                onChange={(e) => adminUpdateStatus(appt.id, e.target.value as AppointmentStatus)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer uppercase tracking-wider focus:outline-none ${
                                  isPending
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : isConfirmed
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : isCompleted
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : isCancelled
                                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                                    : isRescheduled
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-slate-50 text-slate-800 border-slate-300'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="rescheduled">Rescheduled</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <button
                                    type="button"
                                    onClick={() => adminUpdateStatus(appt.id, 'confirmed')}
                                    title="Approve & Confirm Appointment"
                                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedApptForDetails(appt)}
                                  title="View & Edit Full Record"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedApptForReschedule(appt)}
                                  title="Reschedule Booking"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 transition-colors cursor-pointer"
                                >
                                  <Clock3 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to remove appointment ${appt.appointmentCode}?`)) {
                                      adminDeleteAppointment(appt.id);
                                    }
                                  }}
                                  title="Delete Record"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-400 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCTORS & ROSTERS CMS */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Physician Roster CMS</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Hospital Medical Staff Directory ({doctors.length} Physicians)
                </h3>
                <p className="text-xs text-slate-500">
                  Full administrative control: rename doctors, change departments, update fees, edit qualifications, or add new consultants.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoctorForEdit(null);
                    setIsEditDoctorModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Physician</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => {
                const docAppointments = allHospitalAppointments.filter((a) => a.doctorId === doc.id);
                const activeCount = docAppointments.filter((a) => a.status === 'confirmed' || a.status === 'scheduled').length;

                return (
                  <div 
                    key={doc.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={doc.photoUrl}
                          alt={doc.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h4>
                          <p className="text-[11px] text-teal-700 truncate font-semibold">{doc.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{doc.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-700">
                              Room {doc.roomNumber}
                            </span>
                            <span className="text-[10px] font-bold text-amber-700">
                              ⭐ {doc.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Active Bookings</span>
                          <span className="text-sm font-black text-slate-800">{activeCount}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Standard Fee</span>
                          <span className="text-sm font-black text-teal-700">${doc.consultationFee}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1">
                          Available Slots Today:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {doc.availableSlots?.slice(0, 4).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-medium border border-teal-100">
                              {s}
                            </span>
                          ))}
                          {(doc.availableSlots?.length || 0) > 4 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">
                              +{(doc.availableSlots?.length || 0) - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDoctorForEdit(doc);
                          setIsEditDoctorModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-teal-200"
                      >
                        <Edit className="w-3.5 h-3.5 text-teal-700" />
                        <span>Edit Profile & Name</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${doc.name} from the hospital staff directory?`)) {
                            deleteDoctor(doc.id);
                          }
                        }}
                        title="Delete Doctor"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-700 transition-colors cursor-pointer border border-slate-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: WEBSITE CMS & CONTENT EDITOR */}
        {activeTab === 'cms' && (
          <AdminCMSPanel />
        )}

        {/* TAB 4: DEPARTMENT ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900">Hospital Department Patient Volumes & OPD Loads</h3>
              <p className="text-xs text-slate-500">Live booking distribution across clinical specializations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {departments.map((dept) => {
                const deptBookings = allHospitalAppointments.filter((a) => a.departmentId === dept.id);
                const count = deptBookings.length;
                const percentage = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                const revenue = deptBookings.reduce((acc, c) => acc + (c.consultationFee || 0), 0);

                return (
                  <div key={dept.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{dept.name}</h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {count} visits
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>OPD Volume Share</span>
                        <span className="font-bold text-slate-700">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                      <span className="text-slate-500">Department Revenue:</span>
                      <strong className="text-slate-900 font-bold">${revenue}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Admin Modals */}
      <AdminCreateBookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newAppt) => {
          setSelectedApptForDetails(newAppt);
        }}
      />

      <AdminAppointmentDetailsModal
        appointment={selectedApptForDetails}
        isOpen={Boolean(selectedApptForDetails)}
        onClose={() => setSelectedApptForDetails(null)}
        onOpenReschedule={(appt) => {
          setSelectedApptForDetails(null);
          setSelectedApptForReschedule(appt);
        }}
      />

      <AdminRescheduleModal
        appointment={selectedApptForReschedule}
        isOpen={Boolean(selectedApptForReschedule)}
        onClose={() => setSelectedApptForReschedule(null)}
        onSuccess={() => {
          handleRefresh();
        }}
      />

      <AdminEditDoctorModal
        isOpen={isEditDoctorModalOpen}
        doctor={selectedDoctorForEdit}
        onClose={() => {
          setIsEditDoctorModalOpen(false);
          setSelectedDoctorForEdit(null);
        }}
        onSaved={() => {
          handleRefresh();
        }}
      />
    </div>
  );
};
